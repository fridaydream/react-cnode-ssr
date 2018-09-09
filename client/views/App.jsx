import React from 'react'
import Routes from '../config/router'
import AppBar from './layout/app-bar'

export default class App extends React.Component {
  componentDidMount() {
    // do something here

  }

  render() {
    return [
      <AppBar key="appBar" />,
      <Routes key="routes" />
    ]
  }
}
