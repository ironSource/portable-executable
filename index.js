
var v = require('varstruct')

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

function PortableExecutable (buffer, offset) {

  var output = {}
  var offset = 0
  var ch = output.coffHeader = CoffHeader.decode(buffer)
  offset+= CoffHeader.decode.bytes
//  if(ch.optionalHeaderSize !== 0) throw new Error('optional header not yet implemented')

  if(ch.optionalHeaderSize) {
    console.log(output)
    console.log(ch.optionalHeaderSize)
    output.optionalHeader = buffer.slice(offset, offset+ch.optionalHeaderSize)
  offset += offset+ch.optionalHeaderSize
  }
  var sections = ch.sections
//  output.sections = []
//  while(sections --) {
//    var sh = SectionHeader.decode(buffer, offset)
//    sh.name = sh.name.toString('ascii').replace(/\u0000+$/,'') //a cstring (null terminated)
//    offset += SectionHeader.decode.bytes
//    sh.data = buffer.slice(sh.pointerToRawData,sh.pointerToRawData+sh.sizeOfRawData) 
//    output.sections.push(sh)
//  }

  console.log('coffHeader', output.coffHeader.sections)
  output.sections =
    parseArray(buffer, output.coffHeader.sections, offset, SectionHeader.decode)
    .map(function (sh) {
      sh.name = cString(sh.name)
      console.log('section', sh.name)
      //the way it reads ahead sort of breaks varstruct's abstraction.
      sh.data = buffer.slice(sh.pointerToRawData,sh.pointerToRawData+sh.sizeOfRawData)

      //TODO: 1. parse relocations
      //      2. parse line numbers

      if(sh.pointerToLineNumbers)
        sh.lineNumbers = parseArray(buffer, sh.numberOfLineNumbers, sh.pointerToLineNumbers, LineNumber.decode)

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

  return output

}

if(!module.parent) {
  if(process.argv[2]) {
    var buffer = require('fs').readFileSync(process.argv[2])
    var dh = DosHeader.decode(buffer, 0)
    console.log(dh)
    console.log(buffer.readUInt32LE(0x3c))

    var offset = dh.pointerToNewHeader
    //0x5045 0000

    console.log(buffer.slice(dh.pointerToNewHeader, dh.pointerToNewHeader + 4))
    console.log(offset + 4)
    console.log(PortableExecutable(buffer, offset + 4 - 4))
  }
//  var buffer = require('fs').readFileSync('./data/HELLO2.OBJ')
//
//  console.log(JSON.stringify(PortableExecutable(buffer, 0), null, 2))
}







