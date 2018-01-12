import Vue from 'vue'
import Router from 'vue-router'

import store from './store'

import LoginComponent from '@/components/auth/LoginComponent'
// import Callback from '@/components/auth/Callback'
import LoggedInProfileComponent from '@/components/home/LoggedInProfileComponent'
import EditProfileComponent from '@/components/profile/EditProfileComponent'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'LoggedInProfileComponent',
      component: LoggedInProfileComponent,
      beforeEnter (to, from, next) {
        if (store.state.user) {
          next()
        } else {
          next('/signin')
        }
      }
    },
    {
      path: '/edit',
      name: 'EditProfileComponent',
      component: EditProfileComponent
    },
    {
      path: '/signin',
      name: 'LoginComponent',
      component: LoginComponent
    },
    {
      path: '/',
      redirect: '/signin'
    }
  ]
})
