sound.setVolume(100);
sound.setVolume(100, 0);

//var musicFile = sound.load("BIZZYGAME/SONGS/Miku Miku Night Fever (samfree) [FelipeLink]/mikumimuforever.wav");
//let musicFileStepMania = std.open("BIZZYGAME/SONGS/Miku Miku Night Fever (samfree) [FelipeLink]/Miku Miku Night Fever.sm", "r");
var musicFile = sound.load("BIZZYGAME/SONGS/Hardcore Overdoze/HardcoreOverdoze.wav");
let musicFileStepMania = std.open("BIZZYGAME/SONGS/Hardcore Overdoze/HardcoreOverdoze.sm", "r");

var stepManiaQueue = [];
var bpmList = [];

var songOffset = -0.0f * 1000;

var offsetFromTopScreen = 120;

var line1 = "";
while(true){
  line1 = musicFileStepMania.getline();
  if(line1.toUpperCase().includes("#OFFSET:")){ // #OFFSET:-0.179;
    line1 = line1.replace("#OFFSET:", "");
    line1 = line1.replace(";", "");
    songOffset = Math.fround(line1) * 1000;
  }
  else if(line1.toUpperCase().includes("#BPMS:")){
    // #BPMS:0.000=181.600,16.000=726.400,80.000=181.601,372.000=726.404,404.000=90.801,422.000=181.603;
    line1 = line1.replace("#BPMS:", "");
    line1 = line1.replace(";", "");
    const bpms = line1.split(",");
    for(let i = 0; i < bpms.length ; i++){
      const currBpm = bpms[i].split("=");
      let beatnum = parseInt(currBpm[0]);
      let beatspermin = Number(currBpm[1]);
      let secondsPerBeat = (60.0f / beatspermin) * 4;
      let scrollSpeed = 1.0f / beatspermin;
      bpmList.push([beatnum, beatspermin, scrollSpeed, 9999999999]);
      if(i > 0){
        // update previous beat length:
        var prevBeatNum = bpmList[i-1][0];
        bpmList[i-1][3] = beatnum - prevBeatNum;
      }
    }
  }
  if(line1.toUpperCase().includes("#NOTES:")){
    line1 = musicFileStepMania.getline();
    line1 = musicFileStepMania.getline();
    line1 = musicFileStepMania.getline();
    line1 = musicFileStepMania.getline();
    line1 = musicFileStepMania.getline();
    break;
  }
}

function getHeldInfo(arrowLoad, heldBefore ){
  if(arrowLoad == 2){
    return 2;
  }
  if(arrowLoad == 0 && heldBefore){
    return 7;
  }
  return 0;
}

var currentBeat = 0;
var arrowCountThisBeat = 0;
var currNotesHeight = 0;
var heldLoader = [0,0,0,0];
while(true){
  var readLine = musicFileStepMania.getline();
  if(readLine==null){
    //line1 = "WASNULL";
    break;
  }
  if(readLine.toUpperCase().includes(",")){
    currentBeat++;
    let notesHeight = 256 / arrowCountThisBeat;
    for(let i = stepManiaQueue.length - arrowCountThisBeat; i < stepManiaQueue.length; i++){
      stepManiaQueue[i][5] = currNotesHeight;
      currNotesHeight += notesHeight;
    }
    arrowCountThisBeat=0;
    continue;
  }
  if(readLine.toUpperCase().includes("//")){
    continue;
  }
  if(readLine.toUpperCase().includes("#NOTES:")){
    break;
  }
  if(readLine.toUpperCase().includes(";")){
    continue;
  }
  if(readLine.length < 4){
    continue;
  }
  line1 = readLine;

  var leftArrowLoad = Number(line1.charAt(0));
  var downArrowLoad = Number(line1.charAt(1));
  var upArrowLoad = Number(line1.charAt(2));
  var rightArrowLoad= Number(line1.charAt(3));

  heldLoader[0] = getHeldInfo(leftArrowLoad,    heldLoader[0]);
  heldLoader[1] = getHeldInfo(downArrowLoad,    heldLoader[1]);
  heldLoader[2] = getHeldInfo(upArrowLoad,      heldLoader[2]);
  heldLoader[3] = getHeldInfo(rightArrowLoad,   heldLoader[3]);

  leftArrowLoad =   heldLoader[0] != 0 ? heldLoader[0] : leftArrowLoad;
  downArrowLoad =   heldLoader[1] != 0 ? heldLoader[1] : downArrowLoad;
  upArrowLoad =     heldLoader[2] != 0 ? heldLoader[2] : upArrowLoad;
  rightArrowLoad =  heldLoader[3] != 0 ? heldLoader[3] : rightArrowLoad;

  stepManiaQueue.push([
    (leftArrowLoad),
    (downArrowLoad),
    (upArrowLoad),
    (rightArrowLoad),
    currentBeat,
    0, //height
  ]);
  arrowCountThisBeat++;
  //line1 = Number(line1.charAt(2));
}


