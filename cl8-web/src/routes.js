import Vue from 'vue'
import Router from 'vue-router'

import store from './store'

import LoginComponent from '@/components/auth/LoginComponent'
import ResetPassword from '@/components/auth/ResetPassword'
// import Callback from '@/components/auth/Callback'
import LoggedInProfileComponent from '@/components/home/LoggedInProfileComponent'
import EditProfileComponent from '@/components/profile/EditProfileComponent'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'home',
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
      name: 'editProfile',
      component: EditProfileComponent
    },
    {
      path: '/signin',
      name: 'signin',
      component: LoginComponent
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPassword
    },
    {
      path: '/',
      redirect: '/signin'
    }
  ]
})
