<template>
  <div class='avator'>
    <el-popover
      placement="right-start"
      width="240"
      trigger="hover"
      @show="getUserInfo"
      >
      <div>
          <div class="avator_popover_header">
              <div class="avator_popover_header_left">
                  <div class="avator_popover_header_left_nickname">
                      <span>{{ userInfo.nickname }}</span>
                      <img v-if="userInfo.sex === '男'" src="../../assets/imgs/man.svg" alt="" width="25">
                      <img v-else src="../../assets/imgs/woman.svg" alt="" width="25">
                  </div>
                  <div class="avator_popover_header_left_signature">
                      签&nbsp;名：{{ userInfo.signature }}
                  </div>
              </div>
              <el-avatar shape="square" :size="45" :src="paramInfo.picture"></el-avatar>
          </div>
          <div class="avator_popover_body">
            <div> <span>用户名：</span>{{ userInfo.userName }}</div>
            <div><span>地&nbsp;区：</span>{{ userInfo.address }}</div>
          </div>
          <div class="avator_popover_footer">
             <el-button v-if="delUserBtn" type="danger" size='small'>删除</el-button>

             <el-button v-if="AddFriendBtn" type="success" size='small' @click="addFriend">添加</el-button>

             <el-button v-if="pendingFriendBtn" type="success" size='small' @click="agreeFriend(1)">同意</el-button>
             <el-button v-if="pendingFriendBtn" type="success" size='small' @click="agreeFriend(0)">取消</el-button>

             <el-button v-if="editBtn" type="primary" size='small' @click="$router.push({ name: 'EditInfo' })">修改信息</el-button>

             <el-button v-if="logoutBtn" type="danger" size='small' @click="$router.push({ name: 'Login' })">退出登录</el-button>
          </div>
      </div>
      <el-avatar slot="reference" shape="square" :size="size ? size : 25" :src="paramInfo.picture"></el-avatar>
    </el-popover>
  </div>
</template>
<script lang='ts'>
import './index.less'
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Network from '../../network'
import { UserInfo, UserInfoRes, AddFriendRes, AgreeFriendRes } from '../../interface'
import { Message } from 'element-ui'

@Component({})
export default class Avator extends Vue {
  @Prop(Object) readonly paramInfo!: {
    id: number;
    picture: string;
  };

  @Prop(Number) readonly size!: number

  @Prop({ default: false }) readonly delUserBtn!: boolean

  @Prop({ default: false }) readonly editBtn!: boolean

  @Prop({ default: false }) readonly AddFriendBtn!: boolean

  @Prop({ default: false }) readonly pendingFriendBtn!: boolean

  @Prop({ default: false }) readonly logoutBtn!: boolean

  userInfo: any = {}
  async getUserInfo () {
    const userInfoRes = await Network.fetch<UserInfoRes>('UserInfo', { id: this.paramInfo.id })
    this.userInfo = userInfoRes.data.retData.data
  }

  async addFriend () {
    const addFriendRes = await Network.fetch<AddFriendRes>('AddFriend', { id: this.paramInfo.id })
    if (addFriendRes.data.retCode === 100) {
      Message.success(addFriendRes.data.retMsg)
      this.$store.commit('addFriend', this.paramInfo.id)
    }
  }

  @Emit('refresh')
  async agreeFriend (state: number) {
    const agreeFriendRes = await Network.fetch<AgreeFriendRes>('AgreeFriend', { id: this.paramInfo.id, state })
    if (agreeFriendRes.data.retCode === 100) {
      this.$store.commit('agreeFriend', this.paramInfo.id)
      Message.success(agreeFriendRes.data.retMsg)
    }
  }
}
</script>
