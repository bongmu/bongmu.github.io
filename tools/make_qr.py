# -*- coding: utf-8 -*-
"""生成婚礼邀请函二维码卡片

产出两个文件（都在 dist/assets/img/ 下，同时也复制到项目根目录方便直接发）：
  qr.png       裸二维码，想自己排版时用
  qr-card.png  竖版邀请卡（婚纱照拱门 + 姓名夹囍 + 二维码），可直接发给宾客

卡片刻意「不写」日期地点：写全了宾客就没有扫码的理由了，
只用一行「时间·地点·导航都在请柬里」把人引进 H5。

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
PHOTO = os.path.join(ROOT, "dist", "assets", "img", "share.jpg")
IMGDIR = os.path.join(ROOT, "dist", "assets", "img")
os.makedirs(IMGDIR, exist_ok=True)

# ---------- 读配置 ----------
cfg = io.open(CFG, encoding="utf-8").read()


def field(key):
    m = re.search(r"\b%s\s*:\s*'([^']*)'" % key, cfg)
    return m.group(1) if m else ""


groom, bride = field("groom"), field("bride")
date_text, week = field("dateText"), field("week")
lunar = field("lunar")
venue = field("name")
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

# 双层红细框 + 四角小红块
d.rounded_rectangle([44, 44, W - 44, H - 44], radius=16, outline=RED, width=3)
d.rounded_rectangle([62, 62, W - 62, H - 62], radius=10, outline=RED_LT, width=1)
for cx, cy in [(44, 44), (W - 44, 44), (44, H - 44), (W - 44, H - 44)]:
    d.rectangle([cx - 8, cy - 8, cx + 8, cy + 8], fill=RED)

f_strip = font(KAI, 30)
f_name = font(SONG, 66)
f_xi_mid = font(KAI, 78)
f_tip = font(KAI, 38)
f_small = font(HEI, 27)
f_venue = font(KAI, 30)

# 顶部竖排小字（呼应首页的「此生挚爱共白首」）
y = 128
center(d, W / 2, y, "此 生 挚 爱 共 白 首", f_strip, RED_LT, spacing=4)

# ---------- 婚纱照拱门 ----------
pw, ph = 452, 556
px, py = int((W - pw) / 2), 196
r = pw // 2
try:
    ph_img = Image.open(PHOTO).convert("RGB")
    sw, sh = ph_img.size                      # 按短边裁成 pw:ph 比例再缩放
    want = pw / float(ph)
    if sw / float(sh) > want:
        nw = int(sh * want); ph_img = ph_img.crop(((sw - nw) // 2, 0, (sw + nw) // 2, sh))
    else:
        nh = int(sw / want); ph_img = ph_img.crop((0, 0, sw, nh))
    ph_img = ph_img.resize((pw, ph), Image.LANCZOS)
    mask = Image.new("L", (pw, ph), 0)
    md = ImageDraw.Draw(mask)
    md.pieslice([0, 0, pw, pw], 180, 360, fill=255)   # 上半圆
    md.rectangle([0, r, pw, ph], fill=255)            # 下方矩形
    card.paste(ph_img, (px, py), mask)
except Exception as e:
    d.rectangle([px, py, px + pw, py + ph], fill=BLUSH_2)
    print("照片没读到，用空框占位：%s" % e)

# 拱门描边
d.arc([px, py, px + pw, py + pw], 180, 360, fill=RED_LT, width=3)
d.line([px, py + r, px, py + ph], fill=RED_LT, width=3)
d.line([px + pw, py + r, px + pw, py + ph], fill=RED_LT, width=3)
d.line([px, py + ph, px + pw, py + ph], fill=RED_LT, width=3)

# ---------- 姓名夹囍（版式和首页一致）----------
y = py + ph + 76
nw_g = d.textlength(groom, font=f_name)
nw_b = d.textlength(bride, font=f_name)
bb = d.textbbox((0, 0), "囍", font=f_xi_mid)
xw = bb[2] - bb[0]
gap = 44
total = nw_g + gap + xw + gap + nw_b
x = W / 2 - total / 2
d.text((x, y + 6), groom, font=f_name, fill=RED_MID)
d.text((x + nw_g + gap - bb[0], y - 6), "囍", font=f_xi_mid, fill=RED)
d.text((x + nw_g + gap + xw + gap, y + 6), bride, font=f_name, fill=RED_MID)

# 地点（只给村名，不给完整地址和时间——具体的留在请柬里）
y += 104
if venue:
    center(d, W / 2, y, venue, f_venue, INK_SOFT, spacing=6)

# 细分隔
y += 62
d.line([W / 2 - 84, y, W / 2 + 84, y], fill=RED_LT, width=1)
d.rectangle([W / 2 - 5, y - 5, W / 2 + 5, y + 5], fill=RED_LT)

# ---------- 二维码 ----------
y += 48
qsize = 372
buf = io.BytesIO()
segno.make(url, error="h").save(buf, kind="png", scale=20, border=0,
                                dark="#A81E17", light="#FFF8F3")
buf.seek(0)
qimg = Image.open(buf).convert("RGB").resize((qsize, qsize), Image.NEAREST)
pad = 26
plate = (W - qsize) / 2 - pad
d.rectangle([plate, y - pad, plate + qsize + pad * 2, y + qsize + pad], fill=CREAM)
d.rectangle([plate, y - pad, plate + qsize + pad * 2, y + qsize + pad], outline=RED_LT, width=2)
card.paste(qimg, (int((W - qsize) / 2), int(y)))

# 二维码正中的囍（error="h" 纠错撑得住）
c = qsize * 0.19
cx0, cy0 = (W - c) / 2, y + (qsize - c) / 2
d.rectangle([cx0, cy0, cx0 + c, cy0 + c], fill=CREAM)
f_xi2 = font(KAI, int(c * 0.74))
bb = d.textbbox((0, 0), "囍", font=f_xi2)
d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], cy0 + c / 2 - (bb[3] - bb[1]) / 2 - bb[1]),
       "囍", font=f_xi2, fill=RED)

# ---------- 引导语：不写日期地点，只说「都在里面」 ----------
y += qsize + pad + 56
center(d, W / 2, y, "长 按 识 别 二 维 码", f_tip, RED, spacing=2)
y += 58
center(d, W / 2, y, "婚礼时间 · 地点 · 导航都在请柬里", f_small, INK_SOFT, spacing=1)

out = os.path.join(IMGDIR, "qr-card.png")
card.save(out, "PNG", optimize=True)

import shutil
shutil.copy(out, os.path.join(ROOT, "婚礼邀请函二维码.png"))
print("已生成：")
print("  dist/assets/img/qr-card.png")
print("  婚礼邀请函二维码.png（根目录，可直接发微信）")
print("  链接 %s" % url)
