import { createLocalVue } from '@vue/test-utils'
import Store from '../../../src/store'
import Vuex from 'vuex'

describe('Store/Actions/fetchUserList', () => {
  describe('authed', () => {
    it('fetches a list of users from our API server ', async () => {
      //  instantivate Vue
      const localVue = createLocalVue()
      localVue.use(Vuex)
      const store = new Vuex.Store(Store)
      // call action
      await store.dispatch('fetchProfileList')
      // assert we have what we think we have
      expect(store.state.profileList).toHaveLength(3)
    })
  })

  describe.skip('not authed', () => {})
})

describe('Store/Actions/fetchVisibleUserList', () => {
  describe('authed', () => {
    it('fetches a list of visible users from our API server ', async () => {
      //  instantivate Vue
      const localVue = createLocalVue()
      localVue.use(Vuex)
      const store = new Vuex.Store(Store)
      // call action
      await store.dispatch('fetchVisibleProfileList')
      // assert we have what we think we have
      expect(store.state.visibleProfileList).toHaveLength(2)
    })
  })

  describe.skip('not authed', () => {})
})
