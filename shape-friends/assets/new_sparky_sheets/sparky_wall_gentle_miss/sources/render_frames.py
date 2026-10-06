from pathlib import Path
import math,json
import numpy as np
from PIL import Image,ImageDraw,ImageCms
from scipy.ndimage import map_coordinates,label,binary_dilation
from scipy.interpolate import RBFInterpolator
ROOT=Path(__file__).resolve().parents[1]
BASE=np.array(Image.open(ROOT/'sources/master_neutral.png').convert('RGBA'));KEY=np.array(Image.open(ROOT/'sources/gesture_key_aligned.png').convert('RGBA'))
Y,X=np.mgrid[:512,:512];profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
def pm(a):
 a=a.astype(float)/255;return np.dstack((a[:,:,:3]*a[:,:,3,None],a[:,:,3]))
def rgba(p):
 al=np.clip(p[:,:,3],0,1);c=np.divide(p[:,:,:3],al[:,:,None],out=np.zeros_like(p[:,:,:3]),where=al[:,:,None]>1e-8)
 a=np.uint8(np.round(np.dstack((np.clip(c,0,1),al))*255));a[a[:,:,3]==0,:3]=0;return a
def poly(points):
 im=Image.new('L',(512,512));ImageDraw.Draw(im).polygon(points,fill=255);return np.array(im,float)/255
M=poly([(291,216),(292,235),(295,252),(299,267),(306,282),(306,303),(410,303),(410,216)])
M*=np.where(Y<266,np.clip((X-291)/8,0,1),1)
P=pm(BASE);Q=pm(KEY);A=P*M[:,:,None];B=Q*M[:,:,None]
S=np.array([[280,205],[415,205],[415,312],[280,312],[291,217],[297,217],[305,219],[293,235],[296,251],[300,263],
 [312,237],[322,254],[331,268],[304,283],[308,295],[319,298],[338,277],[323,283],[317,290],
 [328,288],[340,283],[351,282],[359,284],[366,288],[368,293],[362,298],[351,300],[340,298],[330,295]],float)
# Peak control points are corrected from the aligned local key drawing during setup.
T=np.array(json.loads((ROOT/'sources/peak-controls.json').read_text()),float)
vy,vx=np.mgrid[207:310,285:415];query=np.c_[vx.ravel(),vy.ravel()]
def deform(p,ctrl,dst):
 d=RBFInterpolator(dst,ctrl-dst,kernel='thin_plate_spline',smoothing=1)(query);c=query+d;o=np.zeros_like(p)
 for k in range(4):o[207:310,285:415,k]=map_coordinates(p[:,:,k],[c[:,1],c[:,0]],order=1,mode='constant',cval=0).reshape(vx.shape)
 return o
def arm(t):
 if t<=0:return P.copy()
 dst=S*(1-t)+T*t;dst[10:,1]-=1.4*math.sin(math.pi*t)
 a=deform(A,S,dst) if t<.3 else deform(B,T,dst)
 back=P*(1-(M>=.999)[:,:,None]);p=a+back*(1-a[:,:,3,None])
 # Preserve a plain shoulder fold where the local cage would curl an interior line into a ring.
 if .3<t<.9:
  patch=bell(305,230,337,265)*math.sin(math.pi*t)*((P[:,:,3]>.97)&(p[:,:,3]>.97))
  p=p*(1-patch[:,:,None])+P*patch[:,:,None]
 return p
def bell(x0,y0,x1,y1):
 u=np.clip((X-x0)/(x1-x0),0,1);v=np.clip((Y-y0)/(y1-y0),0,1);return np.sin(math.pi*u)**2*np.sin(math.pi*v)**2*((X>x0)&(X<x1)&(Y>y0)&(Y<y1))
def sample(p,sx,sy):return np.stack([map_coordinates(p[:,:,k],[sy,sx],order=1,mode='constant',cval=0) for k in range(4)],2)
def act(p,eye,brows,smile,chest,feet,angle,gaze):
 sx=X.astype(float).copy();sy=Y.astype(float).copy()
 # Small local widening, not a different face or an expanded head.
 for cx,cy,rx,ry in [(230,156,23,24),(303,164,26,25)]:
  r=np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2);w=np.clip((1.2-r)/.25,0,1)
  sy-=(Y-cy)*eye*.05*w;sx-=(X-cx)*eye*.05*w
  inner=np.clip((.8-r)/.3,0,1);sx+=gaze*.8*inner;sy-=gaze*.65*inner
 sy+=brows*1.5*(bell(222,112,256,145)+bell(281,119,318,150))
 # Keep the smile's pivot fixed while subtly widening its curved drawing.
 mw=bell(243,168,285,194);sx-=(X-261.484)*smile*.07*mw
 sy+=chest*.9*bell(211,210,304,250)
 fw=np.clip((Y-334)/12,0,1)*((X>174)&(X<309)&(Y<384));sx-=feet*1.5*fw;sy-=feet*.7*fw
 p=sample(p,sx,sy)
 th=math.radians(angle);cx,cy=261.484,180.684
 w=np.clip((216-Y)/18,0,1)*((X>184)&(X<380)&(Y<216)&((Y<208)|(X>219)))
 dist=np.maximum(np.abs(X-cx)/24,np.abs(Y-cy)/17);w*=np.clip((dist-.7)/.55,0,1)
 rx=cx+(X-cx)*math.cos(th)+(Y-cy)*math.sin(th);ry=cy-(X-cx)*math.sin(th)+(Y-cy)*math.cos(th)
 return sample(p,X+(rx-X)*w,Y+(ry-Y)*w)
