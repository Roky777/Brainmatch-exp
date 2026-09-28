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
import { LEVELS, playOptions, resultFor } from './play-options.js';
import { Dialogue } from './dialogue.js';

const $ = id => document.getElementById(id);
// Board, rim controls and collection drawer form one responsive play object.
document.querySelector('.match-area').append($('discovery-strip'));
$('discovery-strip').append($('hint'));
const save = readSave(), audio = new GameAudio(save), timeline = new Timeline();
const sparky = new Sparky($('sparky'));
const menuSparky = new Sparky($('menu-sparky'));
document.querySelector('.mini-sparky').innerHTML = sparkyArt('picnic-sparky');
const garden = new LivingGarden($('living-garden'), { speak: text => say(text), effect: kind => audio.effect(kind), discovered: save.discoveries.length / 2 });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let board, memory, round, mode = 'match', busy = false, run = 0, started = false;
let tapAnimation = null;
let options = playOptions(), guideMemory = new CompanionMemory();
const dialogue = new Dialogue();
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
  const paused = document.hidden || $('settings-dialog').open || mode === 'explore' || mode === 'setup';
  sparky.pause(paused);
  menuSparky.pause(document.hidden || $('settings-dialog').open || mode !== 'setup');
  if (tapAnimation) paused ? tapAnimation.pause() : tapAnimation.play();
  if (paused) { timeline.pause(); audio.stop(); } else timeline.resume();
}
async function wait(ms, ticket = run) { return await timeline.wait(ms) && ticket === run; }
function clearPointer() {
  tapAnimation?.cancel(); tapAnimation = null;
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
  round = roundById(id);
  const level = LEVELS[options.level];
  board = new MatchBoard(cardsFor({ pairs: round.pairs.slice(0, level.pairs) }), { mode: options.mode });
  memory = new CompanionMemory({ capacity: level.capacity }); guideMemory = new CompanionMemory();
  // Decode round art before its flip; these URLs never expose deck positions.
  for (const { item } of cardsFor(round)) { const image = new Image(); image.src = assetURL(item); image.decode?.().catch(() => {}); }
  mode = 'match'; busy = false; save.activeRound = id; persist();
  $('setup-view').hidden = true; $('result-view').hidden = true;
  document.querySelector('.match-area').hidden = false;
  $('app').dataset.playMode = options.mode;
  $('app').dataset.level = options.level;
  $('cards').style.setProperty('--columns', level.pairs === 3 ? '3' : level.pairs === 2 ? '2' : '4');
  $('cards').setAttribute('aria-label', `${board.size} memory cards. Match things with the same shape.`);
  $('app').dataset.mode = mode; $('play-layout').hidden = false; $('discovery-strip').hidden = false;
  $('explore-view').hidden = true; $('chapter-number').textContent = id.padStart(2, '0');
  $('chapter-title').textContent = round.title;
  $('cards').innerHTML = Array.from({ length: board.size }, (_, index) => `<button class="memory-card" type="button" data-index="${index}" aria-label="Hidden card ${index + 1}"><span class="card-inner"><span class="card-face card-back" aria-hidden="true"><span class="card-emblem"><svg viewBox="0 0 60 60"><path d="M30 9c4 11 12 15 20 17-10 4-17 10-20 24-4-12-10-20-20-24 11-3 17-9 20-17Z"/><circle cx="46" cy="10" r="3"/><circle cx="11" cy="46" r="2"/></svg></span></span><span class="card-face card-front" aria-hidden="true"></span></span><span class="match-check" hidden aria-hidden="true">✓</span></button>`).join('');
  renderPath(); renderBoard(); renderTray(); updatePause(); sparky.set('greeting', 1400);
  $('cards').querySelectorAll('.card-emblem').forEach(el => { el.innerHTML = icon('star'); });
  say(dialogue.next(options.mode));
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
  const bonus = board.mode === 'challenge' && board.history.at(-1)?.match;
  $('turn-chip').querySelector('strong').textContent = board.phase === 'complete' ? 'We did it!' : board.actor === 'child' ? (bonus ? 'You go again!' : 'Your turn!') : (bonus ? 'Sparky goes again!' : 'Sparky’s turn!');
  $('pair-progress').innerHTML = Array.from({ length: board.pairCount }, (_, i) => `<i class="${i < board.matched.size ? 'found' : ''}"></i>`).join('');
  $('pair-progress').setAttribute('aria-label', `${board.matched.size} of ${board.pairCount} pairs found`);
  $('pair-progress').hidden = options.mode === 'challenge';
  $('match-score').hidden = options.mode !== 'challenge';
  $('match-score').textContent = `You ${board.scores.child} · Sparky ${board.scores.sparky}`;
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
  memory.observe(observation); guideMemory.observe(observation); audio.effect('flip'); renderBoard();
  return observation;
}
async function childFlip(index) {
  if (busy || timeline.paused || mode !== 'match' || board.actor !== 'child') return;
  activateAudio();
  const observation = reveal(index, 'child'); if (!observation) return;
  $('cards').querySelectorAll('.hinted').forEach(node => node.classList.remove('hinted'));
  sparky.set('thinking'); sparky.look((index % 4 - 1.5) * 2);
  if (board.open.length === 1) {
    if (board.attempts % 2 === 0 && audio.remainingMs() < 100) say(dialogue.next('first'));
  } else {
    busy = true; renderBoard(); await resolveTurn(run);
  }
}
async function resolveTurn(ticket) {
  if (!await wait(900, ticket)) return;
  const result = board.resolve(); if (!result) return;
  if (result.match) {
    memory.removePair(result.pairId);
    guideMemory.removePair(result.pairId);
    discover(save, result.items); persist();
    garden.grow();
    sparky.set('happy', 2200); audio.effect('match');
    say(result.actor === 'child' ? dialogue.next('match') : 'I found a pair!');
    $('pair-celebration').textContent = SHAPES[result.pairId].name;
    $('pair-celebration').hidden = false; renderTray(); connectPair(result.indices);
  } else {
    sparky.set('thinking');
    say(dialogue.next(result.actor === 'child' ? 'miss' : 'sparkyMiss'));
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
async function tapAt(index, ticket) {
  clearPointer();
  // A deliberate gesture: Sparky aims, releases a separate star, then the
  // star's contact flips the card. The card never flips before impact.
  sparky.set('present-right', 1500);
  if (!await wait(reduced.matches ? 20 : 260, ticket)) return false;
  const target = $('cards').children[index], rect = target.getBoundingClientRect();
  const character = $('sparky').getBoundingClientRect();
  const shoulder = {x:character.left + character.width*.25,y:character.top + character.height*.58};
  const tip = {x:rect.left + rect.width*.53,y:rect.top + rect.height*.53};
  const hand = $('hand');
  hand.style.left = `${shoulder.x-28}px`;
  hand.style.top = `${shoulder.y-28}px`;
  hand.classList.add('visible');
  const dx=tip.x-shoulder.x,dy=tip.y-shoulder.y;
  tapAnimation = hand.animate([
    {transform:'translate(0,0) scale(.42) rotate(-35deg)',opacity:0},
    {transform:`translate(${dx*.15}px,${dy*.15-28}px) scale(1) rotate(10deg)`,opacity:1,offset:.2},
    {transform:`translate(${dx*.62}px,${dy*.62-54}px) scale(1.12) rotate(110deg)`,opacity:1,offset:.65},
    {transform:`translate(${dx}px,${dy}px) scale(1.35) rotate(195deg)`,opacity:1},
  ],{duration:reduced.matches?90:570,easing:'cubic-bezier(.33,.13,.35,1)',fill:'forwards'});
  try { await tapAnimation.finished; } catch { return false; }
  target.classList.add('targeted');
  return ticket === run && await wait(reduced.matches?20:100,ticket);
}
async function finishTap(ticket) {
  clearPointer();
  return ticket === run && await wait(reduced.matches?20:100,ticket);
}
async function sparkyTurn(ticket) {
  busy = true; renderBoard(); sparky.set('thinking');
  say('My turn! Hmm… this one?');
  if (!await wait(600, ticket)) return;
  const firstIndex = memory.chooseFirst(board.available());
  if (!await tapAt(firstIndex, ticket)) return;
  const first = reveal(firstIndex, 'sparky');
  if (!await finishTap(ticket)) return;
  if (!first || !await wait(650, ticket)) return;
  sparky.set('thinking');
  const secondIndex = memory.chooseSecond(board.available(), first);
  if (!await tapAt(secondIndex, ticket)) return;
  reveal(secondIndex, 'sparky');
  if (!await finishTap(ticket)) return;
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
  mode = 'result'; $('app').dataset.mode = mode;
  document.querySelector('.match-area').hidden = true; $('result-view').hidden = false;
  const outcome = resultFor(board);
  $('result-title').textContent = { practice:'You found them all!', win:'You beat Sparky!', lose:'Sparky wins this time!', tie:'A brilliant tie!' }[outcome];
  $('result-score').textContent = options.mode === 'practice' ? `${board.pairCount} pairs found` : `You ${board.scores.child} · Sparky ${board.scores.sparky}`;
  sparky.set(outcome === 'lose' ? 'greeting' : 'happy', 2400);
  say(dialogue.next(outcome === 'practice' ? 'done' : outcome)); confetti();
  $('play-again').focus({ preventScroll: true });
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
  const result = guideMemory.hint(board.available(), selected ? { ...selected.card, index: selected.index } : null);
  if (result.type === 'none') say('Let’s try a new card!');
  else {
    result.cards.forEach(card => $('cards').children[card.index].classList.add('hinted'));
    say(result.type === 'pair' || result.type === 'mate' ? 'I remember these two! Try them.' : 'Let’s try a new card!');
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
  if (options.mode === 'practice') hint();
  else { sparky.set('greeting', 1400); say('Hi, friend! Let’s find a pair.'); }
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
$('settings-home').addEventListener('click', () => { $('settings-dialog').close(); showSetup(); });
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
function setupUI() {
  document.querySelectorAll('button[data-play-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.playMode === options.mode)));
  document.querySelectorAll('button[data-level]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.level === options.level)));
  const level = LEVELS[options.level];
  $('level-description').textContent = options.mode === 'practice' ? `${level.pairs * 2} cards · Take your time. Tap Sparky for help.` : level.description;
}
function showSetup() {
  run++; timeline.cancel(); audio.stop(); clearEffects(); picnic.cancelDrag(); busy = false;
  mode = 'setup'; $('app').dataset.mode = mode;
  $('setup-view').hidden = false; $('play-layout').hidden = true; $('explore-view').hidden = true;
  $('result-view').hidden = true; $('discovery-strip').hidden = true;
  $('setup-view').dataset.step = 'menu'; $('mode-panel').hidden = false; $('level-panel').hidden = true;
  setupUI(); updatePause(); menuSparky.set('greeting',1400);
  document.querySelector('button[data-play-mode="practice"]').focus({ preventScroll:true });
}
function showLevels(playMode) {
  options = playOptions(playMode, options.level); setupUI();
  $('setup-view').dataset.step = 'levels'; $('mode-panel').hidden = true; $('level-panel').hidden = false;
  $('level-title').textContent = options.mode === 'practice' ? 'Practice' : 'Beat Sparky';
  menuSparky.set('present-right',1400);
  document.querySelector(`button[data-level="${options.level}"]`).focus({preventScroll:true});
}
document.querySelectorAll('button[data-play-mode]').forEach(button => button.addEventListener('click', () => showLevels(button.dataset.playMode)));
$('back-to-modes').addEventListener('click',showSetup);
$('menu-sparky').addEventListener('click',()=>{activateAudio();menuSparky.set('greeting',1400);$('menu-caption').textContent='Hi, friend! Let’s find a pair.';audio.say($('menu-caption').textContent);});
document.querySelectorAll('button[data-level]').forEach(button => button.addEventListener('click', () => { options = playOptions(options.mode, button.dataset.level); setupUI(); }));
$('start-game').addEventListener('click', () => { activateAudio(); startRound(save.activeRound); });
$('play-again').addEventListener('click', () => { activateAudio(); startRound(round.id === '4' ? '1' : String(Number(round.id) + 1)); });
$('choose-game').addEventListener('click', showSetup);
document.querySelector('.home-button').addEventListener('click', event => { event.preventDefault(); if ($('settings-dialog').open) $('settings-dialog').close(); showSetup(); });
settingsUI(); startRound(save.activeRound); showSetup();
