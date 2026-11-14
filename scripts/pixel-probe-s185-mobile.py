#!/usr/bin/env python3
"""S185 pixel probe 3 — the mobile day-rows card: are the day names visible?

The reference's mobile day-name P carries only `font-medium` (inherited
neutral-50 = near-white). The Saturday name carries text-violet-700.
Pixel-profile the day-rows card region of the mobile frame: if the six
weekday names are invisible, only the count lines (slate-500 14px), the
tiles, and Saturday's violet name will ink."""

from PIL import Image

im = Image.open("docs/probe-evidence/s185/ref-timetable-mobile.png").convert("RGB")
W, H = im.size
px = im.load()
print("frame:", W, H)

# Profile per-row dark ink across the card x-band (x 16-374). Dark = all < 200.
band = (16, 374)
rows = []
for y in range(H):
    dark = sum(1 for x in range(band[0], band[1]) if all(c < 200 for c in px[x, y]))
    rows.append(dark)

runs = []
cur = None
for y, d in enumerate(rows):
    if d > 2:
        if cur is None:
            cur = [y, y, d]
        else:
            cur[1] = y
            cur[2] += d
    else:
        if cur is not None:
            runs.append(tuple(cur))
            cur = None
if cur is not None:
    runs.append(tuple(cur))

print("ink runs (y0,y1,px):")
for r in runs[:36]:
    print(f"  y {r[0]:4d}-{r[1]:4d}  {r[2]:5d}px  span={r[1]-r[0]+1}")

# The left tile band (x 20-70): does each row carry a visible tile glyph
# ("Sun"/"8")? And the name band (x 76-170): the weekday names.
for label, x0, x1 in [("tile-band x20-70", 20, 70), ("name-band x76-180", 76, 180)]:
    ink = 0
    for y in range(250, 800):
        for x in range(x0, x1):
            if all(c < 200 for c in px[x, y]):
                ink += 1
    print(f"{label}: {ink} dark px in y250-800")
