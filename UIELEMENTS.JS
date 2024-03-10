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
