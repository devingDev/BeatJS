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
canvas.mode = PAL;
Screen.setMode(canvas)
//let DISPSPEED = (canvas.mode == NTSC) ? 60 : 50;
let DISPSPEED = 50;

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

// Save/Load system

// Example usage :
// SAVE
// var save = new SaveData();
// save.name = "bizzygwen"
// save.scores.push({name:"level0", score:100});
// saveDataObject(save);
// LOAD
// var loadData = loadDataObject();
// print(loadData.name + " " + loadData.something);
// you can also use the other functions to use your own

// IMPORTANT! If you reset IOP, don't forget to load the correct modules
// Example: IOP.loadDefaultModule(IOP.memcard);

// Can modify these names
const mainFolder = "BIZZYGAME";
const mainDataFile = "game.dat";

// Make your own savedata by modifying/adding to this class:
class SaveData {
  saveVersion = 1;
  name = "BizzyGwen";
  scores = [{ name: "level-", score: 350 }];
}

// save devices (probably can also add hdd and maybe samba?)
const saveDevices = ["mc0:/", "mc1:/", "mass:/"];

function saveDataObject(save, saveFilePathCustom) {
  var saveFilePath = saveFilePathCustom;
  if (typeof saveFilePathCustom === "undefined") {
    saveFilePath = getSaveFilePath();
  }
  var jsonString = JSON.stringify(save);
  var saveAttempt = saveData(saveFilePath, jsonString);
  return saveAttempt;
}

function loadDataObject() {
  var saveFilePath = getSaveFilePath();
  var loadAttempt = loadData(saveFilePath);
  if (loadAttempt.startsWith("ERROR#") || loadAttempt.length <= 0) {
    // create empty savedata and save it:
    var save = new SaveData();
    var saveAttempt = saveDataObject(save);

    loadAttempt = loadData(saveFilePath);
  }

  var loadedData = Object.assign(new SaveData(), JSON.parse(loadAttempt));

  return loadedData;
}

function deleteDataObject() {
  var saveFilePath = getSaveFilePath();
  var removeAttempt = os.remove(saveFilePath);
  return removeAttempt;
}

function stringToArrayBuffer(str) {
  const buffer = new ArrayBuffer(str.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i);
  }
  return buffer;
}

function arrayBufferToString(buffer, maxLength) {
  const uint8Array = new Uint8Array(buffer);
  let str = "";
  for (let i = 0; i < maxLength; i++) {
    str += String.fromCharCode(uint8Array[i]);
  }
  return str;
}

function checkDevice(deviceName) {
  var readDir = os.readdir(deviceName);
  if (readDir[1] == 0) {
    return true;
  }
  return false;
}

function checkFolder(path) {
  var readDir = os.readdir(path);
  if (readDir[1] == 0) {
    return true;
  }
  return false;
}

function createFolder(path) {
  var mkdir = os.mkdir(path);
  if (mkdir == 0) {
    return true;
  }
  return false;
}

function getSaveFilePath() {
  return getSaveFileFolder()[0] + "/" + mainDataFile;
}

function getSaveFileFolder() {
  var error = -1;
  var retMsg = "";

  const saveDeviceAvailable = [];

  // Find available devices (memory,usb,???)
  //retMsg = "Searching for available save devices."
  for (let index = 0; index < saveDevices.length; index++) {
    const saveDevice = saveDevices[index];
    if (checkDevice(saveDevice)) {
      saveDeviceAvailable.push({ device: saveDevice, available: true });
    }
  }

  // Find if my directory already exists
  var foundFolder = false;
  var saveFolder = "";
  for (let index = 0; index < saveDeviceAvailable.length; index++) {
    const saveDevice = saveDeviceAvailable[index].device;
    const savePath = saveDevice + mainFolder;
    if (checkFolder(savePath)) {
      foundFolder = true;
      retMsg += " " + savePath;
      saveFolder = savePath;
      break;
    }
  }

  // If my folder is not found, create it!
  if (!foundFolder) {
    for (let index = 0; index < saveDeviceAvailable.length; index++) {
      const saveDevice = saveDeviceAvailable[index].device;
      const savePath = saveDevice + mainFolder;
      if (createFolder(savePath)) {
        foundFolder = true;
        retMsg += " " + savePath;
        saveFolder = savePath;
        break;
      }
    }
  }

  if (!foundFolder) {
    error = -2;
    retMsg = "Could not find or create save folder.";
  } else {
    retMsg = "Found folder.";
    error = 0;
  }

  const fullSaveFolderPath = saveFolder;
  return [fullSaveFolderPath, retMsg, error];
}