//std.close(musicFileStepMania);





var gameMode = 0;
var playerSaveData = loadDataObject();

const GAMEWIDTH = canvas.width;
const GAMEHEIGHT = canvas.height;

const wMargin = GAMEWIDTH * math.fround(0.9975);
const hMargin = GAMEHEIGHT * math.fround(0.9975);

const _bg = calcIntValFromArgb(252, 178, 197);
const color_second = calcIntValFromArgb(32, 33, 36);
const colort = calcIntValFromArgb(99, 33, 36);

var new_pad = pads.get();
var old_pad = new_pad;

var fixedTime = 0;
const fixedTimeStep = 20; // example: 50 times per second = 0.02  ... in miliseconds -> 20

let currentScrollHeight = 0;
// Fixed time step stuff

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

mainMenuRenders.tests.push(new TestRect(wMargin, hMargin, GAMEWIDTH - wMargin * 2, GAMEHEIGHT - hMargin * 2, color_second));
mainMenuRenders.buttons.push(new TestRect(0, 0, 20, 20, calcIntValFromArgb(255, 22, 77)));
mainMenuRenders.texts.push(new UIText(0,0, "Welcome back " + playerSaveData.name + " !"));
mainMenuRenders.buttons.push(new Button(20, 450, 8, calcIntValFromArgb(75, 200, 75), "Play", calcIntValFromArgb(255, 255, 255),pressedPlay));
mainMenuRenders.buttons.push(new Button(100, 450, 8, calcIntValFromArgb(75, 200, 75), "Settings", calcIntValFromArgb(255, 255, 255),showSettings));



const gameRenders = {
  tests: [],
  texts: [],
  buttons: [],
  sprites: [],
};



gameRenders.tests.push(new TestRect(wMargin, hMargin, GAMEWIDTH - wMargin * 2, GAMEHEIGHT - hMargin * 2, color_second));
gameRenders.texts.push(new UIText(0,0, "Welcome back " + playerSaveData.name + " !"));
let arrowTopSectionImg = new Image("BIZZYGAME/GRAPHICS/REVOLUTION/ARROWTOPSECTION.PNG", VRAM);
let greenArrows = new Image("BIZZYGAME/GRAPHICS/REVOLUTION/ARROWGREEN.PNG", VRAM);
let greenArrowsHOLD = new Image("BIZZYGAME/GRAPHICS/REVOLUTION/ARROWSHOLDCENTERS.PNG", VRAM);
let greenArrowsHOLDTOP = new Image("BIZZYGAME/GRAPHICS/REVOLUTION/ARROWSHOLDTOPS.PNG", VRAM);
let greenArrowsHOLDCAPS = new Image("BIZZYGAME/GRAPHICS/REVOLUTION/ARROWSHOLDCAPS.PNG", VRAM);
let arrowPixelSize = 36;
//  constructor(x, y, sprite, width, height, startx,starty,endx,endy)
// GREEN ARROWS
gameRenders.sprites.push(new Sprite(38*1,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*3,arrowPixelSize,arrowPixelSize*4,72)); // left
gameRenders.sprites.push(new Sprite(38*3,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*7,0,arrowPixelSize*8,36)); // down
gameRenders.sprites.push(new Sprite(38*2,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*3,0,arrowPixelSize*4,36)); // up
gameRenders.sprites.push(new Sprite(38*4,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*7,arrowPixelSize,arrowPixelSize*8,72)); // right
// HOLD ARROWS
gameRenders.sprites.push(new Sprite(38*1,arrowPixelSize,greenArrowsHOLD,arrowPixelSize,70,arrowPixelSize*4,0,arrowPixelSize*5,70)); // L
gameRenders.sprites.push(new Sprite(38*3,arrowPixelSize,greenArrowsHOLD,arrowPixelSize,70,arrowPixelSize*2,0,arrowPixelSize*3,70)); // D
gameRenders.sprites.push(new Sprite(38*2,arrowPixelSize,greenArrowsHOLD,arrowPixelSize,70,arrowPixelSize*0,0,arrowPixelSize*1,70)); // U
gameRenders.sprites.push(new Sprite(38*4,arrowPixelSize,greenArrowsHOLD,arrowPixelSize,70,arrowPixelSize*6,0,arrowPixelSize*7,70)); // R
// HOLD TOPS
gameRenders.sprites.push(new Sprite(38*1,arrowPixelSize,greenArrowsHOLDTOP,arrowPixelSize,62,arrowPixelSize*0,0,arrowPixelSize*1,62)); // L
gameRenders.sprites.push(new Sprite(38*3,arrowPixelSize,greenArrowsHOLDTOP,arrowPixelSize,62,arrowPixelSize*1,0,arrowPixelSize*2,62)); // D
gameRenders.sprites.push(new Sprite(38*2,arrowPixelSize,greenArrowsHOLDTOP,arrowPixelSize,62,arrowPixelSize*2,0,arrowPixelSize*3,62)); // U
gameRenders.sprites.push(new Sprite(38*4,arrowPixelSize,greenArrowsHOLDTOP,arrowPixelSize,62,arrowPixelSize*3,0,arrowPixelSize*4,62)); // R
// HOLD CAPS
gameRenders.sprites.push(new Sprite(38*1,arrowPixelSize,greenArrowsHOLDCAPS,arrowPixelSize,36,arrowPixelSize*4,0,arrowPixelSize*5,36)); // L
gameRenders.sprites.push(new Sprite(38*3,arrowPixelSize,greenArrowsHOLDCAPS,arrowPixelSize,36,arrowPixelSize*2,0,arrowPixelSize*3,36)); // D
gameRenders.sprites.push(new Sprite(38*2,arrowPixelSize,greenArrowsHOLDCAPS,arrowPixelSize,36,arrowPixelSize*0,0,arrowPixelSize*1,36)); // U
gameRenders.sprites.push(new Sprite(38*4,arrowPixelSize,greenArrowsHOLDCAPS,arrowPixelSize,36,arrowPixelSize*6,0,arrowPixelSize*7,36)); // R

