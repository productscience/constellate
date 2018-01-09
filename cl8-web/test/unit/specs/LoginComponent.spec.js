import Vue from 'vue'
import { mount } from 'vue-test-utils'

// import LoginComponent from '@/components/LoginComponent'
import FirebaseService from '@/persistence/FirebaseService'


const fbase = new FirebaseService()


describe('Login Component', () => {
  test('validSubmission', () => {
    let wrapper = mount(LoginComponent, {
      propsData: { fbase: fbase }
    })
    expect(wrapper.findAll('img.supplied-photo').length).toBe(1)
    expect(wrapper.findAll('.gravatar').length).toBe(0)
  })

})
