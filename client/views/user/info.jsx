import React from 'react'
import PropTypes from 'prop-types'
import {
  inject,
  observer
} from 'mobx-react'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import UserWrapper from './user'
import infoStyles from './styles/user-info-style'

const TopicItem = (({ topic, onClick }) => {
  return (
    <ListItem button onClick={onClick}>
      <Avatar src={topic.author.avatar_url} />
      <ListItemText
        primary={topic.title}
        secondary={`最新回复：${topic.last_reply_at}`}
      />
    </ListItem>
  )
})

TopicItem.propTypes = {
  topic: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
}

@inject((stores) => {
  return {
    user: stores.appState.user,
    appState: stores.appState
  }
}) @observer

class UserInfo extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  }

  componentWillMount() {
    this.props.appState.getUserDetail()
    this.props.appState.getUserCollection()
  }

  goToTopic(id) {
    this.context.router.history.push(`/detail/${id}`)
  }

  render() {
    const { classes } = this.props
    const topics = this.props.user.detail.recentTopics
    const replies = this.props.user.detail.recentReplies
    const collections = this.props.user.collections.list
    return (
      <UserWrapper>
        <div className={classes.root}>
          <Grid container spacing={16} align="stretch">
            <Grid item xs={12} md={4}>
              <Paper elevation={2}>
                <Typography className={classes.partTitle}>
                  <span>最新发布的话题</span>
                </Typography>
                <List>
                  {
                    topics.length > 0
                      ? topics.map(topic => (
                        <TopicItem
                          topic={topic}
                          key={topic.id}
                          onClick={() => this.goToTopic(topic.id)}
                        />
                      ))
                      : (
                        <Typography align="center">
                        最近没有发布过话题
                        </Typography>
                      )
                  }
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2}>
                <Typography className={classes.partTitle}>
                  <span>新的回复</span>
                </Typography>
                <List>
                  {
                    replies.length > 0
                      ? replies.map(topic => (
                        <TopicItem
                          topic={topic}
                          key={topic.id}
                          onClick={() => this.goToTopic(topic.id)}
                        />
                      ))
                      : (
                        <Typography align="center">
                        最近没有新的回复
                        </Typography>
                      )
                  }
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2}>
                <Typography className={classes.partTitle}>
                  <span>收藏的话题</span>
                </Typography>
                <List>
                  {
                    collections.length > 0
                      ? collections.map(topic => (
                        <TopicItem
                          topic={topic}
                          key={topic.id}
                          onClick={() => this.goToTopic(topic.id)}
                        />
                      ))
                      : (
                        <Typography align="center">
                        没有收藏话题哦
                        </Typography>
                      )
                  }
                </List>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </UserWrapper>
    )
  }
}

UserInfo.wrappedComponent.propTypes = {
  user: PropTypes.object.isRequired,
  appState: PropTypes.object.isRequired
}

UserInfo.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(infoStyles)(UserInfo)
