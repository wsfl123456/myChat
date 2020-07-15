<template>
  <div class='add-friend'>
      <el-popover
      placement="right-start"
      width="300"
      trigger="click"
      >
      <div>
          <el-input v-model="keyword" placeholder="输入关键字" />

          <div class="add-friend_list">
              <div class="add-friend_list_no-user" v-if="!regexUserList.length && this.keyword">无匹配用户～～～</div>
              <div class="add-friend_list_user" v-else v-for="i in regexUserList" :key="i.id">
                <Avator :paramInfo='i' :AddFriendBtn='true' />
                <span> {{ i.nickname }}</span>
              </div>
          </div>
      </div>
      <el-button slot="reference" type="primary" size="small" @click="getUserList">添加好友</el-button>
    </el-popover>
  </div>
</template>
<script lang='ts'>
import './index.less'
import { Component, Vue, Watch } from 'vue-property-decorator'
import Network from '../../network'
import { UserInfo, UserListRes, UserInfoRes } from '../../interface'
import Avator from '../../components/Avatar/index.vue'
import { Message } from 'element-ui'

@Component({
  components: {
    Avator
  }
})
export default class AddFriend extends Vue {
  @Watch('keyword') handleKeywordChange (keyword: string) {
    this.regexUserList = []
    const reg = new RegExp(keyword, 'i')
    keyword && this.userList.forEach(e => {
      if (reg.test(e.nickname)) {
        this.regexUserList.push(e)
      }
    })
  }

  keyword = ''

  userList: UserInfo[] = []

  regexUserList: UserInfo[] = []

  async getUserList () {
    const userListRes = await Network.fetch<UserListRes>('UserList')
    this.userList = userListRes.data.retData.data
  }
}
</script>
