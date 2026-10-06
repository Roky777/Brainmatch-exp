from pathlib import Path
import json, shutil, zipfile, math
import numpy as np
from PIL import Image, ImageDraw, ImageCms
from scipy.ndimage import map_coordinates, gaussian_filter, binary_dilation, label
from scipy.interpolate import RBFInterpolator
ROOT=Path(__file__).resolve().parents[1]
BASE=np.array(Image.open(ROOT/'sources/master_neutral.png').convert('RGBA'))
KEY=np.array(Image.open(ROOT/'sources/gesture_key_aligned.png').convert('RGBA'))
Y,X=np.mgrid[:512,:512]; profile=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
# A local arm cage: two drawn endpoints; hand and sleeve landmarks deform together.
S=np.array([[280,205],[395,205],[395,318],[280,318],[291,217],[297,217],[305,219],[293,235],[296,251],[300,263],
 [312,237],[322,254],[331,268],[304,283],[308,295],[319,298],[338,277],[323,283],[317,290],
 [328,288],[340,283],[351,282],[359,284],[366,288],[368,293],[362,298],[351,300],[340,298],[330,295]],float)
T=np.array([[280,205],[395,205],[395,318],[280,318],[291,217],[297,217],[305,219],[293,235],[296,251],[300,263],
 [322,235],[339,251],[342,273],[321,281],[339,292],[351,291],[352,247],[341,254],[340,275],
 [349,268],[355,260],[364,247],[368,245],[385,266],[382,274],[374,281],[364,283],[352,276],[346,272]],float)
def pm(a):
 a=a.astype(float)/255;return np.dstack((a[:,:,:3]*a[:,:,3,None],a[:,:,3]))
def rgba(p):
 al=np.clip(p[:,:,3],0,1);c=np.divide(p[:,:,:3],al[:,:,None],out=np.zeros_like(p[:,:,:3]),where=al[:,:,None]>1e-8)
 a=np.dstack((np.clip(c,0,1),al));return np.uint8(np.round(a*255))
# Crop only the free arm. The original torso, hips and legs remain behind the rig.
maskim=Image.new('L',(512,512));ImageDraw.Draw(maskim).polygon([(291,214),(292,235),(295,252),(299,267),(306,282),(306,307),(395,307),(395,211)],fill=255)
M=np.array(maskim,float)/255
M[Y<216]=0
# Feather only the shoulder attachment, not the external silhouette.
attachment=np.clip((X-291)/8,0,1);M*=np.where(Y<266,attachment,1)
P=pm(BASE);Q=pm(KEY);A=P*M[:,:,None];B=Q*M[:,:,None]
bg=P*(1-(M>=.999)[:,:,None])
# Removing the source arm must not erase any hanging-leg pixel.
M[Y>=303]=0;A=P*M[:,:,None];B=Q*M[:,:,None];bg=P*(1-(M>=.999)[:,:,None])
def poly(points):
 im=Image.new('L',(512,512));ImageDraw.Draw(im).polygon(points,fill=255);return np.array(im,float)/255
vy,vx=np.mgrid[207:309,285:397];queries=np.c_[vx.ravel(),vy.ravel()]
def deform(p,ctrl,dest):
 r=RBFInterpolator(dest,ctrl-dest,kernel='thin_plate_spline',smoothing=.1)(queries)
 coords=queries+r;o=np.zeros_like(p)
 for k in range(4):o[207:309,285:397,k]=map_coordinates(p[:,:,k],[coords[:,1],coords[:,0]],order=1,mode='constant',cval=0).reshape(vx.shape)
 return o
def arm(t):
 if t<=0:return P.copy()
 dst=S*(1-t)+T*t
 # A small curved lift gives the wrist a smooth path rather than a straight slide.
 dst[10:,0]+=1.8*math.sin(t*math.pi);dst[10:,1]-=1.2*math.sin(t*math.pi)
 a=deform(A,S,dst);b=deform(B,T,dst)
 # One drawn arm per pose: resting hand for lift/contact, palm-up hand for the conversational beat. Never crossfade two glove outlines.
 p=a if t<.3 else b
 # Composite one selected drawing over the unchanged torso.
 return p+bg*(1-p[:,:,3,None])
