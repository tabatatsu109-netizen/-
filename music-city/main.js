// MUSIC CITY — Episode 01: The First Melody
// Everything in the scene is a pure function of time t, so frames can be
// rendered in any order and always line up with the audio track.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCamera } from './camera.js';

const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1080), H = +(params.get('h') || 1920);
const DEBUG_CAM = params.get('cam');
const NOTES = await (await fetch('./notes.json')).json();
const LETTERS = await (await fetch('./letters.json')).json();

// ---------------------------------------------------------------- utilities
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(20261120);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const pick = arr => arr[Math.floor(rnd() * arr.length)];
function elastic(x) { if (x <= 0) return 0; if (x >= 1) return 1; return 1 - Math.exp(-7 * x) * Math.cos(11 * x); }
function popScale(tau, dur = 0.55) { return elastic(tau / dur); }

function pchip(xs, ys) {
  const n = xs.length;
  if (n === 1) return () => ys[0];
  const h = [], dl = [];
  for (let i = 0; i < n - 1; i++) { h.push(xs[i + 1] - xs[i]); dl.push((ys[i + 1] - ys[i]) / h[i]); }
  const m = new Array(n).fill(0);
  m[0] = dl[0]; m[n - 1] = dl[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (dl[i - 1] * dl[i] <= 0) m[i] = 0;
    else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / dl[i - 1] + w2 / dl[i]); }
  }
  return x => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const s = (x - xs[i]) / h[i], s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * h[i] * m[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * h[i] * m[i + 1];
  };
}
function makeSchedule(knots) {
  const pieces = []; let cur = [knots[0]];
  for (let i = 1; i < knots.length; i++) { cur.push(knots[i]); if (knots[i].kink && i < knots.length - 1) { pieces.push(cur); cur = [knots[i]]; } }
  pieces.push(cur);
  const fs = pieces.map(p => pchip(p.map(k => k.t), p.map(k => k.d)));
  const ends = pieces.map(p => p[p.length - 1].t);
  return t => { for (let i = 0; i < fs.length; i++) if (t <= ends[i] || i === fs.length - 1) return fs[i](t); };
}

// ---------------------------------------------------------------- palette
const PAL = { coral: 0xff8f8f, butter: 0xffdf85, sky: 0x8fcdff, mint: 0x97e6c2, lav: 0xc8b4f6, cream: 0xfff3da, white: 0xffffff, pink: 0xffb7cf, peach: 0xffc9a3 };
const PASTELS = [PAL.coral, PAL.butter, PAL.sky, PAL.mint, PAL.lav];
const LANE_NAMES = ['R', 'Y', 'B', 'G', 'P'];
const MARBLE_COL = { R: 0xff6565, Y: 0xffcf40, B: 0x4fa9ff, G: 0x4fd69c, P: 0xa883f2 };
const LANE_COL = { R: 0xffb0aa, Y: 0xffe9a6, B: 0xb4dcff, G: 0xb9efd6, P: 0xdacbfa };

// ---------------------------------------------------------------- layout constants
const R0 = 8, SPIRAL_A = 0.9, LANE_W = 0.95, RM = 0.28, GRAV = 14;
const H0 = 0.45, KEY_DROP = 0.2, SLAB_T = 0.14, R_ISL = 17.6;
let PHI0 = 0;
function centerAt(th) { const r = R0 + SPIRAL_A * th, ph = PHI0 + th; return { x: r * Math.cos(ph), z: r * Math.sin(ph), r, ph }; }
function frameAt(th) {
  const r = R0 + SPIRAL_A * th, ph = PHI0 + th;
  let tx = SPIRAL_A * Math.cos(ph) - r * Math.sin(ph), tz = SPIRAL_A * Math.sin(ph) + r * Math.cos(ph);
  const l = Math.hypot(tx, tz); tx /= l; tz /= l;
  return { tx, tz, nx: tz, nz: -tx };
}
class Lane {
  constructor(k) { this.k = k; this.name = LANE_NAMES[k]; this.o = (k - 2) * LANE_W; this.dev = () => 0; this.extra = () => 0; }
  pos(th) { const c = centerAt(th), f = frameAt(th), off = this.o + this.dev(th); return { x: c.x + f.nx * off, z: c.z + f.nz * off }; }
  build() {
    const a = -0.5, b = 6.6, n = 7200; this.ths = []; this.ds = [];
    let acc = 0, prev = null, zero = 0;
    for (let i = 0; i <= n; i++) { const th = a + (b - a) * i / n, p = this.pos(th); if (prev) acc += Math.hypot(p.x - prev.x, p.z - prev.z); this.ths.push(th); this.ds.push(acc); prev = p; }
    const i0 = Math.round((0 - a) / (b - a) * n); zero = this.ds[i0];
    for (let i = 0; i <= n; i++) this.ds[i] -= zero;
  }
  thAt(d) { const ds = this.ds; let lo = 0, hi = ds.length - 1; if (d <= ds[0]) return this.ths[0]; if (d >= ds[hi]) return this.ths[hi]; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ds[m] <= d) lo = m; else hi = m; } const k = (d - ds[lo]) / (ds[hi] - ds[lo]); return lerp(this.ths[lo], this.ths[hi], k); }
  dAt(th) { const ths = this.ths; const u = (th - ths[0]) / (ths[ths.length - 1] - ths[0]) * (ths.length - 1); const i = clamp(Math.floor(u), 0, ths.length - 2); return lerp(this.ds[i], this.ds[i + 1], u - i); }
  height(d) { // top surface of the track slab
    let h = H0 + this.extra(d);
    if (d < 0) h += this.slideH * smooth(-d / (this.slideL - 0.15));
    return h;
  }
  at(d) {
    const th = this.thAt(d), p = this.pos(th), e = 0.002, p1 = this.pos(th - e), p2 = this.pos(th + e);
    let tx = p2.x - p1.x, tz = p2.z - p1.z; const l = Math.hypot(tx, tz); tx /= l; tz /= l;
    return { x: p.x, z: p.z, tx, tz, nx: tz, nz: -tx, th, y: this.height(d), d };
  }
}
const lanes = LANE_NAMES.map((_, k) => new Lane(k));
const laneOf = Object.fromEntries(lanes.map(l => [l.name, l]));
lanes.forEach(l => { l.slideL = l.name === 'R' ? 0.95 : 1.45; l.slideH = l.name === 'R' ? 0.75 : 1.25; l.build(); });

// ---------------------------------------------------------------- who plays which note
const midiAt = t => { let best = NOTES[0]; for (const n of NOTES) if (Math.abs(n.t - t) < Math.abs(best.t - t)) best = n; return best.midi; };
const hits = { R: [], Y: [], B: [], G: [], P: [] };
const addHit = (m, t, kind = 'key') => hits[m].push({ t, kind, midi: midiAt(t), marble: m });
[0.5, 1, 1.5, 2, 2.5].forEach(t => addHit('R', t));
addHit('B', 3.0); addHit('Y', 3.5); addHit('G', 4.0); addHit('P', 4.5);
const N1 = NOTES.map(n => n.t).filter(t => t >= 5 && t <= 16.5);
N1.forEach((t, i) => addHit(['R', 'B', 'Y', 'G', 'P'][i % 5], t));
[24.25, 24.5, 24.75, 25.0].forEach(t => addHit('Y', t));
const N2 = NOTES.map(n => n.t).filter(t => t >= 25.25 && t <= 39.75);
N2.forEach((t, i) => addHit(['R', 'G', 'P', 'Y', 'B'][i % 5], t));
[40, 40.5, 41, 41.5, 42, 42.5, 43].forEach(t => addHit('R', t, 'chime'));
addHit('R', 44, 'big');
const SPAWN = { R: -10, B: 1.0, Y: 1.5, G: 2.0, P: 2.5 };
const sp = dt => dt <= 0.3 ? 0.5 : dt <= 0.62 ? 0.8 : 1.2 * dt;

