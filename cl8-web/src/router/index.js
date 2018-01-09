import Vue from 'vue'
import Router from 'vue-router'
import LoggedInProfileComponent from '@/components/LoggedInProfileComponent'
import EditProfileComponent from '@/components/EditProfileComponent'
// import Callback from '@/components/Callback'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'LoggedInProfileComponent',
      component: LoggedInProfileComponent
    },
    {
      path: '/edit',
      name: 'EditProfileComponent',
      component: EditProfileComponent
    },
    // we don't need this now
    // {
    //   path: '/callback',
    //   name: 'Callback',
    //   component: Callback
    // },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})
