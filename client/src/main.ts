import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../src/assets/base.less'
import VueCookies from 'vue-cookies'
import { getCookie } from './util/index'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueCookies)

/* 刷新页面时重新链接socket,以及获取msgArr */
if (getCookie()) {
  store.dispatch('SetMsgArr', getCookie().id)
  store.commit('init', getCookie().id)
  store.commit('message', getCookie().id)
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
