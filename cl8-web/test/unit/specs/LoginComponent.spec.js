
import { mount, shallow, createLocalVue } from 'vue-test-utils'
import VeeValidate from 'vee-validate'
import LoginComponent from '@/components/LoginComponent'

// we need to augment our Vue object for this component test
// as we're not evaluating any setup in main.js
const localVue = createLocalVue()
const config = { events: 'blur' }
localVue.use(VeeValidate, config)

describe('LoginComponent.Vue', () => {

  // declare variable to overwrite
  let wrapper

  describe('mounts with expected data', () => {
    let minimumData = { email: '', password: null }

    beforeEach(() => {
      wrapper = mount(LoginComponent, {propsData: minimumData})
    })

    test('login mounts', () => {
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('adding valid data', () => {

    test('the submit button should be disabled with invalid data', () => {
      return localVue.nextTick(() => {
        expect(wrapper.find('button').element.disabled).toBe(true)
      })
    })

    test('the submit button should no longer be disabled', () => {
      let validProps = {
        email: 'chris@productscience.co.uk',
        password: 'topSekrit'
      }
      wrapper.setProps(validProps)
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
