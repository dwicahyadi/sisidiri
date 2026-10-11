"""Optimasi aset lokal: python3 + Pillow. Commit hasil WebP/JPG sebelum deploy."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
assets = root / 'public/assets'
for source in [assets / 'home.png', *sorted((assets / 'types').glob('*.png'))]:
    image = Image.open(source).convert('RGBA')
    image.thumbnail((1200, 800) if source.name == 'home.png' else (600, 600))
    target = source.with_suffix('.webp')
    image.save(target, 'WEBP', quality=83, method=4)
    print(f'{target.relative_to(root)}: {target.stat().st_size // 1024} KB')

canvas = Image.new('RGB', (1200, 630), '#f7f8f2')
draw = ImageDraw.Draw(canvas)
font = lambda size: ImageFont.truetype('DejaVuSans.ttf', size)
bold = lambda size: ImageFont.truetype('DejaVuSans-Bold.ttf', size)
draw.text((70, 50), 'SisiDiri', font=bold(28), fill='#244e46')
draw.text((70, 175), 'Yuk, kenali', font=bold(60), fill='#244e46')
draw.text((70, 255), 'dirimu lebih dekat.', font=bold(51), fill='#244e46')
draw.text((74, 380), 'Kuis kepribadian sekitar 3 menit', font=font(25), fill='#57685d')
draw.text((74, 423), 'Tanpa akun', font=font(25), fill='#57685d')
image = Image.open(assets / 'types/INFJ.png').convert('RGBA')
image.thumbnail((380, 410))
canvas.paste(image, (790, 145), image)
canvas.save(assets / 'og-sisidiri.jpg', quality=89, optimize=True)
