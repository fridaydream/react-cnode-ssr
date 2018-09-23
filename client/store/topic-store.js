import {
  observable,
  toJS,
  action,
  extendObservable,
  computed
} from 'mobx'

import { topicSchema, replySchema } from '../util/variable-define'

import { get, post } from '../util/http'

const createTopic = (topic) => {
  return Object.assign({}, topicSchema, topic)
}

const createReply = (reply) => {
  return Object.assign({}, replySchema, reply)
}

class Topic {
  constructor(data, isDetail) {
    extendObservable(this, data)
    this.isDetail = isDetail
  }

  @observable syncing = false

  @observable createdReplies = []

  @action doReply(content) {
    return new Promise((resolve, reject) => {
      post(`/topic/${this.id}/replies`, {
        needAccessToken: true
      }, { content })
        .then((resp) => {
          if (resp.success) {
            this.createdReplies.push(createReply({
              id: resp.reply_id,
              content,
              create_at: Date.now()
            }))
            resolve()
          } else {
            resolve(resp)
          }
        }).catch(reject)
    })
  }
}

class TopicStore {
  @observable topics

  @observable details

  @observable syncing

  @observable createdTopics = []

  @observable tab

  constructor({
    syncing = false, topics = [], tab = null, details = []
  } = {}) {
    this.syncing = syncing
    this.topics = topics.map(topic => new Topic(createTopic(topic)))
    this.details = details.map(topic => new Topic(createTopic(topic)))
    this.tab = tab
  }

  addTopic(topic) {
    this.topics.push(new Topic(createTopic(topic)))
  }

  @computed get detailMap() {
    return this.details.reduce((result, detail) => {
      result[detail.id] = detail
      return result
    }, {})
  }

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

  @action getTopicDetail(id) {
    return new Promise((resolve, reject) => {
      console.log('this.detailMap[id]', this.detailMap[id]) // eslint-disable-line
      if (this.detailMap[id]) {
        resolve(this.detailMap[id])
      } else {
        console.log('get request')  // eslint-disable-line
        get(`/topic/${id}`, {
          mdrender: false
        }).then((resp) => {
          if (resp.success) {
            const topic = new Topic(createTopic(resp.data))
            this.details.push(topic)
            resolve(topic)
          } else {
            reject()
          }
        }).catch(reject)
      }
    })
  }

  @action createTopic(title, tab, content) {
    return new Promise((resolve, reject) => {
      post('/topics', {
        needAccessToken: true
      }, {
        title, tab, content
      }).then((resp) => {
        if (resp.success) {
          const topic = {
            title,
            tab,
            content,
            id: resp.topic_id,
            create_at: Date.now()
          }
          this.createdTopics.push(new Topic(createTopic(topic)))
          resolve()
        } else {
          reject()
        }
      }).catch(reject)
    })
  }

  toJson() {
    return {
      topics: toJS(this.topics),
      syncing: this.syncing,
      details: toJS(this.details),
      tab: this.tab
    }
  }
}

export default TopicStore
