'use strict';

function drawLine(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function drawCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawText(ctx, str, x, y, baseline) {
  ctx.textBaseline = baseline;
  ctx.lineWidth = 4;
  ctx.strokeText(str, x, y);
  ctx.fillText(str, x, y);
}

class Draggable {
  constructor(x0, y0) {
    [this.x, this.y] = [x0, y0];
  }
  onBeginDrag(x, y) {
    [this.dragDX, this.dragDY] = [x - this.x, y - this.y];
  }
  onMoveDrag(x, y) {
    this.moveTo(x - this.dragDX, y - this.dragDY);
  }
  moveTo(x, y) { this.x = x; this.y = y; }
  moveBy(dx, dy) { this.x += dx; this.y += dy; }
}

class Map extends Draggable {
  constructor(img) {
    super(0, 0);
    this.scale = 0.5;
    this.img = img;
    [this.mapCX, this.mapCY] = [1, 1];
  }
  onBeginDrag(x, y) {
    [this.dragX0, this.dragY0] = [x, y];
  }
  onMoveDrag(x, y) {
    this.x -= x - this.dragX0;
    this.y -= y - this.dragY0;
  }
  map2canvas(x, y) {
    return [(x - this.x) * this.scale, (y - this.y) * this.scale];
  }
  canvas2map(x, y) {
    return [x / this.scale + this.x, y / this.scale + this.y];
  }
  resizeMap(mapCX, mapCY) {
    [this.mapCX, this.mapCY] = [mapCX, mapCY];
  }
  drawImg(ctx) {
    let [scx, scy] = [ctx.canvas.width, ctx.canvas.height];
    let [kx, ky] = [this.img.width / this.mapCX, this.img.height / this.mapCY];
    let [imgX, imgY] = [this.x * kx, this.y * ky];
    let [imgСX, imgСY] = [scx * kx / this.scale, scy * ky / this.scale];
    ctx.drawImage(this.img, imgX, imgY, imgСX, imgСY, 0, 0, scx, scy);
  }
  drawGrid(ctx) {
    let len = Math.max(ctx.canvas.width, ctx.canvas.height);
    let [gx, gy] = [Math.floor(this.x / 300) * 300, Math.floor(this.y / 300) * 300];
    for (; ;) {
      ctx.lineWidth = (gx % 3 == 0) ? 3 : 1;
      let [x, y] = this.map2canvas(gx, gy);
      ctx.strokeStyle = 'black';
      drawLine(ctx, x, 0, x, len);
      drawLine(ctx, 0, y, len, y);
      if (this.scale > 2.5) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#aaa';
        [x, y] = this.map2canvas(gx + 100 / 3, gy + 100 / 3);
        drawLine(ctx, x, 0, x, len);
        drawLine(ctx, 0, y, len, y);
        [x, y] = this.map2canvas(gx + 200 / 3, gy + 200 / 3);
        drawLine(ctx, x, 0, x, len);
        drawLine(ctx, 0, y, len, y);
      }
      gx += 100; gy += 100;
      if (x > len) break;
    }
  }
  drawScale(ctx) {
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#000';
    ctx.font = '25px sans-serif';
    let text = `${Math.round(this.scale * 100)}%`;
    drawText(ctx, text, 0, ctx.canvas.height, 'bottom');
  }
  draw(ctx) {
    ctx.fillStyle = '#aaa';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.drawImg(ctx);
    this.drawGrid(ctx);
    this.drawScale(ctx);
  }
  zoom(sx, sy, zoomOut) {
    let oldScale = this.scale;
    let delta = this.scale < 1 ? 0.1 : this.scale < 2 ? 0.2 : 0.5;
    if (zoomOut) {
      this.scale = Math.max(0.2, this.scale - delta);
    } else {
      this.scale = Math.min(4, this.scale + delta);
    }

    let k = 1 / oldScale - 1 / this.scale;
    this.moveBy(sx * k, sy * k);
  }
};

