var v = require('varstruct')

function struct (obj) {
  var a = []
  for(var k in obj)
    a.push({name: k, type: obj[k]})
  return v(a)
}

function truncate (s) {
  return s.toString('ascii').replace(/\u0000.*$/,'')
}

var Name = exports.Name = {
  decode: function decode (buffer, offset) {
    var zeros = buffer.readUInt32LE(offset)
    var pointer = buffer.readUInt32LE(offset+4)
    decode.bytes = 8
    if(zeros === 0) {
      var i = 0
      while(buffer[pointer + i] != 0) i++
      return truncate(buffer.slice(pointer-1, pointer + i-1))
    }
    return truncate(buffer.slice(offset, offset + 8))
  },
  encode: function () {
    throw new Error('string encode is not implemented')
  },

  encodingLength: function () { return 8 }

}

var DosHeader = exports.DosHeader = v([
  {name: 'magicNumber', type: v.Buffer(2)}, //Must be: 5A4D, "MZ"
  {name: 'bytesOnLastPageOfFile', type: v.UInt16LE},
  {name: 'pagesInFile', type: v.UInt16LE},
  {name: 'relocations', type: v.UInt16LE},
  {name: 'sizeOfHeaderInParagraphs', type: v.UInt16LE},
  {name: 'minimumExtraParagraphsNeeded', type: v.UInt16LE},
  {name: 'maximumExtraParagraphsNeeded', type: v.UInt16LE},
  {name: 'initialSS', type: v.UInt16LE},
  {name: 'initialSP', type: v.UInt16LE},
  {name: 'checksum', type: v.UInt16LE},
  {name: 'initialIP', type: v.UInt16LE},
  {name: 'initialCS', type: v.UInt16LE},
  {name: 'pointerToRelocationTable', type: v.UInt16LE},
  {name: 'overlayNumber', type: v.UInt16LE},

  {name: 'reservedWorlds', type: v.Buffer(8)},
  {name: 'oemIdentifier', type: v.UInt16LE},
  {name: 'oemInformation', type: v.UInt16LE},
  {name: 'reservedWords2', type: v.Buffer(20)},
  {name: 'pointerToNewHeader', type: v.UInt32LE}
])

exports.CoffHeader = v([
  {name: 'machine', type: v.UInt16LE},
  {name: 'sections', type: v.UInt16LE},
  {name: 'timestamp', type: v.UInt32LE},
  {name: 'symbolPointer', type: v.UInt32LE},
  {name: 'symbols', type: v.UInt32LE},
  {name: 'optionalHeaderSize', type: v.UInt16LE},
  {name: 'characteristics', type: v.UInt16LE}
])

var SectionHeader = exports.SectionHeader = v([
  {name: 'name',             type: Name}, //v.Buffer(8)},
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

var Symbol = exports.Symbol = v([
  {name: 'name',             type: Name},
  {name: 'value',            type: v.UInt32LE},
  {name: 'sectionNumber',    type: v.UInt16LE},
  {name: 'type',             type: v.UInt16LE},
  {name: 'storageClass',     type: v.UInt8},
  {name: 'numberOfAuxSymbols', type: v.UInt8}
])

exports.LineNumber = v([
  {name: 'type', type: v.UInt32LE},
  {name: 'lineNumber', type: v.UInt16LE},
  {name: 'symbolTableIndex', type: v.UInt32LE},
  {name: 'virtualAddress', type: v.UInt32LE}
])

var SizedPointer = exports.SizedPointer = struct({
  pointer: v.UInt32LE,
  size: v.UInt32LE
})

//magic number is 0x10b
exports.OptionalHeader32 = struct({
  //standard fields
  majorLinkerVersion:  v.UInt8,
  minorLinkerVersion: v.UInt8,
  sizeOfCode: v.UInt32LE,
  sizeOfInitializedData: v.UInt32LE,
  sizeOfUninitializedData: v.UInt32LE,
  pointerToEntryPoint: v.UInt32LE,
  baseOfCode: v.UInt32LE,
  baseOfData: v.UInt32LE, //PE32 only

  //windows specific headers
  imageBase: v.UInt32LE,
  sectionAlignment: v.UInt32LE,
  fileAlignment: v.UInt32LE,
  majorOSVersion: v.UInt16LE,
  minorOSVersion: v.UInt16LE,
  majorImageVersion: v.UInt16LE,
  minorImageVersion: v.UInt16LE,
  majorSubsystemVersion: v.UInt16LE,
  minorSubsystemVersion: v.UInt16LE,
  reserved: v.Buffer(4),
  sizeOfImage: v.UInt32LE,
  sizeOfHeaders: v.UInt32LE,
  checksum: v.UInt32LE,
  subsystem: v.UInt16LE,
  dllCharacteristics: v.UInt16LE,
  sizeOfStackReserve: v.UInt32LE,
  sizeOfStackCommit: v.UInt32LE,
  sizeOfHeapReserve: v.UInt32LE,
  sizeOfHeapCommit: v.UInt32LE,
  loaderFlags: v.UInt32LE,
  numberOfRvaAndSizes: v.UInt32LE,

  exportTable: SizedPointer,
  importTable: SizedPointer,
  resourceTable: SizedPointer,
  exceptionTable: SizedPointer,
  certificateTable: SizedPointer,
  baseRelocationTable: SizedPointer,
  debug: SizedPointer,
  architecture: SizedPointer,
  globalPointer: SizedPointer,
  tlsTable: SizedPointer,
  loadConfigTable: SizedPointer,
  boundImport: SizedPointer,
  importAddressTable: SizedPointer,
  delayImportDescriptor: SizedPointer,
  comRuntimeHeader: SizedPointer,
  reserved2: v.Buffer(8)
})

exports.ImportDirectory = struct({
  importLookupTableRva: v.UInt32LE,
  timestamp: v.UInt32LE,
  forwarderChain: v.UInt32LE,
  nameRva: v.UInt32LE,
  importAddressTable: v.UInt32LE
})

exports.HintName = function HintName (buffer, offset) {
  var name = ''
  var c
  var pad = 2
  var i = 0
  while((c = buffer[offset+pad+i++]) !== 0)
    name += String.fromCharCode(c)

  if(i%2) i++ //increment one more to even
  HintName.bytes = i + 2

  var pre = String.fromCharCode(buffer[offset])+String.fromCharCode(buffer[offset+1])

  var hint = buffer.readUInt16LE(offset)

  if(/[A-z0-9_]{2}/.test(pre)) {
    name = pre + name
    hint = null
  }

  return {
    hint: hint, //buffer.readUInt16LE(offset),
    name: name
  }
}



