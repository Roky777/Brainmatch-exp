import { ROUNDS, ITEMS } from './game-data.js';
import { MemoryGame } from './memory-game.js';
import { chooseFirst, chooseSecond } from './guide-ai.js';
import { loadSave, writeSave } from './storage.js';
import { itemArt, guideArt, icon, barnBackdrop } from './art.js';
import { AudioManager } from './audio.js';
import { Barnyard } from './barnyard.js';

const $ = id => document.getElementById(id);
const save = loadSave();
const audio = new AudioManager(save);
let game = null;
let currentRound = 1;
let flowToken = 0;

$('backdrop').innerHTML = barnBackdrop();
$('guide-art').innerHTML = guideArt();
$('home-button').innerHTML = icon('home');
$('explore-home').innerHTML = icon('home');

const barnyard = new Barnyard($('barnyard'), {
  onSound: kind => audio.tone(kind),
  onMessage: message => say(message, true),
});

function persist() {
  if (!writeSave(save)) $('announcement').textContent = 'Progress could not be saved on this device.';
}

function wait(ms, token = flowToken) {
  return new Promise(resolve => setTimeout(() => resolve(token === flowToken), ms));
}

function say(text, speak = true) {
  $('caption').textContent = text;
  if (speak) audio.speak(text);
}

function setMode(mode) {
  $('game').dataset.mode = mode;
  $('home-screen').hidden = mode !== 'home';
  $('match-screen').hidden = mode !== 'matching';
  $('round-complete').hidden = mode !== 'round-end';
  $('explore-panel').hidden = mode !== 'explore';
}

function setBarnyardInteractive(enabled) {
  document.querySelectorAll('.discovery').forEach(button => { button.disabled = !enabled; });
}

function updateSoundButtons() {
  $('voice-toggle').innerHTML = icon('voice');
  $('effects-toggle').innerHTML = icon('effects');
  $('voice-toggle').setAttribute('aria-pressed', String(save.voice));
  $('effects-toggle').setAttribute('aria-pressed', String(save.effects));
  $('voice-toggle').setAttribute('aria-label', save.voice ? 'Turn voice off' : 'Turn voice on');
  $('effects-toggle').setAttribute('aria-label', save.effects ? 'Turn music and effects off' : 'Turn music and effects on');
}

function showHome() {
  flowToken += 1;
  audio.stopVoice();
  game = null;
  barnyard.render(save.discoveries);
  setBarnyardInteractive(false);
  setMode('home');
  const nextRound = !save.completedRounds.includes(1) ? 1 : !save.completedRounds.includes(2) ? 2 : null;
  $('start-button').querySelector('span').textContent = nextRound ? (nextRound === 1 ? 'Play together' : 'Start Round 2') : 'Play a round again';
  $('start-button').dataset.round = String(nextRound || 1);
  $('explore-button').hidden = save.discoveries.length === 0;
  say(save.discoveries.length ? 'Welcome back! Your barnyard friends remember you.' : 'Hi! I’m Tilly. Let’s look for barnyard pairs.', false);
}

function startRound(roundId) {
  flowToken += 1;
  currentRound = roundId;
  game = new MemoryGame(roundId);
  const round = ROUNDS.find(item => item.id === roundId);
  $('round-number').textContent = `Round ${roundId}`;
  $('round-title').textContent = round.title;
  barnyard.render(save.discoveries);
  setBarnyardInteractive(false);
  setMode('matching');
  renderBoard();
  updateTurn();
  say(roundId === 1 ? 'You go first. Flip any two cards!' : 'More friends are hiding. You go first again!');
  requestAnimationFrame(() => $('cards').querySelector('button:not(:disabled)')?.focus({ preventScroll: true }));
}

function renderBoard() {
  $('cards').innerHTML = game.deck.map((card, index) => `
    <button class="memory-card" type="button" data-index="${index}" aria-label="Card ${index + 1}, face down">
      <span class="card-inner">
        <span class="card-face card-back"></span>
        <span class="card-face card-front">${itemArt(card.pairId)}</span>
      </span>
    </button>`).join('');
  updateBoard();
}

