import Vue from 'vue'
import { mount } from '@vue/test-utils'

import ProfileSearchItem from '@/components/profile/ProfileSearchItem.vue'

let sampleData = {
  "fields": {
    "admin": "true",
    "blurb": "",
    "email": "gavin@dgen.net",
    "facebook": "",
    "linkedin": "linkedin.com/in/gavinstarks",
    "name": "Gavin Starks",
    "phone": "",
    "photo": [
      {
        "filename": "me.jpg",
        "id": "attRK0RjZbid1A4Yp",
        "size": 258862,
        "thumbnails": {
          "large": {
            "height": 512,
            "url": "https://dl.airtable.com/9A3XP2U7TvWKZVAZXtc0_large_me.jpg",
            "width": 519
          },
          "small": {
            "height": 36,
            "url": "https://dl.airtable.com/v3cYyYiiQ21uXBPgzesu_small_me.jpg",
            "width": 37
          }
        },
        "type": "image/jpeg",
        "url": "https://dl.airtable.com/8Ip7mLs3RiGt2BR4B99m_me.jpg"
      }
    ],
    "tags": [
      {
        "id": "rec8AoQ0MPMJQxYKK",
        "name": "Open Data"
      },
      {
        "id": "rec0E1cKWxINp13lg",
        "name": "Air Quality"
      }
    ],
    "twitter": "agentGav",
    "visible": "yes",
    "website": "dgen.net"
  },
  "id": "rec9zRtYSMEj8CoJk",
  "id": "recxxxxxxxxxxxxxx",
  ".key": "45"
}

describe.skip('ProfileSearchItem', () => {
  it('shows a user provided photo if present', () => {
    let wrapper = mount(ProfileSearchItem, {
      propsData: { item: sampleData }
    })
    expect(wrapper.findAll('img.supplied-photo').length).toBe(1)
    expect(wrapper.findAll('.gravatar').length).toBe(0)
  })
  it('otherwise shows a gravatar image', () => {
    let copyData = JSON.parse(JSON.stringify(sampleData))
    copyData.fields.photo = []
    let wrapper = mount(ProfileSearchItem, {
      propsData: { item: copyData }
    })
    expect(wrapper.findAll('img.supplied-photo').length).toBe(0)
    expect(wrapper.findAll('.gravatar').length).toBe(1)
  })
})
