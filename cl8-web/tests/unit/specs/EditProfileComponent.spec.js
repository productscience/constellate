import Vue from 'vue'
import {
  mount
} from 'vue-test-utils'

import EditProfileComponent from '@/components/EditProfileComponent'

let sampleProfileData = [{
    "createdTime": "2017-11-11T12:38:10.000Z",
    "fields": {
      "Name": "Kristi",
      "Tags": [
        {
          "Name": "people",
          "id": "recnbHV3M0cJuvpSX"
        },
        {
          "Name": "project management",
          "id": "reca6punHhMVAtgvQ"
        }
      ],
      "email": "dakristi@gmail.com",
      "visible": "yes"
    },
    "id": "rec1sTx5sP34KoFVc"
  },
  {
    "createdTime": "2017-11-11T12:38:10.000Z",
    "fields": {
      "Name": "Robert",
      "email": "rabw@me.com",
      "visible": "yes"
    },
    "id": "rec1uRij092rNL5Ms"
  },
  {
    "createdTime": "2017-11-11T12:40:59.000Z",
    "fields": {
      "Name": "Danny O'Brien",
      "Tags": [
        {
          "Name": "policy",
          "id": "rec91e7jMNlKFGSBX"
        },
        {
          "Name": "Leadership",
          "id": "recq7cw7fwvEZAd6J"
        },
        {
          "Name": "tech",
          "id": "recxY2DHvjV3nX5Fr"
        }
      ],
      "email": "danny@spesh.com",
      "visible": "yes"
    },
    "id": "rec22hm3i74lmKpRE"
  }
]


describe('EditProfileComponent', () => {
  it('renders a list of Tags', () => {
    let wrapper = mount(EditProfileComponent, {
      propsData: {
        items: sampleProfileData
      }
    })
    expect(wrapper.vm.profileTags.length).toBe(5)
  })
})
