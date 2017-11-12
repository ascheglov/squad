'use strict';

const kMaxRocketRange = 815;
const kMaxMortarRange = 1250;

function coords2kp(x, y, size) {
  x = Math.floor(x / size) % 3;
  y = Math.floor(y / size) % 3;
  return 1 + x + 3 * (2 - y);
}

function coords2str(x, y) {
  const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(x / 300));
  const number = Math.floor(y / 300) + 1;
  const kp1 = coords2kp(x, y, 100);
  const kp2 = coords2kp(x, y, 100 / 3);
  return `${letter}${number} - ${kp1} - ${kp2}`;
}

function point(str) {
  const [_, x_letter, y_number, keypads_str] = str.toUpperCase().match(/([A-Z])(\d+)(.*)/);
  let grid = 300;
  let x = (x_letter.charCodeAt(0) - 'A'.charCodeAt(0) + 0.5) * grid;
  let y = (y_number - 0.5) * grid;

  for (let kp of keypads_str.replace(/[^0-9]+/g, '')) {
    grid /= 3;
    //    0  1  2  3  4  5  6  7  8  9
    x += [0,-1, 0, 1,-1, 0, 1,-1, 0, 1][kp] * grid;
    y += [0, 1, 1, 1, 0, 0, 0,-1,-1,-1][kp] * grid;
  }

  return [x, y];
}

function calc(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.round(Math.hypot(dx, dy));
  const dir = Math.round(Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  return [dist, dir];
}

function r2mil(r) {
  if (r <= 50 || r >= kMaxMortarRange) return 0;
  //           50    100   150   200   250   300   350   400   450
  const mil = [1579, 1558, 1538, 1517, 1496, 1475, 1453, 1431, 1409, 1387, 1364, 1341, 1317, 1292, 1267, 1240, 1212, 1183, 1152, 1118, 1081, 1039, 988, 918, 800];
  const i_frac = r / 50 - 1;
  const i = Math.floor(i_frac);
  const [a, b] = mil.slice(i);
  const k = i_frac - i;
  return Math.round(a - (a - b) * k);
}

function r2clicks(r) {
  const dists = [30, 115, 200, 257.5, 292.5, 320, 365, 412.5, 462.5, 515, 550, 572.5, 607.5, 640, 665, 690, 720, 742.5, 760, 795, 9000];
  if (r <= 60 || r >= kMaxRocketRange) return 0;
  return dists.findIndex(function(d) { return r < d; });
}
