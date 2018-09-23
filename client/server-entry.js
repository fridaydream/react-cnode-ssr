import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { Provider, useStaticRendering } from 'mobx-react'

import { JssProvider } from 'react-jss'
import {
  MuiThemeProvider,
} from '@material-ui/core/styles';
import App from './views/App'

import { createStoreMap } from './store/store'

// 让mobx在服务端渲染的时候不会重复数据变换
useStaticRendering(true) // 使用静态的渲染

// {appStore: xxx}
// stores, routerContext, sheetsRegistry, generateClassName, theme, ctx.request.url
export default (stores, routerContext, sheetsRegistry, generateClassName, theme, url) => {
  // jss.options.createGenerateClassName = createGenerateClassName
  return (
    <Provider {...stores}>
      <StaticRouter context={routerContext} location={url}>
        <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
          <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
            <App />
          </MuiThemeProvider>
        </JssProvider>
      </StaticRouter>
    </Provider>
  )
}

export { createStoreMap }
