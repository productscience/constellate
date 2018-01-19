function linkify (url, prefix) {
  // check if link already starts with 'http:', return if so
  let pattern = RegExp(/https?:/)
  if (pattern.test(url)) {
    return url
  }

  if (prefix) {
    return `http://${prefix}/${url}`
  } // looks like we need to add it outselves. We can't assume https

  return `http://${url}`
}

export default linkify
