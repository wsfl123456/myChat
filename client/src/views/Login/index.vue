<template>
  <div class='login' id="login">
    <canvas height="620" width="1360" id="canvas" style="position: absolute; height: 100%;z-index: -1;"></canvas>

    <div class='login_area'>
      <!-- tabs start -->
      <div class='login_area_tabs'>
        <div
          :class='{ "login_area_tabs--active": activeTab === i }'
          v-for='i in tabs'
          :key='i'
          @click='activeTab = i'
        >{{ i }}</div>
      </div>
      <!-- tabs end  -->
      <div class='login_area_content'>
        <!-- 登陆 start -->
        <div v-if='activeTab === tabs[0]'>
          <div class='login_area_content_item'>
            <span>用户名：</span>
            <el-input v-model="loginParams.userName" type='text' placeholder='请输入用户名'></el-input>
          </div>
          <div class='login_area_content_item'>
            <span>密码：</span>
            <el-input v-model="loginParams.password" type='password' placeholder='请输入密码'></el-input>
          </div>
          <div class='login_area_content_btn'>
            <el-button type='primary' @click="login">登&nbsp;录</el-button>
          </div>
        </div>
        <!-- 登陆 end -->

        <!-- 注册 start -->
        <div v-else>
          <div class='login_area_content_item'>
            <span>用户名：</span>
            <el-input v-model='registeredParams.userName' type='text' placeholder='请输入用户名'></el-input>
          </div>
          <div class='login_area_content_item'>
            <span>密码：</span>
            <el-input v-model='registeredParams.password' type='text' placeholder='请输入密码'></el-input>
          </div>
          <div class='login_area_content_item'>
            <span>确认密码：</span>
            <el-input v-model='registeredParams.surePassword' type='text' placeholder='请确认密码'></el-input>
          </div>
          <div class='login_area_content_btn'>
            <el-button type='primary' @click='registered'>注&nbsp;册</el-button>
          </div>
        </div>
        <!-- 注册 end -->
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import './index.less'
import { canvas } from './index'
import { Component, Vue } from 'vue-property-decorator'
import Network from '../../network'
import { RegisteredRes, LoginRes } from '../../interface'
import { Message } from 'element-ui'

enum Tabs {
  login = '登陆',
  registered = '注册'
}

interface RegisteredParams {
  userName: string;
  password: string;
  surePassword: string;
}

interface LoginParams {
  userName: string;
  password: string;
}

const registeredRegexCheck = new Map([
  [['registeredParams', 'userName'], '请输入用户名'],
  [['registeredParams', 'password'], '请输入密码'],
  [['registeredParams', 'surePassword'], '请确认密码']
])

const loginRegexCheck = new Map([
  [['loginParams', 'userName'], '请输入用户名'],
  [['loginParams', 'password'], '请输入密码']
])

@Component({})
export default class Login extends Vue {
  tabs: string[] = [Tabs.login, Tabs.registered];

  activeTab: Tabs = Tabs.login;

  registeredParams: RegisteredParams = {
    userName: '',
    password: '',
    surePassword: ''
  };

  loginParams: LoginParams = {
    userName: '',
    password: ''
  };

  regexCheck (val: any): boolean { /* 判断表单是否为空函数 */
    let check = true

    try {
      val.forEach((value: string, key: string[]) => {
        let vm = this as any
        key.forEach((ele) => {
          vm = vm[ele]
        })
        if ((!vm && vm !== 0) || (Array.isArray(vm) && vm.length === 0)) {
          check = false
          Message.warning(value)
          throw new Error('break')
        }
      })
    } catch (err) {
      console.log(err)
    }

    return check
  }

  get socket () {
    return this.$store.state.socket
  }

  async registered () {
    /* 表单校验 */
    if (!this.regexCheck(registeredRegexCheck)) return
    if (this.registeredParams.password && this.registeredParams.password !== this.registeredParams.surePassword) {
      Message.warning('两次输入的密码须一致')
      return
    }

    const params = {
      userName: this.registeredParams.userName,
      password: this.registeredParams.password
    }
    const registeredRes = await Network.fetch<RegisteredRes>(
      'Registered',
      params
    )
    if (registeredRes.data.retCode === 100) {
      Message.success(registeredRes.data.retMsg)
    }
  }

  async login () {
    /* 表单校验 */
    if (!this.regexCheck(loginRegexCheck)) return

    const params = {
      userName: this.loginParams.userName,
      password: this.loginParams.password
    }
    const loginRes = await Network.fetch<LoginRes>(
      'Login',
      params
    )
    if (loginRes.data.retCode === 100) {
      Message.success(loginRes.data.retMsg)
      this.$store.commit('init', loginRes.data.retData.data.id)
      this.$store.commit('message', loginRes.data.retData.data.id)
      this.$store.dispatch('SetMsgArr', loginRes.data.retData.data.id)
      this.$router.push({
        name: 'Index'
      })
    }
  }

  mounted () {
    canvas()
  }
}
</script>