# Wand, glove and forearm rotate together in a small relaxed dip, never a cast.
wi=Image.new('L',(512,512));ImageDraw.Draw(wi).polygon([(139,161),(184,161),(184,207),(195,208),(204,218),(217,230),(217,244),(209,273),(186,280),(160,253),(154,218),(139,205)],fill=255)
WM=np.array(wi,float)/255
WM*=np.where(X>207,np.clip((219-X)/12,0,1),1)
WP=P*WM[:,:,None]
def wand(p,weight):
 if weight==0:return p
 theta=math.radians(-20*weight);cx,cy=211.,230.
 sx=cx+(X-cx)*math.cos(theta)+(Y-cy)*math.sin(theta)
 sy=cy-(X-cx)*math.sin(theta)+(Y-cy)*math.cos(theta)
 layer=np.zeros_like(WP)
 for k in range(4):layer[:,:,k]=map_coordinates(WP[:,:,k],[sy,sx],order=1,mode='constant',cval=0)
 back=p*(1-(WM>=.999)[:,:,None]);return layer+back*(1-layer[:,:,3,None])
def bell(x0,y0,x1,y1):
 u=np.clip((X-x0)/(x1-x0),0,1);v=np.clip((Y-y0)/(y1-y0),0,1)
 return np.sin(np.pi*u)**2*np.sin(np.pi*v)**2*((X>x0)&(X<x1)&(Y>y0)&(Y<y1))
chest=bell(211,213,303,249);tip=bell(252,28,318,103)
def acting(p,angle,breath,tipmove,brow):
 # Rotate the flame drawing around the mouth pivot, feathering back to its fixed neck.
 theta=math.radians(angle);cx,cy=261.484,180.684
 w=np.clip((216-Y)/18,0,1)*((X>184)&(X<380)&(Y<216)&((Y<208)|(X>219)))
 # The smile and its surrounding skin stay exact for the independent mouth overlay.
 dist=np.maximum(np.abs(X-cx)/24,np.abs(Y-cy)/17)
 w*=np.clip((dist-.7)/.55,0,1)
 sx=cx+(X-cx)*math.cos(theta)+(Y-cy)*math.sin(theta)
 sy=cy-(X-cx)*math.sin(theta)+(Y-cy)*math.cos(theta)
 dx=(sx-X)*w;dy=(sy-Y)*w
 dx-=breath*.009*(X-260)*chest;dy+=breath*.75*chest
 dy+=tipmove*.6*tip
 dy+=brow*.9*(bell(222,112,256,144)+bell(282,118,317,148))
 active=(np.abs(dx)+np.abs(dy))>1e-8
 out=p.copy();yy,xx=np.where(active)
 for k in range(4):out[yy,xx,k]=map_coordinates(p[:,:,k],[yy+dy[yy,xx],xx+dx[yy,xx]],order=1,mode='constant',cval=0)
 return out
amount=[0,0,0,0,.14,.42,.74,.94,1,1,.82,.55,.15,.035,.009,0]
angle=[0,.4,2,2,1.9,1.8,1.8,1.8,1.6,1.6,1.2,.7,.3,.1,.03,0]
breath=[0,.1,.15,.1,.12,.18,.18,.15,.1,.12,.1,.1,.08,.06,.02,0]
brows=[0,.05,.1,.12,.15,.2,.25,.3,.3,.9,.55,.3,.15,.08,.03,0]
tips=[0,0,0,0,0,0,0,0,0,0,0,0,.08,.2,.12,0]
dip=[0,0,0,.65,1,1,1,1,1,1,.85,.65,.35,0,0,0]
ticks=[8,2,2,2,2,2,2,3,24,3,2,2,2,2,3,12];dur=[v*1000/24 for v in ticks]
# Exact locks exclude the wand, which intentionally dips and returns.
locked=[(248,173,279,189),(174,300,308,382),(248,280,280,310)]
frames=[];records=[]
def centroid(m):
 yy,xx=np.where(m);assert len(xx)>0;return [round(float(xx.mean()),3),round(float(yy.mean()),3)]
