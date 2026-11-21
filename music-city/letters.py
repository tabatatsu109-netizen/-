# Turn the name into house positions: skeletonise each hiragana and sample points along the strokes.
import json, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.morphology import skeletonize
import glob
NAME = [list('たばた'), list('みれい')]
FONT = glob.glob('node_modules/@expo-google-fonts/m-plus-rounded-1c/400Regular/*.ttf')[0]
CELL, SPACING = 10.6, 1.0          # world units
X0, Z_LINES, DX = 0.0, [26.2, 38.2], 11.0
PX = 420
font = ImageFont.truetype(FONT, int(PX * 0.86))
out = []
for li, line in enumerate(NAME):
    for ci, ch in enumerate(line):
        im = Image.new('L', (PX, PX), 0); d = ImageDraw.Draw(im)
        bb = d.textbbox((0, 0), ch, font=font)
        d.text(((PX - (bb[2] - bb[0])) / 2 - bb[0], (PX - (bb[3] - bb[1])) / 2 - bb[1]), ch, font=font, fill=255)
        sk = skeletonize(np.array(im) > 128)
        pts = np.argwhere(sk)                      # (row, col)
        sp = SPACING / CELL * PX
        # greedy walk: always continue from the nearest unvisited skeleton pixel, keep points >= spacing apart
        remaining = set(map(tuple, pts)); chosen = []
        cur = min(remaining, key=lambda p: (p[1] + p[0]))
        order = []
        while remaining:
            remaining.discard(cur); order.append(cur)
            if not remaining: break
            arr = np.array(list(remaining)); dist = np.hypot(arr[:, 0] - cur[0], arr[:, 1] - cur[1])
            cur = tuple(arr[np.argmin(dist)])
        pads = []
        for p in order:
            if all(np.hypot(p[0] - q[0], p[1] - q[1]) >= sp * 0.93 for q in chosen): chosen.append(p)
            if all(np.hypot(p[0] - q[0], p[1] - q[1]) >= sp * 0.42 for q in pads): pads.append(p)
        cx = X0 + (ci - 1) * DX; cz = Z_LINES[li]
        base = len(out)
        for (r, c) in chosen:
            out.append({'ch': ch, 'ci': li * 3 + ci, 'x': round(cx + (c / PX - 0.5) * CELL, 3), 'z': round(cz + (r / PX - 0.5) * CELL, 3), 'pads': []})
        for (r, c) in pads:
            k = min(range(len(chosen)), key=lambda i: np.hypot(chosen[i][0] - r, chosen[i][1] - c))
            out[base + k]['pads'].append([round(cx + (c / PX - 0.5) * CELL, 3), round(cz + (r / PX - 0.5) * CELL, 3)])
json.dump(out, open('letters.json', 'w'), ensure_ascii=False)
print(len(out), {i: sum(1 for o in out if o['ci'] == i) for i in range(6)})
# preview
S = 18; im = Image.new('RGB', (int(36 * S), int(26 * S)), (255, 243, 218)); d = ImageDraw.Draw(im)
light = [(255, 200, 200), (255, 228, 170), (190, 222, 255), (185, 238, 214), (218, 204, 250), (255, 205, 225)]
for o in out:
    for px, pz in o['pads']:
        x = (px + 18) * S; y = (pz - 19.5) * S; r = 0.62 * S; d.ellipse([x - r, y - r, x + r, y + r], fill=light[o['ci']])
cols = [(255, 120, 120), (255, 190, 60), (90, 170, 255), (80, 205, 150), (165, 130, 240), (255, 130, 180)]
for o in out:
    x = (o['x'] + 18) * S; y = (o['z'] - 19.5) * S; d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=cols[o['ci']])
im.save('preview/letters.png')
