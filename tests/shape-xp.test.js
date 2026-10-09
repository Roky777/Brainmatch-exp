import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { awardXP, XP_LIMIT, XP_REWARDS } from '../shape-friends/xp.js';
import { emptySave, sanitizeSave } from '../shape-friends/save.js';

test('Practice earns more XP than Beat Sparky and both feed one 200 XP journey',()=>{
  assert.equal(XP_LIMIT,200);
  assert.deepEqual(XP_REWARDS,{practice:10,challenge:6});
  assert(XP_REWARDS.practice>XP_REWARDS.challenge);
  const save=emptySave();
  assert.deepEqual(awardXP(save,'practice'),{earned:10,total:10,max:200,complete:false});
  assert.deepEqual(awardXP(save,'challenge'),{earned:6,total:16,max:200,complete:false});
});

test('XP never exceeds 200 and the final reward is trimmed to the exact cap',()=>{
  const save={xp:197};
  assert.deepEqual(awardXP(save,'practice'),{earned:3,total:200,max:200,complete:true});
  assert.deepEqual(awardXP(save,'challenge'),{earned:0,total:200,max:200,complete:true});
  assert.equal(sanitizeSave({...emptySave(),xp:999}).xp,200);
  assert.equal(sanitizeSave({...emptySave(),xp:-10}).xp,0);
});

test('existing progress receives a safe one-time XP migration',()=>{
  const restored=sanitizeSave({...emptySave(),xp:undefined,dreamStars:['1','2','3'],seasonStars:['1']});
  assert.equal(restored.xp,40);
});

test('the child-facing UI shows the total journey and both reward amounts',async()=>{
  const html=await readFile(new URL('../shape-friends/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../shape-friends/app.js',import.meta.url),'utf8');
  assert.match(html,/id="xp-meter"[\s\S]*?XP journey[\s\S]*?Practice earns 10 · Beat Sparky earns 6/);
  assert.doesNotMatch(html,/class="mode-xp"/,'XP rewards are explained once, not scattered across buttons');
  assert.match(html,/class="result-summary"[\s\S]*?id="result-score"[\s\S]*?id="result-xp"/);
  assert.match(app,/const xpAward=awardXP\(save,options\.mode\);[\s\S]*?persist\(\)/);
});
