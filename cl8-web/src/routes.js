import Vue from 'vue'
import Router from 'vue-router'

import LoginComponent from '@/components/auth/LoginComponent'
import ResetPassword from '@/components/auth/ResetPassword'
// import Callback from '@/components/auth/Callback'
import LoggedInProfileComponent from '@/components/home/LoggedInProfileComponent'
import EditProfileComponent from '@/components/profile/EditProfileComponent'
import ProfilePhotoComponent from '@/components/profile/ProfilePhotoComponent'

// const debug = require('debug')('cl8.route')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'home',
      component: LoggedInProfileComponent,
      meta: { requiresAuth: true }
    },
    {
      path: '/edit',
      name: 'editProfile',
      component: EditProfileComponent,
      meta: { requiresAuth: true }
    },
    {
      path: '/photo',
      name: 'editProfilePhoto',
      component: ProfilePhotoComponent,
      meta: { requiresAuth: true }
    },
    {
      path: '/signin',
      name: 'signin',
      component: LoginComponent
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: ResetPassword
    },
    {
      path: '*',
      redirect: 'home'
    }
  ]
})

export default router
