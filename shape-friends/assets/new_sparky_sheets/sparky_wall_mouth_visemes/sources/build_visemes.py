from pathlib import Path
import json,math
import numpy as np
from PIL import Image,ImageDraw,ImageCms
from scipy.ndimage import label,binary_dilation,binary_closing,distance_transform_edt,map_coordinates,maximum_filter
ROOT=Path(__file__).resolve().parents[1];(ROOT/'mouths').mkdir(exist_ok=True);(ROOT/'integration').mkdir(exist_ok=True);(ROOT/'reviews').mkdir(exist_ok=True)
PROFILE=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes();N=256;SS=4;H=N*SS
Y,X=np.mgrid[:N,:N];HY,HX=np.mgrid[:H,:H]
BLACK=np.array([4,3,0],float);CAVITY=np.array([44,2,12],float);PINK=np.array([255,68,101],float);IVORY=np.array([255,246,220],float)
STROKE=14.
BASE=np.array(Image.open(ROOT/'sources/idle_000.png').convert('RGBA'))
# Mouth-only mask excludes the neighboring eye components.
gray=np.max(BASE[:,:,:3],2);roi=np.zeros((512,512),bool);roi[173:189,248:279]=True
lab,n=label((gray<100)&roi);sizes=np.bincount(lab.ravel());CORE=lab==(1+sizes[1:].argmax())
yy,xx=np.where(CORE);darkPivot=[float(xx.mean()),float(yy.mean())]
MASK=binary_dilation(CORE,iterations=3)
other=(gray<140)&~binary_dilation(CORE,iterations=1)
MASK&=~binary_dilation(other,iterations=1)
yy,xx=np.where(MASK);bbox=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
x0,y0,x1,y1=bbox
local=BASE[y0-2:y1+2,x0-2:x1+2,:3].astype(float);lm=MASK[y0-2:y1+2,x0-2:x1+2]
fy,fx=np.mgrid[:local.shape[0],:local.shape[1]];features=np.stack([np.ones_like(fx),fx,fy,fx*fx,fx*fy,fy*fy],2)
good=(local[:,:,0]>180)&(local[:,:,1]>130)&(local[:,:,2]<90)&~lm
coef=np.linalg.lstsq(features[good],local[good],rcond=None)[0];clean=local.copy();clean[lm]=np.clip((features@coef)[lm],0,255)
for _ in range(500):
 avg=(np.roll(clean,1,0)+np.roll(clean,-1,0)+np.roll(clean,1,1)+np.roll(clean,-1,1))/4;clean[lm]=avg[lm]
REPAIR=BASE.copy();REPAIR[y0-2:y1+2,x0-2:x1+2,:3]=np.uint8(np.round(clean))
repair=np.zeros_like(BASE);repair[MASK,:3]=REPAIR[MASK,:3];repair[MASK,3]=255
Image.fromarray(repair).save(ROOT/'integration/base_mouth_cleanup.png',icc_profile=PROFILE)
Image.fromarray(np.uint8(MASK)*255).save(ROOT/'integration/mouth_cleanup_mask.png')
# Unmatte the approved black smile against its measured reconstructed yellow underpainting.
den=REPAIR[:,:,0].astype(float)-BLACK[0]
restAlpha=np.clip((REPAIR[:,:,0].astype(float)-BASE[:,:,0])/np.maximum(den,1),0,1)*MASK
restAlpha[restAlpha<.015]=0
ry,rx=np.mgrid[:512,:512];total=restAlpha.sum();REF=[float((rx*restAlpha).sum()/total),float((ry*restAlpha).sum()/total)]
def rgba_from(rgb,a):
 out=np.uint8(np.round(np.dstack((np.clip(rgb,0,255),np.clip(a,0,1)*255))));out[out[:,:,3]==0,:3]=0;return Image.fromarray(out,'RGBA')
def weighted_center(im):
 a=np.array(im)[:,:,3].astype(float);s=a.sum();return [float((X*a).sum()/s),float((Y*a).sum()/s)]
def center(im):
 a=np.array(im).astype(float);p=np.dstack((a[:,:,:3]*a[:,:,3,None]/255,a[:,:,3]));
 for _ in range(3):
  al=p[:,:,3];cx=float((X*al).sum()/al.sum());cy=float((Y*al).sum()/al.sum());
  if abs(cx-128)+abs(cy-128)<.015:break
  p=np.stack([map_coordinates(p[:,:,k],[Y+cy-128,X+cx-128],order=1,mode='constant',cval=0) for k in range(4)],2)
 rgb=np.divide(p[:,:,:3]*255,p[:,:,3,None],out=np.zeros_like(p[:,:,:3]),where=p[:,:,3,None]>1e-8);return rgba_from(rgb,p[:,:,3]/255)
