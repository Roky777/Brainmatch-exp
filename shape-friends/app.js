import { PACK, ITEMS, SHAPES, assetURL, cardsFor, roundById } from './content.js';
import { MatchBoard } from './engine.js';
import { CompanionMemory } from './companion.js';
import { Timeline } from './timeline.js';
import { readSave, writeSave, discover } from './save.js';
import { GameAudio } from './audio.js';
import { Sparky, sparkyArt } from './sparky.js';
import { LivingGarden } from './garden.js';
import { Picnic } from './picnic.js';
import { icon } from '../art.js';

const $ = id => document.getElementById(id);
// Board, rim controls and collection drawer form one responsive play object.
document.querySelector('.match-area').append($('discovery-strip'));
$('discovery-strip').append($('hint'));
const save = readSave(), audio = new GameAudio(save), timeline = new Timeline();
const sparky = new Sparky($('sparky'));
document.querySelector('.mini-sparky').innerHTML = sparkyArt('picnic-sparky');
const garden = new LivingGarden($('living-garden'), { speak: text => say(text), effect: kind => audio.effect(kind), discovered: save.discoveries.length / 2 });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let board, memory, round, mode = 'match', busy = false, run = 0, started = false;
const picnic = new Picnic($('picnic'), {
  speak: text => say(text, 'picnic-caption'), effect: kind => audio.effect(kind),
  progress: save.gardenWater, onProgress: value => { save.gardenWater = value; persist(); },
});

