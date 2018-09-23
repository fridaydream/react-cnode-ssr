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

import ListItem from '@material-ui/core/ListItem'
// import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import { withStyles } from '@material-ui/core/styles'

import dateFormat from 'dateformat'
import cx from 'classnames'
import Container from '../layout/container'
// import TopicListItem from './list-item'
// import { AppState } from '../../store/store';

import { tabs } from '../../util/variable-define'

import {
  topicPrimaryStyle,
  topicSecondaryStyle,
} from './styles'

const getTab = (tab, isTop, isGood) => {
  return isTop ? '置顶' : (isGood ? '精品' : tab) // eslint-disable-line
}

const TopicPrimary = (props) => {
  const { topic, classes } = props
  const isTop = topic.top
  const isGood = topic.good
  const classNames = cx([classes.tab, isTop ? classes.top : '', isGood ? classes.good : ''])
  return (
    <div className={classes.root}>
      <span
        className={classNames}
      >
        {getTab(tabs[topic.tab], isTop, isGood)}
      </span>
      <span>{topic.title}</span>
    </div>
  )
}

const TopicSecondary = ({ classes, topic }) => (
  <span className={classes.root}>
    <span className={classes.userName}>{topic.author.loginname}</span>
    <span className={classes.count}>
      <span className={classes.accentColor}>{topic.reply_count}</span>
      <span>/</span>
      <span>{topic.visit_count}</span>
    </span>
    <span>
      创建时间：
      {dateFormat(topic.create_at, 'yyyy-mm-dd')}
    </span>
  </span>
)

TopicPrimary.propTypes = {
  topic: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
}

TopicSecondary.propTypes = {
  topic: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
}

const StyledPrimary = withStyles(topicPrimaryStyle)(TopicPrimary)
const StyledSecondary = withStyles(topicSecondaryStyle)(TopicSecondary)

@inject(stores => ({
  appState: stores.appState,
  topicStore: stores.topicStore,
})) @observer

class TopicList extends React.Component {
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

  bootstrap() {
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
      user,
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
                    <ListItem button onClick={() => { this.listItemClick(topic) }} key={topic.id}>
                      <Avatar src={topic.author.avatar_url} />
                      <ListItemText
                        primary={<StyledPrimary topic={topic} />}
                        secondary={(
                          <StyledSecondary
                            topic={Object.assign({}, topic, {
                              reply_count: 0,
                              visit_count: 0,
                              author: {
                                loginname: user.info.loginName,
                              },
                            })}
                          />
                        )}
                      />
                    </ListItem>
                  )
                })
              }
            </List>
          ) : null
        }

        <List>
          {
            topicList.map(topic => (
              <ListItem button onClick={() => { this.listItemClick(topic) }} key={topic.id}>
                <Avatar src={topic.author.avatar_url} />
                <ListItemText
                  primary={<StyledPrimary topic={topic} />}
                  secondary={<StyledSecondary topic={topic} />}
                />
              </ListItem>
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
  appState: PropTypes.object.isRequired,
  topicStore: PropTypes.object.isRequired
}
TopicList.propTypes = {
  location: PropTypes.object.isRequired
}

export default TopicList
