'use strict';

let $dbg = document.getElementById('dbg');

let $map_name = document.getElementById('map-name');
let $map_img = document.getElementById('map');

let $canvas = document.getElementById('canvas');

let $mortar_img = document.getElementById('mortar');
let $target_img = document.getElementById('target');
let $fob_img = document.getElementById('fob');

let $show_fob = document.getElementById('show-fob');
let $show_target_circles = document.getElementById('show-target-circles');

let g_map = new Map($map_img);
let g_mortar = new Mortar(g_map, 900, 600, $mortar_img);
let g_target = new Target(g_map, g_mortar, 600, 900, $target_img);
let g_fob = new Fob(g_map, 900, 900, $fob_img);
let g_allObjects = [g_fob, g_mortar, g_target];

function drawAll() {
  let ctx = $canvas.getContext('2d');

  g_map.draw(ctx);

  for (let obj of g_allObjects) obj.drawFirst(ctx);
  for (let obj of g_allObjects) obj.drawLast(ctx);
}

function event2canvasXY(e) {
  const rc = $canvas.getBoundingClientRect();
  return [e.clientX - rc.left, e.clientY - rc.top];
}

let g_movingObj = null;
function beginDrag(obj, x, y) {
  g_movingObj = obj;
  obj.onBeginDrag(x, y);
}

$canvas.onmousedown = function (e) {
  let [sx, sy] = event2canvasXY(e);
  let [x, y] = g_map.canvas2map(sx, sy);
  for (let obj of g_allObjects) {
    if (obj.isMouseOver(sx, sy)) {
      beginDrag(obj, x, y);
      return;
    }
  }

  beginDrag(g_map, x, y);
}

function resetMove() {
  g_movingObj = null;
}
$canvas.onmouseup = resetMove;
$canvas.onmouseleave = resetMove;

let [oldX, oldY] = [0, 0];
$canvas.onmousemove = function (e) {
  const [sx, sy] = event2canvasXY(e);
  let [x, y] = g_map.canvas2map(sx, sy).map(Math.round);
  $dbg.innerText = coords2str(x, y) + ` (${x}, ${y})`;

  if (g_movingObj) {
    g_movingObj.onMoveDrag(x, y);
    drawAll();
  }
}
$canvas.onwheel = function (e) {
  let zoomOut = e.deltaY > 0;
  let [sx, sy] = event2canvasXY(e);
  g_map.zoom(sx, sy, zoomOut);
  drawAll();
}

function changeMap() {
  $map_img.src = $map_name.value;
}
$map_name.onchange = changeMap;
changeMap();
$map_img.onload = function () {
  const o = $map_name.querySelector('option:checked');
  let [cx, cy] = [o.getAttribute('m-width'), o.getAttribute('m-height')];
  g_map.resizeMap(cx, cy);
  drawAll();
};

function onResize() {
  $canvas.width = window.innerWidth;
  $canvas.height = window.innerHeight;
  drawAll();
}
window.addEventListener('resize', onResize, false);
onResize();

function toggleFob() {
  g_fob.visible = $show_fob.checked;
  drawAll();
}
$show_fob.onchange = toggleFob;

$show_target_circles.onchange = function() {
  g_target.drawCircles = $show_target_circles.checked;
  drawAll();
}
