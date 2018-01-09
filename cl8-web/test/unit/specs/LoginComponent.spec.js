import Vue from 'vue'
import { mount } from 'vue-test-utils'
import LoginComponent from '@/components/LoginComponent'

// importing this file, because imports EventEmitter, which is a class, causes
// an error alone the lines of `SyntaxError: Unexpected token export`
// how to I transpile it so jest doesn't choke on it?
import FirebaseService from '@/persistence/FirebaseService'
//
//
// const fbase = new FirebaseService()


describe('Login Component', () => {
  test('validSubmission', () => {
    // test that when we have a working email, the form shows as valid


    // let wrapper = mount(LoginComponent, {
    //   propsData: { fbase: fbase }
    // })
    //
    expect(0).toBe(1)
  })

})
