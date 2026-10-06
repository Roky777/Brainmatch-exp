from pathlib import Path
import json,math,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageCms
from scipy.ndimage import map_coordinates,label,binary_dilation
R=Path(__file__).resolve().parents[1]
PROFILE=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
BASE=np.array(Image.open(R/'sources/approved_idle_000.png').convert('RGBA'))
Y,X=np.mgrid[:512,:512]
def pm(a):
 a=a.astype(float)/255;return np.dstack((a[:,:,:3]*a[:,:,3,None],a[:,:,3]))
def rgba(p):
 a=np.clip(p[:,:,3],0,1);rgb=np.divide(p[:,:,:3],a[:,:,None],out=np.zeros_like(p[:,:,:3]),where=a[:,:,None]>1e-8)
 q=np.uint8(np.round(np.dstack((np.clip(rgb,0,1),a))*255));q[q[:,:,3]==0,:3]=0;return q
P=pm(BASE)
def polygon(points):
 m=Image.new('L',(512,512));ImageDraw.Draw(m).polygon(points,fill=255);return np.array(m,float)/255
# The shoulder seam follows the approved kimono's right side; torso, sash and legs stay from the original.
REMOVE=polygon([(291,216),(292,235),(295,252),(299,267),(306,282),(306,303),(395,303),(395,216)])
REMOVE*=np.where(Y<266,np.clip((X-291)/8,0,1),1)
ARM_POLYS={
 6:[(294,216),(306,217),(322,231),(339,253),(341,284),(329,290),(312,289),(304,278),(299,266),(283,265),(282,244),(287,235),(294,234)],
 7:[(285,195),(300,192),(313,199),(318,218),(332,232),(341,249),(341,269),(330,276),(313,276),(302,268),(299,248),(293,237),(280,226),(278,210)]}
ARMS={}
for i in [6,7]:
 a=np.array(Image.open(R/'sources'/f'new_arm_{i:03d}_registered.png').convert('RGBA'));m=polygon(ARM_POLYS[i]);warm=(a[:,:,0]>90)&(a[:,:,0]>a[:,:,2].astype(float)*1.4);m[warm]=0
 layer=pm(a)*m[:,:,None];ARMS[i]=layer
 Image.fromarray(rgba(layer)).save(R/'sources'/f'isolated_new_arm_{i:03d}.png',icc_profile=PROFILE)

def bell(x0,y0,x1,y1):
 u=np.clip((X-x0)/(x1-x0),0,1);v=np.clip((Y-y0)/(y1-y0),0,1);return np.sin(np.pi*u)**2*np.sin(np.pi*v)**2*((X>x0)&(X<x1)&(Y>y0)&(Y<y1))
def pupil_field(cx,cy,rx,ry,ex,ey,erx,ery):
 r=np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2);f=np.clip((1.25-r)/.5,0,1);e=np.sqrt(((X-ex)/erx)**2+((Y-ey)/ery)**2);return f*np.clip((.96-e)/.13,0,1)
EF=pupil_field(235,158,13,17,229,156,20,21)+pupil_field(298,164,15,18,305,164,23,23)
BF0=bell(222,112,256,145);BF1=bell(281,119,318,150)
HW=[0,0,1,1,1,.75,.65,.5,.55,.4,.55,.65,1,1,1,1]
GW=[0,1,1,1,1,.6,.6,.52,.52,.34,.55,1,1,1,1,1]
BW=[0,0,.12,.6,.6,.42,.35,-.5,-.65,-.35,.25,.4,.42,.48,.5,.5]
SETTINGS={'left':[-3,1.7,-2],'center':[0,2.2,2],'right':[3,1.7,2]}
LOCK=[(248,173,279,189),(174,300,309,384),(248,280,280,310),(140,164,184,205),(162,204,207,261)]
def new_frame(i,v):
 gx,gy,deg=SETTINGS[v];sx=X-gx*GW[i]*EF;sy=Y-gy*GW[i]*EF+BW[i]*.85*BF0+BW[i]*.65*BF1
 face=np.stack([map_coordinates(P[:,:,k],[sy,sx],order=1,mode='constant',cval=0) for k in range(4)],2)
 theta=math.radians(deg*HW[i]);cx,cy=261.484,180.684
 w=np.clip((216-Y)/18,0,1)*((X>184)&(X<380)&(Y<216)&((Y<208)|(X>219)));distance=np.maximum(np.abs(X-cx)/24,np.abs(Y-cy)/17);w*=np.clip((distance-.7)/.55,0,1)
 rx=cx+(X-cx)*math.cos(theta)+(Y-cy)*math.sin(theta);ry=cy-(X-cx)*math.sin(theta)+(Y-cy)*math.cos(theta)
 p=np.stack([map_coordinates(face[:,:,k],[Y+(ry-Y)*w,X+(rx-X)*w],order=1,mode='constant',cval=0) for k in range(4)],2)
 back=p*(1-REMOVE[:,:,None]);arm=ARMS[i];p=arm+back*(1-arm[:,:,3,None]);a=rgba(p)
 for x0,y0,x1,y1 in LOCK:a[y0:y1,x0:x1]=BASE[y0:y1,x0:x1]
 a[a[:,:,3]==0,:3]=0;return a

