module.exports = function (buffer) {
  var strings = [], str

  //extract strings at least 3 chars long, by matching ascii ranges.

  for(var i = 0; i < buffer.length; i++) {
    var char = buffer[i]
    if(0x20 <= buffer[i] && buffer[i] <= 0x7e)
      str += String.fromCharCode(buffer[i])
    else if(str.length <= 3)
      str = ''
    else if(str.length >= 3)
      strings.push(str), str = ''
  }
  return strings
}