def anchors(a,i):
 rgb=a[:,:,:3].astype(float);alpha=a[:,:,3]>200
 white=(rgb.min(2)>180)&((rgb.max(2)-rgb.min(2))<65)&alpha
 blue=(rgb[:,:,2]>70)&(rgb[:,:,2]>rgb[:,:,0]*1.45)&(rgb[:,:,0]<90)&alpha
 dark=(rgb.max(2)<100)&alpha
 gold=(rgb[:,:,0]>200)&(rgb[:,:,1]>145)&(rgb[:,:,2]<120)&alpha
 def box(x0,y0,x1,y1):return (X>=x0)&(X<x1)&(Y>=y0)&(Y<y1)
 def moving_box(x0,y0,x1,y1):
  theta=math.radians(-20*dip[i]);cx,cy=211.,230.
  sx=cx+(X-cx)*math.cos(theta)+(Y-cy)*math.sin(theta)
  sy=cy-(X-cx)*math.sin(theta)+(Y-cy)*math.cos(theta)
  return (sx>=x0)&(sx<x1)&(sy>=y0)&(sy<y1)
 return {'seatAnchor':[256,300],'mouthAnchor':centroid(dark&box(248,173,279,190)),
 'wandHandPivot':centroid(white&moving_box(165,207,203,257)),'wandTip':centroid(gold&moving_box(142,165,183,200)),
 'freeHand':centroid(white&box(311,215,389,305)),
 'leftFoot':centroid(blue&box(172,339,241,379)),'rightFoot':centroid(blue&box(248,345,308,383))}
for i in range(16):
 a=BASE.copy() if i in [0,15] else rgba(acting(wand(arm(amount[i]),dip[i]),angle[i],breath[i],tips[i],brows[i]))
 for x0,y0,x1,y1 in locked:a[y0:y1,x0:x1]=BASE[y0:y1,x0:x1]
 # Discard only disconnected alpha dust; retain the main character drawing.
 lab,n=label(a[:,:,3]>4);sz=np.bincount(lab.ravel());main=lab==(1+sz[1:].argmax());keep=binary_dilation(main,iterations=2)
 if i not in [0,15]:a[~keep]=0
 for x0,y0,x1,y1 in locked:a[y0:y1,x0:x1]=BASE[y0:y1,x0:x1]
 a[a[:,:,3]==0,:3]=0
 im=Image.fromarray(a,'RGBA');name=f'sparky_wall_invite_turn_{i:03d}.png';im.save(ROOT/name,icc_profile=profile)
 frames.append(im);records.append({'index':i,'file':name,'durationMs':round(dur[i],6),'previewTicks24fps':ticks[i],'headInclinationDegrees':angle[i],'wandDipDegrees':-20*dip[i],'boundingBox':list(im.getchannel('A').getbbox()),'anchors':anchors(a,i)})
