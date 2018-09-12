import React from 'react'
import {
  observer,
  inject
} from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import queryString from 'query-string'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import List from '@material-ui/core/List'
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '../layout/container'
import TopicListItem from './list-item'
import { AppState } from '../../store/store';

import { tabs } from '../../util/variable-define'
@inject(stores => ({
  appState: stores.appState,
  topicStore: stores.topicStore
})) @observer

export default class TopicList extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  }

  constructor() {
    super()
    this.changeTab = this.changeTab.bind(this)
    this.listItemClick = this.listItemClick.bind(this)
  }

  componentDidMount() {
    // do something
    const tab = this.getTab()
    this.props.topicStore.fetchTopics(tab)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.props.topicStore.fetchTopics(this.getTab(nextProps.location.search))
    }
  }

  asyncBootstrap() {
    const query = queryString.parse(this.props.location.search)
    const { tab } = query
    return this.props.topicStore.fetchTopics(tab || 'all').then(() => {
      return true
    }).catch(() => {
      return false
    })
  }

  changeName(event) {
    this.props.appState.changeName(event.target.value)
  }

  getTab(search) {
    search = search || this.props.location.search
    const query = queryString.parse(search)
    return query.tab || 'all'
  }

  changeTab(e, value) {
    this.context.router.history.push({
      pathname: '/list',
      search: `?tab=${value}`
    })
  }

  listItemClick(topic) {
    this.context.router.history.push(`/detail/${topic.id}`)
  }

  render() {
    const {
      topicStore
    } = this.props
    const topicList = topicStore.topics
    const syncingTopics = topicStore.syncing
    const tab = this.getTab()
    const {
      createdTopics
    } = topicStore
    const {
      user
    } = this.props.appState
    return (
      <Container>
        <Helmet>
          <title>This is topic list</title>
          <meta name="description" content="this is description" />
        </Helmet>
        <Tabs value={tab} onChange={this.changeTab}>
          {
            Object.keys(tabs).map(t => (
              <Tab label={tabs[t]} value={t} key={t} />
            ))
          }
        </Tabs>
        {
          createdTopics && createdTopics.length > 0 ? (
            <List style={{ backgroundColor: '#dfdfdf' }}>
              {
                createdTopics.map((topic) => {
                  topic = Object.assign({}, topic, {
                    author: user.info
                  })
                  return (
                    <TopicListItem
                      onClick={() => { this.listItemClick(topic) }}
                      topic={topic}
                      key={topic.id}
                    />
                  )
                })
              }
            </List>
          ) : null
        }

        <List>
          {
            topicList.map(topic => (
              <TopicListItem
                onClick={() => { this.listItemClick(topic) }}
                topic={topic}
                key={topic.id}
              />
            ))
          }
        </List>
        {
          syncingTopics
            ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '40px 0'
                }}
              >
                <CircularProgress color="secondary" size={100} />
              </div>
            )
            : null
        }

      </Container>
    )
  }
}

TopicList.wrappedComponent.propTypes = {
  appState: PropTypes.instanceOf(AppState).isRequired,
  topicStore: PropTypes.object.isRequired
}
TopicList.propTypes = {
  location: PropTypes.object.isRequired
}
