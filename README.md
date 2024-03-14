# BeatJS Stepmania for PS2
This is basically a fun homebrew project for the PS2 using AthenaEnv as the backend engine.
It can load normal stepmania (.sm) files and plays them and a .wav file back.

# How 2 Play
Just copy everything inside a folder and run athena.elf  

Currently it only loads one song from a static path (which you can change the .sm and .wav file for to play another song!)  
Gonna try adding list of songs soon :tm:   

# TODO
1. Input checking (currently your inputs do nothing ingame)  
2. Better visuals and fixing some glitches  
3. Better main menu with a list of available songs and options  

# "Build" it yourself

You need to concat the scripts in BIZZYGAME/SCRIPTS/ in a particular order.  
(For windows you can also use my batch script after editing it to match your pcsx2 to launch automatically!)  

**As of writing these commands should work:**

Linux:
```
cat "BIZZYGAME/SCRIPTS/CONSTANTS.JS" "BIZZYGAME/SCRIPTS/SAVEGAME.JS" "BIZZYGAME/SCRIPTS/UIELEMENTS.JS" "BIZZYGAME/SCRIPTS/BIZZYGAME.JS" > "MAIN.JS"
```
Windows:
```
type "BIZZYGAME\SCRIPTS\CONSTANTS.JS" "BIZZYGAME\SCRIPTS\SAVEGAME.JS" "BIZZYGAME\SCRIPTS\UIELEMENTS.JS" "BIZZYGAME\SCRIPTS\BIZZYGAME.JS"  > "MAIN.JS"
```
(these commands have to adjust if more scripts need to be added!)  

Then you can run athena.elf!


# Credits:
DanielSant0s https://github.com/DanielSant0s/AthenaEnv for the JS Engine! thanks!  
_gaben from Steppers Anonymous Discord many thanks for all the input especially regarding bpm and scrolling!  
sklag_fatalout from PS2 Scene Discord for some JS tips and sharing his code  
and everyone I forgot too! (tell me if i did I'll add you!)
