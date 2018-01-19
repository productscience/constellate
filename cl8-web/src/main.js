// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
import Vue from 'vue'
import App from './App'
import router from './routes'
import store from './store'
import VeeValidate from 'vee-validate'
import VueFire from 'vuefire'
import VueFuse from 'vue-fuse'
import fbase from './fbase'
import VueAnalytics from 'vue-analytics'

import debugLib from 'debug'
const debug = debugLib('cl8.main.js');

Vue.config.productionTip = false
Vue.config.devtools = true

const vvConfig = {
  events: 'blur',
  class: true
}
Vue.use(VeeValidate, vvConfig)
Vue.use(VueFuse)
Vue.use(VueFire)

Vue.use(VueAnalytics, {
  id: process.env.GOOGLE_ANALYTICS_UA,
  router
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
