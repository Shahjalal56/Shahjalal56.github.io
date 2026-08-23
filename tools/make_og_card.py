"""Builds assets/img/og-card.png -- the 1200x630 link preview for LinkedIn,
WhatsApp, Slack and X. Run it again if the copy on the card needs to change.

The card reuses the site's own palette: black canvas, and the one gradient that
runs Android green -> iOS blue.
"""
import io
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
VOID = (8, 9, 10)
CHALK = (236, 241, 243)
FOG = (138, 150, 156)
DROID = (61, 220, 132)
MID = (43, 201, 168)
IOS = (10, 132, 255)

F = "C:/Windows/Fonts/"
f_big = ImageFont.truetype(F + "segoeuib.ttf", 74)
f_sub = ImageFont.truetype(F + "segoeui.ttf", 27)
f_kick = ImageFont.truetype(F + "consolab.ttf", 19)
f_url = ImageFont.truetype(F + "consola.ttf", 21)

card = Image.new("RGB", (W, H), VOID)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def grad_strip(w, h):
    """The site's --grad token, rasterised: green 0% -> mid 48% -> blue 100%."""
    strip = Image.new("RGB", (w, h))
    px = strip.load()
    for x in range(w):
        t = x / max(1, w - 1)
        col = lerp(DROID, MID, t / 0.48) if t <= 0.48 else lerp(MID, IOS, (t - 0.48) / 0.52)
        for y in range(h):
            px[x, y] = col
    return strip


# ── ambient glow behind the photo, so the cutout doesn't float on flat black ──
glow = Image.new("RGB", (W, H), VOID)
gd = ImageDraw.Draw(glow)
gd.ellipse([W - 620, -240, W + 200, H + 120], fill=(14, 40, 30))
gd.ellipse([W - 330, 150, W + 260, H + 300], fill=(8, 34, 58))
card = Image.blend(card, glow.filter(ImageFilter.GaussianBlur(150)), 0.85)

# ── his cutout, flush to the right edge and the bottom ───────────────────────
photo = Image.open("assets/img/shahjalal.png").convert("RGBA")
ph = 596
pw = round(photo.width * ph / photo.height)
photo = photo.resize((pw, ph), Image.LANCZOS)
card.paste(photo, (W - pw - 46, H - ph), photo)

d = ImageDraw.Draw(card)

# ── the one gradient, as a rule down the left edge of the type ───────────────
# built wide then turned upright, so the ramp runs top-to-bottom not across 6px
# (-90 keeps green at the top, matching the site's 142deg gradient)
card.paste(grad_strip(232, 6).rotate(-90, expand=True), (72, 176))

x = 104
d.text((x, 176), "FLUTTER DEVELOPER  ·  DHAKA, BD", font=f_kick, fill=DROID)
d.text((x, 218), "Md Shahjalal", font=f_big, fill=CHALK)
d.text((x, 316), "3+ years shipping production Android and iOS", font=f_sub, fill=FOG)
d.text((x, 352), "apps from a single Flutter codebase.", font=f_sub, fill=FOG)

# ── foot: gradient underline + the URL ──────────────────────────────────────
card.paste(grad_strip(196, 4), (x, 470))
d.text((x, 496), "shahjalal56.github.io", font=f_url, fill=CHALK)

card.save("assets/img/og-card.png", optimize=True)

out = Image.open("assets/img/og-card.png")
import os
print("size", out.size, "mode", out.mode, "bytes", os.path.getsize("assets/img/og-card.png"))
assert out.size == (1200, 630)
