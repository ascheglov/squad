'use strict';

const kMapImages = "//nabla.ujkl.ru/squad-maps/";

let $canvas = document.getElementById('canvas');
let g_ctx = $canvas.getContext('2d');

let $you = document.getElementById('you');
let $target = document.getElementById('target');
let $result = document.getElementById('result');
let $history = document.getElementById('history');
let $save = document.getElementById('save');
let $dbg = document.getElementById('dbg');

let $map = document.getElementById('map');
let $map_name = document.getElementById('map-name');
let $target_pos = document.getElementById('target-pos');
let $your_pos = document.getElementById('your-pos');
let $m_target = document.getElementById('m-target');

let $fob_pos = document.getElementById('fob-pos');
let $fob_inner = document.getElementById('fob-inner');
let $fob_inner2 = document.getElementById('fob-inner2');
let $m_fob = document.getElementById('m-fob');

function getMapSize() {
  const o = $map_name.querySelector('option:checked');
  return [o.getAttribute('m-width'), o.getAttribute('m-height')];
}

function scale(x, cx_old, cx_new) {
  return (x / cx_old) * cx_new;
}

function elem2point(elem) {
  const rc = elem.getBoundingClientRect();
  const x = rc.left + rc.width / 2;
  const y = rc.top + rc.height / 2;
  return [x, y];
}

function moveMarker(el, x, y) {
  const rc = el.getBoundingClientRect();
  el.style.left = (x - rc.width / 2) + "px";
  el.style.top = (y - rc.height / 2) + "px";
}

function setMarker(what, pos) {
  try {
    const [map_cx, map_cy] = getMapSize();
    let [x, y] = point(pos);
    x = scale(x, map_cx, map.width);
    y = scale(y, map_cy, map.height);
    moveMarker(what, x, y);
  } catch (_) {}
}

function updateImpl(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.round(Math.hypot(dx, dy));
  const dir = Math.round(Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  const mil = r2mil(dist);
  const ws = r2clicks(dist);
  $result.innerHTML = `${dir}&deg;, ${dist}m (${mil}mil, ${ws}*W)`;
}

function updateFromText() {
  try {
    const [x0, y0] = point($you.value);
    const [x1, y1] = point($target.value);
    updateImpl(x0, y0, x1, y1);
  } catch (e) {
    console.log(e);
    $result.innerHTML = 'Use "a1 237" for A1-KP2-3 top-left';
  }
  setMarker($your_pos, $you.value);
  setMarker($target_pos, $target.value);
}

function saveCoords() {
  let you = $you.value;
  let target = $target.value;
  let row = document.createElement("div");
  row.onclick = function() {
    $you.value = you;
    $target.value = target;
    updateFromText();
  }
  row.ondblclick = function() { row.remove(); }
  row.innerHTML = you + ' &rarr; ' + target + ' : ' + $result.innerHTML;
  $history.appendChild(row);
}

const bright_maps = new Set(['chora', 'fools-road', 'kohat-toi']);
function changeMap() {
  const name = $map_name.value;
  $map.src = kMapImages + name;
  const brightness = bright_maps.has(name) ? '200%' : '100%'
  $map.style.filter = "brightness(" + brightness + ")";
}

function updateFromClick(e) {
  if ($m_fob.checked) {
    moveMarker($fob_pos, e.pageX, e.pageY);
    return;
  }

  let elem = $m_target.checked ? $target_pos : $your_pos;
  moveMarker(elem, e.pageX, e.pageY);
  const [x0, y0] = elem2point($your_pos);
  const [x1, y1] = elem2point($target_pos);
  $you.value = coords2str(x0, y0);
  $target.value = coords2str(x1, y1);
  updateImpl(x0, y0, x1, y1);
}

function nextMarkType() {
  let b = document.querySelector('input[name="mark"]:checked');
  let n = b.nextElementSibling.nextElementSibling;
  if (!n) n = b.parentElement.firstElementChild;
  n.checked = true;
}

$map.onload = function() {
  g_ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  let [cx, cy] = getMapSize();
  g_ctx.drawImage($map, 0, 0, cx, cy);
  for (let i = 100; i < 4500; i += 100) {
    g_ctx.beginPath();
    g_ctx.lineWidth = (i % 3 == 0) ? 3 : 1;
    g_ctx.moveTo(0, i);
    g_ctx.lineTo(4500, i);
    g_ctx.moveTo(i, 0);
    g_ctx.lineTo(i, 4500);
    g_ctx.stroke();
  }
}

$map_name.onchange = changeMap;

document.onkeydown = function(e) {
  if (e.which == 27) nextMarkType();
}

$canvas.onclick = updateFromClick;
$your_pos.onclick = updateFromClick;
$target_pos.onclick = updateFromClick;
$fob_pos.onclick = updateFromClick;

$you.oninput = updateFromText;
$target.oninput = updateFromText;

$save.onclick = saveCoords;

changeMap();
updateFromText();

function currentCoords(e) {
  $dbg.innerHTML = 'Mouse: ' + coords2str(e.clientX, e.clientY);
}

$canvas.onmousemove = currentCoords;
$your_pos.onmousemove = currentCoords;
$target_pos.onmousemove = currentCoords;
$fob_pos.onmousemove = currentCoords;