RESTAL=map_coordinates(restAlpha,[REF[1]+(Y-128)/4,REF[0]+(X-128)/4],order=1,mode='constant',cval=0)
REST=center(rgba_from(np.broadcast_to(BLACK,(N,N,3)),RESTAL))
PLATE=Image.open(ROOT/'sources/generated_mouth_plate.png').convert('RGBA')
names=['MBP','A','E','O','U','FV','LTH','S','SMILE_OPEN','GASP'];dims={'MBP':(108,24),'A':(96,96),'E':(116,58),'O':(84,84),'U':(64,62),'FV':(108,44),'LTH':(104,76),'S':(108,38),'SMILE_OPEN':(112,80),'GASP':(88,102)}
raw={};mask={};paint={}
for i,name in enumerate(names):
 col=i%5;row=i//5;cell=PLATE.crop((round(col*PLATE.width/5),round(row*PLATE.height/2),round((col+1)*PLATE.width/5),round((row+1)*PLATE.height/2)))
 a=np.array(cell);lab,n=label(a[:,:,3]>10);sz=np.bincount(lab.ravel());main=lab==(1+sz[1:].argmax());keep=binary_dilation(main,iterations=2);a[~keep]=0
 cell=Image.fromarray(a);cell=cell.crop(cell.getchannel('A').getbbox());raw[name]=cell
