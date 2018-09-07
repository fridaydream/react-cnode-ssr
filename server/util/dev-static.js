const axios = require('axios')
const webpack = require('webpack')
const path = require('path')
const MemoryFs = require('memory-fs')
const ReactDomServer = require('react-dom/server')
const proxy = require('http-proxy-middleware')
const ejs = require('ejs')
const serialize = require('serialize-javascript')
const asyncBootstrap = require('react-async-bootstrapper')
const static = require('koa-static')
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
const Module = module.constructor
const serverCompiler = webpack(serverConfig)
serverCompiler.outputFileSystem = mfs
let serverBundle, createStoreMap
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
  const m = new Module()
  m._compile(bundle, 'server-entry.js')
  serverBundle = m.exports.default
  createStoreMap = m.exports.createStoreMap
})

const getStoreState = (stores) => {
  return Object.keys(stores).reduce((result, storeName) => {
    result[storeName] = stores[storeName].toJson()
    return result
  }, {})
}

module.exports = (app) => {
  app.use(async (ctx, next) => {
    if(ctx.url.startsWith('/public')) {    // 以api开头的异步请求接口都会被转发
        ctx.respond = false
        return proxy({
            target: 'http://localhost:8889/', // 服务器地址
            changeOrigin: true,
            secure: false,
            // pathRewrite: {
            //     '^/api' : '/webapp/api'
            // }
        })(ctx.req, ctx.res, next)
    }
    return next()
  })
  // 指定静态资源文件夹
  // app.use(static(path.join(__dirname, './dist')))
  app.use(async (ctx, next) => {
    const template = await getTemplate()
    const routerContext = {}
    const stores = createStoreMap()
    const app = serverBundle(stores, routerContext, ctx.request.url)
    await asyncBootstrap(app)
    if(routerContext.url) {
      ctx.redirect(routerContext.url)
      ctx.body=''
      return
    }
    const state = getStoreState(stores)
    const content = ReactDomServer.renderToString(app)
    console.log(stores.appState.count)
    const html = ejs.render(template, {
      appString: content,
      initialState: serialize(state)
    })
    ctx.body = html
  })
}
