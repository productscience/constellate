import Vue from 'vue'
import Router from 'vue-router'
import LoggedInProfileComponent from '@/components/LoggedInProfileComponent'
import Callback from '@/components/Callback'

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
      path: '/callback',
      name: 'Callback',
      component: Callback
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})
