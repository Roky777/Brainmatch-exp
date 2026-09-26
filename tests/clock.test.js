import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TurnClock} from '../clock.js';
test('cancelled callbacks cannot cross into a different level',t=>{t.mock.timers.enable({apis:['setTimeout']});const clock=new TurnClock();let n=0;clock.schedule(()=>n++,100);clock.cancel();t.mock.timers.tick(500);assert.equal(n,0);});
test('pause gates timers; resume fires only once',t=>{t.mock.timers.enable({apis:['setTimeout']});const clock=new TurnClock();let n=0;clock.schedule(()=>n++,100);clock.pause();t.mock.timers.tick(500);assert.equal(n,0);clock.resume();clock.resume();t.mock.timers.tick(100);assert.equal(n,1);});
test('rescheduling replaces old task',t=>{t.mock.timers.enable({apis:['setTimeout']});const clock=new TurnClock();let n=0;clock.schedule(()=>n+=10,100);clock.schedule(()=>n++,100);t.mock.timers.tick(100);assert.equal(n,1);});
