'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Sound Engine (Web Audio API procedural SFX) ──────────────────────────────
let _actx: AudioContext | null = null
function getActx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!_actx) _actx = new AudioContext()
    if (_actx.state === 'suspended') _actx.resume()
  } catch { return null }
  return _actx
}
function tone(freq: number, type: OscillatorType, dur: number, vol = 0.25, freqEnd?: number, delay = 0): void {
  const ctx = getActx(); if (!ctx) return
  const now = ctx.currentTime + delay
  const osc = ctx.createOscillator(), gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = type; osc.frequency.setValueAtTime(freq, now)
  if (freqEnd !== undefined) osc.frequency.linearRampToValueAtTime(freqEnd, now + dur)
  gain.gain.setValueAtTime(vol, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  osc.start(now); osc.stop(now + dur)
}
function noise(dur: number, vol = 0.2, cutoff = 2000, delay = 0): void {
  const ctx = getActx(); if (!ctx) return
  const now = ctx.currentTime + delay
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = buf
  const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = cutoff
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(vol, now); gain.gain.exponentialRampToValueAtTime(0.001, now + dur)
  src.connect(flt); flt.connect(gain); gain.connect(ctx.destination)
  src.start(now); src.stop(now + dur)
}
const SFX = {
  shoot()    { tone(700 + Math.random() * 500, 'square', 0.07, 0.07) },
  hit()      { if (Math.random() > 0.55) noise(0.04, 0.10, 1800) },
  explode()  { noise(0.28, 0.30, 900); tone(160, 'sawtooth', 0.28, 0.18, 35) },
  merge()    { tone(523, 'sine', 0.13, 0.22); tone(784, 'sine', 0.18, 0.28, undefined, 0.10); tone(1047, 'sine', 0.14, 0.20, undefined, 0.20) },
  summon()   { [880, 1047, 1319].forEach((f, i) => tone(f, 'sine', 0.12, 0.18, undefined, i * 0.065)) },
  legendary(){ [440, 587, 740, 880, 1047].forEach((f, i) => tone(f, 'sine', 0.18, 0.22, undefined, i * 0.06)); noise(0.5, 0.15, 4000) },
  waveClear(){ [261, 330, 392, 523].forEach((f, i) => tone(f, 'sine', 0.35, 0.22, undefined, i * 0.09)); tone(1047, 'sine', 0.5, 0.18, undefined, 0.4) },
  boss()     { tone(100, 'sawtooth', 0.9, 0.4, 60); noise(0.9, 0.28, 500) },
  skill()    { noise(0.45, 0.45, 3000); tone(220, 'sawtooth', 0.45, 0.35, 55); tone(2000, 'sine', 0.2, 0.15, 400, 0.05) },
  lifeLost() { tone(440, 'sine', 0.55, 0.32, 110) },
  upgrade()  { tone(660, 'triangle', 0.2, 0.2); tone(880, 'triangle', 0.2, 0.2, undefined, 0.15) },
}

// ─── Constants ───────────────────────────────────────────────────────────────
const GRID_COLS=4,GRID_ROWS=5,SLOTS=20,N_WP=36
const MAX_WAVES=100,START_LIVES=20,START_GOLD=200
const SKILL_MAX=75,LEAK_MAX=120,MAX_MERGE=10

const TLBL=['C','B','A','S','SS','SSS','SSS+','MAX']
const TCOL=['#9E9E9E','#2196F3','#4CAF50','#9C27B0','#FF9800','#E91E63','#00BCD4','#FFD700']
const TDMG=[14,19,25,33,44,58,77,103]
const THEAD=['#80AAFF','#55A0EE','#FF8844','#44DDBB','#FF7700','#CC44FF','#00EEFF','#FFDD22']
const TNAME=['클래식','비','타이거','샤크','드래곤','갤럭시','보이드','건담']

const UN=['일반 공격력','희귀 공격력','전설 공격력','전체 사거리','공격속도','마나속도']
const UE=['🐍','💜','🌟','🎯','⚡','💧']
const UB=[80,200,500,120,150,100],UI=[60,150,300,80,100,80],UP=[20,25,30,12,15,20]

type ET='SLIME'|'WORM'|'ARMORED'|'SPEEDER'|'BOSS'|'DEMON'|'GOLEM'|'DRAGON'|'NECROMANCER'
type MK='BULLET'|'DART'|'CLAW'|'TORPEDO'|'FIREBALL'|'STARBURST'|'VOIDORB'|'LASER'
type GP='PREP'|'WAVE'|'OVER'|'WIN'

const ER:Record<ET,number>={SLIME:18,WORM:23,ARMORED:27,SPEEDER:15,BOSS:40,DEMON:22,GOLEM:31,DRAGON:20,NECROMANCER:18}
const ELBL:Record<ET,string>={SLIME:'점액',WORM:'웜',ARMORED:'기갑',SPEEDER:'스피더',BOSS:'보스!!',DEMON:'악마',GOLEM:'골렘',DRAGON:'비룡',NECROMANCER:'마법사'}
const EEMO:Record<ET,string>={SLIME:'🟢',WORM:'🟣',ARMORED:'⚙️',SPEEDER:'⚡',BOSS:'💀',DEMON:'😈',GOLEM:'🗿',DRAGON:'🐉',NECROMANCER:'🧙'}
const ECOL:Record<ET,string>={SLIME:'#32C350',WORM:'#9B4BC3',ARMORED:'#647D91',SPEEDER:'#EB462D',BOSS:'#B41419',DEMON:'#8C0028',GOLEM:'#5A4637',DRAGON:'#148242',NECROMANCER:'#3C0A64'}
const EDTB:Record<ET,number>={SLIME:1,WORM:1,ARMORED:1,SPEEDER:1,BOSS:5,DEMON:2,GOLEM:3,DRAGON:1,NECROMANCER:2}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pt{x:number;y:number}
interface Rect{x:number;y:number;w:number;h:number}
interface Tower{tier:number;mergeCount:number;cooldown:number;mana:number}
interface Enemy{id:number;type:ET;hp:number;maxHp:number;bspd:number;reward:number;x:number;y:number;wi:number;dead:boolean;slowT:number;poisonT:number;pdmg:number;anim:number;dtb:number}
interface Missile{x:number;y:number;vx:number;vy:number;dmg:number;tier:number;kind:MK;tid:number;aoe:boolean;aoeR:number;slow:boolean;chains:number;fx:number;fy:number;rot:number;trail:Pt[];life:number;sldur:number}
interface Laser{fx:number;fy:number;tx:number;ty:number;tier:number;life:number}
interface Prt{x:number;y:number;vx:number;vy:number;life:number;ml:number;col:string;r:number;grav:number}
interface Pop{x:number;y:number;txt:string;col:string;life:number;ml:number}

interface Layout{
  W:number;H:number;hudH:number;ctrlTop:number;ctrlH:number
  iCX:number;iCY:number;pRX:number;pRY:number
  cellSW:number;cellSH:number;gridLeft:number;gridTop:number;slotR:number
  slotPos:Pt[];waypoints:Pt[];spawnPt:Pt
  stars:{x:number;y:number;r:number}[]
  buyNorm:Rect;buyRare:Rect;buyLeg:Rect
  skipR:Rect;spdR:Rect;skillR:Rect;upgR:Rect
  upgPanel:Rect;upgRows:Rect[]
}

interface GS{
  phase:GP;gold:number;lives:number;waveNum:number
  gameTime:number;speed:number;prepT:number;shakeT:number;shakeAmt:number
  totalLeaked:number;skillCharge:number;animT:number
  towers:(Tower|null)[];enemies:Enemy[];missiles:Missile[]
  lasers:Laser[];particles:Prt[];popups:Pop[]
  spawnQ:{type:ET;hp:number;spd:number;rwd:number}[];spawnT:number;spawnIval:number
  upgLv:number[];summonN:number[];legFails:number
  showUpg:boolean;rangeSlot:number;nid:number
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function computeLayout(W:number,H:number,prevStars?:{x:number;y:number;r:number}[]):Layout{
  const hudH=H*0.115,ctrlH=H*0.150,ctrlTop=H-ctrlH
  const gameH=ctrlTop-hudH,iCX=W/2,iCY=hudH+gameH/2
  const pRX=Math.min(W*0.385,W/2-W*0.06)
  const pRY=Math.min(gameH*0.44,gameH/2-gameH*0.04)
  const f=0.66
  const cellSW=Math.max(pRX*Math.SQRT2*f/GRID_COLS,55)
  const cellSH=Math.max(pRY*Math.SQRT2*f/GRID_ROWS,55)
  const gW=cellSW*GRID_COLS,gH=cellSH*GRID_ROWS
  const gridLeft=iCX-gW/2,gridTop=iCY-gH/2
  const slotR=Math.min(cellSW,cellSH)*0.44
  const slotPos:Pt[]=[]
  for(let r=0;r<GRID_ROWS;r++)for(let c=0;c<GRID_COLS;c++)
    slotPos.push({x:gridLeft+c*cellSW+cellSW/2,y:gridTop+r*cellSH+cellSH/2})
  const waypoints:Pt[]=[]
  for(let i=0;i<N_WP;i++){const a=Math.PI*2*i/N_WP;waypoints.push({x:iCX+pRX*Math.cos(a),y:iCY+pRY*Math.sin(a)})}
  const stars=prevStars||Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2+1}))
  const bp=W*0.022,rowH=ctrlH*0.40
  const r1Y=ctrlTop+ctrlH*0.04,r2Y=r1Y+rowH+ctrlH*0.04
  const gw=(W-bp*4)/3
  const buyNorm:Rect={x:bp,y:r1Y,w:gw,h:rowH}
  const buyRare:Rect={x:bp*2+gw,y:r1Y,w:gw,h:rowH}
  const buyLeg:Rect={x:bp*3+gw*2,y:r1Y,w:W-bp-(bp*3+gw*2),h:rowH}
  const r2w=(W-bp*5)/4
  const skipR:Rect={x:bp,y:r2Y,w:r2w,h:rowH}
  const spdR:Rect={x:bp*2+r2w,y:r2Y,w:r2w,h:rowH}
  const skillR:Rect={x:bp*3+r2w*2,y:r2Y,w:r2w,h:rowH}
  const upgR:Rect={x:bp*4+r2w*3,y:r2Y,w:W-bp-(bp*4+r2w*3),h:rowH}
  const panelW=W*0.86,panelRowH=(H*0.60-50)/6,panelH=panelRowH*6+52
  const upgPanel:Rect={x:W-panelW-6,y:ctrlTop-panelH-8,w:panelW,h:panelH}
  const upgRows:Rect[]=Array.from({length:6},(_,i)=>({x:upgPanel.x+6,y:upgPanel.y+48+i*panelRowH,w:upgPanel.w-12,h:panelRowH-4}))
  return{W,H,hudH,ctrlTop,ctrlH,iCX,iCY,pRX,pRY,cellSW,cellSH,gridLeft,gridTop,slotR,slotPos,waypoints,spawnPt:waypoints[0],stars,buyNorm,buyRare,buyLeg,skipR,spdR,skillR,upgR,upgPanel,upgRows}
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function initGS():GS{
  return{phase:'PREP',gold:START_GOLD,lives:START_LIVES,waveNum:0,gameTime:0,speed:1,prepT:4,shakeT:0,shakeAmt:0,totalLeaked:0,skillCharge:0,animT:0,towers:Array(SLOTS).fill(null),enemies:[],missiles:[],lasers:[],particles:[],popups:[],spawnQ:[],spawnT:0,spawnIval:0.9,upgLv:Array(6).fill(0),summonN:[0,0,0],legFails:0,showUpg:false,rangeSlot:-1,nid:0}
}

