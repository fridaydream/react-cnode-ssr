const axios = require('axios')
const baseUrl = 'https://cnodejs.org/api/v1' //https,经测试 http 会报404, 坑
const qs = require('qs')
module.exports = async (ctx, next) => {
  try {
    console.log('url', `${baseUrl}/accesstoken`,qs.stringify(ctx.request.body.accessToken))
    const resp = await axios.post(`${baseUrl}/accesstoken`, qs.stringify({
      accesstoken: ctx.request.body.accessToken
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    if (resp.status === 200 && resp.data.success) {
      console.log('okkkk', ctx.request.body.accessToken)
      ctx.session = {
        user: {
          accesstoken: ctx.request.body.accessToken,
          loginname: resp.data.loginname,
          id: resp.data.id,
          avatarurl: resp.data.avatar_url
        }
      }
      ctx.body = {
        success: true,
        data: resp.data
      }
    }
  }catch(err) {
    ctx.body = {
      success: false,
      data: err.response.data
    }
  }
}
