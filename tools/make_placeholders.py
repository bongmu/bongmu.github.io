# -*- coding: utf-8 -*-
"""生成占位婚纱照（香槟米白 + 烫金细线）。
用户拿到真实照片后，直接用同名文件覆盖 dist/assets/photos/*.jpg 即可。
运行：python tools/make_placeholders.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "dist", "assets", "photos")
os.makedirs(OUT, exist_ok=True)

W, H = 900, 1200                      # 3:4 竖版，和模板里的裁切一致
IVORY   = (247, 243, 236)
SAND    = (226, 213, 194)
GOLD    = (176, 141, 87)
GOLD_LT = (203, 175, 126)
INK     = (74, 66, 58)

KAI  = "C:/Windows/Fonts/simkai.ttf"
SONG = "C:/Windows/Fonts/simsun.ttc"
HEI  = "C:/Windows/Fonts/msyh.ttc"

def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

f_big  = font(KAI, 300)
f_num  = font(SONG, 44)
f_tip  = font(HEI, 26)
f_word = font(KAI, 40)

WORDS = ["初","见","心","动","相","知","相","许","归"]

def center(d, xy, text, f, fill):
    bb = d.textbbox((0, 0), text, font=f)
    d.text((xy[0] - (bb[2] - bb[0]) / 2 - bb[0], xy[1] - (bb[3] - bb[1]) / 2 - bb[1]),
           text, font=f, fill=fill)

for i in range(1, 10):
    img = Image.new("RGB", (W, H), IVORY)
    d = ImageDraw.Draw(img)

    # 斜向暖色渐变
    for y in range(H):
        t = y / H
        for seg in range(0, W, 60):
            s = seg / W
            k = min(1.0, (t * 0.75 + s * 0.25))
            c = tuple(int(a + (b - a) * (k ** 1.4) * 0.85) for a, b in zip(IVORY, SAND))
            d.rectangle([seg, y, seg + 60, y + 1], fill=c)

    # 柔光块
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W * 0.1, H * 0.05, W * 0.95, H * 0.55], fill=(60, 50, 36))
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    img = Image.blend(img, Image.blend(img, glow, 0.0), 0.0)
    d = ImageDraw.Draw(img)

    # 拱门（细金线）
    m = 78
    top = 300
    d.arc([m, top - (W - 2 * m) // 2, W - m, top + (W - 2 * m) // 2], 180, 360,
          fill=GOLD_LT, width=2)
    d.line([m, top, m, H - 150], fill=GOLD_LT, width=2)
    d.line([W - m, top, W - m, H - 150], fill=GOLD_LT, width=2)
    d.line([m, H - 150, W - m, H - 150], fill=GOLD_LT, width=2)

    # 外双框
    d.rectangle([34, 34, W - 34, H - 34], outline=GOLD, width=2)
    d.rectangle([48, 48, W - 48, H - 48], outline=(GOLD_LT[0], GOLD_LT[1], GOLD_LT[2]), width=1)

    # 中央单字
    center(d, (W / 2, H * 0.46), WORDS[i - 1], f_big, (GOLD[0], GOLD[1], GOLD[2]))

    # 序号与提示
    center(d, (W / 2, H * 0.72), "%02d" % i, f_num, INK)
    d.line([W / 2 - 46, H * 0.755, W / 2 + 46, H * 0.755], fill=GOLD_LT, width=1)
    center(d, (W / 2, H * 0.795), "替换 assets/photos/%02d.jpg" % i, f_tip, (140, 128, 112))

    img.save(os.path.join(OUT, "%02d.jpg" % i), quality=82, optimize=True, progressive=True)
    print("ok", i)
