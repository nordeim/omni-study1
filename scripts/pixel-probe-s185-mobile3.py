#!/usr/bin/env python3
"""S185 pixel probe 5 — the ACTUAL rendered color of the mobile weekday
names. The P carries only `font-medium` (computed color neutral-50 =
rgb(250,250,250)), yet ink exists. Sample the darkest pixels in each
name band and print their RGB — slate-400-ish (148,163,184) means the
names render visible; 200+ means near-invisible fringe."""

from PIL import Image

im = Image.open("docs/probe-evidence/s185/ref-timetable-mobile.png").convert("RGB")
px = im.load()

# name bands (from the DOM rects: rows at y=331,408,...; the name P sits
# ~7px below the row's text-column top; bands measured y row_y+7..+16)
bands = {
    "Sunday": (338, 347), "Monday": (415, 424), "Tuesday": (492, 501),
    "Wednesday": (569, 578), "Thursday": (646, 655), "Friday": (723, 732),
    "Saturday(name violet)": (822, 832),
}
for name, (y0, y1) in bands.items():
    best = None
    cnt = 0
    for y in range(y0, y1):
        for x in range(76, 190):
            c = px[x, y]
            if all(v < 210 for v in c):
                cnt += 1
                if best is None or sum(c) < sum(best):
                    best = c
    print(f"{name:24s} ink_px={cnt:4d}  darkest={best}")

# the count line (slate-500, known visible): row 1's count band y 356-369
best = None
cnt = 0
for y in range(356, 370):
    for x in range(76, 190):
        c = px[x, y]
        if all(v < 210 for v in c):
            cnt += 1
            if best is None or sum(c) < sum(best):
                best = c
print(f"{'count line (slate-500?)':24s} ink_px={cnt:4d}  darkest={best}")

# the tile region of row 1 (x 20-70): the "Sun 8" tile text
best = None
cnt = 0
for y in range(331, 399):
    for x in range(20, 70):
        c = px[x, y]
        if all(v < 210 for v in c):
            cnt += 1
            if best is None or sum(c) < sum(best):
                best = c
print(f"{'tile Sun-8 row1':24s} ink_px={cnt:4d}  darkest={best}")