function showSettings(){
  //mainMenuRenders.buttons.push(new Button(180, 450, 8, calcIntValFromArgb(75, 200, 75), "SETT", calcIntValFromArgb(255, 255, 255),showSettings));
  gameMode = 7;
}
var timer = Timer.new();
var bpmChangeTimer = 0;
var bpmListIndex = 0;
let currentBPM = 181.600f;

function getBpmTimer(bpmObj){
  let beatsPerMin = bpmObj[1];
  let beatAmount = bpmObj[3];
  let secondsPerBeat = 60.0f / beatsPerMin;
  return beatAmount * secondsPerBeat * 1000;
}

let testVal;

function pressedPlay(){
  sound.play(musicFile);
  Timer.reset(timer);
  fixedTime = 0;
  currentScrollHeight = 0;
  bpmListIndex = 0;
  testVal = bpmList[0];
  bpmChangeTimer = getBpmTimer(bpmList[bpmListIndex]);
  currentBPM = bpmList[bpmListIndex][1];
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


const sections = [
  { bpm: 181, duration: 16 },
  { bpm: 726, duration: 80 },
  { bpm: 181, duration: 290 },
  // Add more sections as needed
];
function calculateBaseHeight(sections, currentTime) {
  let baseHeight = 0;
  let timeLeft = currentTime;
  for (const section of sections) {
    
  }
  return baseHeight;
}

const bpmValues = [181, 750, 120, 160, 140]; // Example BPM values for each section
    
// Define the duration (in seconds) for each section of the music
const sectionDurations = [3, 5, 25, 15, 35];
const totalDuration = sectionDurations.reduce((acc, val) => acc + val, 0);
let currentSectionIndex = 0;


function fixedUpdate(currTime){
  while(fixedTime < currTime){
    fixedTime += fixedTimeStep;
    if(fixedTime > currTime){
      fixedTime -= fixedTimeStep;
      break;
    }
    
    fixedUpdateScroll();


  }
}


var currentScrollSpeed = 0;

function fixedUpdateScroll(){
  
  if(songOffset < 0){
    songOffset += fixedTimeStep;
    return;
  }

  let speedOption = 1;
  currentScrollSpeed = 0.001066f * currentBPM;
  //currentScrollSpeed = Math.round((Math.floor((currentBPM / 60)*1000)) / 5.25f); // store scroll as int * 1000
  //currentScrollSpeed =  (800/(currentBPM));
  currentScrollHeight -= fixedTimeStep * currentScrollSpeed;

  bpmChangeTimer -= fixedTimeStep;
  if(bpmChangeTimer <= 0){
    bpmListIndex++;
    bpmChangeTimer = getBpmTimer(bpmList[bpmListIndex]);
    currentBPM = bpmList[bpmListIndex][1];
  }

}

var showDebugInfo = false;

function drawGame(){
  var currTime = Timer.getTime(timer);
  fixedUpdate(currTime);
  screen.clear(_bg);


  gameRenders.tests.forEach((element) => {
    element.render();
  });
/*   gameRenders.sprites.forEach((element) => {
    element.render();
  }); */
  gameRenders.texts.forEach((element) => {
    element.render();
  });
  fontInfo.color = calcIntValFromArgb(255, 255, 255, 255);

  //fontInfo.print(0,450,line1 + "timer" + currTime);

  var offset = -45.310f;
  var timerHeight = (currTime / 1000) * DISPSPEED * (181)/(DISPSPEED) + (offset*1000)/DISPSPEED;
  // #BPMS:0.000=181.600,16.000=726.400,80.000=181.601,372.000=726.404,404.000=90.801,422.000=181.603;
  // 6.631-5.310 = 1.321
  var currentTime = currTime + offset;


  //fontInfo.print(50, 350, "Fixed   Time: " + fixedTime + " " + currentBPM + " | " + currentScrollSpeed);
  //fontInfo.print(50, 370, "Game    Time: " + currTime + " | " + bpmChangeTimer );+
  if(showDebugInfo){
    fontInfo.print(50, 360,  "STP: " + stepManiaQueue[0][5] + "|" + stepManiaQueue[1][5]
    + "|" + stepManiaQueue[2][5] + "|" + stepManiaQueue[3][5] + "|" + stepManiaQueue[4][5]
    + "|" + stepManiaQueue[5][5] + "|" + stepManiaQueue[6][5] + "|" + stepManiaQueue[7][5]);
    fontInfo.print(50, 380,  "BPM : " + currentBPM + " SPEED : " + currentScrollSpeed);
    fontInfo.print(50, 400,  "BPM CHANGE IN:  " + bpmChangeTimer );
    fontInfo.print(50, 420, "Scrollheight: " + currentScrollHeight + " off: " + songOffset );
    fontInfo.print(50, 440, "queue: " + stepManiaQueue[31] );
    fontInfo.print(50, 460, "queue: " + stepManiaQueue[32] );
  }

  var leftOffset = (canvas.width / 2) - 38*3;

  for (let i = 0; i < stepManiaQueue.length; i++) {
    let smq = stepManiaQueue[i];
    //let curHeight = (currentScrollHeight/1000) + height;
    let curHeight = offsetFromTopScreen + smq[5] + currentScrollHeight;
    if(curHeight < -120){ // a bit higher to show hold
      continue;
    }
    if(smq[0] != 0 ){
      var thisArrowOffset = leftOffset + 38;
      if(smq[0] == 7){
        gameRenders.sprites[4].render(thisArrowOffset,curHeight)
      }else if(smq[0] == 2){
        gameRenders.sprites[8].render(thisArrowOffset,curHeight)
      }else if(smq[0] == 3){
        gameRenders.sprites[12].render(thisArrowOffset,curHeight)
      }else{
        gameRenders.sprites[0].render(thisArrowOffset,curHeight)
      }
    }
    if(smq[1] != 0 ){
      var thisArrowOffset = leftOffset + 76;
      if(smq[1] == 7){
        gameRenders.sprites[5].render(thisArrowOffset,curHeight)
      }else if(smq[1] == 2){
        gameRenders.sprites[9].render(thisArrowOffset,curHeight)
      }else if(smq[1] == 3){
        gameRenders.sprites[13].render(thisArrowOffset,curHeight)
      }else{
        gameRenders.sprites[1].render(thisArrowOffset,curHeight)
      }
    }
    if(smq[2] != 0 ){
      var thisArrowOffset = leftOffset + 112;
      if(smq[2] == 7){
        gameRenders.sprites[6].render(thisArrowOffset,curHeight)
      }else if(smq[2] == 2){
        gameRenders.sprites[10].render(thisArrowOffset,curHeight)
      }else if(smq[2] == 3){
        gameRenders.sprites[14].render(thisArrowOffset,curHeight)
      }else{
        gameRenders.sprites[2].render(thisArrowOffset,curHeight)
      }
    }
    if(smq[3] != 0){
      var thisArrowOffset = leftOffset + 148;
      if(smq[3] == 7){
        gameRenders.sprites[7].render(thisArrowOffset,curHeight)
      }else if(smq[3] == 2){
        gameRenders.sprites[11].render(thisArrowOffset,curHeight)
      }else if(smq[3] == 3){
        gameRenders.sprites[15].render(thisArrowOffset,curHeight)
      }else{
        gameRenders.sprites[3].render(thisArrowOffset,curHeight)
      }
    }
    if(curHeight > GAMEHEIGHT){
      break;
    }
  }

  arrowTopSectionImg.width = 38;
  arrowTopSectionImg.height = 38;
  arrowTopSectionImg.startx = 0;
  arrowTopSectionImg.starty = 0;
  arrowTopSectionImg.endx = 38;
  arrowTopSectionImg.endy = 38;

  for(let i = 0; i < 4; i++){
    arrowTopSectionImg.draw(leftOffset+(i+1)*38, offsetFromTopScreen);
    arrowTopSectionImg.startx += 36;
    arrowTopSectionImg.endx += 36;
  }


  //gameRenders.sprites[0].render();

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
