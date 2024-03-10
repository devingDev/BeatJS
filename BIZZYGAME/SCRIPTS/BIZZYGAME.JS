sound.setVolume(100);
sound.setVolume(100, 0);

const w = canvas.width;
const h = canvas.height;

const wMargin = w * math.fround(0.99);
const hMargin = h * math.fround(0.99);

const _bg = calcIntValFromArgb(252, 178, 197);
const color_second = calcIntValFromArgb(32, 33, 36);
const colort = calcIntValFromArgb(99, 33, 36);

var new_pad = pads.get();
var old_pad = new_pad;

// load resrouces

const fontInfo = new Font("BIZZYGAME/FONTS/SWANSEA.TTF");
fontInfo.color = calcIntValFromArgb(255, 255, 255);
fontInfo.scale = math.fround(1);
const font = new Font("BIZZYGAME/FONTS/REALLYFREE.TTF");
font.color = calcIntValFromArgb(255, 255, 255);
font.scale = math.fround(2);

let sounds = {
  //unpause: sound.load("pong/unpause.adp"),
  //score: sound.load("pong/score.adp"),
  //over: sound.load("pong/over.adp"),
};

const draws = [];

draws.push(new TestRect(0, 0, 20, 20, calcIntValFromArgb(255, 22, 77)));


function checkPressed(padOld, padNew, btn) {
  return !pads.check(padOld, btn) && pads.check(padNew, btn);
}

var fd = system.openFile("BIZZYGAME/SONGS/FAST.TXT", system.FREAD);
var size = system.sizeFile(fd);
var buffer = system.readFile(fd, 1024);

function calcIntValFromArgb(red, green, blue, alpha = 255) {
  return (alpha << 24) + (blue << 16) + (green << 8) + (red << 0);
}

var loadAttempt = loadDataObject();

//var testJson = std.parseExtJSON("{\"test\":{\"name\":\"John\", \"age\":30, \"car\":null}}");

const defaultX = 25;

while (true) {
  old_pad = new_pad;
  new_pad = pads.get();

  fontInfo.color = calcIntValFromArgb(255, 255, 255);
  screen.clear(_bg);
  draw.rect(wMargin, hMargin, w - wMargin * 2, h - hMargin * 2, color_second);

  draws.forEach((element) => {
    element.draw();
  });

  fontInfo.print(
    defaultX,
    25,
    "File opened : " + fd + " " + size + " " + buffer + " x  "
  );
  fontInfo.color = calcIntValFromArgb(255, 0, 0, 255);

  if (checkPressed(old_pad, new_pad, pads.SELECT)) {
    //sound.play(sounds.unpause);
    deleteDataObject();
  } else {
    
  }

  fontInfo.color = calcIntValFromArgb(111, 255, 55);

  fontInfo.print(defaultX, 120, "R2 " + pads.check(new_pad, pads.R2));
  fontInfo.print(defaultX, 150, "D  " + system.currentDir());

  font.print(defaultX, 190, "MC: " + loadAttempt.name);

  screen.flip();
}
