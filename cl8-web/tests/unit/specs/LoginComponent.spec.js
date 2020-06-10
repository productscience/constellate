
import { mount, shallow, createLocalVue } from '@vue/test-utils'
import VeeValidate from 'vee-validate'
import Login from '@/components/auth/Login.vue'

// we need to augment our Vue object for this component test
// as we're not evaluating any setup in main.js
const localVue = createLocalVue()
const config = { events: 'blur' }
localVue.use(VeeValidate, config)

describe.skip('Login.Vue', () => {

  // declare variable to overwrite
  let wrapper

  describe('mounts with expected data', () => {
    let minimumData = { email: '', password: null }

    beforeEach(() => {
      wrapper = mount(Login, {propsData: minimumData})
    })

    test('login mounts', () => {
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('adding valid data', () => {

    test('the submit button should be disabled with invalid data', () => {
        expect(wrapper.find('button').element.disabled).toBe(true)
    })

    test('the submit button should no longer be disabled', () => {
      let validProps = {
        email: 'chris@productscience.co.uk',
        password: 'topSekrit'
      }
      wrapper.setProps(validProps)
      // Because validation occurs on blur, I think we need to simulate this
      let passwordInput = wrapper.find("[name='password']")
      passwordInput.trigger('blur')

      return localVue.nextTick().then(() => {

        // console.log(otherMount.find('button').element.disabled)
        expect(wrapper.find('button').element.disabled).toBe(false)
      })
    })
  })

  describe('making a submission triggers our signIn function', () => {
    // add valid data

    // next tick?

    // hit submit

    // check that signin function was called
  })

})
