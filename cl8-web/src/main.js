// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueFuse from 'vue-fuse'
import VueFire from 'vuefire'
import VeeValidate from 'vee-validate'

Vue.config.productionTip = false

Vue.use(VueFuse)
Vue.use(VueFire)
Vue.use(VeeValidate)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
