import React from 'react'
import {
  observer,
  inject
} from 'mobx-react'
import PropTypes from 'prop-types'
@inject('appState') @observer

export default class TopicList extends React.Component {
  constructor() {
    super()
    this.changeName = this.changeName.bind(this)
  }

  componentDidMount() {
    // do something
  }

  asyncBootstrap() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.props.appState.count = 3
        resolve(true)
      })
    })
  }

  changeName(event) {
    this.props.appState.changeName(event.target.value)
  }

  render() {
    const { appState } = this.props
    return (
      <div>
        <input type="text" onChange={this.changeName} />
        <span>{appState.msg}</span>
      </div>
    )
  }
}

TopicList.propTypes = {
  appState: PropTypes.object
}
