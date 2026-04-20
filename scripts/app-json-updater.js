module.exports.readVersion = function (contents) {
  return JSON.parse(contents).expo.version
}

module.exports.writeVersion = function (contents, version) {
  const obj = JSON.parse(contents)
  obj.expo.version = version
  obj.expo.android.versionCode = (obj.expo.android.versionCode || 1) + 1
  return JSON.stringify(obj, null, 2) + "\n"
}
