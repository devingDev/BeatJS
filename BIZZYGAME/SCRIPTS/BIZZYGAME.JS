sound.setVolume(100);
sound.setVolume(100, 0);

var musicFile = sound.load("BIZZYGAME/SONGS/BIZZY/DJSATOMIWAVES/DJSATOMIWAVES.WAV");

var gameMode = 0;
var playerSaveData = loadDataObject();

const w = canvas.width;
const h = canvas.height;

const wMargin = w * math.fround(0.9975);
const hMargin = h * math.fround(0.9975);

const _bg = calcIntValFromArgb(252, 178, 197);
const color_second = calcIntValFromArgb(32, 33, 36);
const colort = calcIntValFromArgb(99, 33, 36);

var new_pad = pads.get();
var old_pad = new_pad;

// load resrouces

const fontInfo = new Font("BIZZYGAME/FONTS/SWANSEA.TTF");
fontInfo.color = calcIntValFromArgb(255, 255, 255);
fontInfo.scale = math.fround(1);

let sounds = {
  //unpause: sound.load("pong/unpause.adp"),
  //score: sound.load("pong/score.adp"),
  //over: sound.load("pong/over.adp"),
};

const mainMenuRenders = {
  tests: [],
  texts: [],
  buttons: [],
  sprites: [],
};
var currentButtonIndex = 0;

mainMenuRenders.tests.push(new TestRect(wMargin, hMargin, w - wMargin * 2, h - hMargin * 2, color_second));
mainMenuRenders.buttons.push(new TestRect(0, 0, 20, 20, calcIntValFromArgb(255, 22, 77)));
mainMenuRenders.texts.push(new UIText(10,200, "Welcome back " + playerSaveData.name + " !"));
mainMenuRenders.buttons.push(new Button(20, 450, 8, calcIntValFromArgb(75, 200, 75), "Play", calcIntValFromArgb(255, 255, 255),pressedPlay));
mainMenuRenders.buttons.push(new Button(100, 450, 8, calcIntValFromArgb(75, 200, 75), "Settings", calcIntValFromArgb(255, 255, 255),showSettings));



const gameRenders = {
  tests: [],
  texts: [],
  buttons: [],
  sprites: [],
};

gameRenders.tests.push(new TestRect(wMargin, hMargin, w - wMargin * 2, h - hMargin * 2, color_second));
gameRenders.texts.push(new UIText(10,200, "Welcome back " + playerSaveData.name + " !"));
gameRenders.sprites.push(new Sprite(32,32,new Image("BIZZYGAME/PADS/CROSS.PNG", VRAM)));
gameRenders.sprites.push(new Sprite(64,32,new Image("BIZZYGAME/PADS/CIRCLE.PNG", VRAM)));
gameRenders.sprites.push(new Sprite(96,32,new Image("BIZZYGAME/PADS/SQUARE.PNG", VRAM)));
gameRenders.sprites.push(new Sprite(128,32,new Image("BIZZYGAME/PADS/TRIANGLE.PNG", VRAM)));

function showSettings(){
  //mainMenuRenders.buttons.push(new Button(180, 450, 8, calcIntValFromArgb(75, 200, 75), "SETT", calcIntValFromArgb(255, 255, 255),showSettings));
  gameMode = 7;
}
var timer = Timer.new();
function pressedPlay(){
  sound.play(musicFile);
  Timer.reset(timer);
  //mainMenuRenders.buttons.push(new Button(280, 450, 8, calcIntValFromArgb(75, 200, 75), "PLAY", calcIntValFromArgb(255, 255, 255),pressedPlay));
  gameMode = 1;
}


function checkPressed(padOld, padNew, btn) {
  return !pads.check(padOld, btn) && pads.check(padNew, btn);
}

var fd = system.openFile("BIZZYGAME/SONGS/FAST.TXT", system.FREAD);
var size = system.sizeFile(fd);
var buffer = system.readFile(fd, 1024);

function calcIntValFromArgb(red, green, blue, alpha = 255) {
  return (alpha << 24) + (blue << 16) + (green << 8) + (red << 0);
}


//var testJson = std.parseExtJSON("{\"test\":{\"name\":\"John\", \"age\":30, \"car\":null}}");

const defaultX = 25;


function drawMainMenu(){
  screen.clear(_bg);
  fontInfo.color = calcIntValFromArgb(255, 255, 255);
  mainMenuRenders.tests.forEach((element) => {
    element.render();
  });
  var loopBtnIndex = -1;
  mainMenuRenders.buttons.forEach((element) => {
    var isSelected = (currentButtonIndex==loopBtnIndex);
    element.render(isSelected);
    loopBtnIndex += 1;
  });
  mainMenuRenders.sprites.forEach((element) => {
    element.render();
  });

  fontInfo.color = calcIntValFromArgb(255, 255, 255, 255);
  mainMenuRenders.texts.forEach((element) => {
    element.render();
  });
  screen.flip();
}

function drawGame(){
  screen.clear(_bg);
  gameRenders.tests.forEach((element) => {
    element.render();
  });
  gameRenders.sprites.forEach((element) => {
    element.render();
  });
  gameRenders.texts.forEach((element) => {
    element.render();
  });
  fontInfo.color = calcIntValFromArgb(255, 255, 255, 255);
  var currTime = Timer.getTime(timer);
  fontInfo.print(0,40,"timer" + currTime);
  screen.flip();
}

function drawSettings(){
  screen.clear(_bg);
  mainMenuRenders.tests.forEach((element) => {
    element.render();
  });
  mainMenuRenders.texts.forEach((element) => {
    element.render();
  });
  screen.flip();
}

function readInputs(){
  old_pad = new_pad;
  new_pad = pads.get();

  if (checkPressed(old_pad, new_pad, pads.LEFT)){
    currentButtonIndex = 0;
    if(currentButtonIndex < 0){
      currentButtonIndex = 1;
    }
  }
  if (checkPressed(old_pad, new_pad, pads.RIGHT)){
    currentButtonIndex ++;
    if(currentButtonIndex > 1){
      currentButtonIndex = 0;
    }
  }
  if (checkPressed(old_pad, new_pad, pads.CROSS)){
    mainMenuRenders.buttons[currentButtonIndex+1].run();
  }

  if (checkPressed(old_pad, new_pad, pads.SELECT)) {
    //sound.play(sounds.unpause);
    //deleteDataObject();
  } else {
    
  }

}

while (true) {

  readInputs();

  if(gameMode === 0){
    drawMainMenu();
  }
  else if(gameMode === 1){
    drawGame();
  }
  else{
    drawSettings();
  }



}
