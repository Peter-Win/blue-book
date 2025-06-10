const L = 1.4;
const a = 360/5;
const b = (180 - a)/2;
const toRad = (deg) => deg * Math.PI / 180;
const toDeg = (rad) => rad * 180 / Math.PI;


const r = 0.5/Math.cos(toRad(b));
const f = r * Math.sin(toRad(a));

const dr = Math.asin(f/L);
const d = toDeg(dr);
const g1r = Math.acos(f/L);
const g1 = toDeg(g1r);
const g2 = 180-a-90;


console.log("L =", L);
console.log("a =", a);
console.log("b =", b);
console.log("d =", d);
console.log("r =", r);
console.log("f =", f)

console.log("dir1 =", -60 + d);
console.log("dir2 =", 60 + d);
console.log("dir3 =", 180 + d);
console.log("r1 =", 180-(b+g1+g2));
console.log("r2 =", 180 - 2*b);
