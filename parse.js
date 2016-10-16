
var v = require('varstruct')


var FileHeader = v([
  {name: 'machine', type: v.UInt16LE},
  {name: 'sections', type: v.UInt16LE},
  {name: 'timestamp', type: v.UInt32LE},
  {name: 'filePointer', type: v.UInt32LE},
  {name: 'symbols', type: v.UInt16LE},
  {name: 'optionalHeaderSize', type: v.UInt32LE},
  {name: 'characteristics', type: v.UInt16LE}
])

var SectionHeader = v([
  {name: 'name',             type: v.Buffer(8)},
  {name: 'virtualSize',      type: v.UInt32LE},
  {name: 'virtualAddress',   type: v.UInt32LE},
  {name: 'sizeOfRawData',    type: v.UInt32LE},
  {name: 'pointerToRawData', type: v.UInt32LE},
  {name: 'pointerToRelocations', type: v.UInt32LE},
  {name: 'pointerToLineNumbers', type: v.UInt32LE},
  {name: 'numberOfRelocations', type: v.UInt16LE},
  {name: 'numberOfLineNumbers', type: v.UInt16LE},
  {name: 'characteristics', type: v.UInt32LE},
])

module.exports = function (buffer) {
  FileHeader.decode(buffer, 0)
  //if optional header size is zero, parse section header(s)
}

if(!module.parent) {
  var output = {}
  var offset = 0
  var buffer = require('fs').readFileSync('HELLO2.OBJ')
  var fh = output.fileHeader = FileHeader.decode(buffer)
  offset+= FileHeader.decode.bytes
  if(fh.optionalHeaderSize !== 0) throw new Error('optional header not yet implemented')

  var sections = fh.sections
  output.sections = []
  while(sections --) {
    var sh = SectionHeader.decode(buffer, offset)
    sh.name = sh.name.toString('ascii').replace(/\u0000+$/,'') //a cstring (null terminated)
    offset += SectionHeader.decode.bytes
    output.sections.push(sh)
  }

  console.log(output)
}












