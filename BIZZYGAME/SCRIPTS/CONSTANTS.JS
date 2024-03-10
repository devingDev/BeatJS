/* 

IOP.reset();

IOP.loadDefaultModule(IOP.pads);
IOP.loadDefaultModule(IOP.memcard);
IOP.loadDefaultModule(IOP.audio);
IOP.loadDefaultModule(IOP.memcard);
IOP.loadDefaultModule(IOP.usb_mass); 

*/

const screen = Screen;
const sound = Sound;
const system = System;
const pads = Pads;
const draw = Draw;
const math = Math;
const canvas = screen.getMode();

function dump(arr, level) {
  var dumped_text = "";
  if (!level) level = 0;

  // The padding given at the beginning of the line.
  var level_padding = "";

  for (var j = 0; j < level + 1; j++) level_padding += "  ";

  if (typeof arr == "object") {
    // Array/Hashes/Objects

    for (var item in arr) {
      var value = arr[item];

      if (typeof value == "object") {
        // If it is an array,
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += dump(value, level + 1);
      } else {
        dumped_text += level_padding + "'" + item + "' => \"" + value + '"\n';
      }
    }
  } else {
    // Stings/Chars/Numbers etc.
    dumped_text = "===>" + arr + "<===(" + typeof arr + ")";
  }
  return dumped_text;
}

