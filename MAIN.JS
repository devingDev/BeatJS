/* IOP.reset();

IOP.loadDefaultModule(IOP.pads);
IOP.loadDefaultModule(IOP.memcard);
IOP.loadDefaultModule(IOP.audio);
IOP.loadDefaultModule(IOP.memcard);
IOP.loadDefaultModule(IOP.usb_mass); */

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
  loadAttempt = loadData(saveFilePath);
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
    this.size = w * h;
    this.color = color;
  }
  draw() {
    Draw.rect(this.x, this.y, this.w, this.h, this.color);
  }
}
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

const fontInfo = new Font("FONTS/SWANSEA.TTF");
fontInfo.color = calcIntValFromArgb(255, 255, 255);
fontInfo.scale = math.fround(1);
const font = new Font("FONTS/REALLYFREE.TTF");
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
