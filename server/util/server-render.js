const ejs = require('ejs')
const serialize = require('serialize-javascript')
// 引入异步处理包
const bootstrapper = require('react-async-bootstrapper')
const ReactDomServer = require('react-dom/server')
const Helmet = require('react-helmet').default
const SheetsRegistry = require('react-jss').SheetsRegistry;

const createGenerateClassName = require('@material-ui/core/styles').createGenerateClassName
const createMuiTheme = require('@material-ui/core/styles').createMuiTheme
const colors = require('@material-ui/core/colors')

const getStoreState = (stores) => {
  return Object.keys(stores).reduce((result, storeName) => {
    result[storeName] = stores[storeName].toJson()
    return result
  }, {})
}

module.exports = async (bundle, template, ctx) => {
  const createStoreMap = bundle.createStoreMap
  const createApp = bundle.default
  const routerContext = {}
  const stores = createStoreMap()
  const user = ctx.session.user
  if (user) {
    stores.appState.user.info = user
    stores.appState.user.isLogin = true
  }
  // Create a sheetsRegistry instance.
  const sheetsRegistry = new SheetsRegistry();
  // Create a theme instance.
  const theme = createMuiTheme({
    palette: {
      primary: colors.lightBlue,
      accent: colors.pink,
      type: 'light',
    },
  });
  // Create a new class name generator.
  const generateClassName = createGenerateClassName();
  const app = createApp(stores, routerContext, sheetsRegistry, generateClassName, theme, ctx.request.url)
  await bootstrapper(app)
  if(routerContext.url) {
    ctx.redirect(routerContext.url)
    return
  }
  const helmet = Helmet.rewind()
  const state = getStoreState(stores)
  const content = ReactDomServer.renderToString(app)
  const html = ejs.render(template, {
    appString: content,
    initialState: serialize(state),
    meta: helmet.meta.toString(),
    title: helmet.title.toString(),
    style: helmet.style.toString(),
    link: helmet.link.toString(),
    materialCss: sheetsRegistry.toString()
  })
  ctx.body = html
}

