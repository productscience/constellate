
import { mount, shallow, createLocalVue } from 'vue-test-utils'
import VeeValidate from 'vee-validate'
import LoginComponent from '@/components/LoginComponent'



// we need to augment our Vue object for this component test
// as we're not evaluating any setup in main.js
const localVue = createLocalVue()
const config = { events: 'blur' }
localVue.use(VeeValidate, config)


// importing this file, because imports EventEmitter, which uses new syntax,
// giving an  an error alone the lines of `SyntaxError: Unexpected token export`

// how to I transpile it so jest doesn't choke on it?

// it turns out the solution is pass in a mock, and don't try to import es6-like
// that uses export statements

// TODO add tests   later, because fighting with babel will take hours to learn
// and reading the mocks docs and getting that will take hour s too
// import FirebaseService from '@/persistence/FirebaseService'


// check that a component renders

// check the interaction update the internal state of the component

// no need to check the rendering as Vue already has this covered

describe('Login Component', () => {

  // declare variable to overwrite
  let $mounted
  let otherMount

  describe('mounts with expected data', () => {
    let minimumData = { fbase: {} }

    beforeEach(() => {
      // $mount mounts the component, using the same lifecycle method
      // as vue itself uses
      // $mounted = new Vue(LoginComponent).$mount({propsData: minimumData})

      // whereas mount is the one defined in the test utils
      otherMount = mount(LoginComponent, {propsData: minimumData})
    })

    test('login mounts', () => {
      expect(otherMount.html()).toMatchSnapshot()
    })

    test('validSubmission', () => {

      // input when there's no data should be invalid
      expect().toBe(1)
    })
  })





  // the check that hitting when submit is triggered,
  // the onsubmit function is called
})
