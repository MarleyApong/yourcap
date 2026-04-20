module.exports.readVersion = function (contents) {
  return JSON.parse(contents).expo.version
}

module.exports.writeVersion = function (contents, version) {
  const obj = JSON.parse(contents)
  obj.expo.version = version
  return JSON.stringify(obj, null, 2) + "\n"
}
