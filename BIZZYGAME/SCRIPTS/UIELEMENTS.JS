
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
}