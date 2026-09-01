# -*- coding: utf-8 -*-
"""生成婚礼邀请函二维码卡片

产出两个文件（都在 dist/assets/img/ 下，同时也复制到项目根目录方便直接发）：
  qr.png       裸二维码，想自己排版时用
  qr-card.png  竖版邀请卡（囍 + 姓名 + 日期 + 二维码 + 引导语），可直接发给宾客

用法：
    python tools/make_qr.py

链接从 dist/CNAME 读，姓名日期从 dist/config.js 读，不用手填。
"""
import io
import os
import re

import segno
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, "dist", "config.js")
CNAME = os.path.join(ROOT, "dist", "CNAME")
IMGDIR = os.path.join(ROOT, "dist", "assets", "img")
os.makedirs(IMGDIR, exist_ok=True)

# ---------- 读配置 ----------
cfg = io.open(CFG, encoding="utf-8").read()


def field(key):
    m = re.search(r"\b%s\s*:\s*'([^']*)'" % key, cfg)
    return m.group(1) if m else ""


groom, bride = field("groom"), field("bride")
date_text, week = field("dateText"), field("week")
lunar, time_text = field("lunar"), field("timeText")
url = "https://" + io.open(CNAME, encoding="utf-8").read().strip() + "/"

# ---------- 配色（和页面一致的中国红 + 烫金）----------
BG = (124, 20, 23)
BG2 = (105, 15, 19)
GOLD = (228, 198, 140)
GOLD_DP = (201, 162, 92)
CREAM = (252, 244, 232)
RED_LT = (200, 68, 58)
INK = (122, 42, 36)

KAI = "C:/Windows/Fonts/simkai.ttf"
SONG = "C:/Windows/Fonts/simsun.ttc"
HEI = "C:/Windows/Fonts/msyh.ttc"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def center(d, cx, y, text, f, fill, spacing=0):
    """按字间距居中画一行字"""
    if spacing:
        widths = [d.textlength(ch, font=f) for ch in text]
        total = sum(widths) + spacing * (len(text) - 1)
        x = cx - total / 2
        for ch, w in zip(text, widths):
            d.text((x, y), ch, font=f, fill=fill)
            x += w + spacing
        return total
    w = d.textlength(text, font=f)
    d.text((cx - w / 2, y), text, font=f, fill=fill)
    return w


# ---------- 1. 裸二维码 ----------
qr = segno.make(url, error="h")           # 高纠错，印出来被挡一点也能扫
qr.save(os.path.join(IMGDIR, "qr.png"), scale=12, border=2,
        dark="#7C1417", light="#FCF4E8")
print("qr.png          纯二维码")

# ---------- 2. 邀请卡 ----------
W, H = 1080, 1620
card = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(card)

# 竖向红色渐变
for y in range(H):
    t = (y / H) ** 1.15
    d.line([(0, y), (W, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip((142, 26, 28), BG2)))

# 双层烫金内框
d.rectangle([46, 46, W - 46, H - 46], outline=GOLD_DP, width=3)
d.rectangle([64, 64, W - 64, H - 64], outline=(GOLD[0], GOLD[1], GOLD[2]), width=1)
# 四角小金块
for cx, cy in [(46, 46), (W - 46, 46), (46, H - 46), (W - 46, H - 46)]:
    d.rectangle([cx - 9, cy - 9, cx + 9, cy + 9], fill=GOLD)

f_xi = font(KAI, 132)
f_name = font(SONG, 62)
f_amp = font(KAI, 46)
f_date = font("C:/Windows/Fonts/georgia.ttf", 52)
f_sub = font(KAI, 34)
f_tip = font(HEI, 33)
f_small = font(HEI, 26)
f_eyebrow = font(HEI, 24)

y = 132
center(d, W / 2, y, "WEDDING INVITATION", f_eyebrow, GOLD_DP, spacing=9)

# 囍 印章
y += 78
box = 176
x0 = (W - box) / 2
d.rounded_rectangle([x0, y, x0 + box, y + box], radius=10, fill=RED_LT)
d.rounded_rectangle([x0 + 11, y + 11, x0 + box - 11, y + box - 11], radius=6,
                    outline=(255, 255, 255, 160), width=2)
bb = d.textbbox((0, 0), "囍", font=f_xi)
d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], y + box / 2 - (bb[3] - bb[1]) / 2 - bb[1]),
       "囍", font=f_xi, fill=CREAM)

# 姓名
y += box + 74
nw_g = d.textlength(groom, font=f_name)
nw_b = d.textlength(bride, font=f_name)
gap = 58
total = nw_g + gap + nw_b
x = W / 2 - total / 2
d.text((x, y), groom, font=f_name, fill=CREAM)
bb = d.textbbox((0, 0), "&", font=f_amp)
d.text((x + nw_g + gap / 2 - (bb[2] - bb[0]) / 2 - bb[0], y + 12), "&", font=f_amp, fill=GOLD)
d.text((x + nw_g + gap, y), bride, font=f_name, fill=CREAM)

# 日期
y += 104
center(d, W / 2, y, date_text, f_date, GOLD, spacing=6)
y += 74
center(d, W / 2, y, "%s　%s　%s" % (week, lunar, time_text), f_sub, (255, 241, 226), spacing=2)

# 分隔线
y += 76
d.line([W / 2 - 90, y, W / 2 + 90, y], fill=GOLD_DP, width=1)

# 二维码（纸白托底，中间留白盖一个囍）
y += 62
qsize = 420
buf = io.BytesIO()
segno.make(url, error="h").save(buf, kind="png", scale=20, border=0,
                                dark="#7C1417", light="#FCF4E8")
buf.seek(0)
qimg = Image.open(buf).convert("RGB").resize((qsize, qsize), Image.NEAREST)
pad = 30
plate = (W - qsize - pad * 2) / 2
d.rectangle([plate, y - pad, plate + qsize + pad * 2, y + qsize + pad], fill=CREAM)
d.rectangle([plate, y - pad, plate + qsize + pad * 2, y + qsize + pad],
            outline=GOLD_DP, width=2)
card.paste(qimg, (int((W - qsize) / 2), int(y)))

# 二维码正中的囍（高纠错撑得住）
c = qsize * 0.19
cx0 = (W - c) / 2
cy0 = y + (qsize - c) / 2
d.rectangle([cx0, cy0, cx0 + c, cy0 + c], fill=CREAM)
f_xi2 = font(KAI, int(c * 0.74))
bb = d.textbbox((0, 0), "囍", font=f_xi2)
d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], cy0 + c / 2 - (bb[3] - bb[1]) / 2 - bb[1]),
       "囍", font=f_xi2, fill=RED_LT)

# 引导语
y += qsize + pad + 62
center(d, W / 2, y, "长按或扫描二维码", f_tip, GOLD, spacing=4)
y += 52
center(d, W / 2, y, "查看我们的电子请柬", f_tip, (255, 241, 226), spacing=4)
y += 56
center(d, W / 2, y, "（内含婚礼时间与导航）", f_small, (255, 241, 226, 180), spacing=2)

out = os.path.join(IMGDIR, "qr-card.png")
card.save(out, "PNG", optimize=True)

# 复制一份到项目根目录，方便直接拖进微信发
import shutil
shutil.copy(out, os.path.join(ROOT, "婚礼邀请函二维码.png"))

print("qr-card.png     邀请卡 %dx%d  %dKB" % (W, H, os.path.getsize(out) // 1024))
print("\n链接：%s" % url)
print("根目录已生成「婚礼邀请函二维码.png」，可直接发微信")
