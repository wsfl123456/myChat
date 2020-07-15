<template>
  <div class='chat'>
      <div class="chat_title">{{ this.userInfo.nickname }}</div>
      <div class="chat_msg-list" ref="chat_msg-list">
         <div class="chat_msg-list_item" v-for="(i, k) in msgArr" :key="k">
           <div class="chat_msg-list_item_right" v-if="i.fromUserId === myInfo.id">
             <span class="clr-888 mr-10 font-12">({{ i.time.split(' ')[0] === curDate ? i.time.split(' ')[1] :  i.time}})</span>
             <Arrow class="mr-20" :msg='i.msg' :arrow='1' />
             <Avator :paramInfo='{ id: i.fromUserId, picture: i.fromUserPicture}' :size="30"  />
           </div>
           <div class="chat_msg-list_item_left" v-else>
             <Avator :paramInfo='{ id: i.fromUserId, picture: i.fromUserPicture}' :size="30"  />
             <Arrow class="ml-20" :msg='i.msg' :arrow='0' />
             <span class="clr-888 ml-10 font-12">({{ i.time.split(' ')[0] === curDate ? i.time.split(' ')[1] :  i.time}})</span>
           </div>
         </div>
      </div>
      <div class="chat_operat">
          <el-input v-model="sendValue" ref="chatInput" type="textarea" @keyup.enter.native="submit" placeholder='输入内容'></el-input>
      </div>
  </div>
</template>
<script lang='ts'>
import './index.less'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Message } from 'element-ui'
import { getCookie, scrollBottom, formatDate } from '../../util/index'
import Network from '../../network'
import { UserInfo, UserInfoRes } from '../../interface'
import Avator from '../../components/Avatar/index.vue'
import Arrow from '../../components/Arrow/index.vue'

@Component({
  components: {
    Avator,
    Arrow
  }
})
export default class Chat extends Vue {
  $refs: any = {
    chatInput: HTMLFormElement
  }

  @Watch('userId', { immediate: true }) async handleChange (id: number) {
    const userInfoRes = await Network.fetch<UserInfoRes>('UserInfo', { id })
    this.userInfo = userInfoRes.data.retData.data
    this.$refs.chatInput.focus()
    scrollBottom()
  }

  sendValue = ''
  get userId () {
    return Number(this.$route.params.userId)
  }

  get myInfo (): any {
    return getCookie()
  }

  get msgArr () {
    return this.$store.state.msgArr.filter((e: any) => {
      if (e.toUserId === this.userId || e.fromUserId === this.userId) {
        return true
      } else {
        return false
      }
    })
  }

  get curDate () {
    return formatDate('Y-M-D')
  }

  userInfo: any = {}

  submit () {
    /* 每次按回车键，sendValue的值就会在尾部添加'/n' */
    if (this.sendValue.length > 1) {
      const time = formatDate('')
      const obj = {
        time: time,
        msg: this.sendValue,
        toUserId: this.userInfo.id,
        toUserPicture: this.userInfo.picture,
        fromUserId: this.myInfo.id,
        fromUserPicture: this.myInfo.picture
      }
      this.sendValue = ''
      this.$store.commit('submit', obj)
    } else {
      this.sendValue = ''
    }
  }

  mounted () {
    scrollBottom()
  }
}
</script>
