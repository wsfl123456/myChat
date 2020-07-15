import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '../store'
import { getCookie } from '../util/index'
import { Message } from 'element-ui'

Vue.use(VueRouter)

const vm = new Vue()

const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login/index.vue')
  },
  {
    path: '/',
    name: 'Index',
    component: () => import(/* webpackChunkName: "about" */ '../views/Index/index.vue'),
    children: [
      {
        path: 'chat/:userId',
        name: 'Chat',
        component: () => import(/* webpackChunkName: "about" */ '../components/Chat/index.vue')
      },
      {
        path: 'editInfo',
        name: 'EditInfo',
        component: () => import(/* webpackChunkName: "about" */ '../components/EditInfo/index.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name === 'Login') {
    if (getCookie()) {
      vm.$cookies.remove('userInfo')
      store.commit('disconnect')
    }
    next()
  } else {
    if (getCookie()) {
      next()
    } else {
      Message.warning('登陆失效')
      next({
        name: 'Login'
      })
    }
  }
})

export default router
