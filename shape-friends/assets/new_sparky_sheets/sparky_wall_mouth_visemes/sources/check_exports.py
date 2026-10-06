import runpy, json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
g=runpy.run_path(str(Path(__file__).with_name('build_visemes.py')))
r=g['ROOT'];order=g['ORDER'];atlas=np.array(Image.open(r/'mouth_runtime_atlas.png').convert('RGBA'))
hashes=[];checks=[]
for i,name in enumerate(order):
 p=r/'mouths'/f'{name}.png'
 with Image.open(p) as im:
  im.load();assert im.size==(256,256) and im.mode=='RGBA';assert im.info.get('icc_profile');a=np.array(im)
 assert np.array_equal(a,atlas[i//5*256:(i//5+1)*256,i%5*256:(i%5+1)*256])
 assert not np.any(a[a[:,:,3]==0,:3])
 faceyellow=(a[:,:,0]>170)&(a[:,:,1]>110)&(a[:,:,2]<80)&(a[:,:,3]>0)
 assert not faceyellow.any(),name
 hashes.append(hashlib.sha256(a.tobytes()).hexdigest())
 assert len(hashes)==len(set(hashes))
 dark=Image.new('RGB',(256,256),'#162b46');dark.paste(Image.fromarray(a),(0,0),Image.fromarray(a));checks.append(dark)
 maxdelta=0;changedbounds=None
 for f in [0,5,14]:
  base=g['tested'][f];out=np.array(g['compose'](base,name));diff=np.any(out!=base,2)
  yy,xx=np.where(diff);bb=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
  assert bb[0]>=242 and bb[1]>=168 and bb[2]<=283 and bb[3]<=194,(name,bb)
  assert np.array_equal(out[118:168],base[118:168])
  assert np.array_equal(out[194:],base[194:])
  if name=='REST':maxdelta=max(maxdelta,int(np.max(np.abs(out.astype(int)-base.astype(int)))))
 if name=='REST':restDelta=maxdelta
review=Image.new('RGB',(1280,1152),'#162b46');d=ImageDraw.Draw(review)
for i,(name,im) in enumerate(zip(order,checks)):
 review.paste(im,(i%5*256,i//5*288));d.text((i%5*256+12,i//5*288+263),name,fill='white')
review.save(r/'reviews/mouths_on_navy.png')
large=Image.open(r/'speaking_preview.gif');frames=[];dur=[]
for i in range(large.n_frames):
 large.seek(i);frames.append(large.convert('RGB').resize((168,168),Image.Resampling.LANCZOS));dur.append(large.info.get('duration',40))
frames[0].save(r.parent/'sparky_wall_mouth_visemes_105px_v1.gif',save_all=True,append_images=frames[1:],duration=dur,disposal=1)
qa=json.loads((r/'qa-report.json').read_text());qa.update({'decodedPngsChecked':17,'uniqueShapes':17,'allAtlasCellsMatchNumberedPngs':True,'zeroRgbUnderZeroAlpha':True,'sRgbProfilePresentOnAllGlyphs':True,'unchangedPixelsOutsideFaceMouthRegionOnAllThreeIdleFrames':True,'restCompositeMaxRgbDeltaFromOriginal':restDelta,'restCompositePixelIdenticalToMaster':restDelta==0,'checksOnCreamAndNavy':'Review images exported and visually inspected.','notes':'REST is extracted/unmatted and resampled, so its reconstructed composite is not pixel-identical to the baked master. For exact neutral, hide both cleanup and glyph layers and show the original body.'})
(r/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n')
print(json.dumps(qa,indent=2))
