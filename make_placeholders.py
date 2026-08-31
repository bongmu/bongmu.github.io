# -*- coding: utf-8 -*-
# 生成 5 张占位婚纱照（红金底 + 囍），用户之后直接同名替换 assets/photos/*.jpg
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 900, 1200
FONT_KAI = "C:/Windows/Fonts/simkai.ttf"
FONT_HEI = "C:/Windows/Fonts/msyh.ttc"

def f(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

f_xi = f(FONT_KAI, 330)
f_tip = f(FONT_HEI, 34)
f_no = f(FONT_KAI, 52)

for i in range(1, 6):
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    # 深红竖向渐变
    top = (126, 27, 32)
    bot = (168, 48, 54)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bot)))
    # 金色双框
    d.rectangle([28, 28, W - 28, H - 28], outline=(201, 169, 79), width=3)
    d.rectangle([44, 44, W - 44, H - 44], outline=(201, 169, 79), width=1)
    # 角花
    for cx, cy in [(28, 28), (W - 28, 28), (28, H - 28), (W - 28, H - 28)]:
        d.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(201, 169, 79))
    # 大囍
    xi = "囍"
    bb = d.textbbox((0, 0), xi, font=f_xi)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text(((W - tw) / 2 - bb[0], (H - th) / 2 - bb[1] - 60), xi, font=f_xi, fill=(222, 186, 96))
    # 序号
    no = f"0{i}"
    bb2 = d.textbbox((0, 0), no, font=f_no)
    d.text(((W - (bb2[2] - bb2[0])) / 2 - bb2[0], H / 2 + 150), no, font=f_no, fill=(222, 186, 96))
    # 提示
    tip = "替换为婚纱照 · 放入 assets/photos/"
    bb3 = d.textbbox((0, 0), tip, font=f_tip)
    d.text(((W - (bb3[2] - bb3[0])) / 2 - bb3[0], H - 130), tip, font=f_tip, fill=(214, 178, 106))
    img.save(f"dist/assets/photos/{i}.jpg", quality=88)
    print(f"dist/assets/photos/{i}.jpg")
