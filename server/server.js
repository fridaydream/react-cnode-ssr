const Koa = require('koa')

const ReactSSR = require('react-dom/server')
const fs = require('fs')
const path = require('path')
const mount = require('koa-mount');


const isDev = process.env.NODE_ENV === 'development'
const app = new Koa()

if(!isDev) {
  const serverEntry = require('../dist/server-entry').default
  const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'),'utf8')
  app.use(mount('/public', async (ctx,next) => {
    console.log(ctx.request.path)
    ctx.body = fs.readFileSync(path.join(__dirname, '../dist'+ctx.request.path))
  }));
  app.use((ctx, next) => {
    const appString = ReactSSR.renderToString(serverEntry)
    ctx.body = template.replace('<!-- app -->', appString)
  })
} else {
  const devStatic = require('./util/dev-static')
  devStatic(app)
}

app.listen('3333',() => {
  console.log('server is listening on 3333')
})