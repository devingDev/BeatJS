# Play
Just copy everything inside a folder and run athena.elf

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

Then you can run athena.elf


# Credits:
DanielSant0s https://github.com/DanielSant0s/AthenaEnv for the JS Engine! thanks!
_gaben from Steppers Anonymous Discord many thanks for all the input especially regarding bpm and scrolling!
