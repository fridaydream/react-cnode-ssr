import React from 'react'
import {
  Route,
  Redirect,
  withRouter
} from 'react-router-dom'

import PropTypes from 'prop-types'

import {
  inject,
  observer,
} from 'mobx-react'
import TopicList from '../views/topic-list'
import TopicDetail from '../views/topic-detail'
import UserLogin from '../views/user/login'
import UserInfo from '../views/user/info'
import TopicCreate from '../views/topic-create'

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
  <Route path="/" exact render={() => <Redirect to="/list" />} key="home" />,
  <Route path="/list" exact component={TopicList} key="topiclist" />,
  <Route path="/detail/:id" component={TopicDetail} key="detail" />,
  <Route path="/user/login" component={UserLogin} exact key="login" />,
  <InjectedPrivateRoute path="/user/info" component={UserInfo} key="info" />,
  <InjectedPrivateRoute path="/topic/create" component={TopicCreate} key="create" />
]
