#!/usr/bin/env python3
"""S185 pixel probe — are the reference's hour labels VISIBLE?

The computed color chain says the time labels inherit rgb(250,250,250)
(neutral-50) on a white card — near-invisible IF true. Vision is not
available this session, so pixels settle it: scan the time-column x-band
of the reference timetable frame, profile dark-pixel density per row.
Visible 16px labels => periodic dark bands every 60px. Invisible ones =>
only the 1px slate-50 row borders (faint, uniform)."""

from PIL import Image

im = Image.open("docs/probe-evidence/s185/ref-timetable-desktop.png").convert("RGB")
W, H = im.size
px = im.load()

# The time column band: grid x≈293..432 (sidebar 260 + p-8 32 + card edge).
# Labels start at px-3 (12px) inside the column. Scan a generous band and
# report per-row dark-pixel counts (r,g,b all < 200 = "dark ink").
BAND = (300, 420)
rows = []
for y in range(0, H):
    dark = sum(1 for x in range(BAND[0], BAND[1]) if all(c < 200 for c in px[x, y]))
    rows.append(dark)

# Print a compressed profile: contiguous runs of rows with any dark ink.
runs = []
cur = None
for y, d in enumerate(rows):
    if d > 0:
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

print(f"dark-ink runs in x∈[{BAND[0]},{BAND[1]}] (y0,y1,totalpx):")
for r in runs[:40]:
    print(f"  y {r[0]:4d}-{r[1]:4d}  {r[2]:5d}px  span={r[1]-r[0]+1}")

# Also: the overall min pixel in the band (the darkest ink found).
mn = [255, 255, 255]
for y in range(0, H):
    for x in range(BAND[0], BAND[1]):
        c = px[x, y]
        if sum(c) < sum(mn):
            mn = list(c)
print("darkest pixel in band:", mn)

# Contrast sample: average pixel value across the band vs the label-ink
avg_all = sum(sum(px[x, y]) for y in range(0, H) for x in range(BAND[0], BAND[1])) / ((BAND[1] - BAND[0]) * H)
print("band average (0-765):", round(avg_all, 1))
