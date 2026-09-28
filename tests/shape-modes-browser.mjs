// Browser integration QA. Start npm start and an isolated Chrome with
// --headless=new --remote-debugging-port=9223. No browser library dependency.
// node tests/shape-friends-browser.mjs [--full]
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { PACK, ITEMS } from '../shape-friends/content.js';
const endpoint = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9223';
const origin = process.env.GAME_URL || 'http://127.0.0.1:4178';
const tab = await (await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let serial = 0; const pending = new Map(), errors = [], badResponses = [];
ws.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) { const promise = pending.get(message.id); pending.delete(message.id); message.error ? promise.reject(Error(JSON.stringify(message.error))) : promise.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + message.params.exceptionDetails.exception?.description);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400 && !message.params.response.url.endsWith('favicon.ico')) badResponses.push(message.params.response.url);
});
function send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
  if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await evaluate(expression)) return; await delay(100); }
  throw Error(`Timed out: ${expression}`);
}
async function click(selector) {
  const rect = await evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); e.scrollIntoView({block:'nearest'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...rect, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...rect, button: 'left', clickCount: 1 });
  await delay(90); // Allow native click/close events and the next rendered frame.
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(`/tmp/brainmatch-shape-friends-${name}.png`, Buffer.from(result.data, 'base64'));
}
async function viewport(width, height) { await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 700 }); await delay(200); }
async function noOverflow() { assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'horizontal overflow'); }
async function showToy(id) {
  for (let page = 0; page < 4; page++) {
    if (await evaluate(`!document.querySelector('[data-toy="${id}"]').hidden`)) return;
    await click('[data-more-toys]');
  }
  throw Error(`Cannot find discovery ${id}`);
}
async function drag(source, destination, touch = false, cancel = false) {
  const points = await evaluate(`(() => { const get=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}}; return [get(${JSON.stringify(source)}),get(${JSON.stringify(destination)})]; })()`);
  const [start, end] = points;
  const point = position => ({ ...position, id: 1, radiusX: 6, radiusY: 6, force: 1 });
  if (touch) await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(start)] });
  else await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...start, button: 'left', buttons: 1, clickCount: 1 });
  for (let step = 1; step <= 8; step++) {
    const position = { x: start.x + (end.x - start.x) * step / 8, y: start.y + (end.y - start.y) * step / 8 };
    if (touch) await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(position)] });
    else await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...position, button: 'left', buttons: 1 });
    await delay(30);
  }
  if (touch) await send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  else await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...end, button: 'left', buttons: 0, clickCount: 1 });
  await delay(100);
}

