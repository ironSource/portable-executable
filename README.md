# portable-executable

parse portable-executable files

## example

parse a portable executable and dump to json.

``` js
var fs = require('fs')
var PE = require('portable-executable')

var pe = PE.PortableExecutable(fs.readFileSync(YOUR_FILE_EXE))

console.log(JSON.stringify(pe))
```

portable executable is a interesting, complex format.

example output may resemble:
```
{"magicNumber":{
  "type":"Buffer","data":[77,90]},
  "bytesOnLastPageOfFile":144,"pagesInFile":3,
  "relocations":0,"sizeOfHeaderInParagraphs":4,
  "minimumExtraParagraphsNeeded":0,"maximumExtraParagraphsNeeded":65535,
  "initialSS":0,"initialSP":184,"checksum":0,"initialIP":0,
  "initialCS":0,"pointerToRelocationTable":64,"overlayNumber":0,
  "reservedWorlds":{"type":"Buffer","data":[0,0,0,0,0,0,0,0]},
  "oemIdentifier":0,"oemInformation":0,"reservedWords2":{
      "type":"Buffer","data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  },
  "pointerToNewHeader":256,"coffHeader":{
    "machine":332,"sections":4,"timestamp":1456776247,
    "symbolPointer":0,"symbols":0,"optionalHeaderSize":224,
    "characteristics":271
  },
  "optionalHeader":{
    "majorLinkerVersion":7,
    "minorLinkerVersion":10,
    "sizeOfCode":376832,
    "sizeOfInitializedData":159744,
    "sizeOfUninitializedData":0,
    "pointerToEntryPoint":348400,
    "baseOfCode":4096,
    "baseOfData":380928,
    "imageBase":4194304,
    "sectionAlignment":4096,
    "fileAlignment":4096,
    "majorOSVersion":4,
    "minorOSVersion":0,
    "majorImageVersion":0,
    "minorImageVersion":0,
    "majorSubsystemVersion":4,
    "minorSubsystemVersion":0,
    "reserved":{
      "type":"Buffer",
      "data":[0,0,0,0]
    },
    "sizeOfImage":540672,
    "sizeOfHeaders":4096,
    "checksum":564231,
    "subsystem":2,
    "dllCharacteristics":0,
    "sizeOfStackReserve":1048576,
    "sizeOfStackCommit":4096,
    "sizeOfHeapReserve":1048576,
    "sizeOfHeapCommit":4096,"loaderFlags":0,"numberOfRvaAndSizes":16,
    "exportTable":{"pointer":0,"size":0},
    "importTable":{"pointer":493848,"size":240},
    "resourceTable":{"pointer":528384,"size":11968},
    "exceptionTable":{"pointer":0,"size":0},
    "certificateTable":{"pointer":524288,"size":7080},
    "baseRelocationTable":{"pointer":0,"size":0},
    "debug":{"pointer":0,"size":0},
    "architecture":{"pointer":0,"size":0},
    "globalPointer":{"pointer":0,"size":0},
    "tlsTable":{"pointer":0,"size":0},
    "loadConfigTable":{"pointer":493744,"size":72},
    "boundImport":{"pointer":0,"size":0},
    "importAddressTable":{"pointer":380928,"size":1292},
    "delayImportDescriptor":{"pointer":0,"size":0},
    "comRuntimeHeader":{"pointer":0,"size":0},
    "reserved2":{"type":"Buffer","data":[0,0,0,0,0,0,0,0]}},
    "sections":[{
      "name":".text","virtualSize":376705,
      "virtualAddress":4096,"sizeOfRawData":376832,
      "pointerToRawData":4096,"pointerToRelocations":0,
      "pointerToLineNumbers":0,"numberOfRelocations":0,
      "numberOfLineNumbers":0,"characteristics":1610612768,
      "data":{"type":"Buffer","data":[86,106,12,.....
//and so on...
````

also see

``` js
var fs = require('fs')
var PE = require('portable-executable')

console.log(JSON.stringify(PE.strings(fs.readFileSync(YOUR_FILE_EXE)))
```

which might output:

```
  ["!This program cannot be run in DOS mode.","Rich",".text","`.rdata","@.data",".ndata",".rsrc","5P?B","5@p@"
,"h@7B",";5l?B",";5l?B"," s495l?B",";5l?B","=l?B","5h?B","5,7B","5\\r@","tTj\\V","uv9]","tDH;","PShr","jHjZ",
"t=9]","PSWV","SQSSSPW","VQSPW","QVPW","SQVPW","SQPh","u_9]","t@;u","5h?B","t#9]","5$p@","@_^[",
"PjdQ","v#Vhn+@","5@?B","(SV3","=T?B","Instu`","softuW","NulluN","YtS9]","5P?B","j@Vh`?B","tC+E",
"t;9E","t19u","tS9u","SUVW3","D$8h`","h@7B","8/u7@","8NCRCu"," /D=t","tMSU","> _?=t","t*Vh","t$ h",
"t-SV","D$ Pj(","D$(Ph,","D$,SPS","Vj%SSS","5P?B","SWSh$s@","SWhBs@","tT<\"u","5@?B","SPSj0","5@?B",
"D$(+D$ SSP","D$0+D$(P","t$0h","5@?B","_^][","SUVW","h@7B","5h?B","_^][","|$$3","UUUUW","D$,H",
"t$,VW","u49-","t$0h","t$0S","|$$;","58r@","=H?B","5(7B","5`?B","D$,t","h@7B","5@?B","t$ U",
"-H?B","_^][","5H?B","5H?B","s8j#","5H?B","5H?B","u Pj","t0Pj","PWVh","58r@","5@?B","PWhC",
"SPhQ","9=l?B",";=l?B","uv9E","p\\Wh","WWhG","WPhP","j [S","SWh ","WQhN","9=l?B","5\\r@"," u}h",
"uDSSh","5h?B","=l?B","@SVW","=$7B","=8r@","PPh6","PhVO@","5\\r@","t&jx","5H?B","SPQh","FFC;]",
"h@%B","PPPPPP","th<.u","t^VS","tM9u","9\\\\t",";:\\u","?\\\\u","^j\\PN","Wjd_O","SUVWj","PWVU",
"t[;|$","PPPU","PWVU","_^][","SVW3","@PWSh","$uhh","5H?B","5H?B","5H?B","_^[t","v\"Ph","Vu-3",
"SVWj\"","<6;}","UXTHEME","USERENV","SETUPAPI","APPHELP","PROPSYS","DWMAPI","CRYPTBASE","OLEACC",
"CLBCATQ","RichEdit","RichEdit20A","RichEd32","RichEd20",".DEFAULT\\Control Panel\\International",
"Control Panel\\Desktop\\ResourceLocale","[Rename]","Software\\Microsoft\\Windows\\CurrentVersion",
"\\Microsoft\\Internet Explorer\\Quick Launch","MulDiv","DeleteFileA","FindFirstFileA",
"FindNextFileA","FindClose","SetFilePointer","ReadFile","WriteFile","GetPrivateProfileStringA",
"WritePrivateProfileStringA","MultiByteToWideChar","FreeLibrary","GetProcAddress","LoadLibraryExA",
"GetModuleHandleA","GetExitCodeProcess","WaitForSingleObject","GlobalAlloc","GlobalFree",
"ExpandEnvironmentStringsA","lstrcmpA","lstrcmpiA","CloseHandle","SetFileTime","CompareFileTime",
... etc ...
```

## License

MIT









