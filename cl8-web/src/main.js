// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './routes'

import VueFuse from 'vue-fuse'
import VueFire from 'vuefire'

import VeeValidate from 'vee-validate'

Vue.config.productionTip = false
Vue.config.devtools = true

const config = {
  events: 'blur',
  class: true
}

Vue.use(VueFuse)
Vue.use(VueFire)
Vue.use(VeeValidate, config)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