amount=[0,0,0,0,0,0,0,0,0,.62,1,.53,.18,.05,.01,0]
eyes=[0,0,1,1,1,1,.65,.35,.15,.1,.1,.05,0,0,0,0]
angles=[0,0,0,.5,2,2,1.6,1.1,.8,.6,.4,.2,0,0,0,0]
gaze=[0,1,1,1,1,1,.65,.3,0,0,0,0,0,0,0,0]
brows=[0,0,.15,1,1,.95,.6,.3,.25,.25,.25,.2,.15,.06,.01,0]
smiles=[0,0,0,0,0,0,.2,.6,1,1,1,.8,.5,.2,.04,0]
chest=[0,0,0,0,0,0,0,0,.03,.06,.08,.07,.06,.04,.01,0]
feet=[0]*16
ticks=[8,1,1,1,1,3,1,1,1,2,8,2,2,2,2,10];dur=[n*1000/24 for n in ticks]
LOCK=[(248,280,280,311),(174,300,309,384),(140,164,184,205),(162,204,207,261)]
def anchors(a):
 rgb=a[:,:,:3].astype(float);al=a[:,:,3]>200;white=(rgb.min(2)>180)&((rgb.max(2)-rgb.min(2))<65)&al;dark=(rgb.max(2)<100)&al;gold=(rgb[:,:,0]>200)&(rgb[:,:,1]>145)&(rgb[:,:,2]<120)&al;blue=(rgb[:,:,2]>70)&(rgb[:,:,2]>rgb[:,:,0]*1.45)&(rgb[:,:,0]<90)&al
 def box(x0,y0,x1,y1):return (X>=x0)&(X<x1)&(Y>=y0)&(Y<y1)
 def cen(m):
  yy,xx=np.where(m);assert len(xx)>0;return [round(float(xx.mean()),3),round(float(yy.mean()),3)]
 return {'seatAnchor':[256,300],'mouthAnchor':[261.484,180.684],'measuredSmileCentroid':cen(dark&box(248,173,279,190)),'wandHandPivot':cen(white&box(165,207,203,257)),'wandTip':cen(gold&box(142,165,183,200)),'freeHand':cen(white&box(311,215,410,305)),'leftFoot':cen(blue&box(172,339,243,381)),'rightFoot':cen(blue&box(248,345,310,384))}
frames=[];records=[]
for i in range(16):
 a=BASE.copy() if i in [0,15] else rgba(act(arm(amount[i]),eyes[i],brows[i],smiles[i],chest[i],feet[i],angles[i],gaze[i]))
 if i not in [0,15]:
  lab,n=label(a[:,:,3]>4);sz=np.bincount(lab.ravel());keep=binary_dilation(lab==(1+sz[1:].argmax()),iterations=2);a[~keep]=0
 for x0,y0,x1,y1 in LOCK:a[y0:y1,x0:x1]=BASE[y0:y1,x0:x1]
 name=f'sparky_wall_gentle_miss_{i:03d}.png';im=Image.fromarray(a,'RGBA');im.save(ROOT/name,icc_profile=profile);frames.append(im)
 records.append({'index':i,'file':name,'durationMs':dur[i],'previewTicks24fps':ticks[i],'anchors':anchors(a),'headTiltDegrees':angles[i],'eyeWideningScale':1+.05*eyes[i],'pupilRegisterWeight':gaze[i],'boundingBox':list(im.getchannel('A').getbbox())})
