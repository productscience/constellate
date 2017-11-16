import Vue from 'vue'
import Router from 'vue-router'
import LoggedInProfileComponent from '@/components/LoggedInProfileComponent'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LoggedInProfileComponent',
      component: LoggedInProfileComponent
    }
  ]
})