class MapObject extends Draggable {
  constructor(map, x0, y0, img) {
    super(x0, y0);
    this.map = map;
    this.img = img;
  }
  toScreen() {
    return this.map.map2canvas(this.x, this.y);
  }
  isMouseOver(ex, ey) {
    let [sx, sy] = this.toScreen();
    return Math.hypot(ex - sx, ey - sy) < 15;
  }
  drawLast(ctx) {
    let [sx, sy] = this.toScreen();
    ctx.drawImage(this.img, sx - 10, sy - 10);
  }
}

class Mortar extends MapObject {
  constructor(map, x0, y0, img) {
    super(map, x0, y0, img);
  }

  drawFirst(ctx) {
    let [x, y] = this.toScreen();
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;
    drawCircle(ctx, x, y, kMaxRocketRange * this.map.scale);
    drawCircle(ctx, x, y, kMaxMortarRange * this.map.scale);
  }
};

function drawMortarGridLine(ctx, x0, y0, r0, r1, dir) {
  let phi = dir * Math.PI / 180;
  let [kx, ky] = [Math.sin(phi), -Math.cos(phi)];
  drawLine(ctx, x0 + kx * r0, y0 + ky * r0, x0 + kx * r1, y0 + ky * r1);
}

function drawMortarGridArc(ctx, x0, y0, r, dir) {
  let alpha = Math.PI / 180;
  let phi = (dir - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.arc(x0, y0, r, phi - 2 * alpha, phi + 2 * alpha);
  ctx.stroke();
}

class Target extends MapObject {
  constructor(map, mortar, x0, y0, img) {
    super(map, x0, y0, img);
    this.mortar = mortar;
    this.drawCircles = false;
  }

  drawFirst(ctx) {
    let [sx, sy] = this.toScreen();

    if (this.drawCircles) {
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 1;
      drawCircle(ctx, sx, sy, kMaxRocketRange * this.map.scale);
      drawCircle(ctx, sx, sy, kMaxMortarRange * this.map.scale);
    }

    const [dist, dir] = calc(this.mortar.x, this.mortar.y, this.x, this.y);
    const mil = r2mil(dist);
    const mil10 = Math.round(r2mil(dist) / 10) * 10;

    let [smx, smy] = this.mortar.toScreen();
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 1;
    const [ra, r0, r1, r2, rb] = [mil10 - 10, mil10 - 5, mil10, mil10 + 5, mil10 + 10].map(x => mil2r(x) * this.map.scale);
    drawMortarGridLine(ctx, smx, smy, ra, rb, dir - 1);
    drawMortarGridLine(ctx, smx, smy, ra, rb, dir + 0);
    drawMortarGridLine(ctx, smx, smy, ra, rb, dir + 1);
    drawMortarGridArc(ctx, smx, smy, r0, dir);
    drawMortarGridArc(ctx, smx, smy, r1, dir);
    drawMortarGridArc(ctx, smx, smy, r2, dir);

    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#f00';
    ctx.font = '18px sans-serif';

    let textX = sx + 10;
    drawText(ctx, `${dir}\u00B0 ${dist}m`, textX, sy, 'bottom');

    const ws = r2clicks(dist);
    drawText(ctx, `${mil}mil ${ws}w`, textX, sy, 'top');
  }
};

class Fob extends MapObject {
  constructor(map, x0, y0, img) {
    super(map, x0, y0, img);
    this.visible = false;
  }
  drawFirst(ctx) {
    if (!this.visible) return;
    let [x, y] = this.toScreen();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f00';
    drawCircle(ctx, x, y, 75 * this.map.scale);
    ctx.strokeStyle = '#00f';
    drawCircle(ctx, x, y, 400 * this.map.scale);
  }
  drawLast(ctx) {
    if (!this.visible) return;
    super.drawLast(ctx);
  }
}
