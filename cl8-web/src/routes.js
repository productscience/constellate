import Vue from 'vue'
import Router from 'vue-router'

import LoginComponent from '@/components/auth/LoginComponent'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: 'signin',
      name: 'LoginComponent',
      component: LoginComponent
    },
    {
      path: '/',
      redirect: '/signin'
    }
  ]
})
