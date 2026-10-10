import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cards=fileURLToPath(new URL('../assets/cards/',import.meta.url));
const layouts={
  2:[[142,256],[370,256]],
  3:[[162,154],[350,154],[256,350]],
  4:[[150,150],[362,150],[150,362],[362,362]],
  5:[[116,150],[256,150],[396,150],[180,350],[332,350]],
  6:[[108,150],[256,150],[404,150],[108,358],[256,358],[404,358]],
  7:[[80,150],[198,150],[316,150],[434,150],[138,358],[256,358],[374,358]],
  8:[[76,150],[196,150],[316,150],[436,150],[76,358],[196,358],[316,358],[436,358]],
};
const sizes={2:184,3:156,4:146,5:122,6:114,7:102,8:98};
const jobs=[
  ['apple',2],['apple',3],['apple',4],['apple',6],
  ['bird',4],['bird',6],['flower',5],['flower',8],['ball',6],['star',7],
];

for(const [kind,count] of jobs){
  const size=sizes[count];
  const split=Array.from({length:count},(_,i)=>`o${i}`).join('][');
  const filters=[`[0:v]scale=${size}:${size},format=rgba,split=${count}[${split}]`,`color=c=black:s=512x512,format=rgba,colorchannelmixer=aa=0[base]`];
  let previous='base';
  layouts[count].forEach(([cx,cy],index)=>{
    const next=index===count-1?'final':`layer${index}`;
    filters.push(`[${previous}][o${index}]overlay=${cx-size/2}:${cy-size/2}:format=auto[${next}]`);
    previous=next;
  });
  const result=spawnSync('ffmpeg',['-loglevel','error','-y','-i',`${cards}/source-${kind}.png`,'-filter_complex',filters.join(';'),'-map','[final]','-frames:v','1',`${cards}/${kind==='apple'?'apples':kind==='bird'?'birds':kind==='flower'?'flowers':kind==='ball'?'balls':'stars'}-${count}.png`],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