const T_COLLIDE = 24.0, T_ARCHBELL = 23.75;
const marbles = {};
let dK = 0, thStar = 0, dBc = 0;
function buildMarble(name) {
  const hs = hits[name], lane = laneOf[name], L = lane.slideL, T0 = hs[0].t, knots = [];
  if (name === 'R') knots.push({ t: -1, d: -L }, { t: 0.02, d: -L }, { t: 0.24, d: -L * 0.8 });
  else knots.push({ t: -1, d: -L }, { t: T0 - 0.9, d: -L }, { t: T0 - 0.55, d: -L * 0.84 });
  let d = 0; hs[0].d = 0; knots.push({ t: T0, d: 0 });
  for (let i = 1; i < hs.length; i++) {
    const h = hs[i], p = hs[i - 1], dt = h.t - p.t;
    if (p.t < 17 && h.t > 23) {
      if (name === 'Y') {
        dK = d + 3.0;
        knots.push({ t: p.t + 1.3, d: d + 1.75 }, { t: p.t + 2.0, d: d + 2.55 }, { t: 18.0, d: dK }, { t: T_COLLIDE, d: dK, kink: true });
        d = dK + 0.95;
      } else if (name === 'B') {
        knots.push({ t: 16.6, d: dBc - 3.1 }, { t: 18.2, d: dBc - 2.5 }, { t: 22.7, d: dBc - 2.2 }, { t: 23.35, d: dBc - 1.62 }, { t: T_ARCHBELL, d: dBc - 0.9 }, { t: T_COLLIDE, d: dBc, kink: true }, { t: 24.5, d: dBc + 0.2 }, { t: 25.2, d: dBc + 0.75 });
        d = dBc + 0.75 + 1.35;
      } else {
        const stopT = { R: 17.5, G: 18.3, P: 19.0 }[name], openT = { R: 24.12, G: 24.28, P: 24.44 }[name];
        const gap = 1.2 * (stopT - p.t) * 0.62, dStop = d + gap;
        knots.push({ t: p.t + (stopT - p.t) * 0.55, d: d + gap * 0.8 }, { t: stopT, d: dStop }, { t: openT, d: dStop }, { t: openT + 0.4, d: dStop + 0.16 });
        d = dStop + 0.16 + 1.5 * (h.t - openT - 0.4);
        marbles[name] = { dStop, openT, stopT };
      }
    } else if (h.kind === 'big') d += 1.9;
    else d += sp(dt);
    h.d = d; knots.push({ t: h.t, d });
  }
  const last = hs[hs.length - 1];
  const dEnd = d + (name === 'R' ? 1.3 : 1.15);
  knots.push({ t: last.t + (name === 'R' ? 0.62 : 0.7), d: d + (name === 'R' ? 1.25 : 0.8) }, { t: last.t + (name === 'R' ? 0.75 : 1.5), d: dEnd }, { t: 99, d: dEnd });
  const m = Object.assign(marbles[name] || {}, { name, lane, hits: hs, knots, sched: makeSchedule(knots), dEnd, spawn: SPAWN[name] });
  marbles[name] = m;
  return m;
}
buildMarble('R'); buildMarble('Y'); buildMarble('G'); buildMarble('P');
// orient the spiral so the big bell ends up at the front (+z)
const bigHit = hits.R[hits.R.length - 1];
PHI0 = Math.PI / 2 - laneOf.R.thAt(bigHit.d);
// river angle: where the red marble is at t=31.0
const TH_RIVER = laneOf.R.thAt(marbles.R.sched(31.0));
const RC_RIVER = R0 + SPIRAL_A * TH_RIVER;
const bridgeX = th => (th - TH_RIVER) * RC_RIVER;      // signed distance along the band from river centre
const hump = th => { const x = Math.abs(bridgeX(th)); return x < 2.3 ? 0.8 * 0.5 * (1 + Math.cos(Math.PI * x / 2.3)) : 0; };
lanes.forEach(l => { const base = l.extra; l.extra = d => hump(l.thAt(d)); });
// blue merges onto yellow's lane right behind the parked yellow marble
thStar = laneOf.Y.thAt(dK - 2 * RM);
laneOf.B.dev = th => { const x = (th - thStar) * (R0 + SPIRAL_A * thStar); return -LANE_W * Math.exp(-(x / 1.5) * (x / 1.5)); };
laneOf.B.build();
dBc = laneOf.B.dAt(thStar);
const dBp = hits.B.filter(h => h.t < 17).pop().d = (() => { let d = 0; const hs = hits.B; for (let i = 1; i < hs.length && hs[i].t < 17; i++) d += sp(hs[i].t - hs[i - 1].t); return d; })();
laneOf.B.extra = d => hump(laneOf.B.thAt(d)) + 1.0 * (smooth((d - (dBp + 0.35)) / (dBc - 2.9 - dBp - 0.35)) - smooth((d - (dBc - 2.1)) / 1.95));
buildMarble('B');

// ---------------------------------------------------------------- vertical motion (hops)
function parab(t0, y0, t1, y1) { const T = t1 - t0, v = (y1 - y0 + 0.5 * GRAV * T * T) / T; return t => { const s = t - t0; return y0 + v * s - 0.5 * GRAV * s * s; }; }
const contactY = (m, h) => h.kind === 'big' ? BIG_TOP + RM : h.kind === 'chime' ? CHIME_TOP + RM : m.lane.height(h.d) - KEY_DROP + RM;
const BIG_TOP = 1.55, CHIME_TOP = 0.42;
const TAU_D = Math.sqrt(2 * KEY_DROP / GRAV), TAU_U = 0.34;
for (const m of Object.values(marbles)) {
  const air = [], hs = m.hits, trackY = t => m.lane.height(m.sched(t)) + RM;
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i], p = hs[i - 1], n = hs[i + 1];
    h.cy = contactY(m, h);
    const direct = p && ((h.t - p.t) <= 0.62 || h.kind === 'big' || (h.kind === 'chime' && p.kind === 'chime'));
    if (direct) air.push({ t0: p.t, t1: h.t, f: parab(p.t, contactY(m, p), h.t, h.cy) });
    else { const t0 = h.t - TAU_D; air.push({ t0, t1: h.t, f: parab(t0, trackY(t0), h.t, h.cy) }); }
    const nextDirect = n && ((n.t - h.t) <= 0.62 || n.kind === 'big' || (n.kind === 'chime' && h.kind === 'chime'));
    if (!nextDirect) { const tu = h.kind === 'big' ? 0.62 : TAU_U, t1 = h.t + tu; air.push({ t0: h.t, t1, f: parab(h.t, h.cy, t1, trackY(t1)) }); }
  }
  m.air = air;
  // ground intervals -> track slabs
  m.slabs = [];
  let tA = -1, reveal = m.spawn;
  for (let i = 0; i <= air.length; i++) {
    const a = air[i];
    if (!a || a.t0 > tA + 1e-6) {
      const tB = a ? a.t0 : 99;
      let d0 = m.sched(tA) - (tA < 0 ? 0.3 : 0.1), d1 = m.sched(tB) + (a ? 0.07 : 0.5);
      if (d1 - d0 > 0.3) m.slabs.push({ d0, d1, t0: reveal });
    }
    if (a) { tA = a.t1; const hh = hs.filter(h => h.t <= a.t1 + 1e-6).pop(); if (hh) reveal = hh.t; }
  }
  // key reveal times
  hs.forEach((h, i) => { h.reveal = i === 0 ? m.spawn + 0.12 : hs[i - 1].t + 0.1; });
}
hits.R.slice(0, 5).forEach(h => h.reveal = -10);
hits.Y.filter(h => h.t > 24 && h.t <= 25.01).forEach((h, i) => h.reveal = T_COLLIDE + 0.03 + 0.05 * i);
hits.R.filter(h => h.kind === 'chime').forEach((h, i) => h.reveal = 39.05 + 0.06 * i);
bigHit.reveal = 40.0;

function marbleState(m, t) {
  const d = m.sched(t), L = m.lane.at(d);
  let y = L.y + RM, inAir = false;
  for (const a of m.air) if (t >= a.t0 && t <= a.t1) { y = a.f(t); inAir = true; break; }
  return { x: L.x, y, z: L.z, tx: L.tx, tz: L.tz, d, inAir, th: L.th };
}

// ---------------------------------------------------------------- three.js setup
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 600);

// sky dome with a soft vertical gradient
const skyU = { top: { value: new THREE.Color(0x8fcfff) }, mid: { value: new THREE.Color(0xcdeaff) }, bot: { value: new THREE.Color(0xcfe9ff) } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: 'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0.0 ? mix(mid, top, smoothstep(0.0,0.75,h)) : mix(mid, bot, smoothstep(0.0,-0.55,h)); gl_FragColor=vec4(c,1.0);\n#include <colorspace_fragment>\n }'
}));
scene.add(sky);
scene.fog = new THREE.Fog(0xd6eeff, 130, 420);

const hemi = new THREE.HemisphereLight(0xeaf6ff, 0xffe6c9, 1.15); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e2, 2.3);
sun.target.position.set(0, 0, 13); sun.position.set(-17 * 1.4, 34 * 1.4, 13 + 21 * 1.4); sun.castShadow = true; scene.add(sun.target);
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5;
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 38, bottom: -38, near: 1, far: 160 });
scene.add(sun);

const matCache = new Map();
function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.0, ...o }));
  return matCache.get(key);
}
function mesh(geo, material, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }
const GEO = {
  sphere: new THREE.SphereGeometry(1, 28, 20), cyl: new THREE.CylinderGeometry(1, 1, 1, 20), cone16: new THREE.ConeGeometry(1, 1, 20), cone4: new THREE.ConeGeometry(1, 1, 4),
  dome: new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
};
const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));