function saveData(savePath, saveObjData) {
  var openAttempt = os.open(savePath, os.O_TRUNC | os.O_CREAT | os.O_WRONLY);
  if (openAttempt < 0) {
    return "ERROR#" + openAttempt;
  }

  const buffer = stringToArrayBuffer(saveObjData);
  var writtenBytes = os.write(openAttempt, buffer, 0, buffer.byteLength);

  os.close(openAttempt);
  return writtenBytes;
}

function loadData(savePath) {
  var openAttempt = os.open(savePath, os.O_RDONLY);
  if (openAttempt < 0) {
    return "ERROR#" + openAttempt;
  }
  const bufferSize = 512;
  const buffer = new ArrayBuffer(bufferSize);
  var readBytes = os.read(openAttempt, buffer, 0, bufferSize);
  var totalBytes = readBytes;
  var readStr = "";
  readStr += arrayBufferToString(buffer, readBytes);
  while (readBytes > 0) {
    readBytes = os.read(openAttempt, buffer, 0, bufferSize);
    if (readBytes > 0) {
      readStr += arrayBufferToString(buffer, readBytes);
      totalBytes += readBytes;
    }
  }

  os.close(openAttempt);
  return readStr;
}

function deleteData(savePath) {
  var removeAttempt = os.remove(savePath);
  return removeAttempt;
}

const uiDefaultFont = new Font("BIZZYGAME/FONTS/SWANSEA.TTF");
uiDefaultFont.color = calcIntValFromArgb(255, 255, 255);
uiDefaultFont.scale = math.fround(1);
const font = new Font("BIZZYGAME/FONTS/REALLYFREE.TTF");
font.color = calcIntValFromArgb(255, 255, 255);
font.scale = math.fround(2.5);


class TestRect {
  x;
  y;
  w;
  h;
  size;
  color = calcIntValFromArgb(255, 35, 36);

  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = this.w * this.h;
    this.color = color;
  }
  render() {
    draw.rect(this.x, this.y, this.w, this.h, this.color);
  }
}

class UIText {
  x;
  y;
  text = "";
  textColor = calcIntValFromArgb(255, 255, 255);

  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
  }
  render() {
    font.color = this.textColor;
    font.print(this.x, this.y, this.text);
  }

}

class Sprite {
  x;y;
  sprite;
  width;height;startx;starty;endx;endy;

  constructor(x, y, sprite, width, height, startx,starty,endx,endy) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.sprite.color = Color.new(255, 255, 255, 127);
    this.width = width;
    this.height = height;
    this.startx = startx;
    this.starty = starty;
    this.endx = endx;
    this.endy = endy;
  }
  render(x,y) {

    this.sprite.width = this.width;
    this.sprite.height = this.height;
    this.sprite.startx = this.startx;
    this.sprite.starty = this.starty;
    this.sprite.endx = this.endx;
    this.sprite.endy = this.endy;
    this.sprite.draw(x, y);
  }
}

class Button {
  x;y;w;h;
  padding;
  size;
  bgcolor = calcIntValFromArgb(180, 180, 180);
  text = "";
  textcolor = calcIntValFromArgb(25, 25, 25);
  methodCall;
  selected = false;
  unselectedColor = calcIntValFromArgb(75, 75, 75);
  
  constructor(x, y, padding, bgcolor, text, textcolor, methodCall) {
    this.x = x;
    this.y = y;
    this.padding = padding;
    var strSize = uiDefaultFont.getTextSize(text);
    this.w = strSize.width;
    this.h = strSize.height;
    this.size = this.w * this.h;
    this.bgcolor = bgcolor;
    this.text = text;
    this.textcolor = textcolor;
    this.methodCall = methodCall;
  }
  render(selected) {
    if(selected){
      draw.rect(this.x-this.padding, this.y-this.padding, this.w+this.padding, this.h+this.padding, this.bgcolor);
    }else{
      draw.rect(this.x-this.padding, this.y-this.padding, this.w+this.padding, this.h+this.padding, this.unselectedColor);
    }
    uiDefaultFont.color = this.textcolor;
    uiDefaultFont.print(this.x-this.padding/2, this.y-this.padding/2, this.text);
  }
  run(){
    this.methodCall();
  }
}sound.setVolume(100);
sound.setVolume(100, 0);

