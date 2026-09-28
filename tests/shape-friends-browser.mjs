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
await viewport(1440, 1000);
await send('Page.navigate', { url: `${origin}/shape-friends/` });
await send('Page.bringToFront');
await until('document.querySelectorAll(".memory-card").length === 8');
await evaluate('localStorage.removeItem("brainmatch:shape-friends:v1"); location.reload()');
await delay(600); await until('document.querySelectorAll(".memory-card").length === 8');
await evaluate('document.fonts.ready'); await delay(300);
assert.equal(await evaluate('document.querySelectorAll(".card-front img").length'), 0);
await noOverflow(); await screenshot('desktop');
for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
  await viewport(width, height); await noOverflow(); await screenshot(`${width}x${height}`);
  assert(await evaluate('document.querySelector("#cards").getBoundingClientRect().top > document.querySelector(".turn-banner").getBoundingClientRect().bottom'), 'Turn banner must not cover the cards');
  assert(await evaluate('document.querySelector("#cards").getBoundingClientRect().bottom <= innerHeight'), 'All eight cards should fit on screen');
}
await viewport(1440, 1000);
// Actual keyboard activation, not a direct call to game internals.
// Include the unlocked basket control: it used to drift into the portrait board.
for (const [width,height] of [[390,844],[320,568],[844,390],[667,375],[1024,768],[1920,1080]]) {
  await viewport(width,height);
  await evaluate('document.querySelector("#visit-picnic").hidden=false');
  assert(await evaluate(`(() => {
    const board=document.querySelector('#cards').getBoundingClientRect();
    return [...document.querySelectorAll('.scene-controls > *, #hint, .speech-bubble')].every(e=>{
      const r=e.getBoundingClientRect();
      return r.right<=board.left || r.left>=board.right || r.bottom<=board.top || r.top>=board.bottom;
    });
  })()`), `Controls must not overlap the board at ${width}x${height}`);
  assert(await evaluate(`(() => {
    const hint=document.querySelector('#hint'), r=hint.getBoundingClientRect();
    return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#hint')===hint;
  })()`), `Hint must not be hidden by the discovery drawer at ${width}x${height}`);
  assert(await evaluate(`(() => {
    const board=document.querySelector('.board-wrap').getBoundingClientRect();
    const cards=document.querySelector('#cards').getBoundingClientRect();
    const tray=document.querySelector('#discovery-strip').getBoundingClientRect();
    return cards.left>=board.left && cards.right<=board.right && cards.top>=board.top && cards.bottom<=board.bottom && Math.abs(tray.top-board.bottom)<2;
  })()`), `Cards and attached tray must stay within one tabletop at ${width}x${height}`);
  assert(await evaluate(`(() => {
    const box=s=>document.querySelector(s).getBoundingClientRect();
    const tray=box('#discovery-strip'), coach=box('.companion'), sprite=box('#sparky'), speech=box('.speech-bubble');
    const basket=box('#picnic-basket'), items=box('#discovery-tray'), hint=box('#hint');
    return coach.top>=tray.bottom && sprite.right<=speech.left && speech.bottom<=innerHeight &&
      basket.right<=items.left && items.right<=hint.left && hint.right<=tray.right;
  })()`), `Collection and coach must have ordered, nonoverlapping slots at ${width}x${height}`);
  await noOverflow(); await screenshot(`landscape-check-${width}x${height}`);
}
await viewport(390,844);
assert(await evaluate('getComputedStyle(document.querySelector("#rotate-tip")).display !== "none"'));
await click('#dismiss-rotate');
assert(await evaluate('document.querySelector("#rotate-tip").hidden'));
await evaluate('document.querySelector("#visit-picnic").hidden=true');
await viewport(1440,1000);
// Real generated clips are served locally and play without pitch/rate tricks.
await evaluate(`(() => { const play=HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play=function(){window.__playedVoice=this;return play.call(this);}; })()`);
await click('#repeat');
await until('window.__playedVoice?.currentTime > 0');
assert(await evaluate('window.__playedVoice.src.endsWith("voice/renders/welcome-v1.mp3")'));
assert.equal(await evaluate('window.__playedVoice.playbackRate'),1);
await evaluate('window.__playedVoice.pause()');
const decodedClips=await evaluate(`(async()=>{const {VOICE_CLIPS}=await import('./audio.js');const context=new AudioContext();let count=0;for(const path of Object.values(VOICE_CLIPS)){const response=await fetch(path);if(!response.ok)throw Error(path);const buffer=await context.decodeAudioData(await response.arrayBuffer());if(buffer.duration<=0)throw Error('empty audio');count++;}await context.close();return count;})()`);
assert.equal(decodedClips,8);
await evaluate('document.querySelector(".memory-card").focus()');
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
await until('document.querySelectorAll(".is-open").length === 1');
const revealedBeforeRotation = await evaluate('document.querySelector(".is-open").getAttribute("aria-label")');
await viewport(390,844); await viewport(844,390);
assert.equal(await evaluate('document.querySelectorAll(".is-open").length'),1);
assert.equal(await evaluate('document.querySelector(".is-open").getAttribute("aria-label")'),revealedBeforeRotation);
await viewport(1440,1000);
await click('#settings-open');
await click('#voice-toggle'); await click('#effects-toggle');
assert.equal(await evaluate('document.querySelector("#voice-toggle").getAttribute("aria-pressed")'), 'false');
await click('[data-close]');
await click('.memory-card:not(:disabled)');
assert.equal(await evaluate('document.querySelectorAll(".memory-card:not(:disabled)").length'), 0);
await delay(350); await screenshot('two-cards');
await click('#settings-open');
const before = await evaluate('document.querySelector("#pair-progress").getAttribute("aria-label")');
await delay(1200); assert.equal(await evaluate('document.querySelector("#pair-progress").getAttribute("aria-label")'), before);
await click('[data-close]');
await until('document.querySelector("#turn-chip").dataset.actor === "sparky"');
await screenshot('sparky-turn');
// Switching rounds cancels a pending guide turn, not just its visuals.
await click('#settings-open');
await click('#settings-dialog summary');
await click('#restart-round');
await delay(1700); assert.equal(await evaluate('document.querySelectorAll(".is-open").length'), 0);
assert.equal(await evaluate('document.querySelector("#turn-chip").dataset.actor'), 'child');
console.log('Smoke: desktop, 3 small layouts, keyboard, input lock, pause and restart passed.');
await click('#sparky');
const spriteFrames=new Set();
for(let i=0;i<10;i++) { spriteFrames.add(await evaluate('document.querySelector("#sparky").dataset.frame')); await delay(100); }
assert(spriteFrames.size>=3,'Sparky greeting must play multiple drawn atlas frames');
await click('#settings-open');
const pausedSprite=await evaluate('document.querySelector("#sparky").dataset.frame');
await delay(350);
assert.equal(await evaluate('document.querySelector("#sparky").dataset.frame'),pausedSprite);
await click('[data-close]');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await click('#sparky'); await delay(100);
const stillSprite=await evaluate('document.querySelector("#sparky").dataset.frame');
await delay(350);assert.equal(await evaluate('document.querySelector("#sparky").dataset.frame'),stillSprite);
await send('Emulation.setEmulatedMedia',{features:[]});
console.log('Sprite animation: multiple drawn frames, paused playback and reduced motion passed.');