// ---------------------------------------------------------------- island, river, clouds
{
  const pts = [[0, 0], [R_ISL - 0.5, 0], [R_ISL - 0.15, -0.1], [R_ISL, -0.45], [R_ISL - 0.25, -1.0], [R_ISL - 2.5, -2.6], [R_ISL * 0.55, -5.0], [R_ISL * 0.22, -7.2], [0, -8.2]].map(p => new THREE.Vector2(p[0], p[1]));
  const isl = mesh(new THREE.LatheGeometry(pts, 96), mat(PAL.cream, { roughness: 0.75 }));
  isl.castShadow = false; scene.add(isl);
  const under = mesh(new THREE.LatheGeometry([[R_ISL - 0.24, -1.02], [R_ISL - 2.5, -2.62], [R_ISL * 0.55, -5.02], [R_ISL * 0.22, -7.22], [0, -8.22]].map(p => new THREE.Vector2(p[0] + 0.01, p[1])), 96), mat(0xffd9c2, { roughness: 0.8 }));
  under.castShadow = false; scene.add(under);
}
{
  const w = 39, d = 32.5, r = 9, zc = 29.6, sh = new THREE.Shape();
  sh.moveTo(-w / 2 + r, -d / 2); sh.lineTo(w / 2 - r, -d / 2); sh.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); sh.lineTo(w / 2, d / 2 - r); sh.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); sh.lineTo(-w / 2 + r, d / 2); sh.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); sh.lineTo(-w / 2, -d / 2 + r); sh.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 4, curveSegments: 16 });
  const top = new THREE.Mesh(g, mat(PAL.cream, { roughness: 0.75 })); top.rotation.x = Math.PI / 2; top.position.set(0, -0.304, zc); top.receiveShadow = true; scene.add(top);
  const under = new THREE.Mesh(g, mat(0xffd9c2, { roughness: 0.8 })); under.rotation.x = Math.PI / 2; under.scale.set(0.9, 0.88, 2.2); under.position.set(0, -1.2, zc); scene.add(under);
}
const riverDir = () => { const ph = PHI0 + TH_RIVER; return { x: Math.cos(ph), z: Math.sin(ph) }; };
const RIVER_R0 = 4.6, RIVER_W = 1.5;
{
  const rd = riverDir(), len = R_ISL - 0.35 - RIVER_R0;
  const water = mat(0x9fd8ff, { roughness: 0.12 });
  const strip = mesh(new THREE.BoxGeometry(len, 0.04, RIVER_W), water, rd.x * (RIVER_R0 + len / 2), 0.004, rd.z * (RIVER_R0 + len / 2));
  strip.rotation.y = -Math.atan2(rd.z, rd.x); strip.castShadow = false; scene.add(strip);
  const pond = mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.04, 40), water, rd.x * RIVER_R0, 0.004, rd.z * RIVER_R0); pond.castShadow = false; scene.add(pond);
  const edge = mat(0xffffff, { roughness: 0.5 });
  for (const s of [-1, 1]) { const e = mesh(new THREE.BoxGeometry(len - 1.0, 0.05, 0.09), edge, rd.x * (RIVER_R0 + len / 2 + 0.5) - rd.z * s * RIVER_W / 2, 0.006, rd.z * (RIVER_R0 + len / 2 + 0.5) + rd.x * s * RIVER_W / 2); e.rotation.y = strip.rotation.y; e.castShadow = false; scene.add(e); }
  const ring = mesh(new THREE.TorusGeometry(1.25, 0.05, 8, 48), edge, rd.x * RIVER_R0, 0.01, rd.z * RIVER_R0); ring.rotation.x = Math.PI / 2; ring.castShadow = false; scene.add(ring);
}
const distToRiver = (x, z) => { const rd = riverDir(), along = x * rd.x + z * rd.z, across = Math.abs(-x * rd.z + z * rd.x); if (along < RIVER_R0) return Math.hypot(x - rd.x * RIVER_R0, z - rd.z * RIVER_R0) - 0.5; return across; };
const clouds = [];
{
  const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.18 });
  const cr = mulberry32(77);
  const spots = [[-30, 9, -34, 5], [26, 14, -42, 6], [-8, 20, -60, 8], [40, 5, -8, 5], [-42, 3, 2, 5.5], [34, -6, 30, 5], [-34, -8, 34, 5.5], [10, 26, -80, 9], [-55, 16, -50, 8], [60, 18, -55, 8], [0, -14, 46, 6], [-24, 30, -95, 9], [48, 30, -100, 10], [-70, 0, -20, 7], [72, -4, 0, 7], [18, -18, 40, 5], [-14, 12, 64, 6]];
  for (let i = 0; i < 34; i++) { const a = i / 34 * 6.283 + cr() * 0.3, rr = 48 + cr() * 60; spots.push([Math.cos(a) * rr, -6 + cr() * 30, Math.sin(a) * rr, 4.5 + cr() * 5]); }
  for (const [x, y, z, s] of spots) {
    const g = new THREE.Group();
    const n = 5 + Math.floor(cr() * 3);
    for (let i = 0; i < n; i++) { const b = new THREE.Mesh(GEO.sphere, cm); const r = s * (0.32 + cr() * 0.25); b.scale.set(r * 1.15, r * 0.78, r); b.position.set((i - (n - 1) / 2) * s * 0.42, (cr() - 0.3) * s * 0.22, (cr() - 0.5) * s * 0.4); g.add(b); }
    g.position.set(x, y, z); g.userData = { base: g.position.clone(), ph: cr() * 6.28 }; scene.add(g); clouds.push(g);
  }
}

// ---------------------------------------------------------------- animated object registry
const pops = [];      // {obj, t0, dur, s}
function addPop(obj, t0, dur = 0.55, s = 1) { obj.visible = false; pops.push({ obj, t0, dur, s }); scene.add(obj); return obj; }
const updaters = [];  // functions (t)
const sparkEvents = []; // {t, x,y,z, n, size, seed}
function sparkle(t, x, y, z, n = 10, size = 1) { sparkEvents.push({ t, x, y, z, n, size, seed: sparkEvents.length * 7919 + 13 }); }

// ---------------------------------------------------------------- track slabs (swept geometry with growing draw range)
function sweep(samples, profileFn) {
  const pos = []; let trisPerStep = 0;
  const ring = s => profileFn(s).map(([u, y]) => [s.x + s.nx * u, y, s.z + s.nz * u]);
  let prev = ring(samples[0]);
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  { const n = prev.length; for (let j = 1; j < n - 1; j++) pos.push(...prev[0], ...prev[j + 1], ...prev[j]); }
  const capTris = prev.length - 2;
  for (let i = 1; i < samples.length; i++) {
    const cur = ring(samples[i]), n = cur.length;
    for (let j = 0; j < n; j++) { const k = (j + 1) % n; quad(prev[j], cur[j], cur[k], prev[k]); }
    trisPerStep = n * 2; prev = cur;
  }
  { const n = prev.length; for (let j = 1; j < n - 1; j++) pos.push(...prev[0], ...prev[j], ...prev[j + 1]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  g.userData = { steps: samples.length - 1, trisPerStep, capTris };
  return g;
}
const slabBottom = h => clamp((h - 0.5) * 4) * (h - SLAB_T);
const railMat = mat(0xffffff, { roughness: 0.25 });
const pillarMat = mat(PAL.cream, { roughness: 0.5 });
const beadGeo = new THREE.SphereGeometry(0.05, 10, 8);
const beads = [];   // {x,y,z,t0 (visible), tLit}
const slabObjs = [];
for (const m of Object.values(marbles)) {
  const lane = m.lane;
  for (const sl of m.slabs) {
    const len = sl.d1 - sl.d0, n = Math.max(3, Math.ceil(len / 0.09)), samples = [];
    for (let i = 0; i <= n; i++) { const d = sl.d0 + len * i / n, L = lane.at(d); samples.push({ ...L, h: L.y + (lane.name === 'B' ? 0.004 : 0) }); }
    const slab = new THREE.Mesh(sweep(samples, s => [[-0.4, slabBottom(s.h)], [-0.4, s.h], [0.4, s.h], [0.4, slabBottom(s.h)]]), mat(LANE_COL[lane.name], { roughness: 0.3 }));
    const railL = new THREE.Mesh(sweep(samples, s => [[-0.41, s.h - 0.02], [-0.41, s.h + 0.075], [-0.33, s.h + 0.075], [-0.33, s.h - 0.02]]), railMat);
    const railR = new THREE.Mesh(sweep(samples, s => [[0.33, s.h - 0.02], [0.33, s.h + 0.075], [0.41, s.h + 0.075], [0.41, s.h - 0.02]]), railMat);
    const dur = clamp(len / 5, 0.25, 0.9);
    for (const o of [slab, railL, railR]) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; scene.add(o); slabObjs.push({ o, t0: sl.t0, dur, g: o.geometry.userData }); }
    // pillars under elevated parts
    for (let d = sl.d0 + 0.3; d < sl.d1 - 0.1; d += 0.85) {
      const L = lane.at(d), h = L.y;
      if (h < 0.78) continue;
      if (Math.abs(bridgeX(L.th)) < 2.4) continue;
      if (lane.name === 'B' && Math.abs(lane.dev(L.th)) > 0.12) continue;
      const p = mesh(rbox(0.3, h - SLAB_T, 0.3, 0.06), pillarMat, L.x, (h - SLAB_T) / 2, L.z); p.rotation.y = Math.atan2(L.tx, L.tz);
      addPop(p, sl.t0 + (d - sl.d0) / len * dur, 0.4);
    }
    // rail beads
    for (let d = sl.d0 + 0.2; d < sl.d1 - 0.05; d += 0.55) {
      const L = lane.at(d);
      for (const s of [-1, 1]) beads.push({ x: L.x + L.nx * 0.37 * s, y: L.y + 0.1, z: L.z + L.nz * 0.37 * s, t0: sl.t0 + (d - sl.d0) / len * dur, lane: lane.name });
    }
    // start platform back-stop for slides
    if (sl.d0 < -0.5) { const L = lane.at(sl.d0 + 0.02); const b = mesh(rbox(0.12, 0.3, 0.82, 0.05), railMat, L.x, L.y + 0.13, L.z); b.rotation.y = Math.atan2(L.tx, L.tz) + Math.PI / 2; addPop(b, sl.t0, 0.4); }
  }
}
const beadMesh = new THREE.InstancedMesh(beadGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), beads.length);
beadMesh.frustumCulled = false; scene.add(beadMesh);
const kPt = laneOf.Y.at(dK);
beads.forEach(b => { b.tLit = T_COLLIDE + 0.05 + Math.min(1.6, Math.hypot(b.x - kPt.x, b.z - kPt.z) * 0.085); });

