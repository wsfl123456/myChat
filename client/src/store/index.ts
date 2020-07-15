/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client'
import { scrollBottom } from '../util/index'
import Network from '../network'
import { GetMsgArrRes } from '../interface'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: '',
    socket: {} as any,
    msgArr: [] as any,
    isRefreshInfo: false,
    isRefreshPendingFriend: false,
    isRefreshAgreeFriend: false
  },
  mutations: {
    /* socket */
    init (state, userId) {
      // state.socket = io.connect('http://192.168.0.107:4000', {
      state.socket = io.connect('http://47.100.60.27:4000') //正式
      // state.socket = io.connect('http://10.1.4.68:4000') //本地
      state.socket.emit('addUser', userId)
    },
    disconnect (state) {
      state.socket.emit('mydisconnect')
      state.socket = {}
    },
    addFriend (state, userId) {
      state.socket.emit('addFriend', userId)
    },
    agreeFriend (state, userId) {
      state.socket.emit('agreeFriend', userId)
    },
    submit (state, obj) {
      state.socket.emit('sendMsg', obj)
    },
    message (state, userId) {
      const vm = this as any
      state.socket.on('sendMsgTo' + userId, function (obj: any) {
        state.msgArr.push(obj)
        /* 每次获取新数据时，消息列表滚动到最底部 */
        setTimeout(() => {
          scrollBottom()
        })
      })
      state.socket.on('addFriendTo' + userId, function () {
        vm.commit('refreshPendingFriend', true)
      })
      state.socket.on('agreeFriendTo' + userId, function () {
        vm.commit('refreshAgreeFriend', true)
      })
    },
    setMsgArr (state, obj) { //  登陆时给msgArr赋值
      state.msgArr = obj
    },

    /* 其他 */
    refreshInfo (state, bol) { //  登陆时给msgArr赋值
      state.isRefreshInfo = bol
    },
    refreshPendingFriend (state, bol) {
      state.isRefreshPendingFriend = true
    },
    refreshAgreeFriend (state, bol) {
      state.isRefreshAgreeFriend = true
    }
  },
  actions: {
    async SetMsgArr ({ commit }, showId) {
      console.log(111)
      console.log(showId)
      const params = {
        showId
      }
      const getMsgArrRes = await Network.fetch<GetMsgArrRes>(
        'GetMsgArr',
        params
      )
      if (getMsgArrRes.data.retCode === 100) commit('setMsgArr', getMsgArrRes.data.retData.data)
    }
  },
  modules: {}
})
