import React from 'react'
import PropTypes from 'prop-types'
import marked from 'marked'
import Helmet from 'react-helmet'
import {
  inject,
  observer
} from 'mobx-react'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import IconReply from '@material-ui/icons/Reply'

import SimpleMDE from 'react-simplemde-editor'
import Container from '../layout/container'

import { topicDetailStyle } from './styles'

import Reply from './reply'
// import store from '../../store/store';

@inject((stores) => {
  return {
    topicStore: stores.topicStore,
    user: stores.appState.user
  }
}) @observer

class TopicDetail extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  }

  constructor() {
    super()
    this.state = {
      newReply: ''
    }
    this.handleNewReplyChange = this.handleNewReplyChange.bind(this)
    this.goToLogin = this.goToLogin.bind(this)
    this.doReply = this.doReply.bind(this)
  }

  componentDidMount() {
    const id = this.getTopicId()
    console.log('component did mount id:', id) // eslint-disable-line
    this.props.topicStore.getTopicDetail(id).catch((err) => {
      console.log('detail did mount error:', err) // eslint-disable-line
    })
  }

  bootstrap() {
    const id = this.getTopicId()
    return this.props.topicStore.getTopicDetail(id).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }

  getTopicId() {
    return this.props.match.params.id
  }

  handleNewReplyChange(value) {
    this.setState({
      newReply: value
    })
  }

  goToLogin() {
    const id = this.getTopicId()
    this.context.router.history.push(`/user/login?from=/detail/${id}`)
  }

  /* eslint-disable */
  doReply() {
    const id = this.getTopicId()
    const topic = this.props.topicStore.detailMap[id]
    topic.doReply(this.state.newReply)
      .then(() => {
        this.setState({
          newReply: ''
        })
      }).catch((err) => {
        console.log(err) // eslint-disable-line
      })
  }
  /* eslint-enable */

  render() {
    const {
      classes,
      user
    } = this.props
    const id = this.getTopicId()
    const topic = this.props.topicStore.detailMap[id]
    if (!topic) {
      return (
        <Container>
          <section className={classes.loadingContainer}>
            <CircularProgress color="secondary" />
          </section>
        </Container>
      )
    }
    return (
      <div>
        <Container>
          <Helmet>
            <title>{topic.title}</title>
          </Helmet>
          <header className={classes.header}>
            <h3>{topic.title}</h3>
          </header>
          <section className={classes.body}>
            <p dangerouslySetInnerHTML={{ __html: marked(topic.content) }} />
          </section>
        </Container>

        {
          topic.createdReplies && topic.createdReplies.length > 0 ? (
            <Paper elevation={4} className={classes.replies}>
              <header className={classes.replyHeader}>
                <span>我的最新回复</span>
                <span>{`${topic.createdReplies.length}条`}</span>
              </header>
              {
                topic.createdReplies.map(reply => (
                  <Reply
                    key={reply.id}
                    reply={Object.assign({}, reply, {
                      author: {
                        avatar_url: user.info.avatar_url,
                        loginname: user.info.loginname
                      }
                    })}
                  />
                ))
              }
            </Paper>
          ) : null
        }
        <Paper elevation={4} className={classes.replies}>
          <header className={classes.replyHeader}>
            <span>{`${topic.reply_count} 回复`}</span>
            <span>{`最新回复 ${topic.last_reply_at}`}</span>
          </header>
          {
            user.isLogin ? (
              <section className={classes.replyEditor}>
                <SimpleMDE
                  onChange={this.handleNewReplyChange}
                  value={this.state.newReply}
                  id="samplemdeReplyTopic"
                  className="samplemdeReplyTopic"
                  options={{
                    toolbar: false,
                    autoFocus: false,
                    spellChecker: false,
                    placeholder: '添加您的精彩回复'
                  }}
                />
                <Button
                  variant="fab"
                  color="primary"
                  onClick={this.doReply}
                  className={classes.replyButton}
                >
                  <IconReply />
                </Button>
              </section>
            )
              : (null)
          }
          {
            !user.isLogin
              && (
                <section className={classes.notLoginButton}>
                  <Button variant="raised" color="primary" onClick={this.goToLogin}>
                    登录并进行回复
                  </Button>
                </section>
              )
          }
          <section>
            {
              topic.replies.map(reply => <Reply reply={reply} key={reply.id} />)
            }
          </section>
        </Paper>
      </div>
    )
  }
}

TopicDetail.wrappedComponent.propTypes = {
  topicStore: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}

TopicDetail.propTypes = {
  match: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
}

export default withStyles(topicDetailStyle)(TopicDetail)
