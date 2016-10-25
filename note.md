https://source.winehq.org/source/include/winnt.hhttps://source.winehq.org/source/include/winnt.hMS-DOS STUB

The first few hundred bytes of the typical PE file are taken up by the MS-DOS stub.
This stub is a tiny program that prints out something to the effect of
"This program cannot be run in MS-DOS mode." So if you run a Win32-based program in an
environment that doesn't support Win32, you'll get this informative error message.
When the Win32 loader memory maps a PE file, the first byte of the mapped file corresponds
to the first byte of the MS-DOS stub. That's right. With every Win32-based program you start up,
you get an MS-DOS-based program loaded for free!

DWORD ImageBase
    When the linker creates an executable, it assumes that the file will be memory-mapped
to a specific location in memory. That address is stored in this field, assuming a load address
allows linker optimizations to take place. If the file really is memory-mapped to that address
by the loader, the code doesn't need any patching before it can be run. In executables produced
for Windows NT, the default image base is 0x10000. For DLLs, the default is 0x400000.
In Windows 95, the address 0x10000 can't be used to load 32-bit EXEs because it lies within a
linear address region shared by all processes. Because of this, Microsoft has changed the default
base address for Win32 executables to 0x400000. Older programs that were linked assuming a base
address of 0x10000 will take longer to load under Windows 95 because the loader needs to apply
the base relocations.


Question: so, does it take the image file, AFTER the MS-DOS header (0x40) and THEN load it
into memory at 0x400000?

Question: what does the import table actually look like?



IMAGE_DATA_DIRECTORY DataDirectory[IMAGE_NUMBEROF_DIRECTORY_ENTRIES]
    An array of IMAGE_DATA_DIRECTORY structures. The initial array elements contain the starting
RVA and sizes of important portions of the executable file. Some elements at the end of the array
are currently unused. The first element of the array is always the address and size of the exported
function table (if present). The second array entry is the address and size of the imported function
table, and so on. For a complete list of defined array entries, see the
`IMAGE_DIRECTORY_ENTRY_XXX #defines` in `WINNT.H`. This array allows the loader to
quickly find a particular section of the image (for example, the imported function table),
without needing to iterate through each of the images sections, comparing names as it goes along.
Most array entries describe an entire section's data. However, the `IMAGE_DIRECTORY_ENTRY_DEBUG`
element only encompasses a small portion of the bytes in the .rdata section.

"Most array entries describe an entire section's data"

in bytefence, the .rsrc section and the source table have the same size!
and the resourceTable.pointer = [.rsrc].virtualAddress

> 229376 - 28672
200704
> (229376 - 28672).toString(16)
'31000'

tried 0x31000 base address, but didn't get anything that loooked obvious.

```
                3041 typedef struct _IMAGE_IMPORT_DESCRIPTOR {
                3042     union {
                3043         DWORD   Characteristics; /* 0 for terminating null import descriptor  */
687337999 Kevin*3044         DWORD   OriginalFirstThunk; /* RVA to original unbound IAT */
75b93ff1a Dmitr*3045     } DUMMYUNIONNAME;
180a088be Alexa*3046     DWORD   TimeDateStamp;  /* 0 if not bound,
                3047                  * -1 if bound, and real date\time stamp
                3048                  *    in IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT
                3049                  * (new BIND)
                3050                  * otherwise date/time stamp of DLL bound to
                3051                  * (Old BIND)
                3052                  */
                3053     DWORD   ForwarderChain; /* -1 if no forwarders */
                3054     DWORD   Name;
                3055     /* RVA to IAT (if bound this IAT has actual addresses) */
687337999 Kevin*3056     DWORD   FirstThunk;
180a088be Alexa*3057 } IMAGE_IMPORT_DESCRIPTOR,*PIMAGE_IMPORT_DESCRIPTOR;
```

## PLAN

find HintName table (by looking at hexdump) then parsing at absolute address.
then confirm RVA base guess by RVA pointer to _IMAGE_IMPORT_DESCRIPTOR.Name -rva> {HintName}.dll


## dos header

```
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
```

