
var v = require('varstruct')


var CoffHeader = v([
  {name: 'machine', type: v.UInt16LE},
  {name: 'sections', type: v.UInt16LE},
  {name: 'timestamp', type: v.UInt32LE},
  {name: 'symbolPointer', type: v.UInt32LE},
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

var Symbol = v([
  {name: 'name',             type: v.Buffer(8)},
  {name: 'value',            type: v.UInt32LE},
  {name: 'sectionNumber',    type: v.UInt16LE},
  {name: 'type',             type: v.UInt16LE},
  {name: 'storageClass',     type: v.UInt8},
  {name: 'numberOfAuxSymbols', type: v.UInt8}
])

var LineNumber = v([
  {name: 'type', type: v.UInt32LE},
  {name: 'lineNumber', type: v.UInt16LE},
  {name: 'symbolTableIndex', type: v.UInt32LE},
  {name: 'virtualAddress', type: v.UInt32LE}
])

module.exports = function (buffer) {
  COFFHeader.decode(buffer, 0)
  //if optional header size is zero, parse section header(s)
}

function parseArray(buffer, n, offset, decoder) {
  var array = []
  while(n--) {
    array.push(decoder(buffer, offset))
    offset += decoder.bytes
  }
  parseArray.bytes = offset
  return array
}

function cString(s) {
  return s.toString('ascii').replace(/\u0000+$/,'') //a cstring (null terminated)
}

if(!module.parent) {
  var output = {}
  var offset = 0
  var buffer = require('fs').readFileSync('HELLO2.OBJ')
  var ch = output.coffHeader = CoffHeader.decode(buffer)
  offset+= CoffHeader.decode.bytes
  if(ch.optionalHeaderSize !== 0) throw new Error('optional header not yet implemented')

  var sections = ch.sections
//  output.sections = []
//  while(sections --) {
//    var sh = SectionHeader.decode(buffer, offset)
//    sh.name = sh.name.toString('ascii').replace(/\u0000+$/,'') //a cstring (null terminated)
//    offset += SectionHeader.decode.bytes
//    sh.data = buffer.slice(sh.pointerToRawData,sh.pointerToRawData+sh.sizeOfRawData) 
//    output.sections.push(sh)
//  }

  output.sections =
    parseArray(buffer, output.coffHeader.sections, offset, SectionHeader.decode)
    .map(function (sh) {
      sh.name = cString(sh.name)
      //the way it reads ahead sort of breaks varstruct's abstraction.
      sh.data = buffer.slice(sh.pointerToRawData,sh.pointerToRawData+sh.sizeOfRawData)

      //TODO: 1. parse relocations
      //      2. parse line numbers

      if(sh.pointerToLineNumbers)
        sh.lineNumbers = parseArray(buffer, sh.numberOfLineNumbers, sh.pointerToLineNumbers, LineNumber)

      return sh
    })

  offset = output.coffHeader.symbolPointer

  output.symbols =
    parseArray(buffer, output.coffHeader.symbols, offset, Symbol.decode)
    .map(function (e) {
      //actually a friggen UNION.. "See Section 5.4.1, Symbol Name Representation"
      e.name = cString(e.name)
      return e
    })

  console.log(output)
  console.log(max)
}












