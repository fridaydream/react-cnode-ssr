### react ssr 实践

通过jocket老师的课程，记录下react ssr 实践过程中的难点

[github 代码](https://github.com/fridaydream/react-cnode-ssr)

[效果展示](http://cpnode.daxierhao.com/)

> 不一样的地方

1. <font color=#f00> express 换成koa(各种不同中间件和async和await的写法)</font>
2. webpack升级4
3. material-ui从beta版升级到3(部分语法变化)
4. babel从6升到7(为了简化过程，暂时未升级。但是babel未升级，其相应关联的babel扩展包升级了，导致出现各种问题，其中有react-hot-loader/patch，找了好久才找到问题)
5. react-simplemde-editor富文本编辑器需要添加className


> 服务端渲染过程

![react ssr 流程图](https://raw.githubusercontent.com/fridaydream/blogpic/master/react-ssr.jpeg)


### koa中对开发环境和生产环境中api接口、静态资源请求不同处理

```
plugins: [
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify(isDev?'development':'production'),
        'API_BASE': '"http://127.0.0.1:3333"'
      },
    })
  ]
```
前端接口都是以api开头。通过webpack配置API_BASE，设置接口的前缀，开发环境是空字符串，进行代理到node后台，生产环境是一个绝对路径。这样在ssr，服务端渲染直出页面时在mobx里面直接去调用cnode接口。在node里面是没跨域，在浏览器是有跨域的。

![react ssr 流程图](https://raw.githubusercontent.com/fridaydream/blogpic/master/react-server.jpeg)



### 未登录的跳到需要登录的页面重定向

一般这种情况需要在react的componentWillMount的生命周期函数中处理，我记得vue里面有个路由的生命周期函数可以统一处理跳转到登录页。react里面没有，需要封装。

```
const PrivateRoute = ({ isLogin, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      isLogin ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{ pathname: '/user/login', search: `?from=${rest.path}` }}
        />
      )
    )}
  />
)

const InjectedPrivateRoute = withRouter(inject((stores) => {
  return {
    isLogin: stores.appState.user.isLogin
  }
})(observer(PrivateRoute)))

PrivateRoute.propTypes = {
  isLogin: PropTypes.bool,
  component: PropTypes.element.isRequired
}

PrivateRoute.defaultProps = {
  isLogin: false
}
export default () => [
  <InjectedPrivateRoute path="/topic/create" component={TopicCreate} key="create" />
]
```

贴过来一坨代码，自己理解去。

主要是通过store中的isLogin去判断是否登录，登录了就跳到指定路由，没有登录就重定向到登录页

### 服务端渲染时请求了接口数据，在客户端渲染的时候就不用请求接口

页面刷新的时候进行ssr，由服务端通过路由生成静态文件直出，之后操作都是走客户端的代码。刷新页面时在mobx需判断是否数据存在。

只有服务端渲染才走bootstrap这个生命周期函数。之后componentDidMount又请求一次接口。所以在mobx中需要判断是否数据已经请求回来了。请求一次数据后tab设置成当前tab，第二次请求之前判断tab是否一样，一样就不发送请求

list页面

```
  bootstrap() {
    const query = queryString.parse(this.props.location.search)
    const { tab } = query
    return this.props.topicStore.fetchTopics(tab || 'all').then(() => {
      return true
    }).catch(() => {
      return false
    })
  }
  componentDidMount() {
    // do something
    const tab = this.getTab()
    this.props.topicStore.fetchTopics(tab)
  }
```
mobx

```
  @action fetchTopics(tab) {
    return new Promise((resolve, reject) => {
      if (tab === this.tab && this.topics.length > 0) {
        resolve()
      } else {
        this.tab = tab
        this.syncing = true
        this.topics = []
        get('/topics', {
          mdrender: false,
          tab
        }).then((resp) => {
          if (resp.success) {
            this.topics = resp.data.map((topic) => {
              return new Topic(createTopic(topic))
            })
            resolve()
          } else {
            reject()
          }
          this.syncing = false
        }).catch((err) => {
          reject(err)
          this.syncing = false
        })
      }
    })
  }
```

### dev环境ssr入口server.entry.js打包到内存中如何获取webpack的bundle文件

```
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
```

又是一坨代码

webpack(serverConfig)，webpack可以在js中通过webpack模块执行得到编译之后的代码



#### 个人感悟

通过editorconfig和eslint对代码规范的约束虽然让开发过程痛苦了一点，但是这个避免了很多不必要的问题。也增强了自己代码的规范性。react中一切都是组件。webpack4配置的简化，mobx的reactive，material-ui用法的流畅，koa的简单便捷。pm2、nginx的优雅。

