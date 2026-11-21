// Camera path: one continuous move, built from keyframes tied to where the marbles are.
export function buildCamera(ctx) {
  const { marbles, laneOf, marbleState, kPt, bigHit, centerAt } = ctx;
  const names = ['R', 'Y', 'B', 'G', 'P'];
  const st = (n, t) => marbleState(marbles[n], t);
  const avg = (t, ns = names) => { let x = 0, z = 0; for (const n of ns) { const s = st(n, t); x += s.x; z += s.z; } return [x / ns.length, z / ns.length]; };
  // View of a ground point from outside the island looking inward.
  // inw: shift the aim point toward the island centre so the subject sits low in frame.
  const look = (t, gx, gz, dist, elDeg, o = {}) => {
    const el = elDeg * Math.PI / 180, r = Math.hypot(gx, gz) || 1, ux = gx / r, uz = gz / r;
    const az = Math.atan2(gz, gx) + (o.az || 0) * Math.PI / 180, inw = o.inw ?? 0, ty = o.ty ?? 0.5;
    const tx = gx - ux * inw, tz = gz - uz * inw;
    return { t, tgt: [tx, ty, tz], pos: [tx + Math.cos(az) * dist * Math.cos(el), ty + dist * Math.sin(el), tz + Math.sin(az) * dist * Math.cos(el)], fov: o.fov || 40 };
  };
  const R = d => laneOf.R.at(d);
  const keys = [];
  // scene 1: track the red marble across its little xylophone
  { const a = R(-0.2); keys.push(look(0, a.x, a.z, 6.6, 20, { az: -28, inw: 0.5, ty: 0.75, fov: 38 })); }
  { const a = R(1.5); keys.push(look(1.5, a.x, a.z, 7.2, 22, { az: -26, inw: 0.6, ty: 0.75, fov: 38 })); }
  { const a = R(3.0); keys.push(look(2.7, a.x, a.z, 8.8, 25, { az: -24, inw: 0.5, ty: 0.7, fov: 39 })); }
  // scene 2: the other marbles slide in
  { const c = centerAt(0.1); keys.push(look(4.2, c.x, c.z, 12.5, 29, { az: -18, inw: 0.4 })); }
  { const [x, z] = avg(6.6); keys.push(look(6.6, x, z, 14, 30, { az: -14, inw: 0.8 })); }
  // scene 3: rise to reveal the growing machine
  { const [x, z] = avg(9.6); keys.push(look(9.6, x, z, 17, 32, { az: -12, inw: 1.2 })); }
  { const [x, z] = avg(13); keys.push(look(13, x, z, 19.5, 33, { az: -12, inw: 1.6 })); }
  { const [x, z] = avg(16.3); keys.push(look(16.3, x, z, 20, 33, { az: -10, inw: 1.6 })); }
  // scene 4: the music stops; drift toward the stranded yellow marble, bridge unfinished ahead
  const K = kPt, out = [K.nx, K.nz], fw = [K.tx, K.tz];
  const rel = (t, f, o, y, tf, to, ty, fov) => ({ t, pos: [K.x + fw[0] * f + out[0] * o, y, K.z + fw[1] * f + out[1] * o], tgt: [K.x + fw[0] * tf + out[0] * to, ty, K.z + fw[1] * tf + out[1] * to], fov });
  keys.push(rel(19.3, -9.5, 7.5, 7.5, 3.0, -1.0, 0.5, 40));
  keys.push(rel(21.8, -6.5, 7.0, 5.2, 0.8, -0.6, 0.6, 38));
  // scene 5: the rescue bump
  keys.push(rel(23.6, -2.6, 7.2, 3.6, -0.3, -0.3, 0.6, 34));
  keys.push(rel(24.7, -0.6, 8.2, 4.2, 1.2, -0.4, 0.6, 36));
  { const [x, z] = avg(26.6, ['Y', 'B', 'R']); keys.push(look(26.6, x, z, 16, 36, { az: -8, inw: 1.5 })); }
  { const [x, z] = avg(28.8); keys.push(look(28.8, x, z, 22, 40, { az: -6, inw: 3.0 })); }
  // scene 6: wide orbit while the city fills in
  { const [x, z] = avg(31.5); keys.push(look(31.5, x, z, 28, 41, { az: -4, inw: 5.0, ty: 1.0, fov: 42 })); }
  { const [x, z] = avg(34.5); keys.push(look(34.5, x, z, 32, 40, { az: 0, inw: 6.5, ty: 1.4, fov: 44 })); }
  { const [x, z] = avg(37.5); keys.push(look(37.5, x, z, 35, 38, { az: 4, inw: 7.5, ty: 1.6, fov: 45 })); }
  // scene 7: red runs the golden chimes to the big bell, then pull back to the full city
  const B = bigHit, c7 = hits7(ctx);
  keys.push({ t: 40.4, pos: [c7.x + 5.5, 6.5, c7.z + 10.5], tgt: [c7.x - 0.6, 0.9, c7.z - 2.2], fov: 44 });
  keys.push({ t: 42.0, pos: [B.x + 3.2, 7.2, B.z + 11.5], tgt: [B.x + 0.4, 1.2, B.z - 2.6], fov: 46 });
  // pull up and back: the whole city, and the name the houses were spelling all along
  keys.push({ t: 43.15, pos: [B.x * 0.4, 44, B.z + 27], tgt: [0, 0.6, 12.5], fov: 43 });
  keys.push({ t: 44.25, pos: [0, 90, 45], tgt: [0, 0, 14.2], fov: 40 });
  keys.push({ t: 45.0, pos: [0, 93, 45.5], tgt: [0, 0, 14.2], fov: 40 });
  keys.sort((a, b) => a.t - b.t);
  const n = keys.length;
  const comp = (get) => {
    const v = keys.map(get), m = v.map((_, i) => i === 0 || i === n - 1 ? 0 : (v[i + 1] - v[i - 1]) / (keys[i + 1].t - keys[i - 1].t));
    return t => {
      if (t <= keys[0].t) return v[0]; if (t >= keys[n - 1].t) return v[n - 1];
      let i = 0; while (t > keys[i + 1].t) i++;
      const h = keys[i + 1].t - keys[i].t, s = (t - keys[i].t) / h, s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * v[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * v[i + 1] + (s3 - s2) * h * m[i + 1];
    };
  };
  const f = { px: comp(k => k.pos[0]), py: comp(k => k.pos[1]), pz: comp(k => k.pos[2]), tx: comp(k => k.tgt[0]), ty: comp(k => k.tgt[1]), tz: comp(k => k.tgt[2]), fov: comp(k => k.fov) };
  return t => ({ pos: [f.px(t), f.py(t), f.pz(t)], tgt: [f.tx(t), f.ty(t), f.tz(t)], fov: f.fov(t) });
}
function hits7(ctx) { const hs = ctx.hits.R.filter(h => h.kind === 'chime'); const m = hs[3]; return { x: m.x, z: m.z }; }