function updateBoard() {
  if (!game) return;
  const locked = game.turn !== 'child' || game.phase !== 'ready';
  $('cards').querySelectorAll('.memory-card').forEach((button, index) => {
    const card = game.deck[index];
    const open = game.open.includes(index);
    const matched = game.matched.has(card.pairId);
    button.classList.toggle('flipped', open);
    button.classList.toggle('matched', matched);
    button.disabled = locked || matched || open;
    button.setAttribute('aria-label', `Card ${index + 1}, ${open || matched ? ITEMS[card.pairId].name : 'face down'}${matched ? ', matched' : ''}`);
  });
  $('hint-button').disabled = locked;
  $('progress-count').textContent = `${save.discoveries.length} of 8`;
}

function updateTurn() {
  if (!game) return;
  const guideTurn = game.turn === 'guide';
  $('turn-banner').className = `turn-banner ${guideTurn ? 'guide' : 'child'}`;
  $('turn-banner').querySelector('strong').textContent = guideTurn ? 'Tilly’s turn' : 'Your turn';
  $('guide').classList.toggle('thinking', guideTurn);
  updateBoard();
}

async function childFlip(index) {
  if (!game || game.turn !== 'child' || game.phase !== 'ready') return;
  const card = game.reveal(index);
  if (!card) return;
  audio.tone('flip');
  updateBoard();
  if (game.open.length === 1) say(`A ${ITEMS[card.pairId].name.toLowerCase()}! Now choose one more.`, false);
  if (game.phase === 'resolving') await resolveTurn();
}

async function resolveTurn() {
  const token = flowToken;
  const pause = game.turn === 'guide' ? 850 : 1050;
  if (!await wait(pause, token) || !game) return;
  const result = game.resolve();
  if (result.match) {
    audio.tone('match');
    await revealDiscovery(result.pairId, token);
    if (!game || token !== flowToken) return;
    $('guide').classList.add('celebrate');
    setTimeout(() => $('guide').classList.remove('celebrate'), 1400);
    say(`We found the ${ITEMS[result.pairId].name.toLowerCase()}! It’s joining our barnyard.`);
  } else {
    updateBoard();
    say(game.turn === 'guide' ? 'Those were different. My turn to look!' : 'Not a pair this time. Your turn!', false);
    if (!await wait(650, token) || !game) return;
  }
  updateBoard();
  if (result.complete) {
    if (!save.completedRounds.includes(currentRound)) save.completedRounds.push(currentRound);
    persist();
    if (!await wait(850, token)) return;
    finishRound();
  } else if (game.turn === 'guide') {
    updateTurn();
    await guideTurn(token);
  } else {
    updateTurn();
    say('Your turn. Which two cards belong together?', false);
  }
}

async function revealDiscovery(pairId, token) {
  const wasNew = !save.discoveries.includes(pairId);
  if (wasNew) save.discoveries.push(pairId);
  persist();
  const source = [...$('cards').querySelectorAll('.memory-card')].find(button => game.deck[Number(button.dataset.index)].pairId === pairId);
  const sourceRect = source?.getBoundingClientRect();
  barnyard.render(save.discoveries);
  setBarnyardInteractive(false);
  const destination = document.querySelector(`[data-discovery="${pairId}"]`);
  destination?.classList.toggle('is-new', wasNew);
  updateBoard();
  if (sourceRect && destination && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const destinationRect = destination.getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.className = 'memory-card flying-card flipped';
    flyer.style.cssText = `left:${sourceRect.left}px;top:${sourceRect.top}px;width:${sourceRect.width}px;height:${sourceRect.height}px`;
    flyer.innerHTML = `<span class="card-face card-front">${itemArt(pairId)}</span>`;
    document.body.append(flyer);
    requestAnimationFrame(() => {
      flyer.style.left = `${destinationRect.left + destinationRect.width / 2 - sourceRect.width * .3}px`;
      flyer.style.top = `${destinationRect.top + destinationRect.height / 2 - sourceRect.height * .3}px`;
      flyer.style.scale = '.6'; flyer.style.opacity = '0';
    });
    setTimeout(() => flyer.remove(), 650);
  }
  await wait(600, token);
}

