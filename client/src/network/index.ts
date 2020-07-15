import { Message } from 'element-ui'
import qs from 'qs'
import NetworkState, { NetAction } from './state'
import Action from './action'
import Router from '../router'

const actions: NetAction[] = [
  ...Action
]

const Network = new NetworkState(actions, {
  errorHandler (e) {
    const res = e.response

    if (res && res.status) {
      switch (res.status) {
        case 404:
          Message.error('当前访问接口不存在')
          break
        case 401:
          Message.error('当前接口无访问权限')
          break
        case 500:
          Message.error('服务器错误')
          break
        default:
          Message.error(`未知的服务器异常发生了，请联系管理员处理，错误状态码: ${res.status}`)
          break
      }
    }
  },
  beforeRequest (data) {
    /* 转换成表单结构发送 */
    return qs.stringify(data)
  },
  afterResponse (res) {
    const resCode = res.data.retCode

    /* 发生错误 */
    if (resCode === 101) {
      Message.error(res.data.retMsg)
    }

    if (resCode === 104) {
      Message.error(res.data.retMsg)
      Router.push({
        name: 'Login'
      })
    }
  }
}, {
  validateStatus (status) {
    return status === 200
  }
})

export default Network
