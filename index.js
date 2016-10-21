
var v = require('varstruct')

function struct (obj) {
  var a = []
  for(var k in obj)
    a.push({name: k, type: obj[k]})
  return v(a)
}
var assert = require('assert')
/*
public struct IMAGE_DOS_HEADER

{

    public fixed byte e_magic_byte[2];       // Magic number
    public UInt16 e_cblp;    // Bytes on last page of file
    public UInt16 e_cp;      // Pages in file
    public UInt16 e_crlc;    // Relocations
    public UInt16 e_cparhdr;     // Size of header in paragraphs
    public UInt16 e_minalloc;    // Minimum extra paragraphs needed
    public UInt16 e_maxalloc;    // Maximum extra paragraphs needed
    public UInt16 e_ss;      // Initial (relative) SS value
    public UInt16 e_sp;      // Initial SP value
    public UInt16 e_csum;    // Checksum
    public UInt16 e_ip;      // Initial IP value
    public UInt16 e_cs;      // Initial (relative) CS value
    public UInt16 e_lfarlc;      // File address of relocation table
    public UInt16 e_ovno;    // Overlay number
    public fixed UInt16 e_res1[4];    // Reserved words
    public UInt16 e_oemid;       // OEM identifier (for e_oeminfo)
    public UInt16 e_oeminfo;     // OEM information; e_oemid specific
    public fixed UInt16 e_res2[10];    // Reserved words
    public Int32 e_lfanew;      // File address of new exe header

}
*/
function truncate (s) {
  return s.toString('ascii').replace(/\u0000.*$/,'')
}

var Name = {
  decode: function decode (buffer, offset) {
    var zeros = buffer.readUInt32LE(offset)
    var pointer = buffer.readUInt32LE(offset+4)
    console.log('Name?', offset, zeros, pointer, buffer.slice(offset-2, offset+8))
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

var DosHeader = v([
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

var CoffHeader = v([
  {name: 'machine', type: v.UInt16LE},
  {name: 'sections', type: v.UInt16LE},
  {name: 'timestamp', type: v.UInt32LE},
  {name: 'symbolPointer', type: v.UInt32LE},
  {name: 'symbols', type: v.UInt32LE},
  {name: 'optionalHeaderSize', type: v.UInt16LE},
  {name: 'characteristics', type: v.UInt16LE}
])

var SectionHeader = v([
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

var Symbol = v([
  {name: 'name',             type: Name},
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

var SizedPointer = struct({
  pointer: v.UInt32LE,
  size: v.UInt32LE
})

//magic number is 0x10b
var OptionalHeader32 = struct({
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

var ImportDirectory = struct({
  importLookupTableRva: v.UInt32LE,
  timestamp: v.UInt32LE,
  forwarderChain: v.UInt32LE,
  nameRva: v.UInt32LE,
  importAddressTable: v.UInt32LE
})

function PortableExecutable (buffer, offset) {

  var output = {}
  offset = offset || 0
  var ch = output.coffHeader = CoffHeader.decode(buffer, offset)
  offset+= CoffHeader.decode.bytes

  if(ch.optionalHeaderSize) {
    var magic = buffer.readUInt16LE(offset)
    //note, read OptionalHeader two bytes later, to make room for magic number.
    if(magic === 0x10b) //32bit
      output.optionalHeader = OptionalHeader32.decode(buffer, offset+2)

    else if(magic === 0x20b)
      throw new Error('PE32+ format not yet supported')
    else
      throw new Error('expected PortableExecutable optional header magic number, got:' + magic)
    //console.log(output.optionalHeader)
    var div = output.optionalHeader.sizeOfImage/output.optionalHeader.sectionAlignment
    assert.ok(div === ~~div, 'sizeOfImagemage must be multiple of sectionAlignment')
    //assert.equal(output.optionalHeader.sizeOfImage, buffer.length)

    var op = output.optionalHeader
    for(var k in op)
      if(op[k].pointer && op[k].size)
        op[k].data = buffer.slice(op[k].pointer,  op[k].pointer + op[k].size)

    offset += ch.optionalHeaderSize
  }

  var sections = ch.sections
  //offset was 2 bytes off? how

  output.sections =
    parseArray(buffer, output.coffHeader.sections, offset, SectionHeader.decode)
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

  //  var stringTableLength = buffer.readUInt32LE(offset)
  //
  //  var stringTable = buffer.slice(offset+4, offset+4+stringTableLength)
  //    console.log("STRING TABLE LEN", parseArray.bytes, stringTableLength)
  //
  //  output.stringTable = stringTable.toString()

  }
  return output

}

if(!module.parent) {
  if(process.argv[2]) {
    var buffer = require('fs').readFileSync(process.argv[2])
    var dh = DosHeader.decode(buffer, 0)
    console.log(dh)
    console.log(buffer.readUInt32LE(0x3c))

    var sig = buffer.readUInt32LE(dh.pointerToNewHeader)

    assert.equal(0x4550, sig)

    //in an image (exe) there is a "Signature" first
    //which is not present in a object file.
    var offset = dh.pointerToNewHeader + 4
    //0x5045 0000

    console.log(offset, dh.pointerToNewHeader+4)
    console.log(CoffHeader.decode(buffer, dh.pointerToNewHeader+4))

//    console.log(buffer.slice(dh.pointerToNewHeader, dh.pointerToNewHeader + 4))
//    console.log(offset + 4)
    console.log(PortableExecutable(buffer, offset))
  }
//  var buffer = require('fs').readFileSync('./data/HELLO2.OBJ')
//
//  console.log(JSON.stringify(PortableExecutable(buffer, 0), null, 2))
}


