// ---------------------------------------------------------------- keys, chimes, bells
const keyObjs = [];
const KEY_COL = [0xff7b7b, 0xffb35c, 0xffd94a, 0x67dba8, 0x5cb6ff, 0xa98bf5, 0xff8fc0];
const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xffc94d, roughness: 0.22, metalness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.15 });
const allHits = Object.values(hits).flat().sort((a, b) => a.t - b.t);
for (const h of allHits) {
  const m = marbles[h.marble], L = m.lane.at(h.d), yaw = Math.atan2(L.tx, L.tz);
  const g = new THREE.Group(); g.position.set(L.x, 0, L.z); g.rotation.y = yaw;
  const moving = new THREE.Group(); g.add(moving);
  h.x = L.x; h.z = L.z;
  if (h.kind === 'key') {
    const top = L.y - KEY_DROP, pc = ((h.midi % 12) + 12) % 12, deg = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pc];
    const width = clamp(0.92 - (h.midi - 60) * 0.012, 0.6, 0.92);
    const km = new THREE.MeshStandardMaterial({ color: KEY_COL[deg], roughness: 0.25, emissive: KEY_COL[deg], emissiveIntensity: 0 });
    const bar = mesh(rbox(width, 0.11, 0.36, 0.05), km, 0, top - 0.055, 0); moving.add(bar);
    for (const s of [-1, 1]) g.add(mesh(rbox(0.12, Math.max(0.05, top - 0.11), 0.3, 0.04), pillarMat, s * (width / 2 - 0.12), Math.max(0.05, top - 0.11) / 2, 0));
    h.km = km;
  } else if (h.kind === 'chime') {
    const dome = mesh(GEO.dome, goldMat, 0, CHIME_TOP - 0.2, 0); dome.scale.set(0.24, 0.2, 0.24); moving.add(dome);
    g.add(mesh(GEO.cyl, pillarMat, 0, (CHIME_TOP - 0.2) / 2, 0).translateY(0)).children.at(-1).scale.set(0.07, CHIME_TOP - 0.2, 0.07);
    const base = mesh(GEO.cyl, mat(PAL.pink), 0, 0.03, 0); base.scale.set(0.26, 0.06, 0.26); g.add(base);
  } else {
    const ped = mesh(GEO.cyl, mat(PAL.cream, { roughness: 0.4 }), 0, 0.3, 0); ped.scale.set(1.0, 0.6, 1.0); g.add(ped);
    const ped2 = mesh(GEO.cyl, mat(PAL.coral), 0, 0.66, 0); ped2.scale.set(0.82, 0.12, 0.82); g.add(ped2);
    const dome = mesh(GEO.dome, goldMat, 0, BIG_TOP - 0.83, 0); dome.scale.set(0.95, 0.83, 0.95); moving.add(dome);
    const knob = mesh(GEO.sphere, goldMat, 0, BIG_TOP - 0.02, 0); knob.scale.setScalar(0.1); moving.add(knob);
    h.cy = BIG_TOP + 0.08 + RM;
  }
  addPop(g, h.reveal, 0.5);
  keyObjs.push({ h, moving });
}
// recompute red's last arcs because the big bell contact height changed (knob)
{
  const m = marbles.R, hs = m.hits, n = hs.length, big = hs[n - 1], prev = hs[n - 2];
  m.air = m.air.filter(a => a.t1 <= prev.t + 1e-6);
  m.air.push({ t0: prev.t, t1: big.t, f: parab(prev.t, prev.cy, big.t, big.cy) });
  const t1 = big.t + 0.62; m.air.push({ t0: big.t, t1, f: parab(big.t, big.cy, t1, m.lane.height(m.sched(t1)) + RM) });
}

// end cups
for (const m of Object.values(marbles)) {
  const L = m.lane.at(m.dEnd + 0.36), last = m.hits[m.hits.length - 1];
  const cup = mesh(new THREE.TorusGeometry(0.34, 0.09, 10, 24, Math.PI), mat(MARBLE_COL[m.name], { roughness: 0.3 }), L.x, L.y + 0.08, L.z);
  cup.rotation.set(Math.PI / 2, 0, 0); cup.rotation.z = -Math.atan2(L.tx, L.tz) + Math.PI; cup.rotation.order = 'YXZ';
  cup.rotation.set(-Math.PI / 2, Math.atan2(L.tx, L.tz) + Math.PI, 0);
  addPop(cup, m.name === 'R' ? 40.0 : m.hits[m.hits.length - 1].t, 0.45);
}
// gates for R, G, P
const gates = [];
for (const name of ['R', 'G', 'P']) {
  const m = marbles[name], L = m.lane.at(m.dStop + RM + 0.07), yaw = Math.atan2(L.tx, L.tz);
  const g = new THREE.Group(); g.position.set(L.x, L.y, L.z); g.rotation.y = yaw;
  const post = mesh(rbox(0.09, 0.62, 0.09, 0.03), pillarMat, -0.44, 0.31 - 0.1, 0); g.add(post);
  const lampM = new THREE.MeshStandardMaterial({ color: 0xff9db0, emissive: 0xff7d96, emissiveIntensity: 0.7, roughness: 0.3 });
  const lamp = mesh(GEO.sphere, lampM, -0.44, 0.58, 0); lamp.scale.setScalar(0.09); g.add(lamp);
  const arm = new THREE.Group(); arm.position.set(-0.44, 0.34, 0); g.add(arm);
  const bar = mesh(rbox(0.86, 0.09, 0.09, 0.04), mat(MARBLE_COL[name], { roughness: 0.3 }), 0.44, 0, 0); arm.add(bar);
  const prevHit = m.hits.filter(h => h.t < 17).pop();
  addPop(g, prevHit.t + 0.35, 0.45);
  gates.push({ arm, lampM, openT: m.openT - 0.1 });
}
// arch bell that the blue marble rings on its way down (t = 23.75)
let archBell;
{
  const m = marbles.B, d = m.sched(T_ARCHBELL), L = m.lane.at(d), base = laneOf.B.pos.call({ o: laneOf.B.o, dev: () => 0 }, L.th);
  const px = base.x - L.nx * (LANE_W + 0.475), pz = base.z - L.nz * (LANE_W + 0.475), topY = L.y + 2 * RM + 0.5;
  const g = new THREE.Group();
  const post = mesh(rbox(0.07, topY, 0.07, 0.03), railMat, px, topY / 2, pz); g.add(post);
  const dx = L.x - px, dz = L.z - pz, len = Math.hypot(dx, dz) + 0.1;
  const arm = mesh(rbox(len, 0.07, 0.07, 0.03), railMat, px + dx / 2, topY, pz + dz / 2); arm.rotation.y = -Math.atan2(dz, dx); g.add(arm);
  const swing = new THREE.Group(); swing.position.set(L.x, topY, L.z); swing.rotation.y = Math.atan2(L.tx, L.tz); g.add(swing);
  const bell = mesh(GEO.dome, goldMat, 0, -0.42, 0); bell.scale.set(0.15, 0.22, 0.15); swing.add(bell);
  const str = mesh(GEO.cyl, railMat, 0, -0.1, 0); str.scale.set(0.012, 0.2, 0.012); swing.add(str);
  archBell = { swing };
  const prevHit = hits.B.filter(h => h.t < 17).pop();
  addPop(g, prevHit.t + 0.5, 0.5);
  sparkle(T_ARCHBELL, L.x, topY - 0.3, L.z, 8, 0.8);
}