var musicFile = sound.load("BIZZYGAME/SONGS/Hardcore Overdoze/HardcoreOverdoze.wav");
let musicFileStepMania = std.open("BIZZYGAME/SONGS/Hardcore Overdoze/HardcoreOverdoze.sm", "r");

var stepManiaQueue = [];
var bpmList = [];


var line1 = "";
while(true){
  line1 = musicFileStepMania.getline();
  if(line1.toUpperCase().includes("#BPMS:")){
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

while(true){
  var readLine = musicFileStepMania.getline();
  var currentBeat = 1;
  if(readLine==null){
    //line1 = "WASNULL";
    break;
  }
  if(readLine.toUpperCase().includes(",")){
    currentBeat++;
    continue;
  }
  if(readLine.toUpperCase().includes(";")){
    continue;
  }
  if(readLine.length < 4){
    continue;
  }
  line1 = readLine;
  stepManiaQueue.push([
    Number(line1.charAt(0)),
    Number(line1.charAt(1)),
    Number(line1.charAt(2)),
    Number(line1.charAt(3)),
    currentBeat
  ]);
    //line1 = Number(line1.charAt(2));
}



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
var songOffset = -5.31 * (1000);
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
let arrowPixelSize = 36;
gameRenders.sprites.push(new Sprite(38*1,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*3,arrowPixelSize,arrowPixelSize*4,72));
gameRenders.sprites.push(new Sprite(38*3,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*7,0,arrowPixelSize*8,36));
gameRenders.sprites.push(new Sprite(38*2,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*3,0,arrowPixelSize*4,36));
gameRenders.sprites.push(new Sprite(38*4,arrowPixelSize,greenArrows,arrowPixelSize,arrowPixelSize,arrowPixelSize*7,arrowPixelSize,arrowPixelSize*8,72));

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
  currentScrollSpeed = Math.round((Math.floor((currentBPM / 60)*1000)) / 15); // store scroll as int * 1000
  //currentScrollSpeed =  (800/(currentBPM));
  currentScrollHeight -= fixedTimeStep * currentScrollSpeed;

  bpmChangeTimer -= fixedTimeStep;
  if(bpmChangeTimer <= 0){
    bpmListIndex++;
    bpmChangeTimer = getBpmTimer(bpmList[bpmListIndex]);
    currentBPM = bpmList[bpmListIndex][1];
  }

}


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

  var height = 36;
  var offset = -45.310f;
  var timerHeight = (currTime / 1000) * DISPSPEED * (181)/(DISPSPEED) + (offset*1000)/DISPSPEED;
  // #BPMS:0.000=181.600,16.000=726.400,80.000=181.601,372.000=726.404,404.000=90.801,422.000=181.603;
  // 6.631-5.310 = 1.321
  var currentTime = currTime + offset;


  //fontInfo.print(50, 350, "Fixed   Time: " + fixedTime + " " + currentBPM + " | " + currentScrollSpeed);
  //fontInfo.print(50, 370, "Game    Time: " + currTime + " | " + bpmChangeTimer );
  fontInfo.print(50, 380,  "BPM : " + currentBPM + " SPEED : " + currentScrollSpeed);
  fontInfo.print(50, 400,  "BPM CHANGE IN:  " + bpmChangeTimer );
  fontInfo.print(50, 420, "Scrollheight: " + currentScrollHeight + " off: " + songOffset );
  //endchat

  for (let i = 0; i < stepManiaQueue.length; i++) {
    let smq = stepManiaQueue[i];
    let curHeight = (currentScrollHeight/1000) + height;
    if(curHeight < 0){

    }
    else if(smq[0] != 0){
      gameRenders.sprites[0].render(38,curHeight);
    }
    else if(smq[1] != 0){
      gameRenders.sprites[1].render(76,curHeight);
    }
    else if(smq[2] != 0){
      gameRenders.sprites[2].render(112,curHeight);
    }
    else if(smq[3] != 0){
      gameRenders.sprites[3].render(148,curHeight);
    }
    height += 36;
    if(curHeight > GAMEHEIGHT * 2){
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
    arrowTopSectionImg.draw((i+1)*38, 38);
    arrowTopSectionImg.startx += 38;
    arrowTopSectionImg.endx += 38;
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