TICKS=[6,2,2,2,12,2,2,2,3,3,2,2,2,2,12,2]
DUR=[250,83.333,83.333,83.333,500,83.333,83.333,83.333,125,125,83.333,83.333,83.333,83.333,500,83.333]
def anchors(a):
 rgb=a[:,:,:3].astype(float);opaque=a[:,:,3]>200
 white=(rgb.min(2)>180)&(rgb.max(2)-rgb.min(2)<65)&opaque
 dark=(rgb.max(2)<100)&opaque;gold=(rgb[:,:,0]>200)&(rgb[:,:,1]>145)&(rgb[:,:,2]<120)&opaque
 blue=(rgb[:,:,2]>70)&(rgb[:,:,2]>rgb[:,:,0]*1.45)&(rgb[:,:,0]<90)&opaque
 def box(x0,y0,x1,y1):return (X>=x0)&(X<x1)&(Y>=y0)&(Y<y1)
 def centroid(m,largest=False):
  if largest:
   l,n=label(m);sz=np.bincount(l.ravel());assert n;m=l==1+sz[1:].argmax()
  y,x=np.where(m);assert len(x);return [round(float(x.mean()),4),round(float(y.mean()),4)]
 return {'seatAnchor':[256,300],'mouthAnchor':centroid(dark&box(248,173,279,190)),'wandHandPivot':centroid(white&box(165,207,203,257)),
 'wandTip':centroid(gold&box(142,165,183,200)),'freeHand':centroid(white&box(278,190,379,307),True),
 'leftFoot':centroid(blue&box(172,339,241,379)),'rightFoot':centroid(blue&box(248,345,308,383))}
def wall(im,small=False):
 if not small:
  b=Image.new('RGB',(640,560),'#f7efdf');d=ImageDraw.Draw(b);d.rectangle((42,340,598,510),fill='#cdbba1');d.rectangle((42,340,598,347),fill='#e3d3bc');b.paste(im,(64,40),im)
 else:
  b=Image.new('RGB',(220,224),'#f7efdf');d=ImageDraw.Draw(b);dim=146;line=round(38+300*dim/512);d.rectangle((15,line,205,210),fill='#cdbba1');d.rectangle((15,line,205,line+2),fill='#e3d3bc');s=im.resize((dim,dim),Image.Resampling.LANCZOS);b.paste(s,(37,38),s)
 return b
def apng(path,fs,ds,loop=0):fs[0].save(path,save_all=True,append_images=fs[1:],duration=ds,loop=loop,disposal=0,blend=0,icc_profile=PROFILE)
def gif(path,fs,ds):
 strip=Image.new('RGB',(fs[0].width,fs[0].height*len(fs)));[strip.paste(im,(0,k*im.height)) for k,im in enumerate(fs)];pal=strip.quantize(colors=240);f=[im.quantize(palette=pal,dither=Image.Dither.NONE) for im in fs];f[0].save(path,save_all=True,append_images=f[1:],duration=ds,loop=0,disposal=1)