async function guideTurn(token) {
  if (!game || game.turn !== 'guide') return;
  say('Let me think… I’ll use only the cards we’ve seen.', false);
  if (!await wait(650, token) || !game) return;
  const first = chooseFirst(game.memory, game.available());
  await pointAndFlip(first, token);
  if (!game || token !== flowToken) return;
  const firstPair = game.deck[first].pairId;
  if (!await wait(550, token)) return;
  const second = chooseSecond(game.memory, game.available(), first, firstPair);
  await pointAndFlip(second, token);
  if (!game || token !== flowToken) return;
  await resolveTurn();
}

async function pointAndFlip(index, token) {
  const button = $(`card-${index}`) || $('cards').querySelector(`[data-index="${index}"]`);
  if (!button) return;
  button.classList.add('guide-target');
  const rect = button.getBoundingClientRect();
  const pointer = $('guide-pointer');
  pointer.style.left = `${rect.left + rect.width / 2}px`;
  pointer.style.top = `${rect.top + rect.height / 2}px`;
  pointer.classList.add('show');
  if (!await wait(520, token) || !game) return;
  game.reveal(index); audio.tone('flip'); updateBoard();
  button.classList.remove('guide-target');
  if (!await wait(430, token)) return;
  pointer.classList.remove('show');
}

function positionWords(index) {
  const row = index < 4 ? 'top' : 'bottom';
  const column = ['left side', 'middle-left', 'middle-right', 'right side'][index % 4];
  return `the ${row} row, ${column}`;
}

function giveHint() {
  if (!game || game.turn !== 'child' || game.phase !== 'ready') return;
  const hint = game.memory.hint(game.available());
  if (hint.type === 'pair') say(`I remember two ${ITEMS[hint.pairId].name.toLowerCase()} cards: one near ${positionWords(hint.indices[0])}, and one near ${positionWords(hint.indices[1])}.`);
  else if (hint.type === 'single') say(`I think we saw the ${ITEMS[hint.pairId].name.toLowerCase()} near ${positionWords(hint.index)}.`);
  else say('I don’t remember one yet. Let’s explore any card together!');
}

function finishRound() {
  flowToken += 1;
  game = null;
  barnyard.render(save.discoveries);
  setBarnyardInteractive(true);
  setMode('round-end');
  const finalRound = currentRound === 2;
  $('complete-title').textContent = finalRound ? 'Our barnyard is complete!' : 'The barnyard is waking up.';
  $('complete-copy').textContent = finalRound ? 'There’s no rush now. Tap, drag, and see what your friends can do.' : 'Tap your new friends, or try dragging something they might like.';
  $('next-button').textContent = finalRound ? 'Explore everything' : 'Next round';
  say(finalRound ? 'We found everyone! Try tapping the flowers, or bring the duck to the pond.' : 'What a team! Try bringing the hay to the cow.', true);
}

function showExplore() {
  flowToken += 1; game = null;
  barnyard.render(save.discoveries);
  setBarnyardInteractive(true);
  setMode('explore');
  $('round-two-button').hidden = !save.completedRounds.includes(2);
  say(save.discoveries.includes('flowers') ? 'This is our barnyard! Tap a friend, or drag something to a place it belongs.' : 'Let’s visit everyone we’ve discovered.', true);
}

$('cards').addEventListener('click', event => {
  const button = event.target.closest('[data-index]');
  if (button) childFlip(Number(button.dataset.index));
});
$('start-button').addEventListener('click', () => { audio.tone('tap'); startRound(Number($('start-button').dataset.round)); });
$('explore-button').addEventListener('click', showExplore);
$('home-button').addEventListener('click', showHome);
$('explore-home').addEventListener('click', showHome);
$('hint-button').addEventListener('click', giveHint);
$('next-button').addEventListener('click', () => currentRound === 1 ? startRound(2) : showExplore());
$('replay-button').addEventListener('click', () => startRound(currentRound));
$('round-one-button').addEventListener('click', () => startRound(1));
$('round-two-button').addEventListener('click', () => startRound(2));
$('voice-toggle').addEventListener('click', () => { save.voice = !save.voice; if (!save.voice) audio.stopVoice(); persist(); updateSoundButtons(); if (save.voice) audio.speak($('caption').textContent); });
$('effects-toggle').addEventListener('click', () => { save.effects = !save.effects; persist(); updateSoundButtons(); if (save.effects) audio.tone('tap'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { flowToken += 1; audio.stopVoice(); if (game) { game = null; showHome(); } } });

updateSoundButtons();
showHome();
