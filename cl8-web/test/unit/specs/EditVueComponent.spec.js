import Vue from 'vue'
import {
  mount
} from 'vue-test-utils'

import ProfileComponent from '@/components/ProfileComponent'

let sampleProfileData = {
  "createdTime": "2017-11-11T12:40:59.000Z",
  "fields": {
    "Name": "Homer Simpson",
    "Tags": [{
        "Name": "donuts",
        "id": "rec7BPWAthDqPSOeY"
      },
      {
        "Name": "Duff Beer",
        "id": "recoHNloW0Nk9M9JK"
      },
      {
        "Name": "taverns",
        "id": "recvyDsYcNdJx91is"
      }
    ],
    "email": "homer.simpson@yahoo.com"
  },
  "id": "rec0CSbkZBm1wWluF"
}

describe('EditProfileComponent', () => {
  it('renders the corresponding number of Peeps', () => {
    let wrapper = mount(ProfileComponent, {
      propsData: {
        items: sampleProfileData,
        edit
      }
    })
  })
})
