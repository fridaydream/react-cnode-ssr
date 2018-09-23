const axios = require('axios')
const webpack = require('webpack')
const path = require('path')
const MemoryFs = require('memory-fs')
const proxy = require('http-proxy-middleware')
const serverRender = require('./server-render')

const serverConfig = require('../../build/webpack.config.server')

const getTemplate = () => {
  return new Promise((resolve,reject) => {
    axios.get('http://localhost:8889/public/server.ejs')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}
const mfs = new MemoryFs
const NativeModule = require('module')
const vm = require('vm')
const getModuleFromString = (bundle, filename) => {
  const m = { exports: {} }
  const wrapper = NativeModule.wrap(bundle)
  const script = new vm.Script(wrapper, {
    filename,
    displayErrors: true
  })
  const result = script.runInThisContext()
  result.call(m.exports, m.exports, require, m)
  return m
}

const serverCompiler = webpack(serverConfig)
serverCompiler.outputFileSystem = mfs
let serverBundle
serverCompiler.watch({}, (err, stats) => {
  if(err) throw err;
  stats = stats.toJson()
  stats.errors.forEach(err => console.log(err))
  stats.warnings.forEach(warn => console.log(warn))
  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )
  const bundle = mfs.readFileSync(bundlePath, 'utf8')

  const m = getModuleFromString(bundle, 'server-entry.js')
  serverBundle = m.exports
})

module.exports = (app) => {
  app.use(async (ctx, next) => {
    if(ctx.url.startsWith('/public')) {    // 以public开头的异步请求接口都会被转发
      ctx.respond = false // 必须
        return proxy({
            target: 'http://localhost:8889/', // 服务器地址
            changeOrigin: true,
            secure: false
        })(ctx.req, ctx.res, next)
    }
    return next()
  })

  app.use(async (ctx, next) => {
    try{
      if (!serverBundle) {
        return ctx.body = 'waiting for compile, refresh later'
      }
      const template = await getTemplate()
      await serverRender(serverBundle, template, ctx)
    }catch(e) {
      await next()
    }
  })
}
