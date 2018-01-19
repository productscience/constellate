function linkify(url) {
  // check if link already starts with 'http:', return if so
  let pattern = RegExp(/https?\:/)
  if (pattern.test(url)) {
    return url;
  }

  // looks like we need to add it outselves. We can't assume https
  let newUrl = `http://${url}`

  return newUrl
}

export default linkify;
