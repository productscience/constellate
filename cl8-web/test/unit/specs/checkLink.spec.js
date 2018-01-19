import linkify from '../../../src/utils'

describe('Linkify', () => {
  it("adds 'http://' to domain.com if not present", () => {
    let url = 'domain.com'
    let newUrl = linkify(url)
    expect(newUrl).toBe('http://domain.com')
  })
  it("leaves 'http://domain.com' as is", () => {
    let url = 'http://domain.com'
    let newUrl = linkify(url)
    expect(newUrl).toBe('http://domain.com')
  })
  it("leaves 'https://domain.com' as is", () => {
    let url = 'https://domain.com'
    let newUrl = linkify(url)
    expect(newUrl).toBe('https://domain.com')
  })
})
