import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
// import JssProvider from 'react-jss/lib/JssProvider';
import { AppContainer } from 'react-hot-loader' // eslint-disable-line
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { lightBlue, pink } from '@material-ui/core/colors'
import App from './views/App'
import { AppState, TopicStore } from './store/store'

const theme = createMuiTheme({
  palette: {
    primary: lightBlue,
    accent: pink,
    type: 'light'
  }
})

const initialState = window.__INITIAL_STATE__ || {} // eslint-disable-line

const createApp = (TheApp) => {
  class Main extends React.Component {
    // Remove the server-side injected CSS.
    componentDidMount() {
      const jssStyles = document.getElementById('jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        console.log('remove') // eslint-disable-line
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      return <TheApp />
    }
  }
  return Main
}

const appState = new AppState()
appState.init(initialState.appState)

const topicStore = new TopicStore(initialState.topicStore)
const root = document.getElementById('root')
const render = (Component) => {
  // const hot = !!module.hot
  // const renderMethod = hot ? ReactDOM.render : ReactDOM.hydrate
  const renderMethod = ReactDOM.render // 因为服务端渲染 dangerouslySetInnerHTML 不显示
  renderMethod(
    <AppContainer>
      <Provider appState={appState} topicStore={topicStore}>
        <BrowserRouter>
          <MuiThemeProvider theme={theme}>
            <Component />
          </MuiThemeProvider>
        </BrowserRouter>
      </Provider>
    </AppContainer>,
    root
  )
}
render(createApp(App))
if (module.hot) {
  module.hot.accept('./views/App', () => {
    const NextApp = require('./views/App').default // eslint-disable-line
    render(createApp(NextApp))
  })
}
