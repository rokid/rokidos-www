import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Network from '@/components/Network'
import Upgrade from '@/components/Upgrade'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: '首页',
    component: Home
  }, {
    path: '/network',
    name: '网络',
    component: Network
  }, {
    path: '/upgrade',
    name: '系统升级',
    component: Upgrade
  }]
})
