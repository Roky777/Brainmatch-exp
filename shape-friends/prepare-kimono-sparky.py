"""Package the five user-supplied kimono Sparky sheets for the game.

Each animation sheet has a 4 x 3 grid of 362 px cells. The separate sleeve
comes from the single-piece illustration and is cropped without repainting.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).parent / 'assets' / 'sparky'
names = {
    'expressions': 'ChatGPT Image Sep 28, 2026, 10_05_35 PM-2.png',
    'reach': 'ChatGPT Image Sep 28, 2026, 10_05_37 PM-3.png',
    'reactions': 'ChatGPT Image Sep 28, 2026, 10_05_39 PM-4.png',
    'peek': 'ChatGPT Image Sep 28, 2026, 10_05_40 PM-5.png',
}
for name, source in names.items():
    image = Image.open(root / source).convert('RGBA')
    if image.size != (1448, 1086):
        raise ValueError(f'{source}: expected 1448x1086, got {image.size}')
    image.save(root / f'kimono-{name}-v1.webp', format='WEBP', quality=88, method=6)

parts = Image.open(root / 'ChatGPT Image Sep 28, 2026, 10_05_34 PM-1.png').convert('RGBA')
arm = parts.crop((340, 685, 835, 1045))
bounds = arm.getchannel('A').getbbox()
if not bounds:
    raise ValueError('Separate kimono sleeve has no visible pixels')
arm = arm.crop(bounds)
for x in range(420, arm.width):
    for y in range(0, min(40, arm.height)):
        arm.putpixel((x, y), (0, 0, 0, 0))
arm.crop((165, 0, arm.width, arm.height)).save(root / 'kimono-sleeve-v1.webp', format='WEBP', quality=92, method=6)
arm.crop((0, 0, 230, arm.height)).save(root / 'kimono-glove-v1.webp', format='WEBP', quality=92, method=6)
print('Packed four 4x3 atlases, sleeve and glove')