// ─── Wave building ────────────────────────────────────────────────────────────
function bHp(w:number):number{
  const b=100+w*120+Math.max(0,w-15)*w*3
  return w>50?b+(w-50)*(w-50)*5:b
}
function bSpd(w:number):number{return Math.min(58+w*3.8,220)}

function buildWave(gs:GS,w:number):void{
  const boss=w%5===0,hp=bHp(w),sp=bSpd(w),n=Math.min(8+w*2,80)
  const add=(t:ET,h:number,s:number,r:number)=>{gs.spawnQ.push({type:t,hp:h,spd:s,rwd:r})}
  if(boss){
    const bt:ET=w>=80?'NECROMANCER':w>=60?'DRAGON':w>=40?'DEMON':'BOSS'
    const bm=Math.max(4,Math.min(14,4+w*0.10))
    const sm=Math.max(7,Math.min(17,bm+3))
    const mn:ET=w>=50?'GOLEM':w>=30?'DEMON':'ARMORED'
    for(let i=0;i<Math.floor(n/2);i++)add(mn,hp*2.2,sp*.8,20+Math.floor(w/3))
    add('BOSS',hp*bm,sp*.5,150+w*3)
    if(w>=20)add(bt,hp*sm,sp*.45,200+w*5)
  } else if(w<=3){for(let i=0;i<n;i++)add('SLIME',hp,sp,5)}
  else if(w<=7){for(let i=0;i<Math.floor(n*2/3);i++)add('SLIME',hp,sp,6);for(let i=0;i<Math.floor(n/3);i++)add('WORM',hp*1.7,sp*.9,12)}
  else if(w<=14){for(let i=0;i<Math.floor(n/4);i++)add('SLIME',hp,sp,6);for(let i=0;i<Math.floor(n/3);i++)add('WORM',hp*1.7,sp*.9,12);for(let i=0;i<Math.floor(n/4);i++)add('ARMORED',hp*2.4,sp*.7,18);for(let i=0;i<Math.floor(n/6);i++)add('SPEEDER',hp*.6,sp*1.8,10)}
  else if(w<=25){for(let i=0;i<Math.floor(n/5);i++)add('WORM',hp*2,sp,14);for(let i=0;i<Math.floor(n/3);i++)add('ARMORED',hp*2.8,sp*.72,20);for(let i=0;i<Math.floor(n/3);i++)add('SPEEDER',hp*.8,sp*2,12);for(let i=0;i<Math.floor(n/5);i++)add('WORM',hp*3.5,sp*.6,24)}
  else if(w<=40){for(let i=0;i<Math.floor(n/4);i++)add('DEMON',hp*2.2,sp*1.1,28);for(let i=0;i<Math.floor(n/3);i++)add('ARMORED',hp*3,sp*.7,22);for(let i=0;i<Math.floor(n/4);i++)add('SPEEDER',hp*1.2,sp*2.2,16);for(let i=0;i<Math.floor(n/6);i++)add('WORM',hp*4,sp*.65,28)}
  else if(w<=55){for(let i=0;i<Math.floor(n/3);i++)add('DEMON',hp*3,sp*1.2,35);for(let i=0;i<Math.floor(n/4);i++)add('GOLEM',hp*5,sp*.55,45);for(let i=0;i<Math.floor(n/4);i++)add('SPEEDER',hp*1.5,sp*2.5,20);for(let i=0;i<Math.floor(n/6);i++)add('ARMORED',hp*4,sp*.7,30)}
  else if(w<=70){for(let i=0;i<Math.floor(n/3);i++)add('DRAGON',hp*3.5,sp*1.4,50);for(let i=0;i<Math.floor(n/4);i++)add('GOLEM',hp*6,sp*.6,55);for(let i=0;i<Math.floor(n/4);i++)add('DEMON',hp*4,sp*1.3,40);for(let i=0;i<Math.floor(n/6);i++)add('SPEEDER',hp*2,sp*2.8,28)}
  else if(w<=85){for(let i=0;i<Math.floor(n/3);i++)add('NECROMANCER',hp*4,sp*1.1,60);for(let i=0;i<Math.floor(n/4);i++)add('DRAGON',hp*5,sp*1.5,65);for(let i=0;i<Math.floor(n/4);i++)add('GOLEM',hp*8,sp*.65,70);for(let i=0;i<Math.floor(n/6);i++)add('DEMON',hp*5,sp*1.5,55)}
  else{for(let i=0;i<Math.floor(n/3);i++)add('NECROMANCER',hp*5,sp*1.3,80);for(let i=0;i<Math.floor(n/3);i++)add('DRAGON',hp*6,sp*1.6,90);for(let i=0;i<Math.floor(n/4);i++)add('GOLEM',hp*10,sp*.7,100);for(let i=0;i<Math.floor(n/6);i++)add('DEMON',hp*7,sp*1.7,75)}
  // shuffle, boss last
  for(let i=gs.spawnQ.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[gs.spawnQ[i],gs.spawnQ[j]]=[gs.spawnQ[j],gs.spawnQ[i]]}
  const bi=gs.spawnQ.findIndex(q=>q.type==='BOSS')
  if(bi>=0){const b=gs.spawnQ.splice(bi,1)[0];gs.spawnQ.push(b)}
  gs.spawnIval=w<=5?1.1:w<=12?.82:w<=20?.62:w<=40?.50:w<=70?.40:.30
}

// ─── Tower helpers ────────────────────────────────────────────────────────────
function tRange(tier:number,mc:number,L:Layout,upgLv:number[]):number{
  const pd=Math.hypot(L.pRX,L.pRY)
  const bases=[.42,.58,.74,.90,1.08,1.28,1.50,1.75]
  const b=pd*(bases[tier-1]??0.42)
  return b*(1+Math.min(mc,MAX_MERGE)*0.08)*(1+upgLv[3]*UP[3]/100)
}
function atkMult(tier:number,upgLv:number[]):number{
  const idx=tier<=2?0:tier<=4?1:2
  return 1+upgLv[idx]*UP[idx]/100
}
function spdMult(upgLv:number[]):number{return 1+upgLv[4]*UP[4]/100}
function manaMult(upgLv:number[]):number{return 1+upgLv[5]*UP[5]/100}
function dmgMod(et:ET,mk:MK):number{
  if(et==='ARMORED'){if(mk==='BULLET'||mk==='DART')return 0.45;if(mk==='TORPEDO'||mk==='LASER')return 1.40}
  if(et==='SPEEDER'){if(mk==='STARBURST'||mk==='VOIDORB')return 1.30}
  if(et==='GOLEM'){if(mk==='LASER')return 1.60;if(mk==='BULLET')return 0.50}
  if(et==='NECROMANCER'){if(mk==='VOIDORB')return 1.50;if(mk==='FIREBALL')return 0.35}
  return 1
}
function mkOfTier(tier:number):MK{const ks:MK[]=['BULLET','DART','CLAW','TORPEDO','FIREBALL','STARBURST','VOIDORB','LASER'];return ks[tier-1]??'BULLET'}

// ─── Popup/particle helpers ───────────────────────────────────────────────────
function popup(gs:GS,x:number,y:number,txt:string,col:string):void{gs.popups.push({x,y,txt,col,life:1.8,ml:1.8})}
function spawnExp(gs:GS,x:number,y:number,tier:number,n:number):void{
  const c=TCOL[Math.min(tier-1,7)]
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=Math.random()*220+80;gs.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.5+Math.random()*.3,ml:.8,col:Math.random()<.5?c:'#fff',r:Math.random()*6+3,grav:80})}
}
function spawnSparkles(gs:GS,x:number,y:number,n:number,col:string):void{
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=Math.random()*100+40;gs.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.6,ml:.6,col,r:4,grav:60})}
}
function spawnFireworks(gs:GS,x:number,y:number,n=40):void{
  const cols=['#FFFF00','#00FFFF','#FF4081','#00FF88','#FF6F00']
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=Math.random()*300+100,c=cols[Math.floor(Math.random()*cols.length)];gs.particles.push({x:x+(Math.random()*200-100),y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1.2,ml:1.2,col:c,r:Math.random()*6+3,grav:100})}
}

// ─── Game ticks ───────────────────────────────────────────────────────────────
function beginWave(gs:GS):void{gs.waveNum++;gs.phase='WAVE';gs.spawnQ=[];buildWave(gs,gs.waveNum);gs.spawnT=0;if(gs.waveNum%5===0)SFX.boss()}

function waveCleared(gs:GS,L:Layout):void{
  const ib=gs.waveNum%5===0&&gs.waveNum>0,im=gs.waveNum%10===0
  const b=40+gs.waveNum*14+(ib?120:0)+(im?250:0)+Math.max(0,Math.floor(gs.gold*(3+Math.floor(gs.waveNum/10))/100))
  gs.gold+=b
  popup(gs,L.W/2,L.iCY-80,im?`🏅 마일스톤 ${gs.waveNum}! +${b}💰`:ib?`💀 보스 격파! +${b}💰`:`🎉 웨이브 ${gs.waveNum} 클리어! +${b}💰`,im?'#FFD700':'#FFFF00')
  spawnFireworks(gs,L.W/2,L.iCY,im?80:40);SFX.waveClear()
  if(gs.waveNum>=MAX_WAVES)gs.phase='WIN'
  else{gs.phase='PREP';gs.prepT=ib?8:5}
}

function tickSpawn(gs:GS,dt:number,L:Layout):void{
  if(!gs.spawnQ.length)return
  gs.spawnT-=dt
  if(gs.spawnT>0)return
  const q=gs.spawnQ.shift()!
  gs.enemies.push({id:gs.nid++,type:q.type,hp:q.hp,maxHp:q.hp,bspd:q.spd,reward:q.rwd,x:L.spawnPt.x,y:L.spawnPt.y,wi:0,dead:false,slowT:0,poisonT:0,pdmg:0,anim:Math.random()*100,dtb:EDTB[q.type]})
  gs.spawnT=gs.spawnIval
}

function tickEnemies(gs:GS,dt:number,L:Layout):void{
  const dead:Enemy[]=[]
  for(const e of gs.enemies){
    e.anim+=dt*3.8;if(e.slowT>0)e.slowT-=dt
    if(e.poisonT>0){e.poisonT-=dt;e.hp-=e.pdmg*dt;if(e.hp<=0){e.dead=true;gs.gold+=e.reward;spawnExp(gs,e.x,e.y,4,10)}}
    if(e.dead){dead.push(e);continue}
    const sp=e.slowT>0?e.bspd*0.38:e.bspd
    const ni=(e.wi+1)%N_WP,wp=L.waypoints[ni]
    const dx=wp.x-e.x,dy=wp.y-e.y,d=Math.hypot(dx,dy)
    if(d<6){
      e.wi=ni
      if(e.wi===0){
        gs.lives-=e.dtb;gs.totalLeaked++;dead.push(e);gs.shakeT=0.25;gs.shakeAmt=12;SFX.lifeLost()
        if(gs.lives<=0||gs.totalLeaked>=LEAK_MAX){gs.lives=Math.max(gs.lives,0);gs.phase='OVER'}
        continue
      }
    } else{const m=sp*dt;e.x+=dx/d*m;e.y+=dy/d*m}
  }
  for(const e of dead)gs.enemies.splice(gs.enemies.indexOf(e),1)
}

function hitEnemy(gs:GS,e:Enemy,dmg:number,slow:boolean,sldur=1.8,kind:MK='BULLET'):void{
  if(e.dead)return
  e.hp-=dmg*dmgMod(e.type,kind)
  if(slow)e.slowT=Math.max(e.slowT,sldur)
  if(e.hp<=0){e.dead=true;gs.gold+=e.reward;popup(gs,e.x,e.y-30,`+${e.reward}💰`,'#FFD700');spawnExp(gs,e.x,e.y,4,e.type==='BOSS'?50:18);SFX.explode()}
  else SFX.hit()
}

