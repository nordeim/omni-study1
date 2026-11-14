#!/usr/bin/env python3
"""S185 pixel probe 4 — per-row, per-region ink: is each weekday NAME
visible at mobile? Saturday's name is text-violet-700 (definitely
visible). If the other six names were invisible (inherited neutral-50),
their name-band ink would be ~just the count line, while Saturday's would
be count + name. Compare directly."""

from PIL import Image

im = Image.open("docs/probe-evidence/s185/ref-timetable-mobile.png").convert("RGB")
W, H = im.size
px = im.load()

# The card starts below the banner. Find the card's top: the first row of
# the 7-row rhythm. Rows are ~77px. From the earlier profile the row ink
# bands began ~y338. Card top ~y290; rows: 290 + 77*i.
rows_y = [(290 + 77 * i, 290 + 77 * (i + 1)) for i in range(7)]
names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

print(f"{'row':10s} {'tile(20-70)':>12s} {'name(76-190)':>12s} {'count?':>6s}  verdict")
for name, (y0, y1) in zip(names, rows_y):
    tile = sum(1 for y in range(y0, y1) for x in range(20, 70) if all(c < 200 for c in px[x, y]))
    nb = sum(1 for y in range(y0, y1) for x in range(76, 190) if all(c < 200 for c in px[x, y]))
    # count text lives below name: split the name band at the midpoint of
    # the ink rows — instead just report both halves upper/lower:
    mid = y0 + 40
    upper = sum(1 for y in range(y0, mid) for x in range(76, 190) if all(c < 200 for c in px[x, y]))
    lower = nb - upper
    print(f"{name:10s} {tile:12d} {nb:12d} up={upper:4d} lo={lower:4d}")

# The exact y of the Saturday name ink: scan x76-190 for the last row.
print()
print("Saturday row detail (x76-190), dark y runs:")
runs = []
cur = None
for y in range(725, 800):
    d = sum(1 for x in range(76, 190) if all(c < 200 for c in px[x, y]))
    if d > 0:
        cur = [y, y, d] if cur is None else [cur[0], y, cur[2] + d]
    else:
        if cur:
            runs.append(tuple(cur))
            cur = None
if cur:
    runs.append(tuple(cur))
print("  runs:", runs)
print("Sunday row detail (x76-190), dark y runs:")
runs2 = []
cur = None
for y in range(290, 365):
    d = sum(1 for x in range(76, 190) if all(c < 200 for c in px[x, y]))
    if d > 0:
        cur = [y, y, d] if cur is None else [cur[0], y, cur[2] + d]
    else:
        if cur:
            runs2.append(tuple(cur))
            cur = None
if cur:
    runs2.append(tuple(cur))
print("  runs:", runs2)
