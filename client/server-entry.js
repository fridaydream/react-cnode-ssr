import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { Provider, useStaticRendering } from 'mobx-react'
import App from './views/App'

import { createStoreMap } from './store/store'

// 让mobx在服务端渲染的时候不会重复数据变换
useStaticRendering(true) // 使用静态的渲染

// {appStore: xxx}
export default (stores, routerContext, url) => (
  <Provider {...stores}>
    <StaticRouter context={routerContext} location={url}>
      <App />
    </StaticRouter>
  </Provider>
)

export { createStoreMap }