function tickTowers(gs:GS,dt:number,L:Layout):void{
  for(let i=0;i<SLOTS;i++){
    const t=gs.towers[i];if(!t)continue
    const sp=L.slotPos[i],r=tRange(t.tier,t.mergeCount,L,gs.upgLv)
    const inRange=gs.enemies.filter(e=>!e.dead&&Math.hypot(e.x-sp.x,e.y-sp.y)<=r)
    if(t.tier>=3&&inRange.length){
      t.mana=Math.min(t.mana+dt*7*manaMult(gs.upgLv),100)
      if(t.mana>=100){t.mana=0;fireUltimate(gs,t,i,sp.x,sp.y,L)}
    }
    t.cooldown-=dt;if(t.cooldown>0)continue
    const tgt=inRange.sort((a,b)=>(b.wi*1e5+L.waypoints[b.wi].x)-(a.wi*1e5+L.waypoints[a.wi].x))[0]
    if(!tgt)continue
    const effDmg=TDMG[t.tier-1]*atkMult(t.tier,gs.upgLv)
    const effCd=Math.max(.2,1.5-t.tier*.15)/(spdMult(gs.upgLv))
    if(t.tier===8)fireLaser(gs,t,sp.x,sp.y,tgt,effDmg,L)
    else fireMissile(gs,t,sp.x,sp.y,tgt,effDmg)
    t.cooldown=effCd
  }
}

function fireMissile(gs:GS,t:Tower,fx:number,fy:number,tgt:Enemy,dmg:number):void{
  const dx=tgt.x-fx,dy=tgt.y-fy,d=Math.hypot(dx,dy)||1
  const sp=t.tier>=8?900:t.tier>=6?650:t.tier>=4?630:700
  const aoeR=t.tier>=4?(60+(t.tier-4)*40)*1:0
  gs.missiles.push({x:fx,y:fy,vx:dx/d*sp,vy:dy/d*sp,dmg,tier:t.tier,kind:mkOfTier(t.tier),tid:tgt.id,aoe:t.tier>=4,aoeR,slow:t.tier>=5,chains:t.tier>=6?t.tier-4:0,fx,fy,rot:Math.random()*360,trail:[],life:99,sldur:1.8});SFX.shoot()
}

function fireLaser(gs:GS,t:Tower,fx:number,fy:number,tgt:Enemy,dmg:number,L:Layout):void{
  gs.lasers.push({fx,fy,tx:tgt.x,ty:tgt.y,tier:t.tier,life:.45});SFX.shoot()
  hitEnemy(gs,tgt,dmg,true,1.8,'LASER')
  const lc=t.tier>=6?t.tier-4:0
  if(lc>0){const near=gs.enemies.filter(e=>e!==tgt&&!e.dead).sort((a,b)=>Math.hypot(a.x-tgt.x,a.y-tgt.y)-Math.hypot(b.x-tgt.x,b.y-tgt.y)).slice(0,lc);near.forEach(e=>hitEnemy(gs,e,dmg*.5,false))}
  gs.shakeT=.12;gs.shakeAmt=6;spawnExp(gs,tgt.x,tgt.y,t.tier,30)
}

function fireUltimate(gs:GS,t:Tower,_si:number,sx:number,sy:number,L:Layout):void{
  const r=tRange(t.tier,t.mergeCount,L,gs.upgLv),am=atkMult(t.tier,gs.upgLv)
  const inR=gs.enemies.filter(e=>!e.dead&&Math.hypot(e.x-sx,e.y-sy)<=r)
  switch(t.tier){
    case 3:inR.slice(0,3).forEach(e=>{const dx=e.x-sx,dy=e.y-sy,d=Math.hypot(dx,dy)||1;gs.missiles.push({x:sx,y:sy,vx:dx/d*800,vy:dy/d*800,dmg:TDMG[2]*am*2.5,tier:3,kind:'CLAW',tid:e.id,aoe:true,aoeR:90,slow:false,chains:0,fx:sx,fy:sy,rot:Math.random()*360,trail:[],life:99,sldur:1.8})});popup(gs,sx,sy-90,'🐯 타이거 일격!','#FF6F00');gs.shakeT=.2;gs.shakeAmt=8;break
    case 4:inR.slice(0,5).forEach(e=>{const dx=e.x-sx,dy=e.y-sy,d=Math.hypot(dx,dy)||1;gs.missiles.push({x:sx,y:sy,vx:dx/d*700,vy:dy/d*700,dmg:TDMG[3]*am*2,tier:4,kind:'TORPEDO',tid:e.id,aoe:false,aoeR:0,slow:true,chains:0,fx:sx,fy:sy,rot:0,trail:[],life:99,sldur:1.8})});popup(gs,sx,sy-90,'🦈 어뢰 집중 발사!','#00BCD4');gs.shakeT=.25;gs.shakeAmt=10;break
    case 5:inR.forEach(e=>{hitEnemy(gs,e,Math.max(TDMG[4]*am*2.5,e.maxHp*.06),true,2,'FIREBALL');spawnExp(gs,e.x,e.y,5,18)});popup(gs,sx,sy-90,'🔥 드래곤 브레스!','#FF3D00');gs.shakeT=.35;gs.shakeAmt=14;break
    case 6:inR.forEach(e=>{e.wi=Math.max(0,e.wi-4);const wp=L.waypoints[e.wi];if(wp){e.x=wp.x;e.y=wp.y}e.slowT=4.5;spawnExp(gs,e.x,e.y,6,14)});popup(gs,sx,sy-90,'🌌 중력 역전!','#E91E63');gs.shakeT=.3;gs.shakeAmt=12;break
    case 7:inR.forEach(e=>{hitEnemy(gs,e,Math.max(TDMG[6]*am*3.5,e.maxHp*.08),false,1.8,'VOIDORB');spawnExp(gs,e.x,e.y,7,24)});popup(gs,sx,sy-90,'🌀 보이드 붕괴!','#00BCD4');gs.shakeT=.4;gs.shakeAmt=16;break
    case 8:gs.enemies.filter(e=>!e.dead).forEach(e=>{hitEnemy(gs,e,Math.max(TDMG[7]*am*5,e.maxHp*.10),true,1.8,'LASER');spawnExp(gs,e.x,e.y,8,28)});popup(gs,L.W/2,L.iCY-80,'⚡ 건담 오비탈 캐논!!','#FFD700');spawnFireworks(gs,L.W/2,L.iCY,80);gs.shakeT=.5;gs.shakeAmt=20;break
  }
}

function tickMissiles(gs:GS,dt:number,L:Layout):void{
  const rem:Missile[]=[]
  for(const m of gs.missiles){
    const tgt=gs.enemies.find(e=>e.id===m.tid)
    if(tgt&&!tgt.dead){
      const dx=tgt.x-m.x,dy=tgt.y-m.y,d=Math.hypot(dx,dy)||1
      const sp=Math.hypot(m.vx,m.vy)||100
      const h=m.kind==='DART'?.18:m.kind==='VOIDORB'?.15:.10
      m.vx=m.vx*(1-h)+(dx/d*sp)*h;m.vy=m.vy*(1-h)+(dy/d*sp)*h
    }
    m.x+=m.vx*dt;m.y+=m.vy*dt
    m.rot+=dt*(m.kind==='CLAW'?600:m.kind==='STARBURST'?300:0)
    m.trail.push({x:m.x,y:m.y});if(m.trail.length>12)m.trail.shift()
    if(!tgt||tgt.dead){rem.push(m);continue}
    if(Math.hypot(m.x-tgt.x,m.y-tgt.y)<34){
      if(m.aoe)gs.enemies.filter(e=>!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<=m.aoeR).forEach(e=>hitEnemy(gs,e,m.dmg*.55,m.slow,m.sldur,m.kind))
      hitEnemy(gs,tgt,m.dmg,m.slow,m.sldur,m.kind)
      if(m.chains>0)gs.enemies.filter(e=>e!==tgt&&!e.dead).sort((a,b)=>Math.hypot(a.x-tgt.x,a.y-tgt.y)-Math.hypot(b.x-tgt.x,b.y-tgt.y)).slice(0,m.chains).forEach(e=>hitEnemy(gs,e,m.dmg*.45,false))
      rem.push(m)
    }
  }
  for(const m of rem)gs.missiles.splice(gs.missiles.indexOf(m),1)
  gs.enemies=gs.enemies.filter(e=>!e.dead)
}

function tickParticles(gs:GS,dt:number):void{
  gs.particles=gs.particles.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.grav*dt;p.life-=dt;return p.life>0})
}
function tickPopups(gs:GS,dt:number):void{
  gs.popups=gs.popups.filter(p=>{p.y-=48*dt;p.life-=dt;return p.life>0})
}

