#!/usr/bin/env python3
"""S185 pixel probe 2 — pinpoint the ink in the first hour-label band.

Settles the contradiction: computed color rgb(250,250,250) (near-white)
vs periodic dark ink every 60px. For band y∈[296,314] print every dark
pixel's (x, y, rgb) grouped into x-runs, plus the pixel histogram of the
label cell region. If the ink is the '7 AM' glyphs, it will cluster at
x≈305-350 (px-3 inside the first column) with slate-family colors."""

from collections import Counter
from PIL import Image

im = Image.open("docs/probe-evidence/s185/ref-timetable-desktop.png").convert("RGB")
px = im.load()

print("=== dark pixels (all channels < 210) in y∈[296,314] ===")
cols = Counter()
samples = []
for y in range(296, 315):
    for x in range(290, 460):
        c = px[x, y]
        if all(v < 210 for v in c):
            cols[x] += 1
            if len(samples) < 14:
                samples.append((x, y, c))
xs = sorted(cols)
if xs:
    print("x-range:", xs[0], "-", xs[-1], " columns with ink:", len(xs))
    # group contiguous x-runs
    runs = []
    start = xs[0]
    prev = xs[0]
    for x in xs[1:]:
        if x - prev > 3:
            runs.append((start, prev))
            start = x
        prev = x
    runs.append((start, prev))
    print("x-runs:", runs)
    print("sample pixels:", samples[:10])
else:
    print("no dark pixels in the band at all")

print()
print("=== the label-cell region pixel histogram (x 300-430, y 296-320) ===")
hist = Counter()
for y in range(296, 321):
    for x in range(300, 431):
        c = px[x, y]
        hist[(c[0] // 32, c[1] // 32, c[2] // 32)] += 1
for k, v in sorted(hist.items(), key=lambda kv: -kv[1])[:8]:
    print("  ~rgb", tuple(v * 32 for v in k), "->", v, "px")

print()
print("=== same histogram for a mid label (y 356-380, '8 AM') ===")
hist2 = Counter()
for y in range(356, 381):
    for x in range(300, 431):
        c = px[x, y]
        hist2[(c[0] // 32, c[1] // 32, c[2] // 32)] += 1
for k, v in sorted(hist2.items(), key=lambda kv: -kv[1])[:6]:
    print("  ~rgb", tuple(v * 32 for v in k), "->", v, "px")
