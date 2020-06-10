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

describe('Linkify with social media prefixes', () => {
  it('leaves links that already have the url in them alone', () => {
    let url = 'https://twitter.com/username'
    let prefix = 'https://twitter.com'
    let newUrl = linkify(url, prefix)
    expect(newUrl).toBe('https://twitter.com/username')
  })
  it('adds domains prefix if it are missing', () => {
    ;('username')
    let url = 'username'
    let prefix = 'https://twitter.com'
    let newUrl = linkify(url, prefix)
    expect(newUrl).toBe('https://twitter.com/username')
  })
})
