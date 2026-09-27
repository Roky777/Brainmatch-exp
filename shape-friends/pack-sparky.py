"""Normalize generated strips with the installed sprite pipeline; pack WebP atlases.

Usage: python3 shape-friends/pack-sparky.py GENERATED_SESSION SEED_PNG SKILL_PACKAGE
No image synthesis here: only shared-scale normalization, alpha and atlas packing.
"""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from PIL import Image

generated, seed, package = map(Path, sys.argv[1:])
output = Path(__file__).parent / 'assets' / 'animation'
output.mkdir(parents=True, exist_ok=True)
sources = {'wave': 'exec-620e5bff-b528-41cc-a69e-7b88042d1279.png',
           'think': 'exec-25a98aa8-571e-4eca-842a-18cc51589e50.png',
           'cheer': 'exec-10303f30-2a96-495d-a341-f2888bc839ea.png'}
metadata = {}
with tempfile.TemporaryDirectory(prefix='sparky-normalized-') as work:
    for name, source in sources.items():
        frames = Path(work) / name
        subprocess.run([sys.executable, str(package/'scripts/normalize_sprite_strip.py'),
                        '--input', str(generated/source), '--out-dir', str(frames),
                        '--frames', '4', '--frame-size', '384', '--anchor', str(seed)], check=True)
        sheet = Image.new('RGBA', (1536, 384))
        bounds = []
        for index, frame in enumerate(sorted(frames.glob('*.png'))):
            image = Image.open(frame).convert('RGBA')
            bounds.append(image.getchannel('A').getbbox())
            sheet.alpha_composite(image, (index*384, 0))
        sheet.save(output/f'{name}.webp', quality=92, method=6)
        subprocess.run([sys.executable, str(package/'scripts/render_sprite_preview_sheet.py'),
                        '--frames-dir', str(frames), '--out', f'/tmp/sparky-{name}-preview.png', '--columns', '4'], check=True)
        metadata[name] = {'file': f'{name}.webp', 'frames': 4, 'frameSize': 384, 'bounds': bounds}
(output/'atlas.json').write_text(json.dumps(metadata, indent=2)+'\n')