// ---------------------------------------------------------------- bridge
{
  const o0 = -2.55, o1 = 0.62, lanesOver = ['R', 'Y', 'B'];
  const archUnder = x => Math.abs(x) < 1.0 ? 0.52 * (1 - x * x) : 0;
  const piece = (x0, x1, t0, colour) => {
    const samples = [], n = Math.ceil(Math.abs(x1 - x0) / 0.08);
    for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), th = TH_RIVER + x / RC_RIVER, c = centerAt(th), f = frameAt(th); samples.push({ x: c.x, z: c.z, nx: f.nx, nz: f.nz, top: H0 + hump(th) - SLAB_T - 0.012, bot: archUnder(x) }); }
    const o = new THREE.Mesh(sweep(samples, s => [[o0, s.bot], [o0, Math.max(s.top, s.bot + 0.02)], [o1, Math.max(s.top, s.bot + 0.02)], [o1, s.bot]]), mat(colour, { roughness: 0.4 }));
    o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; scene.add(o);
    slabObjs.push({ o, t0, dur: 0.3, g: o.geometry.userData });
    const th = TH_RIVER + (x0 + x1) / 2 / RC_RIVER, c = centerAt(th), f = frameAt(th);
    sparkle(t0, c.x + f.nx * -1, 1.3, c.z + f.nz * -1, 14, 1.2);
  };
  piece(-2.3, -0.8, 16.5, PAL.lav); piece(2.3, 0.8, 16.5, PAL.lav);
  piece(-0.8, 0.0, 30.0, PAL.pink); piece(0.8, 0.0, 30.25, PAL.pink);
}

// ---------------------------------------------------------------- structures
const winMat = new THREE.MeshStandardMaterial({ color: 0xfff7e0, emissive: 0xffd66b, emissiveIntensity: 0, roughness: 0.3 });
const lampMats = Array.from({ length: 7 }, () => new THREE.MeshStandardMaterial({ color: 0xfffbe8, emissive: 0xffe08a, emissiveIntensity: 0, roughness: 0.3 }));
const lamps = [], homes = [];
function house(variant) {
  const g = new THREE.Group(), body = pick(PASTELS), roofC = pick([PAL.coral, PAL.lav, PAL.sky, PAL.mint, PAL.pink, PAL.peach].filter(c => c !== body));
  const doorM = mat(0xfffaf0, { roughness: 0.4 });
  if (variant === 0) {
    g.add(mesh(rbox(0.95, 0.72, 0.85, 0.12), mat(body), 0, 0.36, 0));
    const roof = mesh(GEO.cone4, mat(roofC), 0, 0.72 + 0.26, 0); roof.scale.set(0.82, 0.56, 0.74); roof.rotation.y = Math.PI / 4; g.add(roof);
    g.add(mesh(rbox(0.2, 0.34, 0.06, 0.03), doorM, 0, 0.17, 0.43));
    for (const s of [-1, 1]) g.add(mesh(rbox(0.17, 0.17, 0.05, 0.03), winMat, s * 0.29, 0.44, 0.43));
    g.add(mesh(rbox(0.13, 0.3, 0.13, 0.03), mat(PAL.cream), 0.25, 1.0, -0.1));
  } else if (variant === 1) {
    g.add(mesh(rbox(0.8, 1.15, 0.78, 0.12), mat(body), 0, 0.575, 0));
    const roof = mesh(GEO.cone4, mat(roofC), 0, 1.15 + 0.22, 0); roof.scale.set(0.72, 0.48, 0.7); roof.rotation.y = Math.PI / 4; g.add(roof);
    g.add(mesh(rbox(0.2, 0.32, 0.06, 0.03), doorM, 0, 0.16, 0.395));
    for (const y of [0.5, 0.86]) for (const s of [-1, 1]) g.add(mesh(rbox(0.15, 0.16, 0.05, 0.03), winMat, s * 0.2, y, 0.395));
  } else {
    const b = mesh(GEO.cyl, mat(body), 0, 0.5, 0); b.scale.set(0.42, 1.0, 0.42); g.add(b);
    const roof = mesh(GEO.cone16, mat(roofC), 0, 1.0 + 0.3, 0); roof.scale.set(0.52, 0.62, 0.52); g.add(roof);
    g.add(mesh(rbox(0.18, 0.3, 0.06, 0.03), doorM, 0, 0.15, 0.41));
    g.add(mesh(rbox(0.16, 0.16, 0.05, 0.03), winMat, 0, 0.66, 0.41));
    const ball = mesh(GEO.sphere, mat(PAL.butter), 0, 1.63, 0); ball.scale.setScalar(0.06); g.add(ball);
  }
  return g;
}
function tree(variant) {
  const g = new THREE.Group(), trunk = mesh(GEO.cyl, mat(0xe9c9a4, { roughness: 0.6 }), 0, 0.2, 0); trunk.scale.set(0.07, 0.4, 0.07); g.add(trunk);
  if (variant === 0) { const c = pick([0x9fe3b6, 0x8fdcab, 0xb5ecc2]); for (const [x, y, z, r] of [[0, 0.62, 0, 0.34], [0.17, 0.5, 0.05, 0.22], [-0.16, 0.52, -0.04, 0.23]]) { const s = mesh(GEO.sphere, mat(c, { roughness: 0.55 }), x, y, z); s.scale.setScalar(r); g.add(s); } }
  else if (variant === 1) { const c = pick([0x8fdcc0, 0x9be4cb]); [[0.5, 0.36, 0.5], [0.78, 0.29, 0.42], [1.02, 0.2, 0.34]].forEach(([y, r, hh]) => { const s = mesh(GEO.cone16, mat(c, { roughness: 0.5 }), 0, y, 0); s.scale.set(r, hh, r); g.add(s); }); }
  else { const s = mesh(GEO.sphere, mat(pick([0xffbfd6, 0xffd0e0, 0xffc6b0]), { roughness: 0.55 }), 0, 0.64, 0); s.scale.set(0.36, 0.33, 0.36); g.add(s); }
  return g;
}
function lampPost() {
  const g = new THREE.Group(), pole = mesh(GEO.cyl, railMat, 0, 0.4, 0); pole.scale.set(0.03, 0.8, 0.03); g.add(pole);
  const base = mesh(GEO.cyl, mat(PAL.lav), 0, 0.04, 0); base.scale.set(0.08, 0.08, 0.08); g.add(base);
  const bulb = mesh(GEO.sphere, lampMats[0], 0, 0.86, 0); bulb.scale.setScalar(0.11); bulb.castShadow = false; g.add(bulb);
  g.userData.bulb = bulb; return g;
}
function bush() { const g = new THREE.Group(); const c = pick([0xa5e8bf, 0xffc4d8, 0xffe39a, 0xcdbcf7]); for (const [x, z, r] of [[0, 0, 0.2], [0.17, 0.05, 0.14], [-0.14, 0.08, 0.13]]) { const s = mesh(GEO.sphere, mat(c, { roughness: 0.55 }), x, r * 0.8, z); s.scale.setScalar(r); g.add(s); } return g; }
function tower() {
  const g = new THREE.Group(); const b = mesh(GEO.cyl, mat(PAL.cream), 0, 0.85, 0); b.scale.set(0.4, 1.7, 0.4); g.add(b);
  const band = mesh(GEO.cyl, mat(PAL.sky), 0, 1.25, 0); band.scale.set(0.43, 0.14, 0.43); g.add(band);
  const roof = mesh(GEO.cone16, mat(PAL.coral), 0, 1.7 + 0.35, 0); roof.scale.set(0.52, 0.7, 0.52); g.add(roof);
  for (const y of [0.55, 1.0]) g.add(mesh(rbox(0.16, 0.2, 0.05, 0.03), winMat, 0, y, 0.39));
  g.add(mesh(rbox(0.2, 0.3, 0.06, 0.03), mat(0xfffaf0), 0, 0.15, 0.39));
  const ball = mesh(GEO.sphere, goldMat, 0, 2.43, 0); ball.scale.setScalar(0.07); g.add(ball);
  return g;
}

