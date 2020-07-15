<template>
  <div class='index'>
    <div class="index_area">
      <div class="index_area_left">
        <div class="index_area_left_top">
          <Avator :paramInfo='myInfo' :logoutBtn='true' :editBtn='true' :size='45' />
          <AddFriend />

          <div class="index_area_left_top_alert" v-if="!myInfo.nickname && showAlert" @click="toEdit">
            <span>《《 </span>
            <span>请完善个人信息</span>
          </div>
        </div>
        <div class="index_area_left_content">
          <FriendList />
        </div>
      </div>
     <router-view></router-view>
    </div>
  </div>
</template>
<script lang='ts'>
import './index.less'
import './index'
import { Component, Vue, Watch } from 'vue-property-decorator'
import Network from '../../network'
import { UserInfo, UserListRes, UserInfoRes } from '../../interface'
import { Message } from 'element-ui'
import Avator from '../../components/Avatar/index.vue'
import AddFriend from '../../components/AddFriend/index.vue'
import FriendList from '../../components/FriendList/index.vue'
import { getCookie } from '../../util/index'

@Component({
  components: {
    Avator,
    AddFriend,
    FriendList
  }
})
export default class Index extends Vue {
  @Watch('refreshInfo') handle (bol: boolean) {
    if (bol === true) {
      this.getMyInfo()
      this.$store.commit('refreshInfo', false)
    }
  }

  showAlert = true

  myInfo: any = {}

  userList: UserInfo[] = []

  getMyInfo () {
    this.myInfo = getCookie()
  }

  toEdit () {
    this.showAlert = false
    this.$router.push({ name: 'EditInfo' })
  }

  get refreshInfo () {
    return this.$store.state.isRefreshInfo
  }

  async getUserList () {
    const userListRes = await Network.fetch<UserListRes>('UserInfo')
    this.userList = userListRes.data.retData.data
  }

  created () {
    this.getMyInfo()
    this.getUserList()
  }
}
</script>