atlas=Image.new('RGBA',(2048,2048));sheet=Image.new('RGB',(896,960),'#f7efdf');d=ImageDraw.Draw(sheet)
for i,im in enumerate(frames):
 atlas.paste(im,(i%4*512,i//4*512));sm=im.resize((208,208),Image.Resampling.LANCZOS);x=i%4*224+8;y=i//4*240+4;sheet.paste(sm,(x,y),sm);d.text((x,y+214),f'{i:03d}'+(' REASSURE_HOLD' if i==10 else ''),fill='#263951')
atlas.save(ROOT/'sparky_wall_gentle_miss_atlas.png',icc_profile=profile);sheet.save(ROOT/'contact_sheet.png',icc_profile=profile)
frames[0].save(ROOT/'transparent_preview.png',save_all=True,append_images=frames[1:],duration=dur,loop=1,disposal=0,blend=0,icc_profile=profile)
def preview(im,small=False):
 if small:
  b=Image.new('RGB',(260,240),'#f7efdf');d=ImageDraw.Draw(b);dim=146;line=round(55+300*dim/512);d.rectangle((30,line,230,210),fill='#cdbba1');d.rectangle((30,line,230,line+2),fill='#e3d3bc');sm=im.resize((dim,dim),Image.Resampling.LANCZOS);b.paste(sm,(55,55),sm)
 else:
  b=Image.new('RGB',(640,560),'#f7efdf');d=ImageDraw.Draw(b);d.rectangle((42,340,598,510),fill='#cdbba1');d.rectangle((42,340,598,347),fill='#e3d3bc');b.paste(im,(64,40),im)
 return b
wall=[preview(im) for im in frames];small=[preview(im,True) for im in frames]
wall[0].save(ROOT/'wall_composite_preview.png',save_all=True,append_images=wall[1:],duration=dur,loop=0)
small[0].save(ROOT/'preview_100px.png',save_all=True,append_images=small[1:],duration=dur,loop=0)
strip=Image.new('RGB',(640,560*16));[strip.paste(v,(0,j*560)) for j,v in enumerate(wall)];pal=strip.quantize(colors=240)
for seq,name in [(wall,'wall_composite_preview.gif'),(small,'preview_100px.gif')]:
 gf=[v.quantize(palette=pal,dither=Image.Dither.NONE) for v in seq];gf[0].save(ROOT/name,save_all=True,append_images=gf[1:],duration=dur,loop=0,disposal=1)
vd=ROOT/'sources/video_frames';vd.mkdir(exist_ok=True)
for j,i in enumerate([i for i,n in enumerate(ticks) for _ in range(n)]):wall[i].save(vd/f'{j:04d}.png')
edge=Image.new('RGB',(1024,512))
for j,col in enumerate(['#f7efdf','#122445']):
 b=Image.new('RGB',(512,512),col);b.paste(frames[8],(0,0),frames[8]);edge.paste(b,(j*512,0))
edge.save(ROOT/'edge_check.png')
manifest={'clip':'sparky_wall_gentle_miss','canvas':[512,512],'colorSpace':'sRGB','alpha':'straight RGBA','coordinateSystem':'top-left, frame-local pixels','frameRate':24,'durationMs':sum(dur),'wallPlaneY':300,'events':{'SURPRISE_HOLD':5,'REASSURE_HOLD':10,'RECOVERY_START':11,'NEUTRAL_HANDOFF':15},'safeHandoffFrames':[0,15],'loop':{'enabled':False},'use':'Brief response to an actual missed pair, then encouragement. Game logic owns turn handoff. No frown, tears or disapproval.',
 'anchorMeasurement':'seatAnchor is inherited authored registration, not guessed anatomy. mouthAnchor is the neutral smile pixel-centroid pivot; smile changes about that fixed point, with its current measured centroid supplied separately. Other anchors are measured exported pixel centroids. wandTip is center of attached golden star. Measurement windows in source code.',
 'construction':'Locked neutral master, generated local waist-level palm key, local arm-cage interpolation; 5% eye widening field, small pupil registration, lifted brows, 2degree head tilt and encouraging smile. Legs and wand fixed. Rigged draft, not16 independently hand-drawn poses.','productionStatus':'Requires visual animator review and game integration check.','frames':records,'atlas':{'file':'sparky_wall_gentle_miss_atlas.png','columns':4,'rows':4,'cellSize':[512,512]}}
(ROOT/'animation-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
qa={'frameCount':16,'neutralEndpointsMatchIdle':True,'minimumPaddingPx':512,'wandSeatPixelLocked':True}
assert np.array_equal(np.array(frames[0]),BASE) and np.array_equal(np.array(frames[15]),BASE)
for i,im in enumerate(frames):
 a=np.array(im);b=records[i]['boundingBox'];pad=min(b[0],b[1],512-b[2],512-b[3]);qa['minimumPaddingPx']=min(qa['minimumPaddingPx'],pad);assert pad>=24,(i,b)
 for x0,y0,x1,y1 in LOCK:assert np.array_equal(a[y0:y1,x0:x1],BASE[y0:y1,x0:x1]),i
(ROOT/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n');print(json.dumps(qa,indent=2))