// candidate plots: rows that follow the band, kept clear of all tracks
const laneSamples = [];
for (const m of Object.values(marbles)) for (const sl of m.slabs) for (let d = sl.d0; d <= sl.d1; d += 0.25) { const L = m.lane.at(d); laneSamples.push([L.x, L.z]); }
for (const h of allHits) laneSamples.push([h.x, h.z]);
const laneDist = (x, z) => { let b = 1e9; for (const [a, c] of laneSamples) { const q = (a - x) * (a - x) + (c - z) * (c - z); if (q < b) b = q; } return Math.sqrt(b); };
const bigPos = { x: bigHit.x, z: bigHit.z };
const chime0 = hits.R.find(h => h.kind === 'chime');
const apron = (x, z) => z > Math.min(bigPos.z, chime0.z) + 0.9 && x > bigPos.x - 3.5 && x < chime0.x + 3.5;
const plotOK = (x, z, clr) => !apron(x, z) && Math.hypot(x, z) < R_ISL - 1.0 && Math.hypot(x, z) > 3.7 && distToRiver(x, z) > RIVER_W / 2 + clr && laneDist(x, z) > 0.4 + clr && Math.hypot(x - bigPos.x, z - bigPos.z) > 1.7;
const plots = [], lampPlots = [];
const ROW_OFFS = [-1.63, -0.21, 1.21]; for (let j = 0; j < 7; j++) ROW_OFFS.push(3.08 + 1.42 * j, -(3.08 + 1.42 * j));
for (const off of ROW_OFFS) {
  let lastD = -1e9, acc = 0, prev = null;
  for (let th = -0.45; th < 6.5; th += 0.004) {
    const c = centerAt(th), f = frameAt(th), x = c.x + f.nx * off, z = c.z + f.nz * off;
    if (prev) acc += Math.hypot(x - prev.x, z - prev.z); prev = { x, z };
    if (acc - lastD < 1.34) continue;
    if (!plotOK(x, z, 0.66)) continue;
    plots.push({ x, z, th, off, used: false }); lastD = acc;
  }
}
for (const m of Object.values(marbles)) for (const sl of m.slabs) for (let d = sl.d0 + 0.4; d < sl.d1 - 0.2; d += 0.8) for (const s of [-1, 1]) {
  const L = m.lane.at(d); if (L.y > 0.7) continue; const x = L.x + L.nx * 0.66 * s, z = L.z + L.nz * 0.66 * s;
  if (laneDist(x, z) > 0.6 && distToRiver(x, z) > RIVER_W / 2 + 0.3 && Math.hypot(x - bigPos.x, z - bigPos.z) > 1.4) lampPlots.push({ x, z, th: L.th, used: false });
}
const occupied = [];
function takePlot(list, px, pz, clr, sidePref, maxD = 1e9) {
  let best = null, bs = maxD;
  for (const p of list) {
    if (p.used) continue;
    let s = Math.hypot(p.x - px, p.z - pz);
    if (sidePref && Math.sign(p.off) !== sidePref) s += 2.2;
    if (s >= bs) continue;
    let ok = true; for (const o of occupied) if (Math.hypot(o.x - p.x, o.z - p.z) < o.r + clr) { ok = false; break; }
    if (ok) { best = p; bs = s; }
  }
  if (best) { best.used = true; occupied.push({ x: best.x, z: best.z, r: clr }); }
  return best;
}
const nearestLanePoint = (x, z) => { let b = 1e9, r = null; for (const s of laneSamples) { const q = (s[0] - x) ** 2 + (s[1] - z) ** 2; if (q < b) { b = q; r = s; } } return r; };
let structCount = 0;
function placeStructure(kind, t, px, pz, side) {
  let obj, p, topY = 1.2;
  if (kind === 'lamp') {
    p = takePlot(lampPlots, px, pz, 0.3, 0, 3.6); if (!p) return placeStructure('tree', t, px, pz, side);
    obj = lampPost(); lamps.push({ obj, th: p.th, x: p.x, z: p.z }); topY = 0.9;
  } else if (kind === 'bush') {
    p = takePlot(plots, px, pz, 0.5, side); if (!p) return;
    obj = bush(); topY = 0.4;
  } else {
    const clr = kind === 'tree' ? 0.56 : 0.68; p = takePlot(plots, px, pz, clr, side, 4.2) || takePlot(plots, px, pz, clr, 0); if (!p) return;
    obj = kind === 'house' ? house(Math.floor(rnd() * 3)) : kind === 'tower' ? tower() : tree(Math.floor(rnd() * 3));
    if (kind === 'tower') topY = 2.3; if (kind === 'house') topY = 1.4;
    if (kind !== 'tree') homes.push({ x: p.x, z: p.z });
    const q = nearestLanePoint(p.x, p.z); obj.rotation.y = Math.atan2(q[0] - p.x, q[1] - p.z);
    if (kind === 'tree') obj.scale.setScalar(0.9 + rnd() * 0.35);
  }
  obj.position.set(p.x, 0, p.z);
  addPop(obj, t, kind === 'lamp' ? 0.4 : 0.6, obj.scale.x);
  sparkle(t, p.x, topY * 0.75, p.z, kind === 'house' || kind === 'tower' ? 12 : 7, kind === 'house' || kind === 'tower' ? 1.0 : 0.7);
  structCount++;
  return p;
}
const noteList = NOTES.map(n => n.t);
let cityPts = [];
noteList.forEach((t, i) => {
  const hs = allHits.filter(h => Math.abs(h.t - t) < 1e-6);
  let px, pz, side = 0, th = 0;
  if (hs.length) { const h = hs[0]; px = h.x; pz = h.z; side = { R: -1, Y: -1, B: (i % 2 ? 1 : -1), G: 1, P: 1 }[h.marble]; sparkle(t, px, h.cy - RM + 0.1, pz, h.kind === 'big' ? 40 : 9, h.kind === 'big' ? 2.2 : 0.9); }
  else if (Math.abs(t - T_COLLIDE) < 1e-6) { px = kPt.x; pz = kPt.z; side = -1; sparkle(t, kPt.x - kPt.tx * RM, kPt.y + RM, kPt.z - kPt.tz * RM, 22, 1.5); }
  else { const s = marbleState(marbles.B, t); px = s.x; pz = s.z; side = 1; }
  cityPts.push([px, pz]);
  let kind;
  if (t < 3) kind = ['house', 'tree', 'house', 'tree', 'house'][i];
  else if (t < 9) kind = i % 4 === 3 ? 'tree' : 'house';
  else if (t < 17) kind = ['tree', 'lamp', 'house'][i % 3];
  else if (t === T_ARCHBELL) kind = 'lamp';
  else if (t === T_COLLIDE) kind = 'tower';
  else if (t < 30) kind = ['house', 'lamp', 'tree', 'house'][i % 4];
  else if (t < 40) kind = ['house', 'tree', 'house', 'lamp'][i % 4];
  else if (t < 44) kind = 'tree';
  else kind = null;
  if (kind) placeStructure(kind, t, px, pz, side);
  // infill: the wider city keeps growing with every note of the second half
  if (t > 24.1 && t < 44) {
    const k = t < 40 ? (i % 2 === 0 ? 1 : 0) : 1;
    for (let j = 0; j < k; j++) { let c = cityPts[Math.floor(rnd() * cityPts.length)], ang = rnd() * 6.28, rr = 1.5 + rnd() * 4.5; if (t >= 30 && rnd() < 0.7) { c = [0, 0]; rr = 3.8 + Math.sqrt(rnd()) * (R_ISL - 5.2); } placeStructure(pick(['house', 'house', 'tree', 'house', 'tree', 'bush']), t + 0.04 * (j + 1), c[0] + Math.cos(ang) * rr, c[1] + Math.sin(ang) * rr, 0); }
  }
});
// ---- the name, spelled out by little houses on the front plaza
const NAME_COL = [0xff7f7f, 0xffc247, 0x5fb0ff, 0x55cf9c, 0xa987f0, 0xff86b6], NAME_LIGHT = [0xffcfcf, 0xffe9b5, 0xc6e2ff, 0xc2f0dc, 0xdfd2fb, 0xffd3e4];
const nameHomes = [];
{
  const order = LETTERS.map((_, i) => i); const r2 = mulberry32(555);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const nt = noteList.filter(t => t > 24.1 && t < 43.5); let q = 0;
  const padGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.04, 20);
  nt.forEach((t, ni) => {
    const per = Math.ceil((order.length - q) / (nt.length - ni));
    for (let j = 0; j < per && q < order.length; j++, q++) {
      const L = LETTERS[order[q]], col = NAME_COL[L.ci], g = new THREE.Group(), t0 = t + 0.05 * j;
      g.add(mesh(rbox(0.8, 0.6, 0.74, 0.1), mat(0xfffaf0), 0, 0.3, 0));
      const roof = mesh(GEO.cone4, mat(col, { roughness: 0.3 }), 0, 0.6 + 0.25, 0); roof.scale.set(0.72, 0.54, 0.68); roof.rotation.y = Math.PI / 4; g.add(roof);
      g.add(mesh(rbox(0.17, 0.28, 0.05, 0.03), mat(col), 0, 0.14, 0.375));
      for (const sx of [-1, 1]) g.add(mesh(rbox(0.14, 0.14, 0.05, 0.03), winMat, sx * 0.25, 0.38, 0.375));
      g.position.set(L.x, 0, L.z); addPop(g, t0, 0.55, 0.8);
      for (const [px, pz] of L.pads) { const pad = new THREE.Mesh(padGeo, mat(NAME_LIGHT[L.ci], { roughness: 0.6 })); pad.position.set(px, 0.022, pz); pad.receiveShadow = true; addPop(pad, t0, 0.4); }
      sparkle(t0, L.x, 0.8, L.z, 5, 0.8);
      nameHomes.push({ x: L.x, z: L.z });
    }
  });
}
lamps.sort((a, b) => Math.hypot(b.x, b.z) - Math.hypot(a.x, a.z));
lamps.forEach((l, i) => { l.group = Math.floor(i * 7 / lamps.length); l.obj.userData.bulb.material = lampMats[l.group]; });