function tick(gs:GS,dt:number,L:Layout):void{
  const adt=dt*gs.speed
  gs.animT+=dt*5;gs.gameTime+=adt
  if(gs.shakeT>0)gs.shakeT-=adt
  gs.lasers=gs.lasers.filter(l=>{l.life-=adt;return l.life>0})
  if(gs.phase==='PREP'){
    tickPopups(gs,adt);tickParticles(gs,adt);gs.prepT-=adt
    if(gs.prepT<=0)beginWave(gs)
    return
  }
  if(gs.phase==='WAVE'){
    tickSpawn(gs,adt,L);tickEnemies(gs,adt,L);tickTowers(gs,adt,L)
    tickMissiles(gs,adt,L);tickParticles(gs,adt);tickPopups(gs,adt)
    gs.skillCharge=Math.min(gs.skillCharge+adt,SKILL_MAX)
    if(!gs.spawnQ.length&&!gs.enemies.length)waveCleared(gs,L)
    return
  }
  tickParticles(gs,adt);tickPopups(gs,adt)
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function summonCost(gs:GS,g:number):number{
  const n=gs.summonN[g]
  return g===0?50+n*12:g===1?150+n*35:400+Math.min(n,5)*100
}
function summonChance(gs:GS,g:number):number{
  return g===0?1:g===1?.65:gs.legFails>=3?1:.30
}

function handleSummon(gs:GS,grade:number,L:Layout):void{
  const cost=summonCost(gs,grade)
  const br=grade===2?L.buyLeg:grade===1?L.buyRare:L.buyNorm
  if(gs.gold<cost){popup(gs,br.x+br.w/2,br.y-14,'💰 골드 부족!','#FF0000');return}
  const empty:number[]=[];for(let i=0;i<SLOTS;i++)if(!gs.towers[i])empty.push(i)
  if(!empty.length){popup(gs,br.x+br.w/2,br.y-14,'자리 없음!','#FF9800');return}
  gs.gold-=cost;gs.summonN[grade]++
  if(Math.random()>=summonChance(gs,grade)){
    const rf=grade>0?Math.floor(cost/2):0;if(rf>0)gs.gold+=rf
    if(grade===2)gs.legFails++
    popup(gs,br.x+br.w/2,br.y-14,grade===1?`💔 희귀 실패 (${rf}💰 환불)`:grade===2?`💔 전설 실패... (${rf}💰 환불)${gs.legFails>=2?' (다음 보장!)':''}` :'소환 실패','#FF5555')
    gs.shakeT=.15;gs.shakeAmt=8;return
  }
  if(grade===2)gs.legFails=0
  const tier=Math.min(grade===0?(Math.random()<.5?1:2):grade===1?Math.floor(Math.random()*3)+2:Math.random()<.15?(Math.random()<.5?6:7):Math.floor(Math.random()*3)+4,8)
  const idx=empty[Math.floor(Math.random()*empty.length)]
  gs.towers[idx]={tier,mergeCount:0,cooldown:0,mana:0}
  const sp=L.slotPos[idx];gs.rangeSlot=idx
  popup(gs,sp.x,sp.y-L.cellSH*.6,grade===0?'✨ 일반 소환!':grade===1?'💜 희귀 소환 성공!':'🌟 전설 소환!!',grade===0?'#00FFFF':grade===1?'#AA44FF':'#FFD700')
  spawnSparkles(gs,sp.x,sp.y,grade===2?30:grade===1?16:8,grade===0?'#00FFFF':grade===1?'#AA44FF':'#FFD700')
  if(grade===2)SFX.legendary();else SFX.summon()
  if(grade===2){gs.shakeT=.25;gs.shakeAmt=10}
}

function handleUpgrade(gs:GS,idx:number,L:Layout):void{
  const cost=UB[idx]+gs.upgLv[idx]*UI[idx]
  if(gs.gold<cost){popup(gs,L.upgPanel.x+L.upgPanel.w/2,L.upgPanel.y+20,'💰 골드 부족!','#FF0000');return}
  gs.gold-=cost;gs.upgLv[idx]++;SFX.upgrade()
  popup(gs,L.upgPanel.x+L.upgPanel.w/2,L.upgPanel.y-30,`${UE[idx]} ${UN[idx]} Lv.${gs.upgLv[idx]} (+${gs.upgLv[idx]*UP[idx]}%)`,'#00E5FF')
  spawnSparkles(gs,L.upgPanel.x+L.upgPanel.w/2,L.upgPanel.y,12,'#00E5FF')
}

function handleSkill(gs:GS,L:Layout):void{
  if(gs.skillCharge<SKILL_MAX){popup(gs,L.skillR.x+L.skillR.w/2,L.skillR.y-20,`충전 중... ${Math.floor(gs.skillCharge/SKILL_MAX*100)}%`,'#AAAAAA');return}
  gs.skillCharge=0;SFX.skill()
  const sorted=gs.enemies.filter(e=>!e.dead).sort((a,b)=>b.hp-a.hp)
  let cd=800+gs.waveNum*60
  sorted.forEach(e=>{hitEnemy(gs,e,cd,true,3,'LASER');cd*=.85})
  popup(gs,L.W/2,L.iCY-100,'⚡ 번개 폭풍!','#FFEB3B')
  gs.shakeT=.5;gs.shakeAmt=18
}

// ─── Merge/drag ───────────────────────────────────────────────────────────────
function doMerge(gs:GS,from:number,to:number,L:Layout):void{
  const a=gs.towers[from],b=gs.towers[to]
  if(!a||!b)return
  if(a.tier===b.tier&&a.tier<8){
    const nt=Math.random()<.05&&a.tier<7?a.tier+2:a.tier+1
    const mc=Math.max(a.mergeCount,b.mergeCount)+1
    gs.towers[to]={tier:Math.min(nt,8),mergeCount:mc,cooldown:0,mana:0}
    gs.towers[from]=null;gs.rangeSlot=to
    const sp=L.slotPos[to]
    popup(gs,sp.x,sp.y-60,nt>a.tier+1?'🎰 JACKPOT!! +2 티어!':'✨ 합성!','#00E5FF')
    spawnExp(gs,sp.x,sp.y,nt,30);if(nt>a.tier+1)SFX.legendary();else SFX.merge()
  } else {
    // swap
    gs.towers[to]=a;gs.towers[from]=b;gs.rangeSlot=to
    popup(gs,L.slotPos[to].x,L.slotPos[to].y-60,'↔ 교체','#FFAAAA')
  }
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function hexToRgb(hex:string):{r:number;g:number;b:number}{
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
  return{r,g,b}
}
function lighten(col:string,amt:number):string{
  const{r,g,b}=hexToRgb(col)
  return `rgb(${Math.min(255,Math.round(r+(255-r)*amt))},${Math.min(255,Math.round(g+(255-g)*amt))},${Math.min(255,Math.round(b+(255-b)*amt))})`
}
function darken(col:string,amt:number):string{
  const{r,g,b}=hexToRgb(col)
  return `rgb(${Math.max(0,Math.round(r*(1-amt)))},${Math.max(0,Math.round(g*(1-amt)))},${Math.max(0,Math.round(b*(1-amt)))})`
}
function hex2rgba(hex:string,a:number):string{const{r,g,b}=hexToRgb(hex);return`rgba(${r},${g},${b},${a})`}

// ─── Drawing ──────────────────────────────────────────────────────────────────
function drawBg(ctx:CanvasRenderingContext2D,L:Layout,animT:number):void{
  ctx.fillStyle='#060C18';ctx.fillRect(0,0,L.W,L.H)
  for(const s of L.stars){
    const tw=Math.sin(animT*.7+s.x)*.5+.5
    ctx.globalAlpha=tw*.63+.24;ctx.fillStyle='#DCE6FF'
    ctx.beginPath();ctx.arc(s.x,s.y,s.r*tw,0,Math.PI*2);ctx.fill()
  }
  ctx.globalAlpha=1
}

function drawRoad(ctx:CanvasRenderingContext2D,L:Layout,animT:number):void{
  if(L.waypoints.length<2)return
  const rw=Math.min(L.pRX,L.pRY)*.24
  const path=new Path2D()
  path.moveTo(L.waypoints[0].x,L.waypoints[0].y)
  for(let i=1;i<L.waypoints.length;i++)path.lineTo(L.waypoints[i].x,L.waypoints[i].y)
  path.closePath()
  ctx.lineCap='round';ctx.lineJoin='round'
  ctx.strokeStyle='#3C2A10';ctx.lineWidth=rw+12;ctx.stroke(path)
  ctx.strokeStyle='#A88040';ctx.lineWidth=rw;ctx.stroke(path)
  ctx.strokeStyle='#C4A26A';ctx.lineWidth=rw*.55;ctx.stroke(path)
  ctx.strokeStyle='#7A5C30';ctx.lineWidth=rw*.07
  ctx.setLineDash([22,16]);ctx.lineDashOffset=-animT*8;ctx.stroke(path);ctx.setLineDash([]);ctx.lineDashOffset=0
  // arrows
  const w=L.waypoints
  const a0=Math.atan2(w[1].y-w[0].y,w[1].x-w[0].x)
  drawArrow(ctx,w[0].x,w[0].y,a0,32)
  if(w.length>N_WP/2){const m=Math.floor(N_WP/2);const am=Math.atan2(w[m+1].y-w[m].y,w[m+1].x-w[m].x);drawArrow(ctx,w[m].x,w[m].y,am,32)}
}
function drawArrow(ctx:CanvasRenderingContext2D,cx:number,cy:number,angle:number,size:number):void{
  ctx.fillStyle='rgba(255,255,255,0.8)'
  ctx.beginPath()
  ctx.moveTo(cx+Math.cos(angle)*size,cy+Math.sin(angle)*size)
  ctx.lineTo(cx+Math.cos(angle+2.4)*size*.55,cy+Math.sin(angle+2.4)*size*.55)
  ctx.lineTo(cx+Math.cos(angle-2.4)*size*.55,cy+Math.sin(angle-2.4)*size*.55)
  ctx.closePath();ctx.fill()
}

function drawIsland(ctx:CanvasRenderingContext2D,L:Layout):void{
  const gW=L.cellSW*GRID_COLS,gH=L.cellSH*GRID_ROWS
  const fl=L.gridLeft-4,ft=L.gridTop-4,fr=fl+gW+8,fb=ft+gH+8
  ctx.save();ctx.shadowColor='rgba(0,0,0,0.4)';ctx.shadowBlur=12;ctx.shadowOffsetX=6;ctx.shadowOffsetY=8
  const g=ctx.createLinearGradient(fl,ft,fl,fb)
  g.addColorStop(0,'#3A8020');g.addColorStop(1,'#2A6015')
  ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(fl,ft,fr-fl,fb-ft,16);ctx.fill()
  ctx.restore()
  ctx.save();ctx.beginPath();ctx.roundRect(fl,ft,fr-fl,fb-ft,16);ctx.clip()
  for(let r=0;r<GRID_ROWS;r++){if(r%2===0){ctx.fillStyle='rgba(255,255,255,0.04)';ctx.fillRect(L.gridLeft,L.gridTop+r*L.cellSH,gW,L.cellSH)}}
  ctx.strokeStyle='rgba(0,0,0,0.18)';ctx.lineWidth=1.5
  for(let c=1;c<GRID_COLS;c++){ctx.beginPath();ctx.moveTo(L.gridLeft+c*L.cellSW,L.gridTop);ctx.lineTo(L.gridLeft+c*L.cellSW,L.gridTop+gH);ctx.stroke()}
  for(let r=1;r<GRID_ROWS;r++){ctx.beginPath();ctx.moveTo(L.gridLeft,L.gridTop+r*L.cellSH);ctx.lineTo(L.gridLeft+gW,L.gridTop+r*L.cellSH);ctx.stroke()}
  ctx.restore()
  ctx.strokeStyle='#1A4A08';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(fl,ft,fr-fl,fb-ft,16);ctx.stroke()
  ctx.strokeStyle='#5DB830';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(fl+2,ft+2,fr-fl-4,fb-ft-4,14);ctx.stroke()
}

function drawSlots(ctx:CanvasRenderingContext2D,L:Layout,gs:GS,dragSlot:number,dragX:number,dragY:number,dragTower:Tower|null,animT:number):void{
  const pad=5,cr=12
  for(let r=0;r<GRID_ROWS;r++){
    for(let c=0;c<GRID_COLS;c++){
      const i=r*GRID_COLS+c;if(i===dragSlot)continue
      const sp=L.slotPos[i],t=gs.towers[i]
      const x=L.gridLeft+c*L.cellSW+pad,y=L.gridTop+r*L.cellSH+pad,w=L.cellSW-pad*2,h=L.cellSH-pad*2
      if(dragTower){
        if(!t){const f=(Math.sin(animT*5)+1)/2;ctx.fillStyle=`rgba(80,180,255,${f*.31+.08})`;ctx.beginPath();ctx.roundRect(x,y,w,h,cr);ctx.fill();ctx.strokeStyle=`rgba(80,200,255,${f*.78+.22})`;ctx.lineWidth=2.5;ctx.stroke()}
        else if(t.tier===dragTower.tier&&dragTower.tier<8){const f=(Math.sin(animT*7)+1)/2;ctx.fillStyle=`rgba(0,220,130,${f*.39+.12})`;ctx.beginPath();ctx.roundRect(x,y,w,h,cr);ctx.fill();ctx.strokeStyle=`rgba(0,255,140,${f*.90+.22})`;ctx.lineWidth=3.5;ctx.stroke()}
        else{ctx.fillStyle='rgba(255,68,68,0.13)';ctx.beginPath();ctx.roundRect(x,y,w,h,cr);ctx.fill()}
      }
      if(!t&&!dragTower){ctx.fillStyle='rgba(0,0,0,0.08)';ctx.beginPath();ctx.roundRect(x,y,w,h,cr);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.19)';ctx.font=`${Math.min(L.cellSW,L.cellSH)*.28}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('+',sp.x,sp.y);ctx.textBaseline='alphabetic'}
    }
  }
}

function drawTowerAt(ctx:CanvasRenderingContext2D,t:Tower,cx:number,cy:number,cellSW:number,cellSH:number,animT:number,floating:boolean):void{
  const sc=floating?1.25:1,hR=Math.min(cellSW,cellSH)*.34*sc
  const tc=TCOL[t.tier-1],hc=THEAD[t.tier-1]
  // aura
  const pulse=(Math.sin(animT*4)+1)/2
  ctx.save();ctx.globalAlpha=.12+pulse*.18;ctx.shadowColor=tc;ctx.shadowBlur=hR
  ctx.fillStyle=tc;ctx.beginPath();ctx.ellipse(cx,cy,hR*1.5,hR*1.23,0,0,Math.PI*2);ctx.fill()
  ctx.restore()
  // body
  ctx.fillStyle=hc;ctx.beginPath();ctx.ellipse(cx,cy,hR,hR*.82,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle=lighten(hc,.28);ctx.beginPath();ctx.ellipse(cx,cy+hR*.06,hR*.52,hR*.58,0,0,Math.PI*2);ctx.fill()
  // eyes
  const eyR=hR*.20,eyY=cy-hR*.14
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx-hR*.31,eyY,eyR,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+hR*.31,eyY,eyR,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#000';ctx.beginPath();ctx.arc(cx-hR*.28,eyY+eyR*.08,eyR*.56,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+hR*.34,eyY+eyR*.08,eyR*.56,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx-hR*.22,eyY-eyR*.18,eyR*.26,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+hR*.40,eyY-eyR*.18,eyR*.26,0,Math.PI*2);ctx.fill()
  // snout
  ctx.fillStyle=darken(hc,.18);ctx.beginPath();ctx.ellipse(cx,cy+hR*.25,hR*.20,hR*.11,0,0,Math.PI*2);ctx.fill()
  // decoration
  drawDeco(ctx,t.tier,cx,cy,hR)
  // border
  ctx.strokeStyle=tc;ctx.lineWidth=hR*.10;ctx.beginPath();ctx.ellipse(cx,cy,hR,hR*.82,0,0,Math.PI*2);ctx.stroke()
  // badge
  const br=hR*.36,bx=cx+hR*.78,by=cy-hR*.78
  ctx.fillStyle=tc;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.stroke()
  ctx.fillStyle='#fff';ctx.font=`bold ${br*.98}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(TLBL[t.tier-1],bx,by);ctx.textBaseline='alphabetic'
  // name
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font=`${hR*.30}px system-ui`;ctx.textAlign='center';ctx.fillText(TNAME[t.tier-1],cx,cy+hR*1.14)
  // merge badge
  if(t.mergeCount>0){ctx.fillStyle='#00E5FF';ctx.font=`bold ${hR*.22}px system-ui`;ctx.textAlign='center';ctx.fillText(`×${t.mergeCount}`,cx-hR*.78,cy-hR*.78+hR*.36)}
  // mana bar
  if(t.tier>=3&&!floating){
    const bW=hR*1.75,bH=Math.max(hR*.17,4),bGx=cx-bW/2,bGy=cy+hR*1.38
    ctx.fillStyle='rgba(0,17,85,0.4)';ctx.beginPath();ctx.roundRect(bGx,bGy,bW,bH,bH/2);ctx.fill()
    const fr=Math.min(t.mana/100,1)
    if(fr>0){const full=fr>=.98;if(full){ctx.save();ctx.shadowColor='#FFD700';ctx.shadowBlur=bH*2}ctx.fillStyle=full?'#FFD700':'#29B6F6';ctx.beginPath();ctx.roundRect(bGx,bGy,bW*fr,bH,bH/2);ctx.fill();if(full)ctx.restore()}
  }
}

function drawDeco(ctx:CanvasRenderingContext2D,tier:number,cx:number,cy:number,r:number):void{
  const ty=cy-r*.82
  if(tier>=8){
    ctx.fillStyle='#FFD700';const cw=r*.68,ch=r*.48
    ctx.beginPath();ctx.moveTo(cx-cw,ty);ctx.lineTo(cx-cw,ty-ch);ctx.lineTo(cx-cw*.3,ty-ch*.5);ctx.lineTo(cx,ty-ch);ctx.lineTo(cx+cw*.3,ty-ch*.5);ctx.lineTo(cx+cw,ty-ch);ctx.lineTo(cx+cw,ty);ctx.closePath();ctx.fill()
    ctx.fillStyle='#FF4444';ctx.beginPath();ctx.arc(cx,ty-ch,r*.10,0,Math.PI*2);ctx.fill()
    ctx.fillStyle='#44FF88';ctx.beginPath();ctx.arc(cx-cw*.3,ty-ch*.5-r*.04,r*.07,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+cw*.3,ty-ch*.5-r*.04,r*.07,0,Math.PI*2);ctx.fill()
  } else if(tier>=6){
    ctx.fillStyle='#7B1FA2';drawHorn(ctx,cx-r*.33,ty,r*.19,-.28);drawHorn(ctx,cx+r*.33,ty,r*.19,.28)
    ctx.save();ctx.shadowColor='#E040FB';ctx.shadowBlur=r*.3;ctx.fillStyle='#E040FB'
    ctx.beginPath();ctx.arc(cx-r*.33,ty-r*.57,r*.14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+r*.33,ty-r*.57,r*.14,0,Math.PI*2);ctx.fill();ctx.restore()
  } else if(tier>=4){
    ctx.fillStyle=tier>=5?'#F5A623':'#27AE60';drawHorn(ctx,cx,ty,r*.22,0)
  } else if(tier>=2){
    ctx.fillStyle=lighten(THEAD[tier-1],.2);ctx.beginPath();ctx.arc(cx-r*.53,ty-r*.08,r*.17,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+r*.53,ty-r*.08,r*.17,0,Math.PI*2);ctx.fill()
  }
}
function drawHorn(ctx:CanvasRenderingContext2D,cx:number,bY:number,r:number,lean:number):void{
  ctx.beginPath();ctx.moveTo(cx-r,bY);ctx.lineTo(cx+r,bY);ctx.lineTo(cx+r*lean,bY-r*3);ctx.closePath();ctx.fill()
}

function drawTowers(ctx:CanvasRenderingContext2D,L:Layout,gs:GS,dragSlot:number,dragX:number,dragY:number,dragTower:Tower|null,animT:number):void{
  // drag preview range
  if(dragTower){
    const r=tRange(dragTower.tier,dragTower.mergeCount,L,gs.upgLv),pulse=(Math.sin(animT*4)+1)/2
    ctx.fillStyle=`rgba(255,220,60,${.08+pulse*.11})`;ctx.beginPath();ctx.arc(dragX,dragY,r,0,Math.PI*2);ctx.fill()
    ctx.strokeStyle=`rgba(255,235,60,${.31+pulse*.78})`;ctx.lineWidth=3.5;ctx.setLineDash([18,10]);ctx.lineDashOffset=-animT*22;ctx.beginPath();ctx.arc(dragX,dragY,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0
  }
  // selected range ring
  if(gs.rangeSlot>=0&&gs.rangeSlot<SLOTS){
    const rt=gs.towers[gs.rangeSlot]
    if(rt&&gs.rangeSlot!==dragSlot){
      const rp=L.slotPos[gs.rangeSlot],rng=tRange(rt.tier,rt.mergeCount,L,gs.upgLv),pulse=(Math.sin(animT*3.5)+1)/2
      ctx.fillStyle=`rgba(255,220,50,${.04+pulse*.09})`;ctx.beginPath();ctx.arc(rp.x,rp.y,rng,0,Math.PI*2);ctx.fill()
      ctx.strokeStyle=`rgba(255,220,50,${.29+pulse*.70})`;ctx.lineWidth=3;ctx.setLineDash([14,8]);ctx.lineDashOffset=-animT*15;ctx.beginPath();ctx.arc(rp.x,rp.y,rng,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0
    }
  }
  for(let i=0;i<SLOTS;i++){
    const t=gs.towers[i];if(!t||i===dragSlot)continue
    drawTowerAt(ctx,t,L.slotPos[i].x,L.slotPos[i].y,L.cellSW,L.cellSH,animT,false)
  }
  // dragged tower
  if(dragTower){
    ctx.save();ctx.globalAlpha=.85
    drawTowerAt(ctx,dragTower,dragX,dragY,L.cellSW,L.cellSH,animT,true)
    ctx.restore()
  }
}

function drawHex(ctx:CanvasRenderingContext2D,cx:number,cy:number,r:number,stroke=false):void{
  ctx.beginPath()
  for(let i=0;i<6;i++){const a=(i*60-30)*Math.PI/180;if(i===0)ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a));else ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a))}
  ctx.closePath();if(stroke)ctx.stroke();else ctx.fill()
}

function drawEnemies(ctx:CanvasRenderingContext2D,gs:GS,animT:number):void{
  for(const e of gs.enemies){
    if(e.dead)continue
    const er=ER[e.type],col=ECOL[e.type]
    ctx.save();ctx.shadowColor='rgba(0,0,0,0.4)';ctx.shadowBlur=er*.5
    ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(e.x,e.y+er*.85,er*.85,er*.22,0,0,Math.PI*2);ctx.fill()
    ctx.restore()
    switch(e.type){
      case 'BOSS':{
        const p=1+Math.sin(e.anim)*.10
        ctx.save();ctx.shadowColor='rgba(255,0,0,0.67)';ctx.shadowBlur=er*.9
        ctx.fillStyle='rgba(255,0,0,0.67)';ctx.beginPath();ctx.arc(e.x,e.y,er*p*1.5,0,Math.PI*2);ctx.fill();ctx.restore()
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(e.x,e.y,er*p,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#000';ctx.beginPath();ctx.arc(e.x,e.y,er*p*.7,0,Math.PI*2);ctx.fill()
        ctx.save();ctx.shadowColor='#FF0000';ctx.shadowBlur=er*.2;ctx.fillStyle='#FF4444'
        ctx.beginPath();ctx.arc(e.x-er*.28,e.y-er*.1,er*.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+er*.28,e.y-er*.1,er*.12,0,Math.PI*2);ctx.fill();ctx.restore()
        ctx.strokeStyle='#FF4444';ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,er*p,0,Math.PI*2);ctx.stroke()
        ctx.font=`${er*.9}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FF6666';ctx.fillText('💀',e.x,e.y+er*.05);ctx.textBaseline='alphabetic';break}
      case 'DEMON':{
        const bob=Math.sin(e.anim)*er*.06
        ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(e.x,e.y+bob,er,er*.85,0,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#880000'
        ctx.beginPath();ctx.moveTo(e.x-er*.5,e.y+bob-er*.8);ctx.lineTo(e.x-er*.7,e.y+bob-er*1.5);ctx.lineTo(e.x-er*.25,e.y+bob-er*.8);ctx.closePath();ctx.fill()
        ctx.beginPath();ctx.moveTo(e.x+er*.5,e.y+bob-er*.8);ctx.lineTo(e.x+er*.7,e.y+bob-er*1.5);ctx.lineTo(e.x+er*.25,e.y+bob-er*.8);ctx.closePath();ctx.fill()
        ctx.save();ctx.shadowColor='#FF2200';ctx.shadowBlur=er*.15;ctx.fillStyle='#FF6600'
        ctx.beginPath();ctx.arc(e.x-er*.3,e.y+bob-er*.15,er*.1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+er*.3,e.y+bob-er*.15,er*.1,0,Math.PI*2);ctx.fill();ctx.restore()
        ctx.strokeStyle='#880000';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(e.x,e.y+bob,er,er*.85,0,0,Math.PI*2);ctx.stroke();break}
      case 'GOLEM':{
        ctx.fillStyle=col;drawHex(ctx,e.x,e.y,er)
        ctx.fillStyle='#8B4513';drawHex(ctx,e.x,e.y,er*.75)
        const p=(Math.sin(e.anim)+1)/2;ctx.save();ctx.shadowColor='#FF8800';ctx.shadowBlur=er*.3
        ctx.fillStyle=`rgba(255,120,0,${.24+p*.63})`;ctx.beginPath();ctx.arc(e.x,e.y,er*.4,0,Math.PI*2);ctx.fill();ctx.restore()
        ctx.fillStyle='#FF8800';ctx.beginPath();ctx.arc(e.x,e.y,er*.25,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#FF4400';ctx.beginPath();ctx.arc(e.x-er*.35,e.y-er*.2,er*.14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+er*.35,e.y-er*.2,er*.14,0,Math.PI*2);ctx.fill()
        ctx.strokeStyle='#5D4037';ctx.lineWidth=3;drawHex(ctx,e.x,e.y,er,true);break}
      case 'DRAGON':{
        const bob=Math.sin(e.anim*1.5)*er*.08
        ctx.fillStyle=darken(col,.3)
        ctx.beginPath();ctx.moveTo(e.x,e.y+bob);ctx.lineTo(e.x-er*1.8,e.y+bob-er*.8);ctx.lineTo(e.x-er*.6,e.y+bob+er*.2);ctx.closePath();ctx.fill()
        ctx.beginPath();ctx.moveTo(e.x,e.y+bob);ctx.lineTo(e.x+er*1.8,e.y+bob-er*.8);ctx.lineTo(e.x+er*.6,e.y+bob+er*.2);ctx.closePath();ctx.fill()
        ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(e.x,e.y+bob,er*.8,er,0,0,Math.PI*2);ctx.fill()
        ctx.save();ctx.shadowColor='#00FF44';ctx.shadowBlur=er*.1;ctx.fillStyle='#00FF44'
        ctx.beginPath();ctx.arc(e.x-er*.25,e.y+bob-er*.25,er*.14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+er*.25,e.y+bob-er*.25,er*.14,0,Math.PI*2);ctx.fill();ctx.restore()
        ctx.fillStyle='#000';ctx.beginPath();ctx.arc(e.x-er*.25,e.y+bob-er*.25,er*.08,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+er*.25,e.y+bob-er*.25,er*.08,0,Math.PI*2);ctx.fill();break}
      case 'NECROMANCER':{
        const bob=Math.sin(e.anim)*er*.07
        ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(e.x,e.y+bob,er*.7,er*.8,0,0,Math.PI*2);ctx.fill()
        ctx.strokeStyle='#4A90E2';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(e.x+er*.5,e.y+bob+er*.8);ctx.lineTo(e.x+er*.5,e.y+bob-er*1.2);ctx.stroke()
        ctx.save();ctx.shadowColor='#00FFFF';ctx.shadowBlur=er*.2;ctx.fillStyle='#00FFFF';ctx.beginPath();ctx.arc(e.x+er*.5,e.y+bob-er*1.2,er*.2,0,Math.PI*2);ctx.fill();ctx.restore()
        ctx.fillStyle=darken(col,.25)
        ctx.beginPath();ctx.moveTo(e.x-er*.65,e.y+bob-er*.55);ctx.lineTo(e.x,e.y+bob-er*1.25);ctx.lineTo(e.x+er*.65,e.y+bob-er*.55);ctx.closePath();ctx.fill()
        ctx.save();ctx.shadowColor='#AA00FF';ctx.shadowBlur=er*.12;ctx.fillStyle='#AA00FF'
        ctx.beginPath();ctx.arc(e.x-er*.22,e.y+bob-er*.35,er*.13,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+er*.22,e.y+bob-er*.35,er*.13,0,Math.PI*2);ctx.fill();ctx.restore();break}
      case 'ARMORED':{
        ctx.fillStyle=col;drawHex(ctx,e.x,e.y,er)
        for(let i=0;i<6;i++){const a=i*60*Math.PI/180;ctx.fillStyle='#AAAAAA';ctx.beginPath();ctx.arc(e.x+er*.72*Math.cos(a),e.y+er*.72*Math.sin(a),er*.1,0,Math.PI*2);ctx.fill()}
        ctx.strokeStyle='rgba(221,221,221,0.67)';ctx.lineWidth=3;drawHex(ctx,e.x,e.y,er,true)
        ctx.font=`${er*.8}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText('🛡',e.x,e.y+er*.05);ctx.textBaseline='alphabetic';break}
      case 'SPEEDER':{
        ctx.fillStyle=col
        ctx.beginPath();ctx.moveTo(e.x-er*1.4,e.y);ctx.lineTo(e.x+er*.4,e.y-er);ctx.lineTo(e.x+er*.9,e.y);ctx.lineTo(e.x+er*.4,e.y+er);ctx.closePath();ctx.fill()
        ctx.strokeStyle='rgba(255,255,0,0.47)';ctx.lineWidth=3
        ctx.beginPath();ctx.moveTo(e.x-er*1.8,e.y-er*.3);ctx.lineTo(e.x-er*.5,e.y-er*.3);ctx.stroke()
        ctx.beginPath();ctx.moveTo(e.x-er*1.6,e.y);ctx.lineTo(e.x-er*.3,e.y);ctx.stroke()
        ctx.beginPath();ctx.moveTo(e.x-er*1.8,e.y+er*.3);ctx.lineTo(e.x-er*.5,e.y+er*.3);ctx.stroke()
        ctx.save();ctx.shadowColor='#FFFF00';ctx.shadowBlur=er*.15;ctx.fillStyle='#FFFF00';ctx.beginPath();ctx.arc(e.x+er*.4,e.y,er*.22,0,Math.PI*2);ctx.fill();ctx.restore();break}
      default:{// SLIME, WORM
        const bob=Math.sin(e.anim)*er*.09
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(e.x,e.y+bob,er,0,Math.PI*2);ctx.fill()
        ctx.fillStyle=lighten(col,.32);ctx.beginPath();ctx.arc(e.x-er*.27,e.y+bob-er*.28,er*.34,0,Math.PI*2);ctx.fill()
        const eyR=er*.24,eyY=e.y+bob-er*.15
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(e.x-er*.30,eyY,eyR,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+er*.30,eyY,eyR,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(e.x-er*.30,eyY,eyR*.3,eyR*.7,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(e.x+er*.30,eyY,eyR*.3,eyR*.7,0,0,Math.PI*2);ctx.fill()
        if(e.type==='WORM'){ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(e.x,e.y+bob+er*.27,er*.35,0,Math.PI,false);ctx.stroke()}
        ctx.strokeStyle=darken(col,.25);ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y+bob,er,0,Math.PI*2);ctx.stroke()}
    }
    // slow/poison rings
    if(e.slowT>0){ctx.strokeStyle='rgba(0,136,255,0.53)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,er+5,0,Math.PI*2);ctx.stroke()}
    if(e.poisonT>0){ctx.strokeStyle='rgba(255,102,0,0.67)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,er+8,0,Math.PI*2);ctx.stroke()}
    // label+emoji
    ctx.font=`bold ${er*.48}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(`${EEMO[e.type]} ${ELBL[e.type]}`,e.x,e.y-er-16)
    // HP bar
    const bW=er*2.4,bH=7,bx=e.x-bW/2,by=e.y-er-10
    ctx.fillStyle='#330000';ctx.beginPath();ctx.roundRect(bx,by,bW,bH,4);ctx.fill()
    const fr=Math.max(0,Math.min(1,e.hp/e.maxHp))
    ctx.fillStyle=fr<.3?'#FF3D00':'#4CAF50';ctx.beginPath();ctx.roundRect(bx,by,bW*fr,bH,4);ctx.fill()
  }
}

function drawMissiles(ctx:CanvasRenderingContext2D,gs:GS):void{
  for(const m of gs.missiles){
    const tc=TCOL[Math.min(m.tier-1,7)]
    // trail
    for(let ti=1;ti<m.trail.length;ti++){
      const a=ti/m.trail.length,r=(m.kind==='FIREBALL'?9:5)*a
      ctx.fillStyle=hex2rgba(tc,a*.63);ctx.beginPath();ctx.arc(m.trail[ti].x,m.trail[ti].y,r,0,Math.PI*2);ctx.fill()
    }
    const r=missileR(m.kind)
    switch(m.kind){
      case 'BULLET':ctx.save();ctx.shadowColor='#4FC3F7';ctx.shadowBlur=r*.8;ctx.fillStyle='#4FC3F7';ctx.beginPath();ctx.arc(m.x,m.y,r*1.3,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(m.x,m.y,r,0,Math.PI*2);ctx.fill();break
      case 'DART':{const ang=Math.atan2(m.vy,m.vx);ctx.save();ctx.translate(m.x,m.y);ctx.rotate(ang);ctx.fillStyle='#FFD700';ctx.beginPath();ctx.moveTo(r*2.2,0);ctx.lineTo(-r*.8,-r*.6);ctx.lineTo(-r*.4,0);ctx.lineTo(-r*.8,r*.6);ctx.closePath();ctx.fill();ctx.restore();break}
      case 'CLAW':{ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.rot*Math.PI/180);ctx.fillStyle='#FF6F00';for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);ctx.beginPath();ctx.moveTo(0,-r*1.4);ctx.lineTo(-r*.5,r*.4);ctx.lineTo(r*.5,r*.4);ctx.closePath();ctx.fill();ctx.restore()}ctx.fillStyle='#FF3D00';ctx.beginPath();ctx.arc(0,0,r*.5,0,Math.PI*2);ctx.fill();ctx.restore();break}
      case 'TORPEDO':{const ang=Math.atan2(m.vy,m.vx);ctx.save();ctx.translate(m.x,m.y);ctx.rotate(ang);ctx.fillStyle='#00BCD4';ctx.beginPath();ctx.ellipse(0,0,r*1.8,r*.55,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#00E5FF';ctx.beginPath();ctx.arc(r*.8,0,r*.4,0,Math.PI*2);ctx.fill();ctx.restore();break}
      case 'FIREBALL':ctx.save();ctx.shadowColor='rgba(255,61,0,0.67)';ctx.shadowBlur=r;ctx.fillStyle='#FF6F00';ctx.beginPath();ctx.arc(m.x,m.y,r,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle='#FFD600';ctx.beginPath();ctx.arc(m.x,m.y,r*.58,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(m.x-r*.2,m.y-r*.2,r*.25,0,Math.PI*2);ctx.fill();break
      case 'STARBURST':{ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.rot*Math.PI/180);ctx.save();ctx.shadowColor='#E040FB';ctx.shadowBlur=r*.7;ctx.fillStyle='#E040FB';ctx.beginPath();ctx.arc(0,0,r*1.3,0,Math.PI*2);ctx.fill();ctx.restore();ctx.strokeStyle='#CE93D8';ctx.lineWidth=3;for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(r*1.5*Math.cos(a),r*1.5*Math.sin(a));ctx.stroke()}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r*.5,0,Math.PI*2);ctx.fill();ctx.restore();break}
      case 'VOIDORB':ctx.save();ctx.shadowColor='#6A1B9A';ctx.shadowBlur=r*1.2;ctx.fillStyle='rgba(106,27,154,0.67)';ctx.beginPath();ctx.arc(m.x,m.y,r*1.6,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle='#12002F';ctx.beginPath();ctx.arc(m.x,m.y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#AA00FF';ctx.lineWidth=3;ctx.beginPath();ctx.arc(m.x,m.y,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){const a=(m.rot+i*90)*Math.PI/180;ctx.fillStyle='#E040FB';ctx.beginPath();ctx.arc(m.x+r*1.1*Math.cos(a),m.y+r*1.1*Math.sin(a),r*.22,0,Math.PI*2);ctx.fill()}break
    }
  }
}
function missileR(k:MK):number{return k==='BULLET'?11:k==='DART'?10:k==='CLAW'?15:k==='TORPEDO'?13:k==='FIREBALL'?21:k==='STARBURST'?16:k==='VOIDORB'?18:0}

function drawLasers(ctx:CanvasRenderingContext2D,gs:GS):void{
  for(const l of gs.lasers){
    const frac=l.life/.45,a=Math.min(1,frac),tc=TCOL[Math.min(l.tier-1,7)]
    ctx.save();ctx.strokeStyle=hex2rgba(tc,a/5);ctx.lineWidth=22;ctx.lineCap='round';ctx.shadowColor=tc;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(l.fx,l.fy);ctx.lineTo(l.tx,l.ty);ctx.stroke();ctx.restore()
    ctx.strokeStyle=hex2rgba(tc,a);ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(l.fx,l.fy);ctx.lineTo(l.tx,l.ty);ctx.stroke()
    ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(l.fx,l.fy);ctx.lineTo(l.tx,l.ty);ctx.stroke()
    ctx.lineCap='butt'
  }
}

function drawParticles(ctx:CanvasRenderingContext2D,gs:GS):void{
  for(const p of gs.particles){
    const a=p.life/p.ml;ctx.globalAlpha=Math.max(0,a);ctx.fillStyle=p.col;const r=p.r*Math.max(.3,a);ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill()
  }
  ctx.globalAlpha=1
}
function drawPopups(ctx:CanvasRenderingContext2D,gs:GS,hudH:number):void{
  for(const p of gs.popups){
    const a=p.life/p.ml;ctx.globalAlpha=Math.max(0,a);ctx.fillStyle=p.col;ctx.font=`bold ${hudH*.24}px system-ui`;ctx.textAlign='center';ctx.fillText(p.txt,p.x,p.y)
  }
  ctx.globalAlpha=1
}

function drawHud(ctx:CanvasRenderingContext2D,L:Layout,gs:GS):void{
  ctx.fillStyle='#0E0520';ctx.fillRect(0,0,L.W,L.hudH)
  ctx.fillStyle='#6A1B9A';ctx.fillRect(0,L.hudH-3,L.W,3)
  const third=L.W/3,cy=L.hudH*.55,ts=L.hudH*.26,pad=L.W*.025
  ctx.font=`bold ${ts}px system-ui`;ctx.textBaseline='middle'
  // lives
  const lf=gs.lives/START_LIVES;ctx.textAlign='left'
  ctx.fillStyle=lf>.5?'#FF6B8A':lf>.25?'#FF9900':'#FF3333'
  ctx.fillText(`❤ ${gs.lives}`,pad,cy)
  ctx.font=`${ts*.55}px system-ui`;ctx.fillStyle='rgba(255,255,255,0.6)'
  ctx.fillText(`/${START_LIVES}`,pad+ts*2.8,cy);ctx.font=`bold ${ts}px system-ui`
  // wave
  ctx.textAlign='center'
  const ws=gs.phase==='PREP'?`준비 ${gs.waveNum+1}/${MAX_WAVES}`:gs.phase==='WAVE'?gs.waveNum%5===0?`💀 BOSS ${gs.waveNum}/${MAX_WAVES}`:`🌊 ${gs.waveNum}/${MAX_WAVES}`:gs.phase==='WIN'?'🏆 클리어!':'💀 게임오버'
  ctx.fillStyle=gs.waveNum%5===0&&gs.phase==='WAVE'?'#FF4444':'#fff'
  ctx.fillText(ws,third+third/2,cy)
  ctx.font=`${ts*.42}px system-ui`;ctx.fillStyle='rgba(255,255,255,0.53)';ctx.fillText('🐍 Island Defense',third+third/2,L.hudH-5)
  // gold
  ctx.font=`bold ${ts}px system-ui`;ctx.textAlign='right';ctx.fillStyle='#FFD700'
  ctx.fillText(`💰${gs.gold}`,L.W-pad,cy)
  // leak warning
  if(gs.totalLeaked>0){
    const lk=gs.totalLeaked/LEAK_MAX;ctx.font=`${ts*.48}px system-ui`;ctx.textAlign='right'
    ctx.fillStyle=lk>.7?'#FF3333':lk>.4?'#FF9900':'#FFAA44'
    ctx.fillText(`⚠ 돌파 ${gs.totalLeaked}/${LEAK_MAX}`,L.W-pad,L.hudH-5)
  }
  ctx.textBaseline='alphabetic'
}

function drawBtn(ctx:CanvasRenderingContext2D,r:Rect,gc1:string,gc2:string,label:string,sub:string,ts:number,ts2:number,border?:string,borderA=1):void{
  const g=ctx.createLinearGradient(r.x,r.y,r.x+r.w,r.y+r.h)
  g.addColorStop(0,gc1);g.addColorStop(1,gc2)
  ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,14);ctx.fill()
  ctx.fillStyle='rgba(255,255,255,0.13)';ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h*.42,14);ctx.fill()
  if(border){ctx.strokeStyle=border;ctx.globalAlpha=borderA;ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,14);ctx.stroke();ctx.globalAlpha=1}
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle'
  ctx.font=`bold ${ts}px system-ui`;ctx.fillText(label,r.x+r.w/2,r.y+r.h/2-ts2*.15)
  ctx.font=`${ts2*.86}px system-ui`;ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillText(sub,r.x+r.w/2,r.y+r.h/2+ts*.55)
  ctx.textBaseline='alphabetic'
}

function drawControls(ctx:CanvasRenderingContext2D,L:Layout,gs:GS):void{
  const g=ctx.createLinearGradient(0,L.ctrlTop,0,L.H)
  g.addColorStop(0,'#0A1520');g.addColorStop(1,'#121E2E')
  ctx.fillStyle=g;ctx.fillRect(0,L.ctrlTop,L.W,L.ctrlH)
  const ts=L.ctrlH*.088,ts2=ts*.80,pulse=(Math.sin(gs.animT*3)+1)/2
  // summon buttons
  for(let g2=0;g2<3;g2++){
    const r=g2===0?L.buyNorm:g2===1?L.buyRare:L.buyLeg
    const cost=summonCost(gs,g2),can=gs.gold>=cost
    const [gc1,gc2]=g2===0?can?['#1E3A5F','#0D47A1']:['#1C2030','#1C2030']:g2===1?can?['#4A148C','#7B1FA2']:['#1C2030','#1C2030']:can?['#7F0000','#B71C1C']:['#1C2030','#1C2030']
    const border=can&&g2>0?g2===2?`rgba(255,215,0,${.22+pulse*.78})`:`rgba(180,80,255,${.22+pulse*.63})`:undefined
    const lbl=g2===0?'일반':g2===1?'희귀':'전설'
    const ch=g2===0?'100%':g2===1?'65%':'30%'
    drawBtn(ctx,r,gc1,gc2,lbl,`💰${cost} (${ch})`,ts,ts2,border,1)
    if(!can){ctx.globalAlpha=.35;ctx.fillStyle='#000';ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,14);ctx.fill();ctx.globalAlpha=1}
  }
  // skip
  const spReady=gs.phase==='PREP'
  drawBtn(ctx,L.skipR,spReady?'#6A1B9A':'#141E2A',spReady?'#AD1457':'#1A2436',spReady?'⚡ 즉시시작':'⏸ 대기','',ts*1.05,ts2)
  // speed
  drawBtn(ctx,L.spdR,gs.speed===2?'#1B5E20':'#141E2A',gs.speed===2?'#00897B':'#1A2436',gs.speed===2?'▶▶ 2배속':'▶ 1배속','',ts*1.05,ts2)
  // skill
  const skR=gs.skillCharge>=SKILL_MAX,skF=gs.skillCharge/SKILL_MAX
  drawBtn(ctx,L.skillR,skR?'#FF6F00':'#1A1A30',skR?'#FFD700':'#252540','⚡ 번개',skR?'✨ 발동!':skF>0?`${Math.floor(skF*100)}%`:'',ts*.88,ts2*.78,skR?`rgba(255,215,0,${.22+pulse*.78})`:undefined)
  if(!skR&&skF>0){
    const fillR={x:L.skillR.x,y:L.skillR.y+L.skillR.h*(1-skF),w:L.skillR.w,h:L.skillR.h*skF}
    const fg=ctx.createLinearGradient(fillR.x,fillR.y,fillR.x+fillR.w,fillR.y+fillR.h)
    fg.addColorStop(0,'#3A7BD5');fg.addColorStop(1,'#00D2FF')
    ctx.fillStyle=fg;ctx.beginPath();ctx.roundRect(fillR.x,fillR.y,fillR.w,fillR.h,0);ctx.fill()
  }
  // upgrade
  const tu=gs.upgLv.reduce((a,b)=>a+b,0)
  drawBtn(ctx,L.upgR,gs.showUpg?'#B8860B':'#1A2A1A',gs.showUpg?'#FFD700':'#2E4020','⬆️ 업그레이드',tu>0?`총 Lv.${tu}`:'',ts*1.05,ts2,gs.showUpg?'rgba(255,215,0,0.67)':undefined)
  // spawn remaining
  if(gs.phase==='WAVE'&&gs.spawnQ.length){ctx.fillStyle='rgba(255,255,255,0.53)';ctx.font=`${L.hudH*.24}px system-ui`;ctx.textAlign='center';ctx.fillText(`적 ${gs.spawnQ.length}마리 남음`,L.W/2,L.ctrlTop-8)}
}

function drawUpgradePanel(ctx:CanvasRenderingContext2D,L:Layout,gs:GS):void{
  const pr=L.upgPanel,ts=pr.h/6*.24,ts2=pr.h/6*.19,cr=16
  ctx.fillStyle='rgba(0,0,0,0.27)';ctx.save();ctx.shadowBlur=18;ctx.shadowOffsetX=6;ctx.shadowOffsetY=6
  ctx.beginPath();ctx.roundRect(pr.x,pr.y,pr.w,pr.h,cr);ctx.fill();ctx.restore()
  const bg=ctx.createLinearGradient(pr.x,pr.y,pr.x,pr.y+pr.h)
  bg.addColorStop(0,'#0D1B2A');bg.addColorStop(1,'#071018')
  ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(pr.x,pr.y,pr.w,pr.h,cr);ctx.fill()
  ctx.strokeStyle='#2A5090';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(pr.x,pr.y,pr.w,pr.h,cr);ctx.stroke()
  // title bar
  const tg=ctx.createLinearGradient(pr.x,pr.y,pr.x+pr.w,pr.y)
  tg.addColorStop(0,'#1565C0');tg.addColorStop(1,'#7B1FA2')
  ctx.fillStyle=tg;ctx.beginPath();ctx.roundRect(pr.x,pr.y,pr.w,44,cr);ctx.fill()
  ctx.fillStyle='#1565C0';ctx.fillRect(pr.x,pr.y+22,pr.w,22)
  ctx.fillStyle='#fff';ctx.font=`bold ${ts*1.05}px system-ui`;ctx.textAlign='center';ctx.fillText('⬆️ 업그레이드',pr.x+pr.w/2,pr.y+30)
  ctx.textAlign='right';ctx.fillStyle='rgba(255,170,170,0.8)';ctx.font=`${ts*1.1}px system-ui`;ctx.fillText('✕',pr.x+pr.w-14,pr.y+30)
  // rows
  const bCols=['#9E9E9E','#7B1FA2','#FFD700','#4CAF50','#FF9800','#4FC3F7']
  for(let i=0;i<6;i++){
    const rr=L.upgRows[i],lvl=gs.upgLv[i],cost=UB[i]+lvl*UI[i],can=gs.gold>=cost,pct=lvl*UP[i],bc=bCols[i]
    ctx.fillStyle=i%2===0?'rgba(255,255,255,0.094)':'rgba(255,255,255,0.047)';ctx.beginPath();ctx.roundRect(rr.x,rr.y,rr.w,rr.h,8);ctx.fill()
    ctx.fillStyle=bc;ctx.beginPath();ctx.roundRect(rr.x,rr.y,5,rr.h,4);ctx.fill()
    ctx.fillStyle='#fff';ctx.font=`bold ${ts}px system-ui`;ctx.textAlign='left';ctx.fillText(`${UE[i]} ${UN[i]}`,rr.x+12,rr.y+rr.h*.52)
    ctx.font=`${ts2}px system-ui`;ctx.fillStyle=lvl>0?'#88FF88':'rgba(255,255,255,0.53)';ctx.fillText(lvl===0?'Lv.0':`Lv.${lvl} (+${pct}%)`,rr.x+12,rr.y+rr.h*.84)
    const bw=rr.w*.34,bh=rr.h*.72,bx=rr.x+rr.w-bw-8,by=rr.y+(rr.h-bh)/2
    const bg2=ctx.createLinearGradient(bx,by,bx+bw,by+bh)
    bg2.addColorStop(0,can?bc:'#222');bg2.addColorStop(1,can?darken(bc,.35):'#222')
    ctx.fillStyle=bg2;ctx.beginPath();ctx.roundRect(bx,by,bw,bh,8);ctx.fill()
    ctx.fillStyle=can?'#fff':'rgba(255,255,255,0.33)';ctx.font=`bold ${ts*.82}px system-ui`;ctx.textAlign='center';ctx.fillText(`💰${cost}`,bx+bw/2,by+bh*.62)
  }
  ctx.textAlign='right';ctx.fillStyle='#FFD700';ctx.font=`bold ${ts2*.9}px system-ui`;ctx.fillText(`보유 💰${gs.gold}`,pr.x+pr.w-14,pr.y+pr.h-8)
}

function drawPrepOverlay(ctx:CanvasRenderingContext2D,L:Layout,gs:GS):void{
  if(gs.phase!=='PREP')return
  const secs=Math.ceil(gs.prepT)
  if(secs<=3&&gs.waveNum>0)return
  const cy=L.H*.5
  ctx.fillStyle='rgba(6,12,24,0.8)';ctx.beginPath();ctx.roundRect(L.W*.08,cy-L.hudH*1.5,L.W*.84,L.hudH*3,22);ctx.fill()
  ctx.fillStyle='#fff';ctx.font=`bold ${L.hudH*.40}px system-ui`;ctx.textAlign='center'
  const nxt=gs.waveNum+1;ctx.fillText(`🌊 웨이브 ${nxt}${nxt%5===0?' ⚠️ BOSS!':''}`,L.W/2,cy-L.hudH*.20)
  ctx.fillStyle='#FFD700';ctx.font=`${L.hudH*.27}px system-ui`
  ctx.fillText(`${secs}초 후 시작  (⚡ 즉시 버튼)`,L.W/2,cy+L.hudH*.70)
}

function renderAll(ctx:CanvasRenderingContext2D,L:Layout,gs:GS,dragSlot:number,dragX:number,dragY:number,dragTower:Tower|null):void{
  ctx.save()
  if(gs.shakeT>0){const sx=(Math.random()-.5)*gs.shakeAmt,sy=(Math.random()-.5)*gs.shakeAmt;ctx.translate(sx,sy)}
  drawBg(ctx,L,gs.animT)
  drawRoad(ctx,L,gs.animT)
  drawIsland(ctx,L)
  drawSlots(ctx,L,gs,dragSlot,dragX,dragY,dragTower,gs.animT)
  drawTowers(ctx,L,gs,dragSlot,dragX,dragY,dragTower,gs.animT)
  drawEnemies(ctx,gs,gs.animT)
  drawMissiles(ctx,gs)
  drawLasers(ctx,gs)
  drawParticles(ctx,gs)
  if(dragTower)drawTowers(ctx,L,gs,dragSlot,dragX,dragY,dragTower,gs.animT)
  drawPopups(ctx,gs,L.hudH)
  drawHud(ctx,L,gs)
  drawControls(ctx,L,gs)
  if(gs.showUpg){ctx.fillStyle='rgba(0,0,0,0.73)';ctx.fillRect(0,L.hudH,L.W,L.ctrlTop-L.hudH);drawUpgradePanel(ctx,L,gs)}
  drawPrepOverlay(ctx,L,gs)
  ctx.restore()
}

// ─── Rect hit test ────────────────────────────────────────────────────────────
function inR(x:number,y:number,r:Rect):boolean{return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h}
function findSlot(x:number,y:number,L:Layout):number{
  let best=-1,bd=Infinity
  for(let i=0;i<SLOTS;i++){const d=Math.hypot(x-L.slotPos[i].x,y-L.slotPos[i].y);if(d<=L.slotR*1.5&&d<bd){bd=d;best=i}}
  return best
}

// ─── Component ───────────────────────────────────────────────────────────────
interface Props{onClose:()=>void}

export default function DefenseGame({onClose}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const gsRef=useRef<GS>(initGS())
  const layoutRef=useRef<Layout|null>(null)
  const rafRef=useRef(0)
  const lastRef=useRef(0)
  const frameRef=useRef(0)
  // drag state
  const dragRef=useRef({slot:-1,tower:null as Tower|null,x:0,y:0,downMs:0,rangeSlot:-1})

  const [ui,setUi]=useState({phase:'PREP' as GP,wave:0,alive:true})

  const getLayout=useCallback(():Layout=>{
    const canvas=canvasRef.current!
    const W=canvas.offsetWidth,H=canvas.offsetHeight
    if(!layoutRef.current||layoutRef.current.W!==W||layoutRef.current.H!==H){
      layoutRef.current=computeLayout(W,H,layoutRef.current?.stars)
    }
    return layoutRef.current!
  },[])

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d');if(!ctx)return
    function resize(){
      canvas!.width=canvas!.offsetWidth*devicePixelRatio
      canvas!.height=canvas!.offsetHeight*devicePixelRatio
      ctx!.scale(devicePixelRatio,devicePixelRatio)
      layoutRef.current=null // force recompute
    }
    resize()
    const ro=new ResizeObserver(resize);ro.observe(canvas)

    function loop(ts:number){
      const dt=Math.min(.05,(ts-lastRef.current)/1000);lastRef.current=ts;frameRef.current++
      const gs=gsRef.current;const L=getLayout()
      if(gs.phase==='WAVE'||gs.phase==='PREP')tick(gs,dt,L)
      else if(gs.phase==='OVER'||gs.phase==='WIN'){tickParticles(gs,dt*gs.speed);tickPopups(gs,dt*gs.speed);gs.lasers=gs.lasers.filter(l=>{l.life-=dt;return l.life>0})}
      const dr=dragRef.current
      renderAll(ctx!,L,gs,dr.slot,dr.x,dr.y,dr.tower)
      if(frameRef.current%20===0)setUi({phase:gs.phase,wave:gs.waveNum,alive:gs.lives>0})
      rafRef.current=requestAnimationFrame(loop)
    }
    rafRef.current=requestAnimationFrame(ts=>{lastRef.current=ts;rafRef.current=requestAnimationFrame(loop)})
    return()=>{cancelAnimationFrame(rafRef.current);ro.disconnect()}
  },[getLayout])

  // pointer handlers
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return
    const rect=()=>canvas.getBoundingClientRect()
    function pos(e:PointerEvent):{x:number;y:number}{const r=rect();return{x:e.clientX-r.left,y:e.clientY-r.top}}

    function onDown(e:PointerEvent){
      getActx() // 첫 터치로 AudioContext 활성화
      const{x,y}=pos(e);const gs=gsRef.current;const L=getLayout();const dr=dragRef.current
      // upgrade panel open
      if(gs.showUpg){
        if(inR(x,y,L.upgR)){gs.showUpg=false;return}
        if(inR(x,y,L.upgPanel)){
          if(y<L.upgPanel.y+52&&x>L.upgPanel.x+L.upgPanel.w-80){gs.showUpg=false;return}
          for(let i=0;i<6;i++){if(inR(x,y,L.upgRows[i])){handleUpgrade(gs,i,L);return}}
          return
        }
        gs.showUpg=false
      }
      // buttons
      if(inR(x,y,L.buyNorm)){handleSummon(gs,0,L);return}
      if(inR(x,y,L.buyRare)){handleSummon(gs,1,L);return}
      if(inR(x,y,L.buyLeg)){handleSummon(gs,2,L);return}
      if(inR(x,y,L.upgR)){gs.showUpg=!gs.showUpg;return}
      if(inR(x,y,L.skillR)){handleSkill(gs,L);return}
      if(inR(x,y,L.spdR)){gs.speed=gs.speed===1?2:1;return}
      if(inR(x,y,L.skipR)&&gs.phase==='PREP'){gs.prepT=0;return}
      // tower drag
      dr.downMs=Date.now()
      const idx=findSlot(x,y,L)
      if(idx>=0&&gs.towers[idx]){dr.slot=idx;dr.tower=gs.towers[idx];gs.towers[idx]=null;dr.x=x;dr.y=y;(canvas as HTMLCanvasElement).setPointerCapture(e.pointerId)}
    }
    function onMove(e:PointerEvent){const{x,y}=pos(e);const dr=dragRef.current;if(dr.tower){dr.x=x;dr.y=y}}
    function onUp(e:PointerEvent){
      const{x,y}=pos(e);const gs=gsRef.current;const L=getLayout();const dr=dragRef.current
      if(dr.tower){
        const di=findSlot(x,y,L);let placed=false
        if(di>=0&&di!==dr.slot){
          const dst=gs.towers[di]
          if(!dst){gs.towers[di]=dr.tower;placed=true;gs.rangeSlot=di}
          else{gs.towers[dr.slot]=dr.tower;doMerge(gs,dr.slot,di,L);placed=true}
        }
        if(!placed){gs.towers[dr.slot]=dr.tower;gs.rangeSlot=dr.slot}
        dr.tower=null;dr.slot=-1
      } else if(Date.now()-dr.downMs<220){
        const idx=findSlot(x,y,L)
        gs.rangeSlot=idx>=0&&gs.towers[idx]?(gs.rangeSlot===idx?-1:idx):-1
      }
    }
    canvas.addEventListener('pointerdown',onDown)
    canvas.addEventListener('pointermove',onMove)
    canvas.addEventListener('pointerup',onUp)
    canvas.addEventListener('pointercancel',onUp)
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()}
    window.addEventListener('keydown',onKey)
    return()=>{
      canvas.removeEventListener('pointerdown',onDown)
      canvas.removeEventListener('pointermove',onMove)
      canvas.removeEventListener('pointerup',onUp)
      canvas.removeEventListener('pointercancel',onUp)
      window.removeEventListener('keydown',onKey)
    }
  },[getLayout,onClose])

  const restart=useCallback(()=>{gsRef.current=initGS();layoutRef.current=null},[])

  return(
    <div className="relative h-full w-full bg-[#060C18] touch-none select-none">
      <canvas ref={canvasRef} className="h-full w-full" style={{touchAction:'none'}}/>
      <button onClick={onClose} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-zinc-400 hover:bg-black/80 hover:text-white transition">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      {ui.phase==='WIN'&&(
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-10 py-8 text-center shadow-2xl">
            <p className="text-4xl font-bold text-yellow-400">🏆 클리어!</p>
            <p className="mt-3 text-zinc-400">웨이브 <span className="font-bold text-white">{ui.wave}</span> 완료</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={restart} className="rounded-full bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition">다시 플레이</button>
              <button onClick={onClose} className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 transition">나가기</button>
            </div>
          </div>
        </div>
      )}
      {ui.phase==='OVER'&&(
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-10 py-8 text-center shadow-2xl">
            <p className="text-4xl font-bold text-red-400">💀 게임 오버</p>
            <p className="mt-3 text-zinc-400">웨이브 <span className="font-bold text-white">{ui.wave}</span> 도달</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={restart} className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">다시 도전</button>
              <button onClick={onClose} className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 transition">나가기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
