import { NetAction } from './state'

const Action: NetAction[] = [
  {
    url: '/registered',
    name: 'Registered',
    type: 'post'
  },
  {
    url: '/login',
    name: 'Login',
    type: 'post'
  },
  {
    url: '/editUserInfo',
    name: 'EditUserInfo',
    type: 'post'
  },
  {
    url: '/getMsgArr',
    name: 'GetMsgArr',
    type: 'post'
  },
  {
    url: '/userList',
    name: 'UserList',
    type: 'post'
  },
  {
    url: '/userInfo',
    name: 'UserInfo',
    type: 'post'
  },
  {
    url: '/addFriend',
    name: 'AddFriend',
    type: 'post'
  },
  {
    url: '/getPengingFriend',
    name: 'GetPengingFriend',
    type: 'post'
  },
  {
    url: '/agreeFriend',
    name: 'AgreeFriend',
    type: 'post'
  },
  {
    url: '/getFriend',
    name: 'GetFriend',
    type: 'post'
  }
]

export default Action
