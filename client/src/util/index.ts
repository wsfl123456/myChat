import Vue from 'vue'

const vm = new Vue()

export function getCookie () {
  const cookie = vm.$cookies.get('userInfo') ? JSON.parse(`{${decodeURIComponent(`${vm.$cookies.get('userInfo')}`).split(':{')[1]}`) : ''
  return cookie
}
/* 清除全部Cookie */
export function deleteAllCookies () {
  const cookies = document.cookie.split(';')

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

/* 滚动最底端 */
export function scrollBottom () {
  const $list = document.querySelector('.chat_msg-list') as any
  $list.scrollTop = $list.scrollHeight
}

/* 日期格式化 */
export function formatDate (format: string) {
  const date = new Date()
  const obj = {
    YY: date.getFullYear(),
    MM: (date.getMonth() + 1 > 9) ? date.getMonth() + 1 : `0${date.getMonth() + 1}`,
    DD: (date.getDate() > 9) ? date.getDate() : `0${date.getDate()}`,
    hh: (date.getHours() > 9) ? date.getHours() : `0${date.getHours()}`,
    mm: (date.getMinutes() > 9) ? date.getMinutes() : `0${date.getMinutes()}`
  }
  return format === 'Y-M-D' ? `${obj.YY}-${obj.MM}-${obj.DD}` : `${obj.YY}-${obj.MM}-${obj.DD} ${obj.hh}:${obj.mm}`
}
