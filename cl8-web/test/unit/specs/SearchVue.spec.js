import Vue from 'vue'
import { mount } from 'vue-test-utils'

import SearchViewComponent from '@/components/SearchViewComponent'

let sampleData = [
  {
    "createdTime": "2017-11-11T12:40:59.000Z",
    "fields": {
      "Name": "Homer Simpson",
      "Tags": [
        {
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
  },
  {
    "createdTime": "2017-11-11T12:38:10.000Z",
    "fields": {
      "Name": "Abu",
      "email": "abu@gmail.com"
    },
    "id": "rec0tJpLlYD0U2Yyh"
  },
  {
    "createdTime": "2017-11-11T12:38:10.000Z",
    "fields": {
      "Name": "Barney Gumble",
      "Tags": [
        {
          "Name": "Duff Beer",
          "id": "recoHNloW0Nk9M9JK"
        },
        {
          "Name": "taverns",
          "id": "recvyDsYcNdJx91is"
        }
      ],
      "email": "barney@gumble.com"
    },
    "id": "rec0y5uKd1vrFnr5c"
  }
]

describe('SearchViewComponent', () => {
  it('renders the corresponding number of Peeps', () => {
    const wrapper = mount(SearchViewComponent, {
      propsData: { items: sampleData }
    })
    expect(wrapper.findAll('li.peep').length).toBe(3)
  })
})

describe('SearchViewComponent tag filtering', () => {
  it('shows a filtered view when we have one active tags', () => {
    const wrapper = mount(SearchViewComponent, {
      propsData: { items: sampleData, terms : [ 'taverns'] }
    })
    expect(wrapper.findAll('li.peep').length).toBe(2)
  })

  it('shows a filtered view when we have multiple active tags', () => {
    const wrapper = mount(SearchViewComponent, {
      propsData: { items: sampleData, terms : [ 'taverns', 'donuts'] }
    })
    expect(wrapper.findAll('li.peep').length).toBe(1)
    // expect only Homer Simpson to be in the list
  })
})