// ---------------------------------------------------------------- ferris wheel
const wheel = { rot: new THREE.Group(), gondolas: [], lights: null };
{
  const C = new THREE.Vector3(0, 4.5, 0), RW = 3.35, ZF = 0.38;
  wheel.rot.position.copy(C); scene.add(wheel.rot);
  const s6 = noteList.filter(t => t >= 30 && t < 40);
  let pi = 0; const nextT = step => { const t = s6[Math.min(s6.length - 1, Math.round(pi))]; pi += step; return t; };
  const partPop = (obj, t, parent) => { obj.visible = false; pops.push({ obj, t0: t, dur: 0.5, s: 1 }); (parent || scene).add(obj); };
  const strut = (a, b, r, material) => { const m = mesh(GEO.cyl, material, 0, 0, 0); const d = new THREE.Vector3().subVectors(b, a); m.scale.set(r, d.length(), r); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); return m; };
  const frameM = mat(0xffffff, { roughness: 0.3 });
  for (const zf of [0.62, -0.62]) {
    const g = new THREE.Group();
    g.add(strut(new THREE.Vector3(-2.0, 0, zf), new THREE.Vector3(0, C.y, zf * 0.75), 0.09, mat(PAL.lav, { roughness: 0.3 })));
    g.add(strut(new THREE.Vector3(2.0, 0, zf), new THREE.Vector3(0, C.y, zf * 0.75), 0.09, mat(PAL.lav, { roughness: 0.3 })));
    for (const x of [-2.0, 2.0]) { const b = mesh(GEO.cyl, mat(PAL.coral), x, 0.06, zf); b.scale.set(0.24, 0.12, 0.24); g.add(b); }
    const t = nextT(2); partPop(g, t); sparkle(t, 0, 2.2, zf, 14, 1.3);
  }
  { const hub = new THREE.Group(); const h = mesh(GEO.cyl, mat(PAL.butter, { roughness: 0.3 }), 0, 0, 0); h.scale.set(0.3, 1.25, 0.3); h.rotation.x = Math.PI / 2; hub.add(h); const cap = mesh(GEO.sphere, mat(PAL.coral), 0, 0, 0.66); cap.scale.setScalar(0.2); hub.add(cap); const t = nextT(2); partPop(hub, t, wheel.rot); sparkle(t, C.x, C.y, 0.7, 14, 1.3); }
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2, g = new THREE.Group();
    for (const z of [ZF, -ZF]) g.add(strut(new THREE.Vector3(0, 0, z), new THREE.Vector3(Math.cos(a) * RW, Math.sin(a) * RW, z), 0.035, frameM));
    const t = nextT(1); partPop(g, t, wheel.rot); sparkle(t, Math.cos(a) * RW * 0.6, C.y + Math.sin(a) * RW * 0.6, 0.5, 6, 0.8);
  }
  for (let i = 0; i < 8; i++) {
    const a0 = i / 8 * Math.PI * 2, g = new THREE.Group(), col = PASTELS[i % 5];
    for (const z of [ZF, -ZF]) { const tor = mesh(new THREE.TorusGeometry(RW, 0.075, 8, 10, Math.PI * 2 / 8), mat(col, { roughness: 0.3 }), 0, 0, z); tor.rotation.z = a0; g.add(tor); }
    const a = a0 + Math.PI / 8, t = nextT(1); partPop(g, t, wheel.rot); sparkle(t, Math.cos(a) * RW, C.y + Math.sin(a) * RW, 0.5, 7, 0.9);
  }
  const lightM = new THREE.MeshStandardMaterial({ color: 0xfffbe8, emissive: 0xffe08a, emissiveIntensity: 0, roughness: 0.3 });
  wheel.lightM = lightM;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2, piv = new THREE.Group(); piv.position.set(Math.cos(a) * RW, Math.sin(a) * RW, 0);
    const col = PASTELS[(i + 2) % 5], cab = new THREE.Group();
    cab.add(strut(new THREE.Vector3(0, 0, -ZF), new THREE.Vector3(0, 0, ZF), 0.03, frameM));
    cab.scale.setScalar(1.25); cab.add(mesh(rbox(0.5, 0.36, 0.42, 0.1), mat(col, { roughness: 0.3 }), 0, -0.42, 0));
    const roof = mesh(rbox(0.56, 0.08, 0.48, 0.03), mat(0xffffff), 0, -0.14, 0); cab.add(roof);
    for (const x of [-0.2, 0.2]) cab.add(strut(new THREE.Vector3(x, -0.02, 0), new THREE.Vector3(x, -0.26, 0), 0.015, frameM));
    cab.add(mesh(rbox(0.3, 0.12, 0.44, 0.03), winMat, 0, -0.36, 0));
    const bulb = mesh(GEO.sphere, lightM, 0, 0.0, ZF + 0.08); bulb.scale.setScalar(0.09); bulb.castShadow = false; piv.add(bulb);
    piv.add(cab); wheel.gondolas.push(cab);
    const t = nextT(i < 7 ? 2.3 : 0); partPop(piv, t, wheel.rot); sparkle(t, Math.cos(a) * RW, C.y + Math.sin(a) * RW - 0.3, 0.5, 9, 1.0);
  }
  wheel.C = C; wheel.RW = RW;
}

// ---------------------------------------------------------------- marbles
function marbleTexture(hex) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#' + hex.toString(16).padStart(6, '0'); x.fillRect(0, 0, 256, 128);
  x.globalAlpha = 0.5; x.fillStyle = '#ffffff';
  x.beginPath(); for (let i = 0; i <= 256; i += 4) x.lineTo(i, 64 + Math.sin(i / 256 * Math.PI * 2) * 22 - 9); for (let i = 256; i >= 0; i -= 4) x.lineTo(i, 64 + Math.sin(i / 256 * Math.PI * 2) * 22 + 9); x.fill();
  x.globalAlpha = 0.65; for (const [u, v, r] of [[40, 28, 9], [170, 100, 8], [215, 30, 6], [100, 105, 6]]) { x.beginPath(); x.arc(u, v, r, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
for (const m of Object.values(marbles)) {
  m.mesh = mesh(new THREE.SphereGeometry(RM, 40, 28), new THREE.MeshPhysicalMaterial({ map: marbleTexture(MARBLE_COL[m.name]), roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6 }));
  scene.add(m.mesh);
}

// ---------------------------------------------------------------- sparkles (point sprites)
const SPK_MAX = 2600;
const spkGeo = new THREE.BufferGeometry();
const spkPos = new Float32Array(SPK_MAX * 3), spkSize = new Float32Array(SPK_MAX), spkCol = new Float32Array(SPK_MAX * 4);
spkGeo.setAttribute('position', new THREE.BufferAttribute(spkPos, 3)); spkGeo.setAttribute('size', new THREE.BufferAttribute(spkSize, 1)); spkGeo.setAttribute('col', new THREE.BufferAttribute(spkCol, 4));
const starTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,0.75)'); g.addColorStop(0.5, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); x.fillStyle = '#fff'; x.beginPath(); const R1 = 62, R2 = 9; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? R2 : R1; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.fill(); return new THREE.CanvasTexture(c); })();
const spk = new THREE.Points(spkGeo, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: { map: { value: starTex }, scale: { value: H / 2 } },
  vertexShader: 'attribute float size; attribute vec4 col; varying vec4 vC; uniform float scale; void main(){ vC=col; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size*scale*projectionMatrix[1][1]/-mv.z; gl_Position=projectionMatrix*mv; }',
  fragmentShader: 'uniform sampler2D map; varying vec4 vC; void main(){ vec4 t=texture2D(map,gl_PointCoord); gl_FragColor=vec4(vC.rgb, vC.a*t.a);\n#include <colorspace_fragment>\n }'
}));
spk.frustumCulled = false; scene.add(spk);
const SPK_COLS = [[1, 1, 1], [1, 0.93, 0.55], [1, 0.72, 0.82], [0.75, 0.9, 1], [1, 0.85, 0.4]];
// lamp glow sprites share the sparkle buffer
function updateSparkles(t) {
  let n = 0;
  const put = (x, y, z, s, c, a) => { if (n >= SPK_MAX) return; spkPos[n * 3] = x; spkPos[n * 3 + 1] = y; spkPos[n * 3 + 2] = z; spkSize[n] = s; spkCol[n * 4] = c[0]; spkCol[n * 4 + 1] = c[1]; spkCol[n * 4 + 2] = c[2]; spkCol[n * 4 + 3] = a; n++; };
  for (const e of sparkEvents) {
    const tau = t - e.t; if (tau < 0 || tau > 0.85) continue;
    const r = mulberry32(e.seed), k = tau / 0.85;
    for (let i = 0; i < e.n; i++) {
      const a = r() * 6.283, el = (r() - 0.25) * 2.2, sp0 = (0.7 + r() * 1.5) * e.size, life = 0.5 + r() * 0.35, c = SPK_COLS[Math.floor(r() * SPK_COLS.length)], sz = (0.1 + r() * 0.16) * e.size;
      if (tau > life) continue; const q = tau / life, dist = sp0 * (1 - Math.exp(-4 * tau)) * 0.75;
      put(e.x + Math.cos(a) * Math.cos(el) * dist, e.y + Math.sin(el) * dist + 0.5 * tau - 0.9 * tau * tau, e.z + Math.sin(a) * Math.cos(el) * dist, sz * (0.45 + 1.1 * Math.sin(Math.min(1, q * 2.2) * Math.PI / 2)) * (1 - q * 0.5), c, 1 - q * q);
    }
  }
  // warm glows once the lights come on
  lamps.forEach(l => { const on = clamp((t - (40 + l.group * 0.5)) / 0.25); if (on > 0) put(l.x, 0.88, l.z, 0.55 * on * (1 + 0.08 * Math.sin(t * 7 + l.x)), [1, 0.9, 0.5], 0.5 * on); });
  const fin = clamp((t - 44) / 0.3);
  if (fin > 0) {
    nameHomes.forEach((hm, i) => put(hm.x, 0.5, hm.z + 0.3, 1.5 * fin * (1 + 0.08 * Math.sin(t * 6 + i)), [1, 0.9, 0.55], 0.5 * fin));
    homes.forEach((hm, i) => put(hm.x, 0.55, hm.z, 1.05 * fin * (1 + 0.06 * Math.sin(t * 5 + i)), [1, 0.86, 0.5], 0.42 * fin));
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283 + wheel.rot.rotation.z; put(Math.cos(a) * wheel.RW, wheel.C.y + Math.sin(a) * wheel.RW, 0.5, 0.5 * fin, [1, 0.95, 0.7], 0.8 * fin); }
    for (let i = 0; i < 8; i++) { const v = new THREE.Vector3(); wheel.gondolas[i].parent.getWorldPosition(v); put(v.x, v.y, v.z + 0.45, 0.8 * fin, [1, 0.9, 0.55], 0.55 * fin); }
    const r = mulberry32(4242);
    for (let i = 0; i < 260; i++) { const onName = i >= 130, a = r() * 6.283, rr = Math.sqrt(r()) * (R_ISL - 1), ph = r() * 6.28, tw = 0.5 + 0.5 * Math.sin((t - 44) * (7 + r() * 6) + ph), nx = (r() - 0.5) * 34, nz = 20.5 + r() * 23; put(onName ? nx : Math.cos(a) * rr, 0.6 + r() * 4.5 + (t - 44) * 0.5, onName ? nz : Math.sin(a) * rr, (0.3 + r() * 0.4) * fin * (0.4 + tw), SPK_COLS[Math.floor(r() * 5)], fin * (0.35 + 0.65 * tw)); }
  }
  spkGeo.setDrawRange(0, n); spkGeo.attributes.position.needsUpdate = true; spkGeo.attributes.size.needsUpdate = true; spkGeo.attributes.col.needsUpdate = true;
}