if (process.argv.includes('--full')) {
  for (const round of PACK.rounds) {
    const shapeForName = new Map(round.pairs.flatMap(([pair, a, b]) => [[ITEMS[a].name, pair], [ITEMS[b].name, pair]]));
    const observations = new Map(); let moves = 0, lastProgress = '';
    const deadline = Date.now() + 160000;
    while (Date.now() < deadline) {
      const state = await evaluate(`({mode:document.querySelector('#app').dataset.mode,actor:document.querySelector('#turn-chip').dataset.actor,progress:document.querySelector('#pair-progress').getAttribute('aria-label'),cards:[...document.querySelectorAll('.memory-card')].map(e=>({index:+e.dataset.index,label:e.getAttribute('aria-label'),open:e.classList.contains('is-open'),matched:e.classList.contains('is-matched'),enabled:!e.disabled}))})`);
      for (const card of state.cards.filter(card => card.open)) {
        const name = card.label.split(/, matched|, face up/)[0];
        observations.set(card.index, shapeForName.get(name));
        assert(shapeForName.has(name), `Unknown visible object: ${name}`);
      }
      if (state.progress !== lastProgress) { lastProgress = state.progress; console.log(`Round ${round.id}: ${lastProgress}`); }
      if (state.mode === 'explore') break;
      const choices = state.cards.filter(card => card.enabled), selected = state.cards.find(card => card.open && !card.matched);
      if (state.actor === 'child' && choices.length) {
        let choice;
        if (selected) choice = choices.find(card => observations.get(card.index) && observations.get(card.index) === observations.get(selected.index));
        else choice = choices.find(card => observations.has(card.index) && choices.some(other => other.index !== card.index && observations.get(other.index) === observations.get(card.index)));
        choice ||= choices.find(card => !observations.has(card.index)) || choices[0];
        await click(`[data-index="${choice.index}"]`); moves++;
      }
      await delay(120);
    }
    assert.equal(await evaluate('document.querySelector("#app").dataset.mode'), 'explore', `Round ${round.id} did not complete`);
    const discoveries = await evaluate('JSON.parse(localStorage.getItem("brainmatch:shape-friends:v1")).discoveries');
    assert(round.pairs.every(([, a, b]) => discoveries.includes(a) && discoveries.includes(b)));
    assert.equal(await evaluate('document.querySelectorAll(".picnic-toy").length'), discoveries.length);
    await screenshot(`round-${round.id}-picnic`);
    assert(await evaluate('document.querySelectorAll(".picnic-toy:not([hidden])").length <= 6'), 'Keep the discovery scene quiet');
    const drink = discoveries.find(id => ITEMS[id].action === 'pour');
    await click('[data-activity="water"]'); await showToy(drink); await click(`[data-toy="${drink}"]`); await click('[data-zone="water"]');
    assert.match(await evaluate('document.querySelector("#picnic-caption").textContent'), /flower/);
    assert(await evaluate('JSON.parse(localStorage.getItem("brainmatch:shape-friends:v1")).gardenWater > 0'));
    await click('[data-activity="chime"]'); await click('.picnic-toy:not([hidden])'); await click('[data-zone="chime"]');
    assert.match(await evaluate('document.querySelector("#picnic-caption").textContent'), /tune/);
    console.log(`Round ${round.id} complete; ${moves} child flips; ${discoveries.length} discoveries.`);
    if (round.id !== '4') await click('#next-round');
  }
  const save = await evaluate('JSON.parse(localStorage.getItem("brainmatch:shape-friends:v1"))');
  assert.equal(save.discoveries.length, 18); assert.equal(save.completed.length, 4);
  await viewport(390, 844); await noOverflow(); await screenshot('completed-phone');
  // Persistence and replay do not duplicate rewards. Rehydration never auto-completes a deck.
  await send('Page.reload'); await delay(600); await until('document.querySelectorAll(".memory-card").length === 8');
  assert.equal(await evaluate('document.querySelectorAll(".is-matched").length'), 0);
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("brainmatch:shape-friends:v1")).discoveries.length'), 18);
  await click('#picnic-basket'); assert.equal(await evaluate('document.querySelectorAll(".picnic-toy").length'), 18);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await click('.picnic-toy:not([hidden])');
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".picnic-toy:not([hidden])")).animationName'), 'none');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await viewport(320, 568);
  await noOverflow(); await screenshot('picnic-small-phone');
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await click('[data-activity="bounce"]'); await showToy('football');
  await drag('[data-toy="football"]', '[data-zone="bounce"]', true);
  assert.match(await evaluate('document.querySelector("#picnic-caption").textContent'), /Boing/);
  assert.equal(await evaluate('document.querySelectorAll("[data-zone=bounce] .zone-discovery").length'), 1);
  await showToy('book'); await drag('[data-toy="book"]', '[data-zone="bounce"]', true);
  assert.match(await evaluate('document.querySelector("#picnic-caption").textContent'), /Try a round/);
  await click('[data-activity="chime"]'); await showToy('orange'); await drag('[data-toy="orange"]', '[data-zone="chime"]', true, true);
  assert.equal(await evaluate('document.querySelectorAll(".dragging").length'), 0);
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await viewport(1440, 1000);
  await click('[data-activity="bounce"]'); await showToy('football');
  await drag('[data-toy="football"]', '[data-zone="bounce"]');
  assert.match(await evaluate('document.querySelector("#picnic-caption").textContent'), /Boing/);
  await delay(400);
  await click('[data-activity="chime"]'); await showToy('book');
  for (const selector of ['[data-toy="book"]', '[data-zone="chime"]']) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await delay(100);
  }
  assert.match(await evaluate('document.querySelector("#picnic-caption").textContent'), /tune/);
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("brainmatch:shape-friends:v1")).discoveries.length'), 18);
  console.log('Picnic: mouse drag, real touch drag, invalid drop, touch cancellation and keyboard equivalents passed.');
  console.log('Campaign: all 4 rounds, 18 discoveries, picnic interaction, persistence and reduced motion passed.');
}
assert.deepEqual(errors, []); assert.deepEqual(badResponses, []);
console.log('No browser exceptions or missing game assets.');
ws.close();