function persist() { $('save-notice').hidden = writeSave(save); }
function activateAudio() { started = true; audio.unlock(); }
function say(text, destination = 'caption') {
  $(destination).textContent = text;
  sparky.speak(text);
  if (started) audio.say(text);
}
function updatePause() {
  const paused = document.hidden || $('settings-dialog').open || mode === 'explore';
  sparky.pause(paused);
  if (paused) { timeline.pause(); audio.stop(); } else timeline.resume();
}
async function wait(ms, ticket = run) { return await timeline.wait(ms) && ticket === run; }
function clearPointer() {
  $('hand').classList.remove('visible');
  $('cards').querySelectorAll('.targeted').forEach(node => node.classList.remove('targeted'));
}
function clearEffects() {
  clearPointer(); $('effects-layer').replaceChildren(); $('pair-celebration').hidden = true;
  document.querySelector('.pair-thread')?.remove();
  $('cards').querySelectorAll('.hinted').forEach(node => node.classList.remove('hinted'));
}
function unlocked(id) {
  const index = PACK.rounds.findIndex(item => item.id === id);
  return index === 0 || save.completed.includes(PACK.rounds[index - 1].id);
}
function renderPath() {
  $('chapter-path').innerHTML = PACK.rounds.map(item => `<button type="button" data-round="${item.id}" class="${save.completed.includes(item.id) ? 'done' : ''}" ${item.id === round.id ? 'aria-current="step"' : ''} ${!unlocked(item.id) ? 'disabled' : ''} aria-label="Round ${item.id}: ${item.title}${save.completed.includes(item.id) ? ', completed' : ''}">${item.id}</button>`).join('');
}
function startRound(id) {
  if (!roundById(id) || !unlocked(id)) id = '1';
  run++; timeline.cancel(); audio.stop(); clearEffects(); picnic.cancelDrag();
  round = roundById(id); board = new MatchBoard(cardsFor(round)); memory = new CompanionMemory();
  // Decode round art before its flip; these URLs never expose deck positions.
  for (const { item } of cardsFor(round)) { const image = new Image(); image.src = assetURL(item); image.decode?.().catch(() => {}); }
  mode = 'match'; busy = false; save.activeRound = id; persist();
  $('app').dataset.mode = mode; $('play-layout').hidden = false; $('discovery-strip').hidden = false;
  $('explore-view').hidden = true; $('chapter-number').textContent = id.padStart(2, '0');
  $('chapter-title').textContent = round.title;
  $('cards').innerHTML = Array.from({ length: board.size }, (_, index) => `<button class="memory-card" type="button" data-index="${index}" aria-label="Hidden card ${index + 1}"><span class="card-inner"><span class="card-face card-back" aria-hidden="true"><span class="card-emblem"><svg viewBox="0 0 60 60"><path d="M30 9c4 11 12 15 20 17-10 4-17 10-20 24-4-12-10-20-20-24 11-3 17-9 20-17Z"/><circle cx="46" cy="10" r="3"/><circle cx="11" cy="46" r="2"/></svg></span></span><span class="card-face card-front" aria-hidden="true"></span></span><span class="match-check" hidden aria-hidden="true">✓</span></button>`).join('');
  renderPath(); renderBoard(); renderTray(); updatePause(); sparky.set('greeting', 1400);
  $('cards').querySelectorAll('.card-emblem').forEach(el => { el.innerHTML = icon('star'); });
  say(id === '1' ? 'Let’s find shape friends! Pick two.' : 'More shape friends! You go first.');
}
function renderBoard() {
  const canPlay = board.actor === 'child' && board.phase === 'ready' && !busy && mode === 'match';
  board.snapshot().forEach(({ index, matched, visible, card }) => {
    const button = $('cards').children[index], front = button.querySelector('.card-front');
    button.classList.toggle('is-open', visible); button.classList.toggle('is-matched', matched);
    button.disabled = !canPlay || visible;
    button.setAttribute('aria-label', visible ? `${ITEMS[card.item].name}${matched ? ', matched' : ', face up'}. Card ${index + 1}` : `Hidden card ${index + 1}`);
    button.querySelector('.match-check').hidden = !matched;
    // An unseen identity is never rendered into the DOM or its accessibility tree.
    if (visible && !front.firstChild) {
      const img = new Image(); img.src = assetURL(card.item); img.alt = ''; img.draggable = false;
      front.append(img);
    } else if (!visible) {
      // Retain previously observed art through the closing half of the flip only.
      const ticket = run;
      timeline.wait(210).then(ok => { if (ok && ticket === run && !board.snapshot()[index].visible) front.replaceChildren(); });
    }
  });
  $('turn-chip').dataset.actor = board.actor;
  $('turn-chip').querySelector('strong').textContent = board.phase === 'complete' ? 'We did it!' : board.actor === 'child' ? 'Your turn!' : 'Sparky’s turn!';
  $('pair-progress').innerHTML = Array.from({ length: board.pairCount }, (_, i) => `<i class="${i < board.matched.size ? 'found' : ''}"></i>`).join('');
  $('pair-progress').setAttribute('aria-label', `${board.matched.size} of ${board.pairCount} pairs found`);
  $('hint').disabled = !canPlay;
  $('visit-picnic').hidden = !save.discoveries.length || mode !== 'match';
  $('visit-picnic').disabled = !canPlay;
}
function renderTray() {
  const count = save.discoveries.length;
  $('discovery-count').textContent = count ? `${count} picnic ${count === 1 ? 'discovery' : 'discoveries'}` : 'Let’s fill our picnic!';
  $('basket-count').hidden = !count; $('basket-count').textContent = count;
  $('picnic-basket').setAttribute('aria-label', count ? `Play with our ${count} picnic discoveries` : 'Our picnic basket. Find a pair to fill it!');
  const max = 3;
  $('discovery-tray').innerHTML = save.discoveries.slice(-max).map(id => `<button class="tray-item" data-discovery="${id}" type="button" aria-label="Visit our picnic with ${ITEMS[id].name}"><img src="${assetURL(id)}" alt=""></button>`).join('');
}
function reveal(index, actor) {
  const observation = board.reveal(index, actor);
  if (!observation) return null;
  memory.observe(observation); audio.effect('flip'); renderBoard();
  return observation;
}
async function childFlip(index) {
  if (busy || timeline.paused || mode !== 'match' || board.actor !== 'child') return;
  activateAudio();
  const observation = reveal(index, 'child'); if (!observation) return;
  $('cards').querySelectorAll('.hinted').forEach(node => node.classList.remove('hinted'));
  sparky.set('thinking'); sparky.look((index % 4 - 1.5) * 2);
  if (board.open.length === 1) {
    say(`A ${ITEMS[observation.item].name.toLowerCase()}! Find its shape friend.`);
  } else {
    busy = true; renderBoard(); await resolveTurn(run);
  }
}
async function resolveTurn(ticket) {
  if (!await wait(900, ticket)) return;
  const result = board.resolve(); if (!result) return;
  if (result.match) {
    memory.removePair(result.pairId);
    discover(save, result.items); persist();
    garden.grow();
    sparky.set('happy', 2200); audio.effect('match');
    say(result.actor === 'child' ? 'You found shape friends! Hooray!' : 'Shape friends for our picnic!');
    $('pair-celebration').textContent = SHAPES[result.pairId].name;
    $('pair-celebration').hidden = false; renderTray(); connectPair(result.indices); flyDiscoveries(result.indices);
  } else {
    sparky.set('thinking');
    say(result.actor === 'child' ? 'Not quite! Let’s remember them.' : 'Oops! Your turn to look.');
  }
  renderBoard();
  if (!await wait(result.match ? 1300 : 900, ticket)) return;
  // Let local character clips finish their short reaction before changing turns.
  const voiceTail = audio.remainingMs();
  if (voiceTail > 80 && !await wait(voiceTail, ticket)) return;
  clearEffects(); board.advance(); renderBoard();
  // Let the cards close before the next player's input becomes available.
  if (!await wait(420, ticket)) return;
  if (board.phase === 'complete') { finishRound(); return; }
  busy = false; renderBoard();
  if (board.actor === 'sparky') await sparkyTurn(ticket);
  else { sparky.set('present-right', 1700); say('Your turn! Pick two.'); }
}
async function pointAt(index, ticket) {
  clearPointer();
  const target = $('cards').children[index], rect = target.getBoundingClientRect();
  const hand = $('hand'); hand.style.left = `${rect.left + rect.width * .58}px`; hand.style.top = `${rect.top + rect.height * .58}px`;
  hand.classList.add('visible'); target.classList.add('targeted');
  sparky.set('present-right'); sparky.look((index % 4 - 1.5) * 2);
  return wait(550, ticket);
}
async function sparkyTurn(ticket) {
  busy = true; renderBoard(); sparky.set('thinking');
  say(memory.knownPair(board.available()) ? 'I remember these two!' : 'My turn! Hmm… this one?');
  if (!await wait(600, ticket)) return;
  const firstIndex = memory.chooseFirst(board.available());
  if (!await pointAt(firstIndex, ticket)) return;
  const first = reveal(firstIndex, 'sparky'); clearPointer();
  if (!first || !await wait(650, ticket)) return;
  sparky.set('thinking');
  const secondIndex = memory.chooseSecond(board.available(), first);
  if (!await pointAt(secondIndex, ticket)) return;
  reveal(secondIndex, 'sparky'); clearPointer();
  await resolveTurn(ticket);
}
function flyDiscoveries(indices) {
  if (reduced.matches) return;
  const destination = $('discovery-tray').getBoundingClientRect();
  for (const [offset, index] of indices.entries()) {
    const source = $('cards').children[index].querySelector('img');
    const rect = source.getBoundingClientRect(), img = source.cloneNode();
    img.className = 'flying-discovery';
    Object.assign(img.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    $('effects-layer').append(img);
    const ticket = run;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (ticket !== run || !img.isConnected) return;
      Object.assign(img.style, { left: `${destination.left + offset * 45}px`, top: `${destination.top}px`, width: '42px', height: '42px' });
    }));
  }
}
function connectPair(indices) {
  if (reduced.matches) return;
  const wrap = document.querySelector('.board-wrap'), base = wrap.getBoundingClientRect();
  const centers = indices.map(index => {
    const r = $('cards').children[index].getBoundingClientRect();
    return [r.left + r.width / 2 - base.left, r.top + r.height / 2 - base.top];
  });
  const [a,b] = centers, ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns,'svg'), path = document.createElementNS(ns,'path');
  svg.classList.add('pair-thread'); svg.setAttribute('aria-hidden','true');
  svg.setAttribute('viewBox',`0 0 ${base.width} ${base.height}`);
  path.setAttribute('d',`M${a[0]} ${a[1]} Q${(a[0]+b[0])/2} ${Math.min(a[1],b[1])-35} ${b[0]} ${b[1]}`);
  path.setAttribute('pathLength','1');svg.append(path);wrap.append(svg);
}
function confetti() {
  if (reduced.matches) return;
  $('effects-layer').innerHTML = Array.from({ length: 24 }, (_, i) => `<i class="confetti-bit" style="--x:${i * 4.2}%;--delay:${i % 5 * .08}s;--c:${['#eab867', '#9cc493', '#df9c99', '#88bfc0'][i % 4]};--rot:${i * 47}deg"></i>`).join('');
}
function finishRound() {
  if (!save.completed.includes(round.id)) save.completed.push(round.id);
  persist(); renderPath(); audio.effect('finish');
  showPicnic(); confetti();
  say(save.completed.length === PACK.rounds.length ? 'All our friends! We did it!' : 'We did it! Let’s play!', 'picnic-caption');
  $('next-round').focus({ preventScroll: true });
}
function showPicnic() {
  if (!save.discoveries.length) return;
  if (board.phase !== 'complete' && (busy || board.actor !== 'child')) return;
  mode = 'explore'; clearEffects(); picnic.render(save.discoveries);
  $('app').dataset.mode = mode; $('play-layout').hidden = true; $('discovery-strip').hidden = true; $('explore-view').hidden = false; $('visit-picnic').hidden = true;
  const complete = board.phase === 'complete', final = save.completed.length === PACK.rounds.length;
  $('explore-title').textContent = final ? 'Our happy picnic!' : 'Picnic time!';
  $('explore-kicker').textContent = complete ? `ROUND ${round.id} · WE DID IT TOGETHER` : 'A LITTLE PLAY BREAK';
  $('explore-message').textContent = 'Tap a discovery, or bring it to a place below.';
  $('next-round').hidden = !complete; $('resume-round').hidden = complete;
  $('next-round').innerHTML = `${round.id === '4' ? 'Play again!' : 'More shapes!'} <span aria-hidden="true">→</span>`;
  updatePause(); window.scrollTo({ top: 0, behavior: 'instant' });
}
function resumeRound() {
  picnic.cancelDrag(); audio.stop(); mode = 'match'; $('app').dataset.mode = mode;
  $('play-layout').hidden = false; $('discovery-strip').hidden = false; $('explore-view').hidden = true;
  updatePause(); renderBoard(); say('Hello again, shape friends!');
}
function hint() {
  if (busy || timeline.paused || board.actor !== 'child' || board.phase !== 'ready') return;
  activateAudio();
  const selected = board.snapshot().find(card => card.visible && !card.matched);
  const result = memory.hint(board.available(), selected ? { ...selected.card, index: selected.index } : null);
  if (result.type === 'none') say(selected ? 'Let’s try a new card!' : 'Pick one! We’ll remember together.');
  else {
    result.cards.forEach(card => $('cards').children[card.index].classList.add('hinted'));
    say(result.type === 'pair' ? 'I remember these two! Try them.' : `Look here! We saw a ${ITEMS[result.cards[0].item].name.toLowerCase()}.`);
  }
  sparky.set('thumbs-up', 1800);
}
function openSettings() { audio.stop(); picnic.cancelDrag(); $('settings-dialog').showModal(); updatePause(); }
function settingsUI() {
  for (const key of ['voice', 'effects']) {
    $(`${key}-toggle`).setAttribute('aria-pressed', String(save[key]));
    $(`${key}-toggle`).textContent = save[key] ? 'On' : 'Off';
  }
}

