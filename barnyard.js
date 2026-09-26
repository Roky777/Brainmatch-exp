import { itemArt } from './art.js';

const draggable = new Set(['hay', 'egg', 'duck']);

export class Barnyard {
  constructor(root, { onSound = () => {}, onMessage = () => {} } = {}) {
    this.root = root;
    this.onSound = onSound;
    this.onMessage = onMessage;
    this.discoveries = [];
    this.drag = null;
    this.boundMove = event => this.pointerMove(event);
    this.boundUp = event => this.pointerUp(event);
  }
  render(discoveries) {
    this.discoveries = [...discoveries];
    this.root.querySelectorAll('.discovery').forEach(node => node.remove());
    for (const id of discoveries) {
      const button = document.createElement('button');
      button.className = `discovery discovery-${id}`;
      button.dataset.discovery = id;
      button.setAttribute('aria-label', this.label(id));
      button.innerHTML = itemArt(id);
      if (draggable.has(id)) button.classList.add('can-drag');
      button.addEventListener('click', event => this.tap(event));
      button.addEventListener('pointerdown', event => this.pointerDown(event));
      this.root.append(button);
    }
  }
  label(id) {
    return ({ cow: 'Cow. Tap to hear a moo. Hay can be dragged here.', hen: 'Hen. Tap to see her flap.', hay: 'Hay. Drag it to the cow.', egg: 'Egg. Drag it to the nest.', duck: 'Duck. Tap it, or drag it to the pond.', sheep: 'Sheep. Tap to see it bounce.', pond: 'Pond', flowers: 'Flowers. Tap to meet a butterfly.' })[id] || id;
  }
  tap(event) {
    const node = event.currentTarget;
    if (node.dataset.dragged === 'true') { node.dataset.dragged = 'false'; return; }
    const id = node.dataset.discovery;
    if (id === 'cow') this.animate(node, 'is-mooing', 'Moo! The cow says hello.', 'moo');
    if (id === 'hen') this.animate(node, 'is-flapping', 'Flap, flap! The hen is busy.', 'cluck');
    if (id === 'duck') this.swim(node);
    if (id === 'sheep') this.animate(node, 'is-bouncing', 'Baa! What a bouncy sheep.', 'baa');
    if (id === 'flowers') this.butterfly(node);
  }
  animate(node, className, message, sound) {
    node.classList.remove(className); void node.offsetWidth; node.classList.add(className);
    setTimeout(() => node.classList.remove(className), 1300);
    this.onSound(sound); this.onMessage(message);
  }
  swim(node) {
    const pond = this.root.querySelector('[data-discovery="pond"]');
    node.classList.add('is-swimming'); pond?.classList.add('is-splashing');
    setTimeout(() => { node.classList.remove('is-swimming'); pond?.classList.remove('is-splashing'); }, 1700);
    this.onSound('splash'); this.onMessage('Splish, splash! The duck paddles in the pond.');
  }
  butterfly(node) {
    const butterfly = document.createElement('span');
    butterfly.className = 'butterfly'; butterfly.setAttribute('aria-hidden', 'true');
    butterfly.innerHTML = '<i></i><b></b>';
    node.append(butterfly); setTimeout(() => butterfly.remove(), 2300);
    this.onSound('bloom'); this.onMessage('A butterfly found the flowers!');
  }
  pointerDown(event) {
    const node = event.currentTarget;
    if (!draggable.has(node.dataset.discovery)) return;
    this.drag = { node, id: node.dataset.discovery, x: event.clientX, y: event.clientY, moved: false };
    node.setPointerCapture(event.pointerId);
    node.classList.add('is-dragging');
    node.addEventListener('pointermove', this.boundMove);
    node.addEventListener('pointerup', this.boundUp, { once: true });
    node.addEventListener('pointercancel', this.boundUp, { once: true });
  }
  pointerMove(event) {
    if (!this.drag) return;
    const dx = event.clientX - this.drag.x, dy = event.clientY - this.drag.y;
    if (Math.hypot(dx, dy) > 7) this.drag.moved = true;
    this.drag.node.style.setProperty('--drag-x', `${dx}px`);
    this.drag.node.style.setProperty('--drag-y', `${dy}px`);
  }
  pointerUp(event) {
    if (!this.drag) return;
    const { node, id, moved } = this.drag;
    node.releasePointerCapture?.(event.pointerId);
    node.removeEventListener('pointermove', this.boundMove);
    node.classList.remove('is-dragging');
    node.style.removeProperty('--drag-x'); node.style.removeProperty('--drag-y');
    node.dataset.dragged = String(moved);
    const targetSelector = id === 'hay' ? '[data-discovery="cow"]' : id === 'egg' ? '.nest' : '[data-discovery="pond"]';
    const target = this.root.querySelector(targetSelector);
    if (moved && target && this.overlaps(event.clientX, event.clientY, target.getBoundingClientRect())) this.drop(id, node, target);
    this.drag = null;
  }
  overlaps(x, y, rect) { return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom; }
  drop(id, node, target) {
    if (id === 'hay') {
      node.classList.add('is-nibbled'); this.animate(target, 'is-happy', 'Crunch, crunch! The cow loves her hay.', 'moo');
      setTimeout(() => node.classList.remove('is-nibbled'), 1600);
    }
    if (id === 'egg') {
      node.classList.add('in-nest'); const hen = this.root.querySelector('[data-discovery="hen"]');
      hen?.classList.add('is-sitting'); this.onMessage('The hen keeps the egg cozy…'); this.onSound('cluck');
      setTimeout(() => { target.classList.add('has-chick'); this.onMessage('Peep! A tiny chick says hello.'); }, 1100);
      setTimeout(() => { node.classList.remove('in-nest'); hen?.classList.remove('is-sitting'); target.classList.remove('has-chick'); }, 3600);
    }
    if (id === 'duck') this.swim(node);
  }
}