await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
await viewport(1440,1000);await send('Page.navigate',{url:origin+'/shape-friends/'});await send('Page.bringToFront');
await until('document.querySelector("#app")?.dataset.mode==="setup"');
await evaluate('localStorage.removeItem("brainmatch:shape-friends:v1");location.reload()');await delay(600);
await until('document.querySelector("#app")?.dataset.mode==="setup"');
await screenshot('setup');
assert.equal(await evaluate('document.querySelector("#app").hasAttribute("aria-pressed")'),false,'Mode and difficulty selectors must target buttons, never the app container');
for(const [width,height] of [[390,844],[375,669],[320,568],[844,390],[667,375],[1024,768],[1920,1080]]){
 await viewport(width,height);await noOverflow();
 assert(await evaluate('document.querySelector("#level-panel").hidden'),'Levels are not on the home menu');
 assert(await evaluate('(()=>{const r=document.querySelector("button[data-play-mode=challenge]").getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()'),'Home menu visible');
 assert(await evaluate('(()=>{const r=document.querySelector("#menu-caption").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})()'),`Sparky caption stays onscreen at ${width}x${height}`);
 await screenshot('setup-'+width+'x'+height);
}
await viewport(1440,1000);
await evaluate('document.querySelector("button[data-play-mode=challenge]").focus()');
await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
assert.equal(await evaluate('document.querySelector("button[data-play-mode=challenge]").getAttribute("aria-pressed")'),'true');
await until('document.querySelector("#setup-view").dataset.step==="levels"');
assert.equal(await evaluate('document.querySelector("#level-title").textContent'),'Beat Sparky');
for(const [width,height] of [[390,844],[320,568],[1440,1000]]){
 await viewport(width,height);await noOverflow();
 const bounds=await evaluate('(()=>{const a=document.querySelector("#back-to-modes").getBoundingClientRect(),b=document.querySelector("#start-game").getBoundingClientRect();return {top:a.top,bottom:b.bottom}})()');
 assert(bounds.top>=0&&bounds.bottom<=height,`Beat Sparky levels visible ${width}x${height}: ${JSON.stringify(bounds)}`);
 await screenshot('beat-sparky-levels-'+width+'x'+height);
}
await click('#back-to-modes');
await click('button[data-play-mode="practice"]');
assert.equal(await evaluate('document.querySelector("#level-title").textContent'),'Practice');
for(const [width,height] of [[390,844],[320,568],[844,390],[667,375],[1440,1000]]){
 await viewport(width,height);await noOverflow();
 const startRect=await evaluate('(()=>{const r=document.querySelector("#start-game").getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight}})()');
 assert(startRect.top>=0&&startRect.bottom<=height,`Level start visible ${width}x${height}: ${JSON.stringify(startRect)}`);
 await screenshot('levels-'+width+'x'+height);
}
await evaluate('(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__playedVoice=this;return play.call(this)}})()');
await click('#start-game');
await until('window.__playedVoice?.currentTime>0');
assert(await evaluate('window.__playedVoice.src.endsWith("practice-start-v1.mp3")'));
const count=await evaluate('(async()=>{const {VOICE_CLIPS}=await import("./audio.js");const c=new AudioContext();for(const path of Object.values(VOICE_CLIPS)){const r=await fetch(path);if(!r.ok)throw Error(path);const b=await c.decodeAudioData(await r.arrayBuffer());if(!b.duration)throw Error(path)}await c.close();return Object.keys(VOICE_CLIPS).length})()');
assert.equal(count,21);
await click('#settings-open');const frame=await evaluate('document.querySelector("#sparky").dataset.frame');await delay(200);
assert.equal(await evaluate('document.querySelector("#sparky").dataset.frame'),frame);
await click('#voice-toggle');await click('#effects-toggle');await click('[data-close]');
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
const touch=await evaluate('(()=>{const r=document.querySelector(".memory-card").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touch,id:1}]});
await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(200);
assert.equal(await evaluate('document.querySelectorAll(".is-open").length'),1);
await send('Emulation.setTouchEmulationEnabled',{enabled:false});
await click('#sparky');await screenshot('dream-first-card');
await click('.home-button');
for(const mode of ['practice','challenge'])for(const [level,size] of [['gentle',4],['growing',6],['clever',8]]){
 await click('button[data-play-mode="'+mode+'"]');await click('button[data-level="'+level+'"]');await click('#start-game');
 assert.equal(await evaluate('document.querySelectorAll(".memory-card").length'),size);
 for(const [width,height] of [[390,844],[320,568],[844,390],[667,375],[1440,1000]]){
   await viewport(width,height);await noOverflow();
   assert(await evaluate('getComputedStyle(document.querySelector("#discovery-strip")).display==="none"'));
   const layout=await evaluate('(()=>{const b=document.querySelector("#cards").getBoundingClientRect(),s=document.querySelector(".speech-bubble").getBoundingClientRect(),c=document.querySelector("#sparky").getBoundingClientRect(),t=document.querySelector(".turn-banner").getBoundingClientRect(),overlap=(a,d)=>a.left<d.right&&a.right>d.left&&a.top<d.bottom&&a.bottom>d.top;return {ok:t.bottom<=b.top&&!overlap(b,s)&&!overlap(b,c)&&(s.right<=c.left+25||s.bottom<=c.top)&&s.bottom<=innerHeight&&c.bottom<=innerHeight,board:[b.x,b.y,b.width,b.height],speech:[s.x,s.y,s.width,s.height],sparky:[c.x,c.y,c.width,c.height],turn:[t.x,t.y,t.width,t.height]}})()');
   if(!layout.ok)await screenshot('layout-fail-'+width+'x'+height);
   assert(layout.ok,mode+' '+level+' layout '+width+' '+JSON.stringify(layout));
   if(mode==='practice'&&level==='gentle'&&width===390)await screenshot('kimono-practice-390x844');
   if(mode==='challenge'&&level==='clever')await screenshot('minimal-'+width+'x'+height);
 }
 await viewport(1440,1000);
 const observations=new Map(),shapeForName=new Map(PACK.rounds[0].pairs.flatMap(([p,a,b])=>[[ITEMS[a].name,p],[ITEMS[b].name,p]]));
 let turns=new Set(),moves=0;const deadline=Date.now()+160000;
 while(Date.now()<deadline){
   const state=await evaluate('({mode:document.querySelector("#app").dataset.mode,actor:document.querySelector("#turn-chip").dataset.actor,cards:[...document.querySelectorAll(".memory-card")].map(e=>({index:+e.dataset.index,label:e.getAttribute("aria-label"),open:e.classList.contains("is-open"),matched:e.classList.contains("is-matched"),enabled:!e.disabled}))})');
   for(const card of state.cards.filter(c=>c.open)){const name=card.label.split(/, matched|, face up/)[0];assert(shapeForName.has(name),name);observations.set(card.index,shapeForName.get(name))}
   turns.add(state.actor);if(state.mode==='result')break;
   const choices=state.cards.filter(c=>c.enabled),selected=state.cards.find(c=>c.open&&!c.matched);
   if(state.actor==='child'&&choices.length){
     let choice;
     if(selected)choice=choices.find(c=>observations.get(c.index)&&observations.get(c.index)===observations.get(selected.index));
     else choice=choices.find(c=>observations.has(c.index)&&choices.some(o=>o.index!==c.index&&observations.get(o.index)===observations.get(c.index)));
     choice||=choices.find(c=>!observations.has(c.index))||choices[0];
     await click('[data-index="'+choice.index+'"]');moves++;
   }
   await delay(100);
 }
 assert.equal(await evaluate('document.querySelector("#app").dataset.mode'),'result');
 if(mode==='practice')assert.deepEqual([...turns],['child']);
 const score=await evaluate('document.querySelector("#result-score").textContent');
 if(mode==='challenge'){const numbers=score.match(/\d+/g).map(Number);assert.equal(numbers[0]+numbers[1],size/2);}
 await screenshot(mode+'-'+level+'-result');
 console.log(mode+' '+level+' completed: '+score+'; '+moves+' child flips.');
 await click('#choose-game');
}
await click('button[data-play-mode="challenge"]');await click('button[data-level="clever"]');
await evaluate('window.__originalRandom=Math.random;Math.random=()=>0');
await click('#start-game');await click('[data-index="0"]');await click('[data-index="1"]');
await until('document.querySelector("#turn-chip").dataset.actor==="sparky"');
await until('document.querySelector("#hand").classList.contains("visible")');
await delay(400);await screenshot('sparky-card-tap');
assert(await evaluate('document.querySelector("#hand").getBoundingClientRect().width>=50'),'Sparky sends a visible card-tap cue');
await click('.home-button');await evaluate('Math.random=window.__originalRandom');
await click('button[data-play-mode="challenge"]');await click('button[data-level="clever"]');await click('#start-game');await click('[data-index="0"]');
await click('.home-button');await delay(1500);assert.equal(await evaluate('document.querySelector("#app").dataset.mode'),'setup');
await click('button[data-play-mode="challenge"]');await click('#start-game');assert.equal(await evaluate('document.querySelectorAll(".is-open").length'),0);
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await click('#sparky');await delay(100);const still=await evaluate('document.querySelector("#sparky").dataset.frame');await delay(400);assert.equal(await evaluate('document.querySelector("#sparky").dataset.frame'),still);
assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);
console.log('All six mode/level combinations, layout sizes, local voice decoding/playback, pause, cancellation and reduced motion passed.');
await send('Page.close');ws.close();