$('cards').addEventListener('click', event => { const card = event.target.closest('[data-index]'); if (card) childFlip(Number(card.dataset.index)); });
$('hint').addEventListener('click', hint);
$('sparky').addEventListener('click', () => {
  if (busy || mode !== 'match' || $('settings-dialog').open) return;
  sparky.set('greeting', 1400); say('Hi, friend! Let’s find a pair.');
});
$('repeat').addEventListener('click', () => { activateAudio(); audio.say($('caption').textContent); });
$('chapter-path').addEventListener('click', event => { const target = event.target.closest('[data-round]'); if (target && unlocked(target.dataset.round)) { $('settings-dialog').close(); startRound(target.dataset.round); } });
$('visit-picnic').addEventListener('click', showPicnic);
$('picnic-basket').addEventListener('click', () => { if (save.discoveries.length) showPicnic(); else { sparky.set('happy', 1300); say('Find a pair for our picnic!'); } });
$('discovery-tray').addEventListener('click', event => { if (event.target.closest('[data-discovery]')) showPicnic(); });
$('resume-round').addEventListener('click', resumeRound);
$('next-round').addEventListener('click', () => { activateAudio(); startRound(round.id === '4' ? '1' : String(Number(round.id) + 1)); });
$('settings-open').addEventListener('click', openSettings);
$('settings-dialog').querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $('settings-dialog').close()));
$('settings-dialog').addEventListener('close', updatePause);
$('restart-round').addEventListener('click', () => { $('settings-dialog').close(); startRound(round.id); });
for (const key of ['voice', 'effects']) $(`${key}-toggle`).addEventListener('click', () => { save[key] = !save[key]; if (key === 'voice') audio.stop(); persist(); settingsUI(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('settings-dialog').open) { event.preventDefault(); openSettings(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) picnic.cancelDrag(); updatePause(); });
window.addEventListener('resize', () => { renderTray(); clearPointer(); });
document.addEventListener('pointerdown', activateAudio, { once: true });
document.addEventListener('keydown', activateAudio, { once: true });
// A suggestion only: never lock orientation or interrupt an unfinished turn.
try { $('rotate-tip').hidden = sessionStorage.getItem('shape-friends:rotation-dismissed') === 'yes'; } catch {}
$('dismiss-rotate').addEventListener('click', () => {
  $('rotate-tip').hidden = true;
  try { sessionStorage.setItem('shape-friends:rotation-dismissed', 'yes'); } catch {}
});
settingsUI(); startRound(save.activeRound);
