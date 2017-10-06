function assert_eq(a, b, context) {
  console.assert(JSON.stringify(a) == JSON.stringify(b), `${context}:`, a, '!=', b);
}
assert_eq([2, 3], [4, 5], "must fail");

function test_point(str, x, y) {
  assert_eq(point(str).map(Math.round), [x, y], str);
}
test_point('a1', 150, 150);
test_point('a1 5', 150, 150);
test_point('a1 9', 250, 50);
test_point('a1 7', 50, 50);
test_point('a1 75', 50, 50);
test_point('a1 79', 83, 17);
test_point('a1 77', 17, 17);
test_point('a1 777', 6, 6);

function test_calc(src, dst, dist, dir) {
  assert_eq(calc(src, dst), [dist, dir], `${src} -> ${dst}`);
}
test_calc('a1', 'a1 7', 141, 315);
test_calc('a1', 'a1 8', 100, 0);
test_calc('a1', 'a1 9', 141, 45);
test_calc('a1', 'a1 6', 100, 90);
test_calc('a1', 'a1 4', 100, 270);
test_calc('a2', 'b1',   424, 45);

function test_r2mil(dist, mil) {
  assert_eq(r2mil(dist), mil, `${dist}m :`);
}
test_r2mil(300, 1475);
test_r2mil(350, 1453);
test_r2mil(425, 1420);
test_r2mil(60, 1575);

function test_r2clicks(dist, clicks) {
  assert_eq(r2clicks(dist), clicks, `${dist}m :`);
}
test_r2clicks(500, 9);
test_r2clicks(800, 20);
test_r2clicks(50, 0);

function test_str2point(x, y, str) {
  assert_eq(coords2str(x, y), str, str);
}
test_str2point(83, 17, 'A1-795');
test_str2point(383, 617, 'B3-795');
