const ejs = require('ejs')
const serialize = require('serialize-javascript')
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

module.exports = (bundle, template, ctx) => {
  return new Promise(async (resolve, reject) => {
    const createStoreMap = bundle.createStoreMap
    const createApp = bundle.default
    const routerContext = {}
    const stores = createStoreMap()

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

    const app = createApp(stores, routerContext, sheetsRegistry,generateClassName, theme, ctx.request.url)
    await bootstrapper(app)
    if(routerContext.url) {
      ctx.status = 302
      ctx.redirect(routerContext.url)
      ctx.body=''
      resolve()  //promise 必须要有resolve(), 此处有坑
      return
    }
    const helmet = Helmet.renderStatic()
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
    resolve(html)
  })
}