# Atlas contains exact numbered frames, labels belong only in the separate review sheet.
atlas=Image.new('RGBA',(2048,2048));sheet=Image.new('RGB',(896,960),'#f7efdf');d=ImageDraw.Draw(sheet)
for i,im in enumerate(frames):
 atlas.paste(im,(i%4*512,i//4*512));sm=im.resize((208,208),Image.Resampling.LANCZOS);x=i%4*224+8;y=i//4*240+4;sheet.paste(sm,(x,y),sm);d.text((x+4,y+214),f'{i:03d} · {dur[i]:.0f} ms',fill='#243750')
atlas.save(ROOT/'sparky_wall_invite_turn_atlas.png',icc_profile=profile);sheet.save(ROOT/'contact_sheet.png',icc_profile=profile)
frames[0].save(ROOT/'transparent_preview.png',save_all=True,append_images=frames[1:],duration=dur,loop=1,disposal=0,blend=0,icc_profile=profile)
# Temporary wall belongs only to previews; y300 is the shared seat plane.
def preview(im,size=512):
 if size==512:
  bg=Image.new('RGB',(640,560),'#f7efdf');d=ImageDraw.Draw(bg);d.rectangle((42,340,598,510),fill='#cdbba1');d.rectangle((42,340,598,347),fill='#e3d3bc');bg.paste(im,(64,40),im)
 else:
  bg=Image.new('RGB',(260,240),'#f7efdf');d=ImageDraw.Draw(bg);dim=round(512*100/350);line=round(55+300*dim/512);d.rectangle((30,line,230,210),fill='#cdbba1');d.rectangle((30,line,230,line+2),fill='#e3d3bc');sm=im.resize((dim,dim),Image.Resampling.LANCZOS);bg.paste(sm,(55,55),sm)
 return bg
wall=[preview(im) for im in frames];small=[preview(im,100) for im in frames]
wall[0].save(ROOT/'wall_composite_preview.png',save_all=True,append_images=wall[1:],duration=dur,loop=0)
small[0].save(ROOT/'preview_100px.png',save_all=True,append_images=small[1:],duration=dur,loop=0)
# Idle→invite→idle includes the actual approved idle images, not regenerated substitutes.
IDLE=ROOT/'sources/approved_idle_reference';idle=[Image.open(IDLE/f'sparky_wall_idle_blink_{i:03d}.png').convert('RGBA') for i in range(16)]
idur=[900,120,120,160,140,450,70,42,42,42,84,42,42,42,180,850]
seq=[preview(v) for v in idle]+wall+[preview(v) for v in idle];sd=idur+dur+idur
seq[0].save(ROOT/'idle_invite_idle_preview.png',save_all=True,append_images=seq[1:],duration=sd,loop=0)
# A single GIF palette makes cream and clothing colors stable across frames.
pal=Image.new('RGB',(640,560*len(wall)));[pal.paste(v,(0,j*560)) for j,v in enumerate(wall)];palette=pal.quantize(colors=240)
gif=[v.quantize(palette=palette,dither=Image.Dither.NONE) for v in wall]
gif[0].save(ROOT/'wall_composite_preview.gif',save_all=True,append_images=gif[1:],duration=dur,loop=0,disposal=1)
sg=[v.quantize(palette=palette,dither=Image.Dither.NONE) for v in small];sg[0].save(ROOT/'preview_100px.gif',save_all=True,append_images=sg[1:],duration=dur,loop=0,disposal=1)
# CFR previews repeat each source pose for its specified number of 24fps ticks.
vdir=ROOT/'sources/video_frames';vdir.mkdir(exist_ok=True)
for j,i in enumerate([i for _ in range(3) for i,n in enumerate(ticks) for _ in range(n)]):wall[i].save(vdir/f'{j:04d}.png')
hdir=ROOT/'sources/handoff_video_frames';hdir.mkdir(exist_ok=True);j=0
for im,duration in zip(seq,sd):
 for _ in range(max(1,round(duration*24/1000))):im.save(hdir/f'{j:04d}.png');j+=1
# Visual checks: endpoint overlay plus cream/navy transparent-edge view.
edge=Image.new('RGB',(1024,512));
for j,col in enumerate(['#f7efdf','#122445']):
 bgim=Image.new('RGB',(512,512),col);bgim.paste(frames[8],(0,0),frames[8]);edge.paste(bgim,(j*512,0))
edge.save(ROOT/'edge_check.png')
manifest={'clip':'sparky_wall_invite_turn','canvas':{'width':512,'height':512},'colorSpace':'sRGB','alphaFormat':'straight/unmatted RGBA','coordinateSystem':'top-left, frame-local pixels',
 'construction':'Locked approved neutral master. Local arm cage interpolates a drawn neutral arm and a generated palm-up key drawing; local head/chest/flame deformation and rigid local wand/forearm dip. No full-frame translation/scaling. Closed mouth pixels, seat and legs are protected; wand returns to exact rest. Not 16 independently hand-drawn poses.',
 'frameRate':24,'timingMode':'variable durations expressed as 24fps ticks','durationMs':round(sum(dur),6),'loop':{'enabled':False,'mode':'one-shot','start':0,'end':15},'neutralHoldFrames':[0,15],'inviteHoldFrame':8,'recoveryStartFrame':10,'safeHandoffFrames':[0,15],
 'speech':{'mouthMode':'closed neutral throughout; runtime visemes separate','mouthReplacementRegion':[248,173,279,189],'holdPolicy':'frame8 INVITE_HOLD may remain onscreen during the child invitation line; release into frame9 then recover from frame10; neutral mouth stays fixed'},
 'wallPlaneY':300,'anchorMeasurement':'seatAnchor (256,300) is the inherited authored registration point, not a guessed measured anatomical joint. All other anchors are measured from each exported PNG: dark-smile pixel centroid; white wand grip centroid; gold star centroid as wand-tip/spawn point; free white glove centroid; blue shoe centroids. The grip/star measurement regions follow the rendered rigid dip and return to the identical idle measurement windows at neutral. ROI definitions are in sources/render_frames.py.',
 'frames':records,'atlas':{'file':'sparky_wall_invite_turn_atlas.png','columns':4,'rows':4,'cellWidth':512,'cellHeight':512,'paddingBetweenCells':0}}
manifest['events']={'NEUTRAL':[0,15],'INVITE_HOLD':8,'WARM_BROW_ACCENT':9,'RECOVERY_START':10,'WAND_NEUTRAL':13,'IDLE_HANDOFF':15}
manifest['productionStatus']='Export validated; rigged wrist-turn transitions and actual game/viseme integration need production review.'
(ROOT/'animation-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
arrays=[np.array(v) for v in frames]
assert np.array_equal(arrays[0],BASE) and np.array_equal(arrays[-1],BASE)
for i,a in enumerate(arrays):
 b=records[i]['boundingBox'];assert min(b[0],b[1],512-b[2],512-b[3])>=24
 for x0,y0,x1,y1 in locked:assert np.array_equal(a[y0:y1,x0:x1],BASE[y0:y1,x0:x1]),(i,'lock')
 for key in ['seatAnchor','mouthAnchor','leftFoot','rightFoot']:assert records[i]['anchors'][key]==records[0]['anchors'][key],(i,key)
qa={'frames':16,'size512':True,'atlasSize':[2048,2048],'allFramesMin24pxPadding':True,'neutralStartAndEndPixelIdenticalToApprovedIdle000':True,'mouthPatchSeatLegsPixelLock':True,'wandReturnsExactlyToNeutral':True,'measuredAnchorLock':True,'transparentPixelsRGBZero':all(np.all(a[a[:,:,3]==0,:3]==0) for a in arrays),'uniqueRasterFrames':len({a.tobytes() for a in arrays}),'productionLimit':'Rigged drawing interpolation;  visual pose continuity must be reviewed alongside the supplied previews. Game UI placement and actual viseme atlas integration are not tested.'}
lengths=[float(np.linalg.norm(np.array(r['anchors']['wandTip'])-r['anchors']['wandHandPivot'])) for r in records]
# Two thresholded raster centroids need not preserve an exact geometric length after resampling. The wand layer itself uses rotation only, scale 1.
qa['rigidWandTransform']={'scale':1,'rotationOnly':True,'pivot':[211,230]}
qa['wandGripToStarCentroidDistancePx']={'minimum':min(lengths),'maximum':max(lengths),'rasterTolerancePx':.75}
assert max(lengths)-min(lengths)<.75
for i in [0,1,2,13,14,15]:
 for k in ['wandHandPivot','wandTip']:assert records[i]['anchors'][k]==records[0]['anchors'][k],(i,k)
(ROOT/'qa-report.json').write_text(json.dumps(qa,indent=2)+'\n')
print(json.dumps(qa,indent=2));print('Duration',sum(dur))
