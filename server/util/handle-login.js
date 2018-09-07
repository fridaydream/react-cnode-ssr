const axios = require('axios')
const baseUrl = 'http://cnodejs.org/api/v1'
module.exports = async (ctx, next) => {
  axios.post(`${baseUrl}/accesstoken`, {
    accesstoken: ctx.request.body.accessToken
  })
    .then(resp => {
      if (resp.status === 200 && resp.data.success) {
        ctx.session.user = {
          accessToken: ctx.request.body.accessToken,
          loginName: resp.data.loginname,
          id: resp.data.id,
          avatarUrl: resp.data.avatar_url,
        }
        ctx.body = {
          success: true,
          data: resp.data
        }
      }
    })
    .catch(err => {
      if(err.response) {
        ctx.body = {
          success: false,
          data: err.response.data
        }
      } else {
        next(err)
      }
    })
}

