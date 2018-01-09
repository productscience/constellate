import Vue from 'vue'
import { mount } from 'vue-test-utils'

// import LoginComponent from '@/components/LoginComponent'
import FirebaseService from '@/persistence/FirebaseService'


const fbase = new FirebaseService()


describe('Login Component', () => {
  test('validSubmission', () => {
    // let wrapper = mount(LoginComponent, {
    //   propsData: { fbase: fbase }
    // })
    //
    expect(0).toBe(1)
  })

})
