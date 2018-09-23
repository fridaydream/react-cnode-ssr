const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser')
const session = require('koa-session');
const serverRender = require('./util/server-render')
const Router = require('koa-router');
const isDev = process.env.NODE_ENV === 'development'
const app = new Koa()

app.keys = ['some secret hurr'];
const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));

app.use(bodyParser())
const router = new Router({
  prefix: '/api'
});

// router.post('/user/login', require('./util/handle-login'))
// // router.all('/user/:id?', require('./util/handle-login'))
// router.all('/:t/:id?/:reply?', require('./util/proxy'))

router.post('/user/login', require('./util/handle-login'))
router.get('/topics', require('./util/proxy'))
router.post('/topics', require('./util/proxy'))
router.get('/topic/:id', require('./util/proxy'))
router.get('/user/:id', require('./util/proxy'))
router.get('/topic_collect/:id', require('./util/proxy'))
router.post('/topic/:id/replies', require('./util/proxy'))
app
  .use(router.routes())
  .use(router.allowedMethods());

if(!isDev) {
  const serverEntry = require('../dist/server-entry')
  const template = fs.readFileSync(path.join(__dirname, '../dist/server.ejs'),'utf8')
  app.use(mount('/public', async (ctx,next) => {
    ctx.body = fs.readFileSync(path.join(__dirname, '../dist'+ctx.request.path))
  }));
  app.use(async (ctx, next) => {
    await serverRender(serverEntry, template, ctx)
  })
} else {
  const devStatic = require('./util/dev-static')
  devStatic(app)
}

const host = '0.0.0.0'
const port = process.PORT || '3333'
app.listen(port, host, () => {
  console.log(`server is listening on ${port}`)
})
