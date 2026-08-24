# Slice ARKAY text 1-02 using the reference site's slice geometry,
# scaled onto this export (verified: same artwork at 2.6674x).
from PIL import Image
import json, os

SRC = r"d:\orkay-tiles-site\public\img\ARKAY text 1-02.png"
OUT = r"d:\orkay-tiles-site\public\img"
img = Image.open(SRC).convert("RGBA")

# reference geometry (canvas 3833 wide, origin at O's top-left)
REF = {
    "o-top":  (0, 0, 821, 403),
    "o-band": (0, 403, 821, 542),
    "o-bot":  (0, 945, 821, 434),
    # the R band must start and end where the leg outline is already flat —
    # inside y 2045..4340 of the export. The reference's 748/1644 cut the leg
    # while it is still curving, so scaling the band broke its slope at the
    # seam and the elongated leg read as two strokes, not one line.
    "r-top":  (916, 7, 669, 763),
    "r-band": (916, 770, 669, 856),
    "r-bot":  (916, 1626, 669, 98),
    "kay":    (1699, 7, 2134, 821),
}
X0, Y0 = 218, 0          # O top-left in this export (measured)
CW = 10442 - X0          # O left -> Y right
s = CW / 3833

# full stretched extent: r-band doubles
M = round(s * (770 + 2 * 856 + 98))
scale_out = 2400 / CW
table = {}
for name, (x, y, w, h) in REF.items():
    a, b = X0 + round(x * s), Y0 + round(y * s)
    c, d = a + round(w * s), b + round(h * s)
    crop = img.crop((a, b, c, d))
    white = crop  # the section is light — keep the source's black ink
    white = white.resize((max(1, round(crop.width * scale_out)), max(1, round(crop.height * scale_out))), Image.LANCZOS)
    white.save(os.path.join(OUT, f"wordmark-{name}.png"), optimize=True)
    table[name] = {
        "left": round((a - X0) / CW * 100, 3), "top": round((b - Y0) / M * 100, 3),
        "width": round((c - a) / CW * 100, 3), "height": round((d - b) / M * 100, 3),
    }
print(json.dumps(table, indent=1))
print("aspect:", CW, "/", M)
oh, rh = round(542 * s), round(856 * s)
print("U =", round(oh / rh, 4), " P =", round((2 - oh / rh) * rh / oh, 4))

# ── verification composites: collapsed (compact) and final (o=1, r=2) ──
def render(so, sr, path, H=1200):
    Wv = 2000
    cv = Image.new("RGBA", (Wv, H), (17, 17, 17, 255))
    for name, t in table.items():
        p = Image.open(os.path.join(OUT, f"wordmark-{name}.png"))
        x = round(t["left"] / 100 * Wv); w = round(t["width"] / 100 * Wv)
        y = t["top"] / 100 * (Wv / (CW / M)); h = p.height * (w / p.width)
        k = so if name.startswith("o-") else sr if name.startswith("r-") else 1
        if name.endswith("-band"):
            h *= k
        if name.endswith("-bot"):
            band = table[name.replace("-bot", "-band")]
            bh = band["height"] / 100 * (Wv / (CW / M))
            y -= (1 - k) * bh
        if h < 1: continue
        pr = p.resize((max(1, w), max(1, round(h))), Image.LANCZOS)
        cv.alpha_composite(pr, (x, round(y)))
    cv.save(path)

render(0, 0, "collapsed.png", 700)
render(1, 2, "final.png", 1400)
print("previews written")