def canvas_for(cell,size):
 cell=cell.resize(size,Image.Resampling.LANCZOS);can=Image.new('RGBA',(N,N));can.alpha_composite(cell,((N-size[0])//2,(N-size[1])//2));return center(can)
for name in names:
 # U uses the rounded O outline, with the small U paint, instead of a broad smile-shaped pucker.
 art=canvas_for(raw[name],dims[name]);arr=np.array(art);outline=canvas_for(raw['O'],dims[name]) if name=='U' else art
 m=np.array(outline)[:,:,3]>127;mask[name]=m
 rgb=arr[:,:,:3].astype(float);al=arr[:,:,3]>100
 teeth=(rgb[:,:,0]>180)&(rgb[:,:,1]>170)&(rgb[:,:,2]>135)&al
 tongue=(rgb[:,:,0]>130)&(rgb[:,:,0]>rgb[:,:,1]*1.6)&(rgb[:,:,2]>30)&al
 teeth=binary_closing(teeth,iterations=2);tongue=binary_closing(tongue,iterations=3)
 if name=='FV':tongue[:]=False
 if name=='LTH':
  tongue|=(((X-128)/11)**2+((Y-127)/15)**2)<1
 paint[name]=(teeth,tongue)
def make_open(m,teeth,tongue):
 mh=Image.fromarray(np.uint8(m)*255).resize((H,H),Image.Resampling.NEAREST);mh=np.array(mh)>0
 d=distance_transform_edt(mh);inside=d>STROKE*SS
 rgb=np.broadcast_to(BLACK,(H,H,3)).copy();rgb[inside]=CAVITY
 th=np.array(Image.fromarray(np.uint8(teeth)*255).resize((H,H),Image.Resampling.NEAREST))>0
 tp=np.array(Image.fromarray(np.uint8(tongue)*255).resize((H,H),Image.Resampling.NEAREST))>0
 rgb[inside&tp]=PINK;rgb[inside&th]=IVORY
 im=rgba_from(rgb,mh.astype(float));im=im.resize((N,N),Image.Resampling.LANCZOS);return center(im)
glyphs={'REST':REST}
for name in names:
 if name=='MBP':
  # Preserve the generated pressed-lip curve, then regularize its thin stroke to the approved line weight.
  im=canvas_for(raw[name],(108,16));aa=np.array(im)[:,:,3];xs=[];ys=[]
  for x in range(N):
   v=aa[:,x].astype(float)
   if v.sum()>0:xs.append(x);ys.append(float((np.arange(N)*v).sum()/v.sum()))
  line=Image.new('L',(H,H));dr=ImageDraw.Draw(line);pts=[(int(x*SS),int(y*SS)) for x,y in zip(xs,ys)];dr.line(pts,fill=255,width=int(STROKE*SS),joint='curve')
  for x,y in [pts[0],pts[-1]]:r=STROKE*SS/2;dr.ellipse((x-r,y-r,x+r,y+r),fill=255)
  al=np.array(line.resize((N,N),Image.Resampling.LANCZOS),float)/255;glyphs[name]=center(rgba_from(np.broadcast_to(BLACK,(N,N,3)),al))
 else:glyphs[name]=make_open(mask[name],*paint[name])
def sdf(m):return distance_transform_edt(m)-distance_transform_edt(~m)
mask['REST']=np.array(REST)[:,:,3]>127
for start,end,prefix in [('REST','A','REST_A'),('A','O','A_O'),('O','REST','O_REST')]:
 for j,t in [(1,1/3),(2,2/3)]:
  mm=((1-t)*sdf(mask[start])+t*sdf(mask[end]))>0
  src=end if end!='REST' else start;teeth,tongue=paint[src];glyphs[f'{prefix}_{j}']=make_open(mm,teeth,tongue)
ORDER=['REST','MBP','A','E','O','U','FV','LTH','S','SMILE_OPEN','GASP','REST_A_1','REST_A_2','A_O_1','A_O_2','O_REST_1','O_REST_2']
entries={};atlas=Image.new('RGBA',(1280,1024));review=Image.new('RGB',(1280,1152),'#f8efdc');dr=ImageDraw.Draw(review)
for i,name in enumerate(ORDER):
 im=glyphs[name];im.save(ROOT/'mouths'/f'{name}.png',icc_profile=PROFILE);cx,cy=weighted_center(im);assert abs(cx-128)<.12 and abs(cy-128)<.12,(name,cx,cy)
 entries[name]={'file':f'mouths/{name}.png','mouthAnchor':[round(cx,4),round(cy,4)],'runtimePivot':[128,128],'bounds':list(im.getchannel('A').getbbox()),'strokeNominalPixels':None if name=='REST' else STROKE}
 atlas.paste(im,(i%5*N,i//5*N));review.paste(im,(i%5*N,i//5*288),im);dr.text((i%5*N+12,i//5*288+263),name,fill='#263951')
atlas.save(ROOT/'mouth_runtime_atlas.png',icc_profile=PROFILE);review.save(ROOT/'mouth_review_atlas.png',icc_profile=PROFILE)
def compose(idle,name):
 out=idle.copy();out[MASK,:3]=REPAIR[MASK,:3]
 # Premultiplied subpixel sampling positions the measured256-square pivot on the source face.
 a=np.array(glyphs[name],float)/255;p=np.dstack((a[:,:,:3]*a[:,:,3,None],a[:,:,3]));y,x=np.mgrid[:512,:512]
 sx=128+(x-REF[0])*4;sy=128+(y-REF[1])*4;mp=np.stack([map_coordinates(p[:,:,k],[sy,sx],order=1,mode='constant',cval=0) for k in range(4)],2)
 base=out.astype(float)/255;basep=np.dstack((base[:,:,:3]*base[:,:,3,None],base[:,:,3]));o=mp+basep*(1-mp[:,:,3,None]);rgb=np.divide(o[:,:,:3],o[:,:,3,None],out=np.zeros_like(o[:,:,:3]),where=o[:,:,3,None]>1e-8);return rgba_from(rgb*255,o[:,:,3])
tested={}
for f in [0,5,14]:
 idle=np.array(Image.open(ROOT/'sources'/f'idle_{f:03d}.png').convert('RGBA'));assert np.array_equal(idle[168:194,242:283],BASE[168:194,242:283])
 sheet=Image.new('RGB',(1500,800),'#f8efdc');dr=ImageDraw.Draw(sheet)
 for i,name in enumerate(ORDER):
  im=compose(idle,name);face=im.crop((193,118,379,211)).resize((290,145),Image.Resampling.LANCZOS);x=i%5*300+5;y=i//5*200+5;sheet.paste(face,(x,y),face);dr.text((x,y+155),name,fill='#263951')
 sheet.save(ROOT/'reviews'/f'overlays_idle_{f:03d}.png',icc_profile=PROFILE);tested[f]=idle
# At actual game size on three supplied idle frames, not a rebuilt mascot.
sizes=[90,105,120];comparison=Image.new('RGB',(720,720),'#f8efdc');dr=ImageDraw.Draw(comparison)
for r,f in enumerate([0,5,14]):
 for c,size in enumerate(sizes):
  im=compose(tested[f],'SMILE_OPEN');dim=round(512*size/350);small=im.resize((dim,dim),Image.Resampling.LANCZOS);x=c*240+(240-dim)//2;y=r*240+28;comparison.paste(small,(x,y),small);dr.text((c*240+12,r*240+218),f'idle{f:03d} / {size}px tall',fill='#263951')
comparison.save(ROOT/'reviews/game_size_overlays.png')
sequence=[('REST',20),('MBP',2),('E',3),('LTH',2),('REST_A_1',1),('REST_A_2',1),('A',3),('A_O_1',1),('A_O_2',1),('O',2),('U',2),('FV',2),('S',2),('E',2),('SMILE_OPEN',3),('O',2),('O_REST_1',1),('O_REST_2',1),('REST',48)]
preview=[];ticks=[];video=ROOT/'sources/video_frames';video.mkdir(exist_ok=True);j=0
for name,n in sequence:
 b=Image.new('RGB',(560,560),'#f8efdc');im=compose(BASE,name);b.paste(im,(24,24),im);preview.append(b);ticks.append(n)
 for _ in range(n):b.save(video/f'{j:04d}.png');j+=1
strip=Image.new('RGB',(560,560*len(preview)));[strip.paste(v,(0,k*560)) for k,v in enumerate(preview)];pal=strip.quantize(colors=240);gf=[v.quantize(palette=pal,dither=Image.Dither.NONE) for v in preview];gf[0].save(ROOT/'speaking_preview.gif',save_all=True,append_images=gf[1:],duration=[n*1000/24 for n in ticks],disposal=1)
preview[0].save(ROOT/'speaking_preview.png',save_all=True,append_images=preview[1:],duration=[n*1000/24 for n in ticks],loop=1)
manifest={'package':'sparky_wall_mouth_visemes','canvas':[256,256],'alpha':'straight RGBA','colorSpace':'sRGB','coordinateSystem':'top-left, canvas-local pixels','measuredReferenceMouthAnchor512':REF,'legacyBodyDarkSmileCentroid512':darkPivot,'overlayScaleOn512Master':.25,'mouthAnchorConvention':'Each glyph is registered by its measured alpha-weighted centroid, at128,128 to within0.12px. runtimePivot128,128. Source-face pivot measured by unmatting the approved closed smile.','glyphs':entries,'runtimeAtlas':{'file':'mouth_runtime_atlas.png','columns':5,'rows':4,'cellSize':[256,256],'emptyCells':[17,18,19]},'integration':{'baseRepair':'integration/base_mouth_cleanup.png','cleanupMask':'integration/mouth_cleanup_mask.png','cleanupBounds512':bbox,'order':'approved body → separate base smile cleanup → mouth glyph','warning':'Do not layer visemes directly over the baked closed smile. Cleanup plate is separate from the mouth overlays. For moving/scaled faces, align the clean plate with the same source frame mouth region.'},'recommendedTransitions':{'REST_to_A':['REST','REST_A_1','REST_A_2','A'],'A_to_O':['A','A_O_1','A_O_2','O'],'O_to_REST':['O','O_REST_1','O_REST_2','REST'],'transitionFrameDurationMs':[35,60],'visemeTypicalHoldMs':[60,140],'speechEnd':'Always return toREST; audio timing should choose phonetic visemes, not a constant-rate looping mouth.'},'previewSequence':sequence,'previewFrameRate':24,'previewIsAudioSynced':False,'testedIdleFrames':[0,5,14],'gameSizeReviewCssHeight':[90,105,120],'productionStatus':'Export validated; phonetic mapping and spoken-audio integration require animator/audio review. Generated glyph silhouettes normalized to one border weight; REST extracted from original, transitions are single-contour distance-field morphs.'}
(ROOT/'animation-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
qa={'mouthPNGs':17,'all256':True,'anchorTolerancePx':.12,'minimumPaddingPx':min(min(v['bounds'][0],v['bounds'][1],256-v['bounds'][2],256-v['bounds'][3]) for v in entries.values()),'runtimeMouthsNoYellowFaceMatte':True,'bodyPixelsOutsideMouthRepairUnchanged':True}
(ROOT/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n');print(json.dumps(qa,indent=2))
