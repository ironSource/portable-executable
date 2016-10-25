
var hexpp = require('hexpp')
var h = require('./headers')
var assert = require('assert')

exports.strings = function strings (buffer) {
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

function parseArray(buffer, n, offset, decoder) {
  var array = []
  while(n--) {
    array.push(decoder(buffer, offset))
    offset += decoder.bytes
  }
  parseArray.bytes = offset
  return array
}

exports.ObjectFile = function (buffer, offset, obj) {
  var output = obj || {}
  offset = offset || 0
  var ch = output.coffHeader = h.CoffHeader.decode(buffer, offset)
  offset+= h.CoffHeader.decode.bytes

  if(ch.optionalHeaderSize) {
    var magic = buffer.readUInt16LE(offset)
    //note, read OptionalHeader two bytes later, to make room for magic number.

    if(magic === 0x10b) //32bit
      output.optionalHeader = h.OptionalHeader32.decode(buffer, offset+2)
    else if(magic === 0x20b)
      throw new Error('PE32+ format not yet supported')
    else
      throw new Error('expected PortableExecutable optional header magic number, got:' + magic)

    //console.log(output.optionalHeader)
    var div = output.optionalHeader.sizeOfImage/output.optionalHeader.sectionAlignment
    assert.ok(div === ~~div, 'sizeOfImagemage must be multiple of sectionAlignment')
    //assert.equal(output.optionalHeader.sizeOfImage, buffer.length)

   offset += ch.optionalHeaderSize
  }
  
  var sections = ch.sections
  //offset was 2 bytes off? how

  output.sections =
    parseArray(buffer, output.coffHeader.sections, offset, h.SectionHeader.decode)
    .map(function (sh) {
      //the way it reads ahead sort of breaks varstruct's abstraction.
      if(sh.sizeOfRawData)
        sh.data = buffer.slice(sh.pointerToRawData,sh.pointerToRawData+sh.sizeOfRawData)

      //TODO: 1. parse relocations
      //      2. parse line numbers

      if(sh.pointerToLineNumbers)
        sh.lineNumbers = parseArray(buffer, sh.numberOfLineNumbers, sh.pointerToLineNumbers, LineNumber.decode)

      return sh
    })

  if(output.coffHeader.symbolPointer) {
    offset = output.coffHeader.symbolPointer

    output.symbols =
      parseArray(buffer, output.coffHeader.symbols, offset, Symbol.decode)

    offset+=parseArray.bytes

  }
  return output

}

exports.DosStub = function DosStub (buffer, offset) {
  var dh = h.DosHeader.decode(buffer, 0)
  var sig = buffer.readUInt32LE(dh.pointerToNewHeader)

  assert.equal(0x4550, sig)

  //in an image (exe) there is a "Signature" first
  //which is not present in a object file.
  DosStub.bytes = offset + dh.pointerToNewHeader + 4

  return dh
}

exports.PortableExecutable = function (buffer, offset) {
  offset = offset || 0
  var dh = exports.DosStub(buffer, offset)

  var output =exports.ObjectFile(buffer, offset + exports.DosStub.bytes, dh)
  return output
}

/////////// command line ////////////////////////

if(!module.parent) {
  if(!process.argv[2]) throw new Error('usage: node index.js {file.exe}')
  var buffer = require('fs').readFileSync(process.argv[2])
  var offset = 0

  var output = exports.PortableExecutable(buffer, offset)
  console.log(JSON.stringify(output))
}


