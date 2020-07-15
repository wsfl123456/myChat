<template>
  <div class='friend-list'>
      <div class="friend-list_pending">
          <div class="friend-list_pending_title" @click="changeActiveManul(1)">
              <i :class="{'el-icon-arrow-down': activeManul === 1, 'el-icon-arrow-right': activeManul !== 1}"></i>
              <span>新的朋友</span>
              <span v-show="pendingUserList.length" class="fl-badge">{{ pendingUserList.length }}</span>
          </div>
          <div v-if="activeManul === 1" class="friend-list_pending_list">
              <div v-for="i in pendingUserList" :key='i.id'>
                <Avator :paramInfo='i' :size="30" :pendingFriendBtn="true" @refresh="refresh" />
                <span> {{ i.nickname }}</span>
              </div>
          </div>
      </div>
      <div class="friend-list_user">
          <div class="friend-list_user_title" @click="changeActiveManul(2)">
              <i :class="{'el-icon-arrow-down': activeManul === 2, 'el-icon-arrow-right': activeManul !== 2}"></i>
              <span>我的好友</span>
              <span class="clr-888">（{{ userList.length }}）</span>
              <!-- <span v-show="userList.length" class="fl-badge">{{ userList.length }}</span> -->
          </div>
          <div v-if="activeManul === 2" class="friend-list_user_list">
              <div v-for="(i, k) in userList" :key='i.id' @click="toChat(i.id)" :style="{ 'background': Number($route.params.userId) === i.id ? '#f8f9fa' : '' }">
                <Avator :paramInfo='i' :size="40" />
                <div class="friend-list_user_list_nickname">
                    <div>{{ i.nickname }}</div>
                    <div>{{ lastList[k] ? lastList[k].lastMsg : '' }}</div>
                </div>
                <div class="friend-list_user_list_date">
                    {{ lastList[k] && lastList[k].lastTime ? (lastList[k].lastTime.split(' ')[0] === curDate ? lastList[k].lastTime.split(' ')[1] : lastList[k].lastTime.split(' ')[0]) : '' }}
                </div>
              </div>
          </div>
      </div>
  </div>
</template>
<script lang='ts'>
import './index.less'
import { Component, Vue, Watch } from 'vue-property-decorator'
import Network from '../../network'
import { UserInfo, GetPengingFriendRes, GetFriendRes } from '../../interface'
import Avator from '../../components/Avatar/index.vue'
import { Message } from 'element-ui'
import { getCookie, formatDate } from '../../util/index'

@Component({
  components: {
    Avator
  }
})
export default class FriendList extends Vue {
  @Watch('msgArr', { deep: true }) async handleChange (arr: any[]) {
    this.$nextTick(() => {
      this.userList.forEach((e, k) => {
        this.lastList.push({})
        arr.forEach(i => {
          if (i.toUserId === e.id || i.fromUserId === e.id) {
            this.lastList[k].lastMsg = i.msg
            this.lastList[k].lastTime = i.time
          }
        })
      })
    })
  }

  @Watch('userList', { deep: true }) async handleListChange (userList: any[]) {
    this.$nextTick(() => {
      userList.forEach((e: any, k: number) => {
        this.lastList.push({})
        this.msgArr.forEach((i: any) => {
          if (i.toUserId === e.id || i.fromUserId === e.id) {
            this.lastList[k].lastMsg = i.msg
            this.lastList[k].lastTime = i.time
          }
        })
      })
    })
  }

  @Watch('isRefreshPendingFriend') handlePending (bol: boolean) {
    if (bol === true) {
      this.getPendingUserList()
      this.$store.commit('refreshPendingFriend', false)
    }
  }

  @Watch('isRefreshAgreeFriend') handleAgree (bol: boolean) {
    if (bol === true) {
      this.getUserList()
      this.$store.commit('refreshAgreeFriend', false)
    }
  }

  get isRefreshPendingFriend () {
    return this.$store.state.isRefreshPendingFriend
  }

  get isRefreshAgreeFriend () {
    return this.$store.state.isRefreshAgreeFriend
  }

  get myInfo (): any {
    return getCookie()
  }

  get msgArr () {
    return this.$store.state.msgArr
  }

  get curDate () {
    return formatDate('Y-M-D')
  }

  activeManul = 2

  pendingUserList: UserInfo[] = []

  userList: UserInfo[] = []
  lastList: any = []
  toChat (userId: any) {
    this.$router.push({
      name: 'Chat',
      params: {
        userId
      }
    })
  }

  async getPendingUserList () {
    const userListRes = await Network.fetch<GetPengingFriendRes>('GetPengingFriend', { id: this.myInfo.id })
    this.pendingUserList = userListRes.data.retData.data
  }

  async getUserList () {
    const userListRes = await Network.fetch<GetFriendRes>('GetFriend')
    this.userList = userListRes.data.retData.data
  }

  changeActiveManul (val: number) {
    if (this.activeManul && this.activeManul === val) {
      this.activeManul = 0
    } else {
      this.activeManul = val
    }
  }

  refresh () {
    this.getPendingUserList()
    this.getUserList()
  }

  created () {
    this.getPendingUserList()
    this.getUserList()
  }
}
</script>