allframes={};variants={};handoff={};records=[]
for v in SETTINGS:
 d=R/v;d.mkdir(exist_ok=True);fs=[];rows=[]
 for i in range(16):
  if i==0:a=BASE.copy()
  elif i in [6,7]:a=new_frame(i,v)
  elif i==15:a=np.array(Image.open(R/'sources'/f'wand_pick_{v}_000.png').convert('RGBA'))
  else:
   old=Image.open(R/'sources'/f'reference_poses_{v}.png').convert('RGBA');a=np.array(old.crop((i%4*512,i//4*512,(i%4+1)*512,(i//4+1)*512)))
  im=Image.fromarray(a);fn=f'sparky_wall_observe_think_{v}_{i:03d}.png';im.save(d/fn,icc_profile=PROFILE)
  with Image.open(d/fn) as decoded:decoded.load();assert decoded.size==(512,512) and decoded.mode=='RGBA' and np.array_equal(np.array(decoded),a)
  fs.append(im);anc=anchors(a);bb=list(im.getchannel('A').getbbox());assert min(bb[0],bb[1],512-bb[2],512-bb[3])>=24,(v,i,bb)
  for x0,y0,x1,y1 in LOCK:assert np.array_equal(a[y0:y1,x0:x1],BASE[y0:y1,x0:x1]),(v,i,'pixel lock')
  rows.append({'index':i,'file':f'{v}/{fn}','durationMs':DUR[i],'previewTicks24fps':TICKS[i],**anc,'boundingBox':bb,'construction':'new drawn glove/sleeve, registered on original body' if i in [6,7] else 'exact supplied handoff master' if i==15 else 'approved neutral' if i==0 else 'existing registered rigged pose'})
 atlas=Image.new('RGBA',(2048,2048));review=Image.new('RGB',(896,960),'#f7efdf');dr=ImageDraw.Draw(review)
 for i,im in enumerate(fs):
  atlas.paste(im,(i%4*512,i//4*512));s=im.resize((208,208),Image.Resampling.LANCZOS);x=i%4*224+8;y=i//4*240+4;review.paste(s,(x,y),s);marker=' OBSERVE' if i==4 else ' CHOOSE' if i==14 else ' HANDOFF' if i==15 else ' NEW' if i in [6,7] else '';dr.text((x,y+214),f'{v} {i:03d}{marker}',fill='#263951')
 atlas.save(R/f'atlas_{v}.png',icc_profile=PROFILE);review.save(R/f'contact_sheet_{v}.png',icc_profile=PROFILE)
 aa=np.array(Image.open(R/f'atlas_{v}.png'));assert aa.shape==(2048,2048,4)
 for i,im in enumerate(fs):assert np.array_equal(aa[i//4*512:(i//4+1)*512,i%4*512:(i%4+1)*512],np.array(im))
 # The action is a one-shot. Repeated review previews include a neutral bridge after the exact ending pose, clearly separate from runtime frames.
 previews=fs+list(reversed(fs[5:14]))+[fs[0]];pd=DUR+[100]*9+[700]
 apng(R/f'transparent_preview_{v}.png',previews,pd)
 wf=[wall(im) for im in previews];apng(R/f'wall_preview_{v}.png',wf,pd);gif(R/f'wall_preview_{v}.gif',wf,pd)
 hd=np.array(Image.open(R/'sources'/f'wand_pick_{v}_000.png').convert('RGBA'));assert np.array_equal(np.array(fs[15]),hd);handoff[v]=True
 variants[v]={'frameCount':16,'frames':rows,'OBSERVE_HOLD':4,'CHOOSE_HOLD':14,'WAND_PICK_HANDOFF':15,'frame015PixelIdenticalToWandPick000':True,'atlas':{'file':f'atlas_{v}.png','columns':4,'rows':4,'cellSize':[512,512]},'loop':False,'safeHandoffFrames':[0,4,14,15]};allframes[v]=fs;records.extend(rows)
 # Actual default timeline at24fps, without the review-only reset bridge.
 vd=R/'sources'/f'video_frames_{v}';vd.mkdir(exist_ok=True);j=0
 for i,n in enumerate(TICKS):
  b=wall(fs[i])
  for _ in range(n):b.save(vd/f'{j:04d}.png');j+=1
comp=[]
for i in range(16):
 b=Image.new('RGB',(660,248),'#f7efdf');dr=ImageDraw.Draw(b)
 for j,v in enumerate(SETTINGS):b.paste(wall(allframes[v][i],True),(j*220,24));dr.text((j*220+90,8),v,fill='#263951')
 comp.append(b)
gif(R/'variants_100px.gif',comp,DUR);apng(R/'variants_100px.png',comp,DUR,loop=0)
edges=Image.new('RGB',(1024,1536))
for row,i in enumerate([6,7,8]):
 for col,color in enumerate(['#f7efdf','#162b46']):
  b=Image.new('RGB',(512,512),color);b.paste(allframes['center'][i],(0,0),allframes['center'][i]);edges.paste(b,(col*512,row*512))
edges.save(R/'edge_review_006_007_008.png')
bodyregion=(Y>=216)
for i in range(16):
 a=np.array(allframes['center'][i])
 for v in SETTINGS:assert np.array_equal(a[bodyregion],np.array(allframes[v][i])[bodyregion]),(v,i,'variant body')
qa={'numberedPngs':48,'frame006And007PresentAllVariants':True,'allDecoded512RgbaWithSRgbProfile':True,'exactAtlasCellComparisons':48,'neutralStartPixelIdentical':True,'handoff015PixelIdenticalToWandPick000':handoff,'bodyPixelsBelow216IdenticalAcrossVariants':True,'seatFeetSashWandMouthPixelLocks':True,'minimumPaddingPixels':min(min(p['boundingBox'][0],p['boundingBox'][1],512-p['boundingBox'][2],512-p['boundingBox'][3]) for p in records),'gloveAnatomy':'New006/007 drawings require visual inspection; automatic pixel checks cannot count stylized fingers.','actualGameTested':False}
(R/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n')
manifest={'clip':'sparky_wall_observe_think_v2','variantNames':list(SETTINGS),'frameCountPerVariant':16,'totalNumberedFrames':48,'canvas':[512,512],'frameRate':24,'alpha':'straight RGBA','colorSpace':'sRGB','coordinateSystem':'top-left, frame-local pixels','wallPlaneY':300,'durationMs':sum(DUR),'events':{'OBSERVE_HOLD':4,'CHOOSE_HOLD':14,'WAND_PICK_HANDOFF':15},'variants':variants,'frame015PixelIdenticalConfirmation':handoff,'anchorMeasurement':'SeatAnchor[256,300] is the user-authored registration. All other anchors are measured opaque-pixel centroids within specified semantic regions; free glove uses its largest white connected component, shoe anchors use their blue pixels. WandTip is the attached gold star centroid for effect spawning, not an outer pointed vertex. Bounding boxes are alpha-support bounds, exclusive right/bottom.','holdPolicy':'Hold004 for an actually revealed card, then resume remembering legal observations. Hold014 until legal game choice is ready, then015 starts the corresponding wand-pick. Variants come from game logic; no hidden-card identity is inferred by art.','safeInterruption':'Pause freezes frame; Home cancels.0 is neutral.4 and14 are extendable holds.15 is exact wand-pick handoff.','previewNotes':'Transparent repeatedAPNG and wallGIF/APNG previews append a review-only reversed-pose reset, not additional delivered runtime frames. MP4 and game-size GIF show the default one-shot timeline at24fps; restarting the comparison GIF is a review cut, not a neutral handoff.','construction':'Original approved neutral and existing registered local rig poses. Frames006/007 use new generated arm drawings, isolated, uniformly registered and composited onto the unchanged source body/head. Not48 independently hand-drawn full characters. Source art and prompts included.','endpointConstraint':'Supplied wand-pick000 has the glove near the chin. Exact handoff is preserved, so the hand return ends in that supplied raised-hand pose rather than ledge rest.','productionStatus':'Complete48-frame export and exact endpoint checks. Glove/sleeve motion requires animator review; actual game integration untested.','qaReport':'qa-report.json'}
(R/'animation-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(qa,indent=2))
