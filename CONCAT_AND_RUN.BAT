
:: kill pcsx2
taskkill /f /im pcsx2-qt.exe

:: concatenate needed files into a single one to start in athena
type CONSTANTS.JS SAVEGAME.JS UIELEMENTS.JS BIZZYGAME.JS  > MAIN.JS

:: switch to drive where pcsx2 is, which in my case its D: 
:: then cd to its directory and run with correct elf file path
D:
cd "D:\Emulators\PCSX2"
start "" "pcsx2-qt.exe" -elf "C:\Projects\SeriousProjects\PS2JSMaster\ATHENA.ELF