// ---------------------------------------------------------------- camera
const cam = buildCamera({ marbles, laneOf, marbleState, hits, kPt, bigHit, dK, dBc, TH_RIVER, RC_RIVER, centerAt, frameAt, R_ISL, THREE });

// ---------------------------------------------------------------- per-frame update
const dummy = new THREE.Object3D(), beadOff = new THREE.Color(0xe6dccb), beadOn = new THREE.Color(0xfff2a0), tmpC = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);
function renderAt(t) {
  // pops
  for (const p of pops) {
    const tau = t - p.t0; if (tau < 0) { p.obj.visible = false; continue; }
    p.obj.visible = true; const s = popScale(tau, p.dur), sy = popScale(tau * 1.15, p.dur);
    p.obj.scale.set(p.s * s, p.s * Math.max(0.001, sy), p.s * s);
  }
  // growing tracks
  for (const s of slabObjs) {
    const k = clamp((t - s.t0) / s.dur); const steps = Math.floor(s.g.steps * smooth(k));
    s.o.visible = t >= s.t0 && steps > 0;
    s.o.geometry.setDrawRange(0, k >= 1 ? Infinity : (s.g.capTris + steps * s.g.trisPerStep) * 3);
  }
  // rail beads
  beads.forEach((b, i) => {
    const vis = t >= b.t0 ? popScale(t - b.t0, 0.3) : 0; dummy.position.set(b.x, b.y, b.z); dummy.scale.setScalar(Math.max(0.0001, vis)); dummy.updateMatrix(); beadMesh.setMatrixAt(i, dummy.matrix);
    const lit = clamp((t - Math.max(b.tLit, b.t0)) / 0.2); const tw = 0.85 + 0.15 * Math.sin(t * 6 + i);
    tmpC.copy(beadOff).lerp(beadOn, lit).multiplyScalar(lit > 0 ? 1 + 0.5 * lit * tw : 1); beadMesh.setColorAt(i, tmpC);
  });
  beadMesh.instanceMatrix.needsUpdate = true; beadMesh.instanceColor.needsUpdate = true;
  // keys
  for (const k of keyObjs) {
    const tau = t - k.h.t; let dy = 0, glow = 0;
    if (tau >= 0 && tau < 0.6) { dy = -0.06 * Math.exp(-9 * tau) * Math.cos(30 * tau); glow = Math.exp(-6 * tau); }
    k.moving.position.y = dy; if (k.h.km) k.h.km.emissiveIntensity = 0.55 * glow;
    if (k.h.kind === 'big') { const s = tau >= 0 ? 1 + 0.06 * Math.exp(-4 * tau) * Math.sin(40 * tau) : 1; k.moving.scale.set(s, 1 / s, s); }
  }
  // gates
  for (const g of gates) { const k = smooth((t - g.openT) / 0.35); g.arm.rotation.z = k * 1.45; g.lampM.color.set(k > 0.5 ? 0x9df2c4 : 0xff9db0); g.lampM.emissive.set(k > 0.5 ? 0x5fe0a0 : 0xff7d96); }
  { const tau = t - T_ARCHBELL; archBell.swing.rotation.x = tau > 0 ? 0.9 * Math.exp(-1.6 * tau) * Math.sin(11 * tau + 0.6) : 0; }
  // marbles
  for (const m of Object.values(marbles)) {
    if (t < m.spawn) { m.mesh.visible = false; continue; }
    m.mesh.visible = true;
    const s = marbleState(m, t); m.mesh.position.set(s.x, s.y, s.z);
    const axis = new THREE.Vector3(s.tz, 0, -s.tx); m.mesh.quaternion.setFromAxisAngle(axis, s.d / RM);
    m.mesh.scale.setScalar(popScale(t - m.spawn, 0.45) || 0.001);
  }
  // finale lights
  lampMats.forEach((lm, i) => { lm.emissiveIntensity = 2.4 * clamp((t - (40 + i * 0.5)) / 0.25); });
  const fin = clamp((t - 44) / 0.35);
  winMat.emissiveIntensity = 2.4 * fin; wheel.lightM.emissiveIntensity = 2.6 * fin;
  const dusk = smooth((t - 40) / 4) * 0.35 + fin * 0.45;
  sun.intensity = lerp(2.3, 1.05, dusk); hemi.intensity = lerp(1.15, 0.86, dusk); hemi.color.setHex(0xeaf6ff).lerp(tmpC.setHex(0xd6caff), dusk); scene.fog.color.setHex(0xd6eeff).lerp(tmpC.setHex(0xd9c6f0), dusk);
  sun.color.setHex(0xfff4e2).lerp(tmpC.setHex(0xffd9b8), dusk);
  skyU.top.value.setHex(0x8fcfff).lerp(tmpC.setHex(0x8f9fe6), dusk); skyU.mid.value.setHex(0xcdeaff).lerp(tmpC.setHex(0xffc9d6), dusk); skyU.bot.value.setHex(0xcfe9ff).lerp(tmpC.setHex(0xb3a4ea), dusk);
  // wheel
  const wt = Math.max(0, t - 44); const ang = -(wt < 1.2 ? 0.5 * 0.55 * wt * wt / 1.2 * 2 : 0.66 + 0.55 * (wt - 1.2)) ;
  wheel.rot.rotation.z = ang; for (const g of wheel.gondolas) g.rotation.z = -ang;
  // clouds
  for (const c of clouds) { c.position.x = c.userData.base.x + Math.sin(t * 0.05 + c.userData.ph) * 1.2 + t * 0.04; c.position.y = c.userData.base.y + Math.sin(t * 0.3 + c.userData.ph) * 0.25; }
  // camera
  if (DEBUG_CAM === 'top') { camera.fov = 40; camera.position.set(0, 62, 0.01); camera.lookAt(0, 0, 0); }
  else if (DEBUG_CAM) { const v = DEBUG_CAM.split(',').map(Number); camera.fov = v[6]; camera.position.set(v[0], v[1], v[2]); camera.lookAt(v[3], v[4], v[5]); }
  else { const c = cam(t); camera.fov = c.fov; camera.position.set(...c.pos); camera.lookAt(...c.tgt); }
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  scene.updateMatrixWorld();
  updateSparkles(t);
  renderer.render(scene, camera);
}
window.renderAt = renderAt;
window.info = { structCount, lamps: lamps.length, plots: plots.length, used: plots.filter(p => p.used).length, dK, dBc, TH_RIVER, ends: Object.fromEntries(Object.values(marbles).map(m => [m.name, [+m.dEnd.toFixed(2), +m.lane.thAt(m.dEnd).toFixed(2)]])) };
window.ready = true;
