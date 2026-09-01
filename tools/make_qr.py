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

# ---------- 配色（和页面一致：淡粉米白底 + 红字）----------
BLUSH = (251, 239, 233)      # 页面底色
BLUSH_2 = (246, 226, 218)    # 略深，做渐变
RED = (168, 30, 23)          # 主红
RED_MID = (192, 52, 42)
RED_LT = (217, 86, 74)
CREAM = (255, 248, 243)
INK = (122, 42, 34)
INK_SOFT = (150, 78, 68)

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
        dark="#A81E17", light="#FFF8F3")
print("qr.png          纯二维码")

# ---------- 2. 邀请卡 ----------
W, H = 1080, 1620
card = Image.new("RGB", (W, H), BLUSH)
d = ImageDraw.Draw(card)

# 竖向淡粉渐变（上浅下略深，和页面一致）
for y in range(H):
    t = (y / H) ** 1.1
    d.line([(0, y), (W, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip((253, 247, 243), BLUSH_2)))

# 双层红细框（婚呗封面那圈）
d.rounded_rectangle([44, 44, W - 44, H - 44], radius=16, outline=RED, width=3)
d.rounded_rectangle([62, 62, W - 62, H - 62], radius=10,
                    outline=(RED_LT[0], RED_LT[1], RED_LT[2]), width=1)
# 四角小红块
for cx, cy in [(44, 44), (W - 44, 44), (44, H - 44), (W - 44, H - 44)]:
    d.rectangle([cx - 8, cy - 8, cx + 8, cy + 8], fill=RED)

f_xi = font(KAI, 132)
f_name = font(SONG, 62)
f_amp = font(KAI, 46)
f_date = font("C:/Windows/Fonts/georgia.ttf", 52)
f_sub = font(KAI, 34)
f_tip = font(HEI, 33)
f_small = font(HEI, 26)
f_eyebrow = font(HEI, 24)

y = 132
center(d, W / 2, y, "WEDDING INVITATION", f_eyebrow, RED_MID, spacing=9)

# 囍 印章
y += 78
box = 176
x0 = (W - box) / 2
d.rounded_rectangle([x0, y, x0 + box, y + box], radius=8, fill=RED)
d.rounded_rectangle([x0 + 11, y + 11, x0 + box - 11, y + box - 11], radius=5,
                    outline=(255, 226, 218), width=2)
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
d.text((x, y), groom, font=f_name, fill=RED_MID)
bb = d.textbbox((0, 0), "&", font=f_amp)
d.text((x + nw_g + gap / 2 - (bb[2] - bb[0]) / 2 - bb[0], y + 12), "&", font=f_amp, fill=RED_LT)
d.text((x + nw_g + gap, y), bride, font=f_name, fill=RED_MID)

# 日期
y += 104
center(d, W / 2, y, date_text, f_date, RED, spacing=6)
y += 74
center(d, W / 2, y, "%s　%s　%s" % (week, lunar, time_text), f_sub, INK_SOFT, spacing=2)

# 分隔线
y += 76
d.line([W / 2 - 90, y, W / 2 + 90, y], fill=RED_LT, width=1)

# 二维码（纸白托底，中间留白盖一个囍）
y += 62
qsize = 420
buf = io.BytesIO()
segno.make(url, error="h").save(buf, kind="png", scale=20, border=0,
                                dark="#A81E17", light="#FFF8F3")
buf.seek(0)
qimg = Image.open(buf).convert("RGB").resize((qsize, qsize), Image.NEAREST)
pad = 30
plate = (W - qsize - pad * 2) / 2
d.rectangle([plate, y - pad, plate + qsize + pad * 2, y + qsize + pad], fill=CREAM)
d.rectangle([plate, y - pad, plate + qsize + pad * 2, y + qsize + pad],
            outline=RED_LT, width=2)
card.paste(qimg, (int((W - qsize) / 2), int(y)))

# 二维码正中的囍（高纠错撑得住）
c = qsize * 0.19
cx0 = (W - c) / 2
cy0 = y + (qsize - c) / 2
d.rectangle([cx0, cy0, cx0 + c, cy0 + c], fill=CREAM)
f_xi2 = font(KAI, int(c * 0.74))
bb = d.textbbox((0, 0), "囍", font=f_xi2)
d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], cy0 + c / 2 - (bb[3] - bb[1]) / 2 - bb[1]),
       "囍", font=f_xi2, fill=RED)

# 引导语
y += qsize + pad + 62
center(d, W / 2, y, "长按或扫描二维码", f_tip, RED, spacing=4)
y += 52
center(d, W / 2, y, "查看我们的电子请柬", f_tip, RED_MID, spacing=4)
y += 56
center(d, W / 2, y, "（内含婚礼时间与导航）", f_small, INK_SOFT, spacing=2)

out = os.path.join(IMGDIR, "qr-card.png")
card.save(out, "PNG", optimize=True)

# 复制一份到项目根目录，方便直接拖进微信发
import shutil
shutil.copy(out, os.path.join(ROOT, "婚礼邀请函二维码.png"))

print("qr-card.png     邀请卡 %dx%d  %dKB" % (W, H, os.path.getsize(out) // 1024))
print("\n链接：%s" % url)
print("根目录已生成「婚礼邀请函二维码.png」，可直接发微信")
