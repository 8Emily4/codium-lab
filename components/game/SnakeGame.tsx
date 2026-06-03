'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Constants (snake-grow-battle/core/Constants.kt) ─────────────────────────
const ARENA_R = 2500
const BASE_SPD = 185, MIN_SPD = 155, SPD_SLOPE = 15
const BOOST_MLT = 1.6, BOOST_DR_INT = 0.4, BOOST_MIN = 25, BOOST_DR_MIN = 80
const TURN_P = 6.5, TURN_AI = 2.6, TURN_BOSS = 1.6
const SUPER_THR = 0.5, SUPER_MLT = 2.0, CHG_RATE = 0.12, CHG_DRAIN = 0.45
const BASE_DIA = 20, DIA_GROW = 6, MAX_DIA = 60
const INIT_P = 35, INIT_AI = 30, SEG_SP = 0.6, LPS = 5, MIN_SEGS = 6, MAX_LEN = 2000
const FOOD_TGT = 1200, FOOD_MAX = 2000, FOOD_SPS = 20
const FAT_CHANCE = 0.125, SOFTCAP = 500, DG_MLT = 1.5
const FOOD_R = 4, MAG_SPD = 420, DEATH_R = 0.7, DP_DIV = 55, DP_MAX = 25
const BASE_ATTR = 2.5, MAG_FAC = 5.0, MAG_ST_EXTRA = 1.6
const ITEM_TGT = 12, ITEM_R = 12, MAX_ITEMS = 5
const AI_N = 20, AI_DELAY = 2.5, AI_MAXR = 5, AI_DT = 0.4, AGGRO_P = 12
const SP_CLR = 400, PL_SP_CLR = 750, SP_INV = 3
const ZONE_FIRST = 30, ZONE_HOLD = 20, ZONE_WARN_S = 120, ZONE_SHR_S = 15
const ZONE_SHR_F = 0.24, ZONE_MIN = 400, ZOFF_MIN = 0.30, ZOFF_MAX = 0.92
const RIM_DRAIN = 45
const SAFE_N = 4, SAFE_RING = 1150, SAFE_R = 240
const BOSS_T = 45, BOSS_MIN_LEN = 150, BOSS_WARN_S = 10, BOSS_LEN = 30
const BOSS_DIA = 210, BOSS_HP = 240, BOSS_COIL = 2, BOSS_HIT_GR = 0.6
const BSKL_INT = 5.5, BSKL_WARN = 1.4, BSKL_R = 600
const BSKL_DRAIN = 50, BSKL_KB = 950, BSKL_STUN = 1.0
const TRUCE_POST = 10, TRUCE_IFRAME = 1.5
const COMBO_WIN = 2.0, COMBO_TIER = 8, COMBO_MAX = 3
const FRENZY_WIN = 6, FRENZY_DUR = 6, FRENZY_MAX = 5
const PERK_KILL = 3
const ULT_MAX = 100, ULT_FOOD = 1.2, ULT_KILL = 25, ULT_SEC = 0.4
const ULT_DASH_DUR = 1.5, ULT_DASH_SPD = 1.7
const MAG_DUR = 10, BOOTS_DUR = 6, DG_DUR = 15, ST_MAX = 5
const WIN_GRACE = 4, RANK1_ITEMS = 3

const PLAYER_COL = '#4fc3f7'
const AI_COLS = ['#ef5350','#ab47bc','#7e57c2','#26a69a','#66bb6a','#ffca28','#ff7043','#8d6e63','#ec407a','#42a5f5','#9ccc65','#ffa726']
const AI_NAMES = ['Slinky','Viper','Noodle','Coilz','FangX','Hisss','Boa','Mamba','Wiggle','Anaconda','Cobra','Python','Slither99','ToxicTail','벨로시','쿠루룽','지렁이왕','꿈틀','독사','스르륵']

const PERKS = {
  SWIFT:   {title:'민첩',   desc:'회전속도 +20%',   emoji:'🌀'},
  SPRINT:  {title:'질주',   desc:'이동속도 +8%',    emoji:'💨'},
  GLUTTON: {title:'대식가', desc:'자석범위 +40%',   emoji:'🧲'},
  HARVEST: {title:'수확',   desc:'먹이가치 +1',     emoji:'🍎'},
  VAMPIRE: {title:'흡혈',   desc:'처치시 15%흡수',  emoji:'🩸'},
} as const
type PerkId = keyof typeof PERKS
const ALL_PERKS = Object.keys(PERKS) as PerkId[]

// ─── Types ────────────────────────────────────────────────────────────────────
interface Seg { x: number; y: number }
type AiBehav = 'GRAZER'|'COWARD'|'HUNTER'|'CUTTER'|'SCAVENGER'
type ItemKind = 'MAGNET'|'BOOTS'|'DOUBLE'
type ZonePhase = 'HOLD'|'WARN'|'SHRINK'
type BossPhase = 'NONE'|'WARNING'|'ACTIVE'|'DONE'
type GamePhase = 'playing'|'dead'|'win'

interface Snake {
  id: number; segs: Seg[]; dir: number; tdir: number
  len: number; growAcc: number; boostAcc: number; rimAcc: number
  col: string; isPlayer: boolean; alive: boolean; boosting: boolean
  name: string; aiTimer: number; behav: AiBehav; aiInt: number
  kills: number; spUntil: number; deathT: number; respawns: number; peakLen: number
  isBoss: boolean; bossHp: number; bAttGrace: number; bFlash: number; diaOvr: number
  magUntil: number; magSt: number; bootsUntil: number; bootsSt: number; dgUntil: number; dgSt: number
  dashUntil: number; stunUntil: number; slimedUntil: number; boostCharge: number
  heldItems: ItemKind[]
}

interface Food { id: number; x: number; y: number; val: number; fat: boolean; hue: number }
interface GItem { id: number; x: number; y: number; kind: ItemKind }
interface SafeZ { x: number; y: number; r: number }

interface World {
  snakes: Snake[]; foods: Food[]; items: GItem[]; safeZones: SafeZ[]
  now: number; foodAcc: number; itemAcc: number
  curR: number; curCX: number; curCY: number; tgtR: number; tgtCX: number; tgtCY: number
  zPhase: ZonePhase; zUntil: number; zStep: number; shrR: number; shrCX: number; shrCY: number
  bPhase: BossPhase; bWarnUntil: number; bId: number; bPhaseSpawned: number
  bLX: number; bLY: number; bDefeated: boolean; bTruceEnd: number; pHitBoss: boolean; truceWas: boolean
  bSklReady: number; bSklFire: number; bSklCX: number; bSklCY: number
  pKills: number; pPellets: number
  combo: number; comboMult: number; comboTimer: number
  frenzy: number; frenzyUntil: number; lastKillT: number; lastFrenzyK: number
  perks: PerkId[]; draft: PerkId[]|null; nextDraftK: number
  ultCharge: number; rank1Id: number; peakRank: number
  playerWon: boolean; winGrace: number
  phase: GamePhase; score: number; nextFoodId: number; nextItemId: number
  lastKillName: string; killedByName: string
  soundEvents: string[]; lastEatT: number
}

// ─── Math ─────────────────────────────────────────────────────────────────────
function angDelta(a: number, b: number) {
  let d = (b-a) % (Math.PI*2)
  if (d > Math.PI) d -= Math.PI*2
  if (d < -Math.PI) d += Math.PI*2
  return d
}
function rotTo(from: number, to: number, max: number) {
  const d = angDelta(from, to)
  if (d > max) return from+max
  if (d < -max) return from-max
  return from+d
}
function headTo(fx: number, fy: number, tx: number, ty: number) { return Math.atan2(ty-fy, tx-fx) }
function dist2(ax: number, ay: number, bx: number, by: number) { const dx=ax-bx,dy=ay-by; return dx*dx+dy*dy }
function dist(ax: number, ay: number, bx: number, by: number) { return Math.sqrt(dist2(ax,ay,bx,by)) }

// ─── Snake helpers ─────────────────────────────────────────────────────────────
function snakeDia(s: Snake) {
  if (s.diaOvr > 0) return s.diaOvr
  return Math.min(MAX_DIA, BASE_DIA + DIA_GROW * Math.sqrt(s.len/10))
}
function snakeSpacing(s: Snake) { return snakeDia(s) * SEG_SP }
function segTarget(len: number) { return Math.max(MIN_SEGS, Math.floor(len/LPS)) }
function baseSpeed(s: Snake) { return Math.max(MIN_SPD, BASE_SPD - SPD_SLOPE*(s.len/MAX_LEN)) }
function inSafeZone(w: World, x: number, y: number) {
  for (const z of w.safeZones) if (dist2(x,y,z.x,z.y) <= z.r*z.r) return true
  return false
}

// ─── Emoji canvas cache ───────────────────────────────────────────────────────
const eCache = new Map<string, HTMLCanvasElement>()
function emojiCanvas(e: string, px: number): HTMLCanvasElement|null {
  if (typeof document==='undefined') return null
  const k=`${e}-${px}`
  if (!eCache.has(k)) {
    const c=document.createElement('canvas'); c.width=px; c.height=px
    const cx=c.getContext('2d'); if (!cx) return null
    cx.font=`${Math.round(px*0.82)}px system-ui`; cx.textAlign='center'; cx.textBaseline='middle'
    cx.fillText(e, px/2, px/2); eCache.set(k, c)
  }
  return eCache.get(k) ?? null
}
const FRUITS = ['🍎','🍌','🍇','🍊','🍓','🍑','🍐','🥝','🫐','🍒']
const FAT_FRUITS = ['🍉','🍑','🥭','🍈','🍒','🍓','🍇','🫐']
const ITEM_EMOJI: Record<ItemKind,string> = {MAGNET:'🧲',BOOTS:'⚡',DOUBLE:'✨'}
const ITEM_COL: Record<ItemKind,string> = {MAGNET:'#6366f1',BOOTS:'#fbbf24',DOUBLE:'#4ade80'}

// ─── Sound ────────────────────────────────────────────────────────────────────
let _sfxCtx: AudioContext | null = null
function getSfxCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!_sfxCtx) try { _sfxCtx = new AudioContext() } catch { return null }
  return _sfxCtx
}
function playSound(type: string) {
  const ctx = getSfxCtx(); if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()
  const t = ctx.currentTime
  const osc = (freq: number, wt: OscillatorType = 'sine', start = 0, dur = 0.15, vol = 0.18, slide?: number) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = wt; o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(freq, t + start)
    if (slide != null) o.frequency.exponentialRampToValueAtTime(Math.max(1, slide), t + start + dur)
    g.gain.setValueAtTime(vol, t + start)
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur)
    o.start(t + start); o.stop(t + start + dur + 0.01)
  }
  switch (type) {
    case 'eat':       osc(880, 'sine', 0, 0.07, 0.07, 1200); break
    case 'combo':     osc(1320, 'triangle', 0, 0.1, 0.12); break
    case 'kill':      osc(440, 'sawtooth', 0, 0.25, 0.22, 80); osc(220, 'square', 0, 0.15, 0.1, 60); break
    case 'item':      osc(660, 'triangle', 0, 0.1, 0.16, 990); osc(990, 'triangle', 0.1, 0.15, 0.13, 1320); break
    case 'boss_warn': for (let i=0;i<3;i++) osc(180, 'square', i*0.28, 0.22, 0.14, 240); break
    case 'boss_skill': osc(90, 'sawtooth', 0, 0.45, 0.28, 30); osc(180, 'sine', 0, 0.3, 0.14, 55); break
    case 'dash':      osc(280, 'sawtooth', 0, 0.18, 0.22, 1400); break
    case 'death':     osc(380, 'sine', 0, 1.4, 0.28, 50); osc(190, 'triangle', 0.1, 1.2, 0.14, 40); break
    case 'win':       [523,659,784,1047].forEach((f,i) => osc(f, 'triangle', i*0.14, 0.38, 0.17)); break
  }
}

// ─── World helpers ────────────────────────────────────────────────────────────
function randInArena(w: World, rf=0.88): Seg {
  const a=Math.random()*Math.PI*2, r=w.curR*rf*Math.sqrt(Math.random())
  return {x:w.curCX+Math.cos(a)*r, y:w.curCY+Math.sin(a)*r}
}

function makeSnake(id: number, isPlayer: boolean, name: string, col: string, x: number, y: number, dir: number, initLen: number, now: number): Snake {
  const sp = Math.min(MAX_DIA, BASE_DIA+DIA_GROW*Math.sqrt(initLen/10))*SEG_SP
  const segs: Seg[] = []
  for (let i=0; i<Math.max(MIN_SEGS,Math.floor(initLen/LPS)); i++)
    segs.push({x:x-Math.cos(dir)*sp*i, y:y-Math.sin(dir)*sp*i})
  return {
    id, segs, dir, tdir:dir, len:initLen, growAcc:0, boostAcc:0, rimAcc:0,
    col, isPlayer, alive:true, boosting:false, name,
    aiTimer:Math.random()*AI_DT, behav:'GRAZER', aiInt:AI_DT,
    kills:0, spUntil:now+SP_INV, deathT:0, respawns:0, peakLen:initLen,
    isBoss:false, bossHp:0, bAttGrace:0, bFlash:0, diaOvr:0,
    magUntil:0, magSt:0, bootsUntil:0, bootsSt:0, dgUntil:0, dgSt:0,
    dashUntil:0, stunUntil:0, slimedUntil:0, boostCharge:0, heldItems:[],
  }
}

function assignBehav(): AiBehav {
  const r = Math.random()
  if (r < 0.27) return 'GRAZER'
  if (r < 0.45) return 'SCAVENGER'
  if (r < 0.75) return 'COWARD'
  if (r < 0.90) return 'HUNTER'
  return 'CUTTER'
}

function spawnFood(w: World) {
  const p=randInArena(w,0.95), fat=Math.random()<FAT_CHANCE
  w.foods.push({id:w.nextFoodId++, x:p.x, y:p.y, val:fat?3:1, fat, hue:Math.random()})
}

function spawnItem(w: World) {
  const p=randInArena(w,0.85), kinds:ItemKind[]=['MAGNET','BOOTS','DOUBLE']
  w.items.push({id:w.nextItemId++, x:p.x, y:p.y, kind:kinds[Math.floor(Math.random()*3)]})
}

function findClearSpawn(w: World): Seg {
  const px=w.snakes[0]?.segs[0]?.x??0, py=w.snakes[0]?.segs[0]?.y??0
  let best=randInArena(w,0.9), bestScore=-Infinity
  for (let k=0; k<24; k++) {
    const c=randInArena(w,0.9)
    const dpl=dist(c.x,c.y,px,py)
    let dOther=Infinity
    for (const s of w.snakes) { if (!s.alive) continue; const d=dist(c.x,c.y,s.segs[0].x,s.segs[0].y); if (d<dOther) dOther=d }
    if (dpl>=PL_SP_CLR && dOther>=SP_CLR) return c
    const score=Math.min(dpl,PL_SP_CLR)*2+dOther
    if (score>bestScore) {bestScore=score; best=c}
  }
  return best
}

// ─── World init ───────────────────────────────────────────────────────────────
function initWorld(): World {
  const w: World = {
    snakes:[], foods:[], items:[], safeZones:[],
    now:0, foodAcc:0, itemAcc:0,
    curR:ARENA_R, curCX:0, curCY:0, tgtR:ARENA_R, tgtCX:0, tgtCY:0,
    zPhase:'HOLD', zUntil:ZONE_FIRST, zStep:0, shrR:ARENA_R, shrCX:0, shrCY:0,
    bPhase:'NONE', bWarnUntil:0, bId:-1, bPhaseSpawned:-1,
    bLX:0, bLY:0, bDefeated:false, bTruceEnd:0, pHitBoss:false, truceWas:false,
    bSklReady:0, bSklFire:0, bSklCX:0, bSklCY:0,
    pKills:0, pPellets:0,
    combo:0, comboMult:1, comboTimer:0,
    frenzy:0, frenzyUntil:0, lastKillT:-100, lastFrenzyK:0,
    perks:[], draft:null, nextDraftK:PERK_KILL,
    ultCharge:0, rank1Id:-1, peakRank:99999,
    playerWon:false, winGrace:0,
    phase:'playing', score:0, nextFoodId:0, nextItemId:0,
    lastKillName:'', killedByName:'',
    soundEvents:[], lastEatT:-1,
  }
  // Safe zones
  for (let i=0; i<SAFE_N; i++) {
    const a=Math.PI*2*i/SAFE_N+Math.PI*2/8
    w.safeZones.push({x:Math.cos(a)*SAFE_RING, y:Math.sin(a)*SAFE_RING, r:SAFE_R})
  }
  // Player
  const p=makeSnake(0,true,'나',PLAYER_COL,0,0,0,INIT_P,0)
  w.snakes.push(p)
  // AI
  for (let i=0; i<AI_N; i++) {
    const a=Math.random()*Math.PI*2, r=ARENA_R*(0.35+Math.random()*0.55)
    const startLen=Math.random()<0.18?80+Math.floor(Math.random()*100):INIT_AI+Math.floor(Math.random()*40)
    const s=makeSnake(i+1,false,AI_NAMES[i%AI_NAMES.length],AI_COLS[i%AI_COLS.length], Math.cos(a)*r,Math.sin(a)*r,(a+Math.PI),startLen,0)
    s.behav=assignBehav(); s.aiInt=AI_DT+Math.random()*0.08
    w.snakes.push(s)
  }
  for (let i=0;i<FOOD_TGT;i++) spawnFood(w)
  for (let i=0;i<ITEM_TGT;i++) spawnItem(w)
  return w
}

// ─── AI (AIController.kt port) ────────────────────────────────────────────────
function clearanceAt(w: World, me: Snake, px: number, py: number): number {
  let min=800
  for (const o of w.snakes) {
    if (o===me||!o.alive) continue
    const d=dist(o.segs[0].x,o.segs[0].y,px,py); if (d<min) min=d
    const step=Math.max(1,Math.floor(o.segs.length/15))
    for (let i=0;i<o.segs.length;i+=step) { const bd=dist(o.segs[i].x,o.segs[i].y,px,py); if (bd<min) min=bd }
  }
  return min
}
function nearestFoodAI(w: World, s: Snake, range: number): Food|null {
  const r2=range*range, hx=s.segs[0].x, hy=s.segs[0].y
  let best:Food|null=null, bestD2=r2
  const step=Math.max(1,Math.floor(w.foods.length/80))
  for (let i=0;i<w.foods.length;i+=step) {
    const f=w.foods[i], d2=dist2(hx,hy,f.x,f.y)
    if (d2<bestD2) {bestD2=d2; best=f}
  }
  return best
}
const CAND_TURNS = [-0.2,0.2,-0.45,0.45,-0.85,0.85,-1.4,1.4,-2.2,2.2]

function updateAI(w: World, s: Snake) {
  s.aiTimer-=1/60; if (s.aiTimer>0) return
  s.aiTimer=s.aiInt
  const hx=s.segs[0].x, hy=s.segs[0].y, now=w.now

  // 1) Boundary safety
  const dfc=dist(hx,hy,w.curCX,w.curCY)
  if (dfc > w.curR-200) {
    s.tdir=headTo(hx,hy,w.curCX,w.curCY); s.boosting=dfc>w.curR-120&&s.len>BOOST_MIN*2; return
  }
  // 1b) Boss AI hunt player
  if (s.isBoss) {
    const p=w.snakes[0]; s.tdir=p.alive?headTo(hx,hy,p.segs[0].x,p.segs[0].y):headTo(hx,hy,w.curCX,w.curCY); s.boosting=false; return
  }
  // 1c) Raid: attack/orbit boss
  const boss=w.bPhase==='ACTIVE'&&w.bId>=0?w.snakes[w.bId]:null
  if (boss?.alive&&boss.isBoss) {
    const isAtk=s.id%5<3, d2=dist2(hx,hy,boss.segs[0].x,boss.segs[0].y)
    const orbitR=Math.min(680+(s.id%6)*70,(w.curR-200)*0.8)
    if (isAtk&&d2>150*150) { s.tdir=headTo(hx,hy,boss.segs[0].x,boss.segs[0].y); s.boosting=s.len>BOOST_MIN*2&&d2>400*400 }
    else if (isAtk) { s.tdir=headTo(boss.segs[0].x,boss.segs[0].y,hx,hy); s.boosting=false }
    else {
      const ang=Math.atan2(hy-boss.segs[0].y,hx-boss.segs[0].x)
      s.tdir=d2<orbitR*orbitR*0.7?ang:headTo(hx,hy,boss.segs[0].x+Math.cos(ang+0.28)*orbitR,boss.segs[0].y+Math.sin(ang+0.28)*orbitR)
      s.boosting=false
    }
    return
  }
  // 1d) Storm gather
  if (w.zPhase!=='HOLD') {
    const dt2=dist(hx,hy,w.tgtCX,w.tgtCY)
    if (dt2>w.tgtR-100) { s.tdir=headTo(hx,hy,w.tgtCX,w.tgtCY); s.boosting=dt2>w.tgtR+120&&s.len>BOOST_MIN*2; return }
  }
  // 2) Survival fan
  const look=snakeDia(s)*10, danger=snakeDia(s)*3.5
  const sClear=clearanceAt(w,s,hx+Math.cos(s.dir)*look,hy+Math.sin(s.dir)*look)
  if (sClear<danger) {
    let bestH=s.dir, bestScore=-Infinity
    for (const off of CAND_TURNS) {
      const h=s.dir+off, score=clearanceAt(w,s,hx+Math.cos(h)*look,hy+Math.sin(h)*look)-Math.abs(off)*10
      if (score>bestScore) {bestScore=score; bestH=h}
    }
    s.tdir=bestH; s.boosting=bestScore>danger*1.5&&s.len>BOOST_MIN*2; return
  }
  // 2b) Leader bounty
  const player=w.snakes[0]
  if (player.len>1000&&now>=AGGRO_P&&player.alive&&dist2(hx,hy,player.segs[0].x,player.segs[0].y)<1500*1500&&s.behav!=='COWARD') {
    s.tdir=headTo(hx,hy,player.segs[0].x+Math.cos(player.dir)*player.len*0.5,player.segs[0].y+Math.sin(player.dir)*player.len*0.5)
    s.boosting=s.len>BOOST_MIN*2; return
  }
  // 3) Personality
  switch (s.behav) {
    case 'HUNTER': {
      const tgt=now<AGGRO_P?(w.rank1Id>=0?w.snakes[w.rank1Id]:null):player
      if (tgt?.alive&&tgt!==s&&dist2(hx,hy,tgt.segs[0].x,tgt.segs[0].y)<1700*1700) {
        const tx=tgt.segs[0].x+Math.cos(tgt.dir)*tgt.len*0.5, ty=tgt.segs[0].y+Math.sin(tgt.dir)*tgt.len*0.5
        const toT=headTo(hx,hy,tx,ty)
        s.tdir=toT; s.boosting=clearanceAt(w,s,hx+Math.cos(toT)*look,hy+Math.sin(toT)*look)>danger&&s.len>BOOST_MIN*2; return
      }
      break
    }
    case 'CUTTER': {
      let prey:Snake|null=null, bestS=-Infinity
      for (const o of w.snakes) {
        if (o===s||!o.alive||o.isBoss) continue
        const d2=dist2(hx,hy,o.segs[0].x,o.segs[0].y)
        if (d2>400*400) continue
        const sc2=-d2/1000+(o.len-s.len)
        if (sc2>bestS) {bestS=sc2; prey=o}
      }
      if (prey) {
        const tx=prey.segs[0].x+Math.cos(prey.dir)*baseSpeed(prey)*1.4, ty=prey.segs[0].y+Math.sin(prey.dir)*baseSpeed(prey)*1.4
        const toT=headTo(hx,hy,tx,ty)
        s.tdir=toT; s.boosting=clearanceAt(w,s,hx+Math.cos(toT)*look,hy+Math.sin(toT)*look)>danger&&s.len>BOOST_MIN*2; return
      }
      break
    }
    case 'COWARD': {
      let threat:Snake|null=null, bestD2=snakeDia(s)*snakeDia(s)*81
      for (const o of w.snakes) {
        if (o===s||!o.alive) continue
        const d2=dist2(hx,hy,o.segs[0].x,o.segs[0].y)
        if (d2<bestD2) {bestD2=d2; threat=o}
      }
      if (threat) { s.tdir=headTo(threat.segs[0].x,threat.segs[0].y,hx,hy); s.boosting=s.len>BOOST_MIN*2; return }
      break
    }
    case 'SCAVENGER': {
      const f=nearestFoodAI(w,s,1100)
      if (f) {s.tdir=headTo(hx,hy,f.x,f.y); s.boosting=false; return}
      break
    }
    default: break
  }
  // 4) Nearest food
  const nf=nearestFoodAI(w,s,600)
  if (nf) {s.tdir=headTo(hx,hy,nf.x,nf.y); s.boosting=false; return}
  // 5) Wander
  s.tdir=s.dir+(Math.random()-0.5)*1.0; s.boosting=false
}

// ─── Move snake ───────────────────────────────────────────────────────────────
function moveSnake(w: World, s: Snake, dt: number, now: number) {
  const stunned=now<s.stunUntil
  let tr=s.isPlayer?TURN_P:(s.isBoss?TURN_BOSS:TURN_AI)
  if (s.isPlayer) {
    const sw=w.perks.filter(p=>p==='SWIFT').length, fr=now<w.frenzyUntil?w.frenzy:0
    tr*=(1+0.20*sw)*(1+0.06*fr)
  }
  if (!stunned) s.dir=rotTo(s.dir,s.tdir,tr*dt)

  let speed=baseSpeed(s)
  if (stunned) speed*=0.35
  if (now<s.slimedUntil&&!s.isPlayer) speed*=0.6
  if (s.isPlayer) {
    const sp2=w.perks.filter(p=>p==='SPRINT').length, fr=now<w.frenzyUntil?w.frenzy:0
    speed*=(1+0.08*sp2)*(1+0.07*fr)
  }
  if (now<s.dashUntil) speed*=ULT_DASH_SPD

  const inRest=inSafeZone(w,s.segs[0].x,s.segs[0].y)
  const canBoost=!inRest&&s.boosting&&s.len>=BOOST_MIN
  const freeBoost=now<s.bootsUntil
  if (canBoost||freeBoost) {
    const isSuper=canBoost&&!freeBoost&&s.boostCharge>=SUPER_THR
    let mult=isSuper?SUPER_MLT:BOOST_MLT
    if (freeBoost) mult+=Math.max(0,s.bootsSt-1)*0.25
    speed*=mult
  }

  s.segs[0]={x:s.segs[0].x+Math.cos(s.dir)*speed*dt, y:s.segs[0].y+Math.sin(s.dir)*speed*dt}

  // Rope physics
  const sp=snakeSpacing(s)
  for (let i=1;i<s.segs.length;i++) {
    const prev=s.segs[i-1], curr=s.segs[i], dx=curr.x-prev.x, dy=curr.y-prev.y, d=Math.sqrt(dx*dx+dy*dy)
    if (d>sp) { const ratio=(d-sp)/d; s.segs[i]={x:curr.x-dx*ratio,y:curr.y-dy*ratio} }
  }

  // Grow/shrink segs
  const want=Math.min(segTarget(s.len),260)
  while (s.segs.length<want) s.segs.push({...s.segs[s.segs.length-1]})
  if (s.segs.length>want) s.segs.length=want

  // Boost drain
  if (canBoost&&!freeBoost) {
    if (s.len>BOOST_DR_MIN) {
      s.boostAcc+=dt
      while (s.boostAcc>=BOOST_DR_INT&&s.len>BOOST_DR_MIN) {
        s.boostAcc-=BOOST_DR_INT
        const tail=s.segs[s.segs.length-1]
        w.foods.push({id:w.nextFoodId++,x:tail.x,y:tail.y,val:1,fat:false,hue:0.5})
        s.len=Math.max(BOOST_DR_MIN,s.len-LPS)
      }
      if (s.boostCharge>=SUPER_THR) s.boostCharge=Math.max(0,s.boostCharge-CHG_DRAIN*dt)
    } else s.boostAcc=0
  } else {
    s.boostAcc=0
    if (!canBoost) s.boostCharge=Math.min(1,s.boostCharge+CHG_RATE*dt)
  }
}

// ─── Item effect ──────────────────────────────────────────────────────────────
function applyItem(s: Snake, kind: ItemKind, now: number) {
  if (kind==='MAGNET') {
    if (s.magUntil>now){s.magSt=Math.min(ST_MAX,s.magSt+1);s.magUntil+=MAG_DUR}
    else{s.magSt=1;s.magUntil=now+MAG_DUR}
  } else if (kind==='BOOTS') {
    if (s.bootsUntil>now){s.bootsSt=Math.min(ST_MAX,s.bootsSt+1);s.bootsUntil+=BOOTS_DUR}
    else{s.bootsSt=1;s.bootsUntil=now+BOOTS_DUR}
  } else {
    if (s.dgUntil>now){s.dgSt=Math.min(ST_MAX,s.dgSt+1);s.dgUntil+=DG_DUR}
    else{s.dgSt=1;s.dgUntil=now+DG_DUR}
  }
}

// ─── Kill ─────────────────────────────────────────────────────────────────────
function killSnake(w: World, s: Snake) {
  if (!s.alive) return
  s.alive=false; s.deathT=w.now
  const pellets=Math.floor(s.segs.length*DEATH_R)
  const pelVal=Math.min(DP_MAX,1+Math.floor(s.len/DP_DIV))
  for (let i=0;i<pellets;i++) {
    const seg=s.segs[Math.floor(i/pellets*s.segs.length)]
    let px=seg.x+(Math.random()-0.5)*6, py=seg.y+(Math.random()-0.5)*6
    const rr=w.curR-40, d2c=dist2(px,py,w.curCX,w.curCY)
    if (d2c>rr*rr){const k=rr/Math.sqrt(d2c);px=w.curCX+(px-w.curCX)*k;py=w.curCY+(py-w.curCY)*k}
    w.foods.push({id:w.nextFoodId++,x:px,y:py,val:pelVal,fat:pelVal>1,hue:0.5})
  }
  if (w.foods.length>FOOD_MAX) w.foods.splice(0,w.foods.length-FOOD_MAX)
}

// ─── Zone ─────────────────────────────────────────────────────────────────────
function computeNextZone(w: World) {
  const newR=Math.max(ZONE_MIN,w.curR*(1-ZONE_SHR_F)), slack=Math.max(0,w.curR-newR)
  const ang=Math.random()*Math.PI*2, off=slack*(ZOFF_MIN+Math.random()*(ZOFF_MAX-ZOFF_MIN))
  w.tgtR=newR; w.tgtCX=w.curCX+Math.cos(ang)*off; w.tgtCY=w.curCY+Math.sin(ang)*off
}
function updateZone(w: World, dt: number) {
  const now=w.now
  if (w.zPhase==='HOLD') {
    if (now>=w.zUntil&&w.curR>ZONE_MIN+1) {computeNextZone(w);w.zPhase='WARN';w.zUntil=now+ZONE_WARN_S}
  } else if (w.zPhase==='WARN') {
    if (now>=w.zUntil) {w.shrR=w.curR;w.shrCX=w.curCX;w.shrCY=w.curCY;w.zPhase='SHRINK';w.zUntil=now+ZONE_SHR_S;w.zStep++}
  } else {
    const t=Math.min(1,1-(w.zUntil-now)/ZONE_SHR_S)
    w.curR=w.shrR+(w.tgtR-w.shrR)*t; w.curCX=w.shrCX+(w.tgtCX-w.shrCX)*t; w.curCY=w.shrCY+(w.tgtCY-w.shrCY)*t
    if (now>=w.zUntil) {w.curR=w.tgtR;w.curCX=w.tgtCX;w.curCY=w.tgtCY;w.zPhase='HOLD';w.zUntil=now+ZONE_HOLD}
  }
  void dt
}

// ─── Boss ─────────────────────────────────────────────────────────────────────
function pickBossLair(w: World) {
  const p=w.snakes[0], awayAng=Math.atan2(w.curCY-p.segs[0].y,w.curCX-p.segs[0].x)
  for (let k=0;k<8;k++) {
    const a=awayAng+(k-4)*0.4, rr=w.curR*0.5, x=w.curCX+Math.cos(a)*rr, y=w.curCY+Math.sin(a)*rr
    if (!inSafeZone(w,x,y)){w.bLX=x;w.bLY=y;return}
  }
  w.bLX=w.curCX; w.bLY=w.curCY
}

function spawnBoss(w: World) {
  const player=w.snakes[0]; let pick=-1, bestD2=-1
  for (let i=1;i<w.snakes.length;i++) {
    const s=w.snakes[i]; if (s===player||i>AI_N) continue
    const d2=dist2(s.segs[0].x,s.segs[0].y,player.segs[0].x,player.segs[0].y)
    if (d2>bestD2){bestD2=d2;pick=i}
  }
  if (pick<0){w.bPhase='DONE';w.bPhaseSpawned=w.zStep;return}
  const b=w.snakes[pick], face=headTo(w.bLX,w.bLY,player.segs[0].x,player.segs[0].y)
  const sp2=BOSS_DIA*SEG_SP
  b.segs=[]; for (let i=0;i<Math.max(MIN_SEGS,Math.floor(BOSS_LEN/LPS));i++) b.segs.push({x:w.bLX-Math.cos(face)*sp2*i,y:w.bLY-Math.sin(face)*sp2*i})
  b.dir=face;b.tdir=face;b.len=BOSS_LEN;b.alive=true;b.isBoss=true;b.diaOvr=BOSS_DIA
  b.bossHp=BOSS_HP;b.bAttGrace=0;b.bFlash=0;b.spUntil=0;b.behav='HUNTER';b.name='BOSS'
  w.bId=pick;w.bPhase='ACTIVE';w.pHitBoss=false;w.bSklReady=w.now+BSKL_INT;w.bSklFire=0
}

function damageBoss(w: World, boss: Snake, attacker: Snake, dmg: number) {
  if (w.now<attacker.bAttGrace) return
  attacker.bAttGrace=w.now+BOSS_HIT_GR; boss.bFlash=w.now+0.22; boss.bossHp-=dmg
  if (attacker.isPlayer){w.pHitBoss=true;w.ultCharge=Math.min(ULT_MAX,w.ultCharge+12)}
  if (boss.bossHp<=0) {
    if (w.pHitBoss){const p=w.snakes[0];p.len=Math.min(MAX_LEN,p.len+250);p.peakLen=Math.max(p.peakLen,p.len)}
    for (let i=0;i<5;i++){const a=Math.PI*2*i/5,kinds:ItemKind[]=['MAGNET','BOOTS','DOUBLE'];w.items.push({id:w.nextItemId++,x:boss.segs[0].x+Math.cos(a)*60,y:boss.segs[0].y+Math.sin(a)*60,kind:kinds[i%3]})}
    w.bDefeated=w.pHitBoss; killSnake(w,boss); w.bPhase='DONE'; w.bTruceEnd=w.now+TRUCE_POST; w.bSklFire=0
  }
}

function fireBossSkill(w: World, boss: Snake) {
  w.soundEvents.push('boss_skill')
  const r2=BSKL_R*BSKL_R
  for (const s of w.snakes) {
    if (!s.alive||s.isBoss) continue
    const dx=s.segs[0].x-w.bSklCX, dy=s.segs[0].y-w.bSklCY, d2=dx*dx+dy*dy
    if (d2>r2) continue
    const d=Math.max(1,Math.sqrt(d2)), ux=dx/d, uy=dy/d, push=BSKL_KB*(1-d/BSKL_R)
    for (let i=0;i<s.segs.length;i++) s.segs[i]={x:s.segs[i].x+ux*push,y:s.segs[i].y+uy*push}
    const safeR=Math.max(0,w.curR-20)
    for (let i=0;i<s.segs.length;i++){const sx=s.segs[i].x-w.curCX,sy=s.segs[i].y-w.curCY,sd2=sx*sx+sy*sy;if(sd2>safeR*safeR){const k=safeR/Math.sqrt(sd2);s.segs[i]={x:w.curCX+sx*k,y:w.curCY+sy*k}}}
    s.stunUntil=Math.max(s.stunUntil,w.now+BSKL_STUN)
    s.len=Math.max(MIN_SEGS*LPS,s.len-BSKL_DRAIN)
  }
  void boss
}

function updateBoss(w: World) {
  const now=w.now, player=w.snakes[0]
  if (w.bPhase==='NONE'||w.bPhase==='DONE') {
    if (player.alive&&w.zStep>w.bPhaseSpawned&&now>=BOSS_T&&player.len>=BOSS_MIN_LEN)
      {pickBossLair(w);w.bWarnUntil=now+BOSS_WARN_S;w.bPhase='WARNING';w.bPhaseSpawned=w.zStep}
  } else if (w.bPhase==='WARNING') {
    if (now>=w.bWarnUntil) spawnBoss(w)
  } else if (w.bPhase==='ACTIVE') {
    const b=w.bId>=0&&w.bId<w.snakes.length?w.snakes[w.bId]:null
    if (!b?.alive||!b.isBoss){w.bPhase='DONE';w.bTruceEnd=now+TRUCE_POST;w.bSklFire=0}
    else {
      const mid=Math.floor(b.segs.length/2); w.bSklCX=b.segs[mid].x; w.bSklCY=b.segs[mid].y
      if (w.bSklFire>0){if(now>=w.bSklFire){fireBossSkill(w,b);w.bSklFire=0;w.bSklReady=now+BSKL_INT}}
      else if (now>=w.bSklReady) w.bSklFire=now+BSKL_WARN
    }
  }
}

// ─── Coil kill (boss only) ────────────────────────────────────────────────────
function pointInPlayerLoop(w: World, px: number, py: number): boolean {
  const p=w.snakes[0], n=p.segs.length; if (n<3) return false
  let inside=false, j=n-1
  for (let i=0;i<n;i++){
    const yi=p.segs[i].y,yj=p.segs[j].y
    if ((yi>py)!==(yj>py)){const xi=p.segs[i].x,xj=p.segs[j].x;if(px<(xj-xi)*(py-yi)/(yj-yi)+xi) inside=!inside}
    j=i
  }
  return inside
}
function checkCoilKill(w: World) {
  const player=w.snakes[0]; if (!player.alive||player.segs.length<14) return
  const boss=w.bPhase==='ACTIVE'&&w.bId>=0?w.snakes[w.bId]:null
  if (!boss?.alive||!boss.isBoss) return
  if (pointInPlayerLoop(w,boss.segs[0].x,boss.segs[0].y)) damageBoss(w,boss,player,BOSS_COIL)
}

// ─── AI passive grow ──────────────────────────────────────────────────────────
function aiPassiveGrow(s: Snake, dt: number) {
  if (s.isBoss) return
  const rate=s.len<300?5:s.len<700?3.5:s.len<1200?2:1
  s.growAcc+=rate*dt; const whole=Math.floor(s.growAcc)
  if (whole>0){s.growAcc-=whole;s.len=Math.min(MAX_LEN,s.len+whole);s.peakLen=Math.max(s.peakLen,s.len)}
}

// ─── Main tick ────────────────────────────────────────────────────────────────
function tick(w: World, dt: number, inputDir: number, inputBoost: boolean, inputUlt: boolean) {
  w.now+=dt
  const now=w.now, player=w.snakes[0]

  if (w.comboTimer>0){w.comboTimer-=dt;if(w.comboTimer<=0){w.combo=0;w.comboMult=1}}
  if (player.alive) w.ultCharge=Math.min(ULT_MAX,w.ultCharge+ULT_SEC*dt)

  updateZone(w,dt)

  // Truce iframes on boss death
  const truceNow=w.bPhase==='ACTIVE'||now<w.bTruceEnd
  if (w.truceWas&&!truceNow) for (const s of w.snakes) if(s.alive) s.spUntil=Math.max(s.spUntil,now+TRUCE_IFRAME)
  w.truceWas=truceNow

  // AI
  for (const s of w.snakes) if (!s.isPlayer&&s.alive){updateAI(w,s);aiPassiveGrow(s,dt)}

  // Player input
  if (player.alive) {
    player.tdir=inputDir; player.boosting=inputBoost&&player.len>=BOOST_MIN
    if (inputUlt&&w.ultCharge>=ULT_MAX){w.ultCharge=0;player.dashUntil=now+ULT_DASH_DUR;w.soundEvents.push('dash')}
  }

  // Move
  for (const s of w.snakes) if (s.alive) moveSnake(w,s,dt,now)

  // Rim drain
  const rim2=w.curR*w.curR
  for (const s of w.snakes) {
    if (!s.alive||s.isBoss) continue
    const dx=s.segs[0].x-w.curCX, dy=s.segs[0].y-w.curCY
    if (dx*dx+dy*dy>rim2) {
      if (now>=s.spUntil){s.rimAcc+=RIM_DRAIN*dt;const whole=Math.floor(s.rimAcc);if(whole>0){s.rimAcc-=whole;s.len-=whole};if(s.len<=MIN_SEGS*LPS) killSnake(w,s)}
    } else s.rimAcc=0
  }

  // Collision: head vs body
  for (const runner of w.snakes) {
    if (!runner.alive) continue
    const rhx=runner.segs[0].x, rhy=runner.segs[0].y, rR=snakeDia(runner)/2
    for (const wall of w.snakes) {
      if (wall===runner||!wall.alive||!runner.alive) continue
      const wR=snakeDia(wall)/2
      for (let si=1;si<wall.segs.length;si++) {
        if (dist2(rhx,rhy,wall.segs[si].x,wall.segs[si].y)>(rR+wR+5)*(rR+wR+5)) continue
        if (dist2(rhx,rhy,wall.segs[si].x,wall.segs[si].y)<(rR+wR)*(rR+wR)) {
          if (now<runner.spUntil||now<wall.spUntil) break
          if (runner.isPlayer&&now<runner.dashUntil) break
          if (inSafeZone(w,rhx,rhy)&&!wall.isBoss) break
          if (runner.isBoss) break
          if (wall.isBoss){damageBoss(w,wall,runner,1);break}
          if (truceNow&&!wall.isBoss) break
          // Kill
          if (runner.isPlayer) w.killedByName=wall.name
          if (wall.isPlayer){w.lastKillName=runner.name;w.pKills=wall.kills+1}
          wall.kills++
          if (wall.isPlayer) {
            w.pKills=wall.kills; w.ultCharge=Math.min(ULT_MAX,w.ultCharge+ULT_KILL)
            const vc=w.perks.filter(p=>p==='VAMPIRE').length
            if (vc>0){player.len=Math.min(MAX_LEN,player.len+Math.floor(runner.len*0.15*vc));player.peakLen=Math.max(player.peakLen,player.len)}
            if (runner.id===w.rank1Id) for(let k=0;k<RANK1_ITEMS;k++){const kinds:ItemKind[]=['MAGNET','BOOTS','DOUBLE'];const si2=Math.floor(k/RANK1_ITEMS*runner.segs.length);w.items.push({id:w.nextItemId++,x:runner.segs[si2].x,y:runner.segs[si2].y,kind:kinds[k%3]})}
          }
          if(wall.isPlayer)w.soundEvents.push('kill')
          killSnake(w,runner); break
        }
      }
    }
  }

  checkCoilKill(w)

  // Food collection
  for (const s of w.snakes) {
    if (!s.alive) continue
    const hx=s.segs[0].x, hy=s.segs[0].y, eatR2=(snakeDia(s)/2+FOOD_R)*(snakeDia(s)/2+FOOD_R)
    const toRm: number[]=[]
    for (let fi=0;fi<w.foods.length;fi++) {
      const f=w.foods[fi]; if (dist2(hx,hy,f.x,f.y)>eatR2) continue
      const dgSt=now<s.dgUntil?s.dgSt:0, mult=dgSt>0?DG_MLT+(dgSt-1)*0.5:1
      const combo=s.isPlayer?w.comboMult:1
      const hv=s.isPlayer?w.perks.filter(p=>p==='HARVEST').length:0
      s.growAcc+=(f.val+hv)*mult*combo*(SOFTCAP/(SOFTCAP+s.len))
      const whole=Math.floor(s.growAcc); if (whole>0){s.growAcc-=whole;s.len=Math.min(MAX_LEN,s.len+whole)}
      s.peakLen=Math.max(s.peakLen,s.len)
      if (s.isPlayer){w.pPellets++;w.ultCharge=Math.min(ULT_MAX,w.ultCharge+ULT_FOOD);w.combo++;w.comboTimer=COMBO_WIN;const prevMult=w.comboMult;w.comboMult=Math.min(COMBO_MAX,1+Math.floor(w.combo/COMBO_TIER));if(w.comboMult>prevMult)w.soundEvents.push('combo');if(now-w.lastEatT>0.1){w.soundEvents.push('eat');w.lastEatT=now}}
      toRm.push(fi)
    }
    for (let i=toRm.length-1;i>=0;i--){const idx=toRm[i];w.foods[idx]=w.foods[w.foods.length-1];w.foods.pop()}
  }

  // Item collection
  for (const s of w.snakes) {
    if (!s.alive) continue
    const hx=s.segs[0].x, hy=s.segs[0].y, pr2=(snakeDia(s)/2+ITEM_R)*(snakeDia(s)/2+ITEM_R)
    const toRm: number[]=[]
    for (let ii=0;ii<w.items.length;ii++) {
      const it=w.items[ii]; if (dist2(hx,hy,it.x,it.y)>pr2) continue
      applyItem(s,it.kind,now);toRm.push(ii);if(s.isPlayer)w.soundEvents.push('item')
    }
    for (let i=toRm.length-1;i>=0;i--){w.items[toRm[i]]=w.items[w.items.length-1];w.items.pop()}
  }

  // Magnet attraction
  for (const s of w.snakes) {
    if (!s.alive) continue
    const magSt=now<s.magUntil?s.magSt:0
    let factor=magSt>0?MAG_FAC+(magSt-1)*MAG_ST_EXTRA:BASE_ATTR
    let range=snakeDia(s)*factor
    if (s.isPlayer){const gl=w.perks.filter(p=>p==='GLUTTON').length,fr=now<w.frenzyUntil?w.frenzy:0;range*=(1+0.40*gl)*(1+0.25*fr)}
    const r2=range*range, hx=s.segs[0].x, hy=s.segs[0].y, pull=MAG_SPD*dt
    for (const f of w.foods){const dx=hx-f.x,dy=hy-f.y,d2=dx*dx+dy*dy;if(d2>1&&d2<r2){const d=Math.sqrt(d2);f.x+=dx/d*Math.min(pull,d);f.y+=dy/d*Math.min(pull,d)}}
  }

  // Spawn food/items
  w.foodAcc+=dt*FOOD_SPS; while(w.foodAcc>=1&&w.foods.length<FOOD_TGT){w.foodAcc-=1;spawnFood(w)}
  w.itemAcc+=dt*0.5; while(w.itemAcc>=1&&w.items.length<ITEM_TGT){w.itemAcc-=1;spawnItem(w)}

  // Prune food outside rim
  const lim2=(w.curR-20)*(w.curR-20)
  for (let i=w.foods.length-1;i>=0;i--){const f=w.foods[i];if((f.x-w.curCX)*(f.x-w.curCX)+(f.y-w.curCY)*(f.y-w.curCY)>lim2){w.foods[i]=w.foods[w.foods.length-1];w.foods.pop()}}

  // AI respawn
  const cap=w.curR<=ZONE_MIN+1?0:Math.max(0,Math.floor(AI_N/Math.pow(2,w.zStep)))
  let aliveAi=w.snakes.filter(s=>!s.isPlayer&&s.alive&&!s.isBoss).length
  for (const s of w.snakes) {
    if (s.isPlayer||s.alive||s.isBoss||s.respawns>=AI_MAXR||aliveAi>=cap) continue
    if (now-s.deathT<AI_DELAY) continue
    const p2=findClearSpawn(w), face=headTo(p2.x,p2.y,w.curCX,w.curCY)
    const sp3=Math.min(MAX_DIA,BASE_DIA+DIA_GROW*Math.sqrt(INIT_AI/10))*SEG_SP
    s.segs=[]; for(let i=0;i<Math.max(MIN_SEGS,Math.floor(INIT_AI/LPS));i++) s.segs.push({x:p2.x-Math.cos(face)*sp3*i,y:p2.y-Math.sin(face)*sp3*i})
    s.dir=face;s.tdir=face;s.len=INIT_AI;s.growAcc=0;s.boostAcc=0;s.rimAcc=0
    s.alive=true;s.isBoss=false;s.diaOvr=0;s.bossHp=0
    s.magUntil=0;s.bootsUntil=0;s.dgUntil=0;s.dashUntil=0;s.stunUntil=0;s.slimedUntil=0;s.boostCharge=0
    s.heldItems=[];s.respawns++;s.kills=0;s.spUntil=now+SP_INV;s.peakLen=INIT_AI;s.behav=assignBehav();s.aiInt=AI_DT+Math.random()*0.08
    aliveAi++
  }

  // Rank-1
  let r1:Snake|null=null
  for (const s of w.snakes) if (s.alive&&!s.isBoss&&(!r1||s.len>r1.len)) r1=s
  w.rank1Id=r1?.id??-1
  if (player.alive){let rank=1;for(const s of w.snakes) if(s.alive&&!s.isBoss&&s!==player&&s.len>player.len) rank++;if(rank<w.peakRank) w.peakRank=rank}

  // Frenzy
  if (now>=w.frenzyUntil) w.frenzy=0
  if (player.alive&&w.pKills>w.lastFrenzyK){w.frenzy=Math.min(FRENZY_MAX,now-w.lastKillT<FRENZY_WIN?w.frenzy+1:1);w.frenzyUntil=now+FRENZY_DUR;w.lastKillT=now;w.lastFrenzyK=w.pKills}

  // Perk draft
  if (!w.draft&&w.pKills>=w.nextDraftK){const sh=[...ALL_PERKS].sort(()=>Math.random()-0.5);w.draft=sh.slice(0,3);w.nextDraftK+=PERK_KILL}

  const _bPhaseBefore=w.bPhase
  updateBoss(w)
  if(w.bPhase==='WARNING'&&_bPhaseBefore!=='WARNING')w.soundEvents.push('boss_warn')

  // Win/lose
  const _phaseBefore=w.phase
  if (player.alive) w.score=player.len
  if (!player.alive) w.phase='dead'
  const aliveAI2=w.snakes.filter(s=>!s.isPlayer&&s.alive&&!s.isBoss).length
  const noResp=w.snakes.every(s=>s.isPlayer||s.respawns>=AI_MAXR||s.alive)
  if (player.alive&&aliveAI2===0&&w.bPhase!=='ACTIVE'&&w.bPhase!=='WARNING'&&(cap===0||noResp)&&now>15){
    w.winGrace+=dt; if(w.winGrace>=WIN_GRACE){w.playerWon=true;w.phase='win'}
  } else w.winGrace=0
  if(w.phase!==_phaseBefore){if(w.phase==='dead')w.soundEvents.push('death');if(w.phase==='win')w.soundEvents.push('win')}
}

// ─── Render ───────────────────────────────────────────────────────────────────
function shade(hex: string, f: number) {
  const n=parseInt(hex.replace('#',''),16)
  return `rgb(${Math.min(255,Math.round(((n>>16)&0xff)*f))},${Math.min(255,Math.round(((n>>8)&0xff)*f))},${Math.min(255,Math.round((n&0xff)*f))})`
}

function render(ctx: CanvasRenderingContext2D, w: World, cw: number, ch: number, now: number, cam: {x:number;y:number;zoom:number}) {
  ctx.clearRect(0,0,cw,ch)
  const {x:cx,y:cy,zoom:sc}=cam
  ctx.save(); ctx.translate(cw/2,ch/2); ctx.scale(sc,sc); ctx.translate(-cx,-cy)

  // Background
  ctx.fillStyle='#0a0e1a'; ctx.fillRect(cx-cw/sc,cy-ch/sc,cw/sc*2,ch/sc*2)
  const ag=ctx.createRadialGradient(w.curCX,w.curCY,0,w.curCX,w.curCY,ARENA_R)
  ag.addColorStop(0,'#0d0d1e');ag.addColorStop(0.75,'#0a0a16');ag.addColorStop(1,'#05050c')
  ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(w.curCX,w.curCY,ARENA_R,0,Math.PI*2); ctx.fill()

  // Grid dots
  const gs=120,visW=cw/sc,visH=ch/sc,gx0=Math.floor((cx-visW/2)/gs)*gs,gy0=Math.floor((cy-visH/2)/gs)*gs
  ctx.globalAlpha=0.08; ctx.fillStyle='#6366f1'
  for (let gx=gx0;gx<=cx+visW/2;gx+=gs)
    for (let gy=gy0;gy<=cy+visH/2;gy+=gs)
      if ((gx-w.curCX)*(gx-w.curCX)+(gy-w.curCY)*(gy-w.curCY)<=ARENA_R*ARENA_R)
        {ctx.beginPath();ctx.arc(gx,gy,2.5,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=1

  // Safe zones
  for (const z of w.safeZones) {
    const pulse=0.3+0.1*Math.sin(now*1.5)
    ctx.strokeStyle=`rgba(74,222,128,${pulse})`;ctx.lineWidth=4;ctx.setLineDash([12,8])
    ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])
    ctx.fillStyle='rgba(74,222,128,0.03)';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill()
  }

  // Storm red zone
  if (w.curR<ARENA_R) {
    ctx.save();ctx.globalAlpha=0.35
    const sg=ctx.createRadialGradient(w.curCX,w.curCY,w.curR*0.95,w.curCX,w.curCY,ARENA_R*1.05)
    sg.addColorStop(0,'rgba(239,68,68,0)');sg.addColorStop(0.35,'rgba(239,68,68,0.65)');sg.addColorStop(1,'rgba(220,38,38,0.95)')
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(w.curCX,w.curCY,ARENA_R,0,Math.PI*2);ctx.arc(w.curCX,w.curCY,w.curR,0,Math.PI*2,true);ctx.fill();ctx.restore()
    ctx.strokeStyle='rgba(239,68,68,0.75)';ctx.lineWidth=8;ctx.setLineDash([30,20])
    ctx.beginPath();ctx.arc(w.curCX,w.curCY,w.curR,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])
  }
  // Next ring
  if (w.zPhase!=='HOLD') {
    const pulse=0.5+0.5*Math.sin(now*2.5)
    ctx.strokeStyle=`rgba(251,146,60,${0.35+pulse*0.45})`;ctx.lineWidth=5;ctx.setLineDash([20,15])
    ctx.beginPath();ctx.arc(w.tgtCX,w.tgtCY,w.tgtR,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])
  }

  // Arena boundary
  ctx.strokeStyle='rgba(34,211,238,0.5)';ctx.lineWidth=14;ctx.beginPath();ctx.arc(0,0,ARENA_R,0,Math.PI*2);ctx.stroke()

  // Boss warning marker
  if (w.bPhase==='WARNING') {
    const pulse=0.5+0.5*Math.sin(now*4)
    ctx.strokeStyle=`rgba(255,0,0,${0.6+pulse*0.4})`;ctx.lineWidth=6;ctx.setLineDash([20,10])
    ctx.beginPath();ctx.arc(w.bLX,w.bLY,200,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])
    ctx.font=`bold ${18/sc}px system-ui`;ctx.textAlign='center';ctx.fillStyle=`rgba(255,80,80,${0.7+pulse*0.3})`
    ctx.fillText('⚠️ BOSS',w.bLX,w.bLY-220/sc);ctx.textAlign='left'
  }

  // Boss skill telegraph
  if (w.bPhase==='ACTIVE'&&w.bSklFire>0) {
    const prog=Math.max(0,1-(w.bSklFire-now)/BSKL_WARN)
    ctx.strokeStyle=`rgba(255,100,0,${0.4+prog*0.5})`;ctx.lineWidth=4+prog*4
    ctx.beginPath();ctx.arc(w.bSklCX,w.bSklCY,BSKL_R,0,Math.PI*2);ctx.stroke()
    ctx.fillStyle=`rgba(255,100,0,${0.05+prog*0.08})`;ctx.beginPath();ctx.arc(w.bSklCX,w.bSklCY,BSKL_R,0,Math.PI*2);ctx.fill()
  }

  // Items
  for (const it of w.items) {
    const sx=(it.x-cx)*sc+cw/2,sy=(it.y-cy)*sc+ch/2; if(sx<-60||sx>cw+60||sy<-60||sy>ch+60) continue
    const pulse=0.5+0.5*Math.sin(now*3+it.id), glowR=(36+pulse*8)/sc
    const grd=ctx.createRadialGradient(it.x,it.y,0,it.x,it.y,glowR)
    grd.addColorStop(0,ITEM_COL[it.kind]+'aa');grd.addColorStop(1,'transparent')
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(it.x,it.y,glowR,0,Math.PI*2);ctx.fill()
    const sw=32,ww=sw/sc; const ec=emojiCanvas(ITEM_EMOJI[it.kind],sw*2)
    if (ec) ctx.drawImage(ec,it.x-ww/2,it.y-ww/2,ww,ww)
  }

  // Food
  for (const f of w.foods) {
    const sx=(f.x-cx)*sc+cw/2,sy=(f.y-cy)*sc+ch/2; if(sx<-40||sx>cw+40||sy<-40||sy>ch+40) continue
    const emoji=f.fat?FAT_FRUITS[f.id%FAT_FRUITS.length]:FRUITS[f.id%FRUITS.length], ss=f.fat?26:16, ww=ss/sc
    const ec=emojiCanvas(emoji,ss*2)
    if (ec){if(f.fat){ctx.shadowColor='rgba(253,230,138,0.5)';ctx.shadowBlur=10/sc};ctx.drawImage(ec,f.x-ww/2,f.y-ww/2,ww,ww);ctx.shadowBlur=0}
  }

  // Snakes
  for (const s of w.snakes) {
    if (!s.alive||s.segs.length<2) continue
    const d=snakeDia(s), r=d/2
    if (s.isPlayer){ctx.shadowColor=s.col;ctx.shadowBlur=22}
    if (s.isBoss&&now<s.bFlash){ctx.shadowColor='white';ctx.shadowBlur=40}

    // Magnet aura
    if (now<s.magUntil){
      const mp=0.3+0.2*Math.sin(now*5), magR=d*(MAG_FAC+(s.magSt-1)*MAG_ST_EXTRA)
      ctx.strokeStyle=`rgba(99,102,241,${mp})`;ctx.lineWidth=3/sc;ctx.setLineDash([6/sc,4/sc])
      ctx.beginPath();ctx.arc(s.segs[0].x,s.segs[0].y,magR,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])
    }
    if (s.boosting){ctx.fillStyle=s.col+'55';ctx.beginPath();ctx.arc(s.segs[0].x,s.segs[0].y,r*2,0,Math.PI*2);ctx.fill()}
    if (now<s.dashUntil){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.beginPath();ctx.arc(s.segs[0].x,s.segs[0].y,r*2.5,0,Math.PI*2);ctx.fill()}

    // Body beads
    const n=s.segs.length, BUDGET=s.isBoss?30:120, step=Math.max(1,Math.ceil(n/BUDGET)), fatten=Math.min(2.5,1+0.45*(step-1))
    for (let i=n-1;i>=0;i-=step) {
      const tf=i/n, rSeg=r*(1-0.40*tf)*fatten
      ctx.fillStyle=shade(s.col,0.55+0.45*(1-tf)); ctx.beginPath(); ctx.arc(s.segs[i].x,s.segs[i].y,rSeg,0,Math.PI*2); ctx.fill()
      if (i<20){ctx.fillStyle='rgba(255,255,255,0.22)';ctx.beginPath();ctx.arc(s.segs[i].x-rSeg*0.30,s.segs[i].y-rSeg*0.30,rSeg*0.27,0,Math.PI*2);ctx.fill()}
    }

    // Double-growth shimmer
    if (now<s.dgUntil){
      const gp=0.4+0.3*Math.sin(now*8)
      ctx.strokeStyle=`rgba(74,222,128,${gp})`;ctx.lineWidth=d*0.15;ctx.lineCap='round';ctx.lineJoin='round'
      ctx.beginPath();ctx.moveTo(s.segs[0].x,s.segs[0].y);for(let i=1;i<s.segs.length;i++) ctx.lineTo(s.segs[i].x,s.segs[i].y);ctx.stroke()
    }

    // Head
    const headR=r*1.25
    ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(s.segs[0].x,s.segs[0].y,headR,0,Math.PI*2);ctx.fill()
    ctx.fillStyle='rgba(255,255,255,0.18)';ctx.beginPath();ctx.arc(s.segs[0].x-headR*0.28,s.segs[0].y-headR*0.28,headR*0.32,0,Math.PI*2);ctx.fill()
    ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=1.5/sc;ctx.beginPath();ctx.arc(s.segs[0].x,s.segs[0].y,headR,0,Math.PI*2);ctx.stroke()

    // Storm danger ring
    if (dist2(s.segs[0].x,s.segs[0].y,w.curCX,w.curCY)>w.curR*w.curR){
      const dp=0.6+0.4*Math.sin(now*6)
      ctx.strokeStyle=`rgba(255,23,68,${dp})`;ctx.lineWidth=3/sc;ctx.beginPath();ctx.arc(s.segs[0].x,s.segs[0].y,headR*1.4,0,Math.PI*2);ctx.stroke()
    }

    // Boss HP bar
    if (s.isBoss) {
      const bw=BOSS_DIA*1.4,bh=16/sc,bx=s.segs[0].x-bw/2,by=s.segs[0].y-headR-30/sc
      ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,bh/2);ctx.fill()
      const frac=Math.max(0,s.bossHp/BOSS_HP), hpCol=frac>0.5?'#ef4444':frac>0.25?'#f97316':'#ff0000'
      ctx.fillStyle=hpCol;ctx.beginPath();ctx.roundRect(bx+2/sc,by+2/sc,(bw-4/sc)*frac,bh-4/sc,(bh-4/sc)/2);ctx.fill()
      ctx.font=`bold ${12/sc}px system-ui`;ctx.textAlign='center';ctx.fillStyle='white'
      ctx.fillText(`BOSS ${s.bossHp}/${BOSS_HP}`,s.segs[0].x,by-4/sc);ctx.textAlign='left'
    }

    // Eyes
    const eOX=Math.cos(s.dir)*headR*0.34,eOY=Math.sin(s.dir)*headR*0.34
    const pX=-Math.sin(s.dir)*headR*0.48,pY=Math.cos(s.dir)*headR*0.48,eR=headR*0.26
    for (const side of [-1,1]) {
      const ex=s.segs[0].x+eOX+pX*side,ey=s.segs[0].y+eOY+pY*side
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,eR,0,Math.PI*2);ctx.fill()
      ctx.fillStyle='#1a1a2e';ctx.beginPath();ctx.arc(ex+Math.cos(s.dir)*eR*0.4,ey+Math.sin(s.dir)*eR*0.4,eR*0.55,0,Math.PI*2);ctx.fill()
    }

    // Crown rank-1
    if (s.id===w.rank1Id){ctx.font=`${22/sc}px system-ui`;ctx.textAlign='center';ctx.fillText('👑',s.segs[0].x,s.segs[0].y-headR-8/sc);ctx.textAlign='left'}

    // Name tag
    const fPx=s.isPlayer?13:11,wFont=fPx/sc,tagY=s.segs[0].y-headR-(s.id===w.rank1Id?34:6)/sc
    ctx.save();ctx.font=`${s.isPlayer?'bold ':''}${wFont}px system-ui`;ctx.textAlign='center';ctx.textBaseline='bottom'
    const tw=ctx.measureText(s.name).width,px2=5/sc,py2=3/sc,pillH=wFont+py2*2
    ctx.fillStyle=s.isPlayer?'rgba(99,102,241,0.8)':'rgba(0,0,0,0.6)'
    ctx.beginPath();ctx.roundRect(s.segs[0].x-tw/2-px2,tagY-pillH,tw+px2*2,pillH,pillH/2);ctx.fill()
    ctx.fillStyle=s.isPlayer?'#fff':'#e4e4e7';ctx.fillText(s.name,s.segs[0].x,tagY-py2)
    ctx.textBaseline='alphabetic';ctx.restore()
    ctx.shadowBlur=0
  }
  ctx.restore()
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function renderHUD(ctx: CanvasRenderingContext2D, w: World, cw: number, ch: number, now: number, cam: {x:number;y:number;zoom:number}) {
  const player=w.snakes[0]; if (!player||cw<10||ch<10) return
  // Minimap
  const mm=Math.max(60,Math.min(cw,ch)*0.14), mmX=cw-mm-16, mmY=16, mmSc=mm/(ARENA_R*2)
  ctx.globalAlpha=0.75;ctx.fillStyle='#0d0d1a';ctx.strokeStyle='#6366f1';ctx.lineWidth=1.5
  ctx.beginPath();ctx.arc(mmX+mm/2,mmY+mm/2,mm/2,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.globalAlpha=1
  ctx.save();ctx.beginPath();ctx.arc(mmX+mm/2,mmY+mm/2,Math.max(1,mm/2-2),0,Math.PI*2);ctx.clip()
  if (w.curR<ARENA_R) {
    ctx.globalAlpha=0.3;ctx.fillStyle='rgba(239,68,68,0.5)';ctx.beginPath()
    ctx.arc(mmX+mm/2+w.curCX*mmSc,mmY+mm/2+w.curCY*mmSc,mm/2,0,Math.PI*2)
    ctx.arc(mmX+mm/2+w.curCX*mmSc,mmY+mm/2+w.curCY*mmSc,w.curR*mmSc,0,Math.PI*2,true)
    ctx.fill();ctx.globalAlpha=1
  }
  for (const it of w.items){ctx.fillStyle=ITEM_COL[it.kind];ctx.globalAlpha=0.8;ctx.beginPath();ctx.arc(mmX+mm/2+it.x*mmSc,mmY+mm/2+it.y*mmSc,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  for (const s of w.snakes){if(!s.alive)continue;ctx.fillStyle=s.isPlayer?'#a5b4fc':s.col;ctx.globalAlpha=s.isPlayer?1:0.7;ctx.beginPath();ctx.arc(mmX+mm/2+s.segs[0].x*mmSc,mmY+mm/2+s.segs[0].y*mmSc,s.isPlayer?4:s.isBoss?6:2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  ctx.restore()

  // Score bar
  const alive=w.snakes.filter(s=>s.alive).length; let rank=1
  for (const s of w.snakes) if(s.alive&&!s.isBoss&&s!==player&&s.len>player.len) rank++
  const stats=[{l:'길이',v:Math.floor(player.len).toString()},{l:'처치',v:w.pKills.toString()},{l:'순위',v:`${rank}/${alive}`}]
  ctx.fillStyle='rgba(0,0,0,0.62)';ctx.beginPath();ctx.roundRect(12,ch-76,248,64,12);ctx.fill()
  stats.forEach((st,i)=>{const x=24+i*80;ctx.font='bold 10px system-ui';ctx.fillStyle='#52525b';ctx.textAlign='left';ctx.fillText(st.l.toUpperCase(),x,ch-46);ctx.font='bold 15px system-ui';ctx.fillStyle='#f4f4f5';ctx.fillText(st.v,x,ch-26)})

  // Frenzy
  const fr=now<w.frenzyUntil?w.frenzy:0; let yOff=0
  if (fr>0){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.beginPath();ctx.roundRect(12,ch-76-44,180,36,8);ctx.fill();ctx.font='bold 11px system-ui';ctx.fillStyle='#f97316';ctx.textAlign='left';ctx.fillText(`🔥 FRENZY x${fr}`,22,ch-76-20);yOff+=44}

  // Combo
  if (w.comboMult>1){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.beginPath();ctx.roundRect(12,ch-76-44-yOff,140,34,8);ctx.fill();ctx.font='bold 11px system-ui';ctx.fillStyle='#fbbf24';ctx.textAlign='left';ctx.fillText(`⚡ COMBO x${w.comboMult}`,20,ch-76-20-yOff);yOff+=42}

  // Effects
  type E={emoji:string;col:string;rem:number}
  const effects:E[]=[]
  if (now<player.magUntil) effects.push({emoji:'🧲',col:'#818cf8',rem:player.magUntil-now})
  if (now<player.bootsUntil) effects.push({emoji:'⚡',col:'#fbbf24',rem:player.bootsUntil-now})
  if (now<player.dgUntil) effects.push({emoji:'✨',col:'#4ade80',rem:player.dgUntil-now})
  if (effects.length>0){
    const bW=effects.length*52+8,bX=12,bY=ch-76-56-yOff
    ctx.fillStyle='rgba(0,0,0,0.62)';ctx.beginPath();ctx.roundRect(bX,bY,bW,48,10);ctx.fill()
    effects.forEach((ef,i)=>{const ex=bX+8+i*52,ey=bY+4;ctx.fillStyle=ef.col+'33';ctx.beginPath();ctx.roundRect(ex,ey,44,40,8);ctx.fill();ctx.font='18px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ef.emoji,ex+22,ey+16);ctx.font='bold 10px system-ui';ctx.fillStyle='#d4d4d8';ctx.fillText(`${Math.ceil(ef.rem)}s`,ex+22,ey+33);ctx.textBaseline='alphabetic'})
    ctx.textAlign='left'; yOff+=56
  }

  // Ultimate bar
  const ultY=ch-76-108-yOff, ultBarW=180, ultFrac=w.ultCharge/ULT_MAX
  ctx.fillStyle='rgba(0,0,0,0.62)';ctx.beginPath();ctx.roundRect(12,ultY,ultBarW,32,8);ctx.fill()
  ctx.fillStyle=(ultFrac>=1?'#a78bfa':'#6366f1')+'33';ctx.beginPath();ctx.roundRect(14,ultY+2,(ultBarW-4)*ultFrac,28,6);ctx.fill()
  if (ultFrac>=1){const p=0.5+0.5*Math.sin(now*6);ctx.fillStyle=`rgba(167,139,250,${0.3+p*0.3})`;ctx.beginPath();ctx.roundRect(14,ultY+2,ultBarW-4,28,6);ctx.fill()}
  ctx.font='bold 10px system-ui';ctx.fillStyle=ultFrac>=1?'#c4b5fd':'#818cf8';ctx.textAlign='left'
  ctx.fillText(`DASH ${ultFrac>=1?'READY!':Math.floor(ultFrac*100)+'%'}`,22,ultY+20); yOff+=40

  // Held items
  if (player.heldItems.length>0){
    const itmY=ch-76-108-yOff, itmX=12
    ctx.fillStyle='rgba(0,0,0,0.62)';ctx.beginPath();ctx.roundRect(itmX,itmY,player.heldItems.length*46+8,38,8);ctx.fill()
    player.heldItems.forEach((kind,i)=>{const ix=itmX+8+i*46,iy=itmY+4;ctx.fillStyle=ITEM_COL[kind]+'44';ctx.beginPath();ctx.roundRect(ix,iy,38,30,6);ctx.fill();ctx.font='16px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ITEM_EMOJI[kind],ix+19,iy+15);ctx.textBaseline='alphabetic'})
    ctx.textAlign='left';ctx.font='bold 9px system-ui';ctx.fillStyle='#71717a';ctx.fillText('Q → 아이템 사용',itmX+4,itmY-4)
  }

  // Perks
  if (w.perks.length>0){
    ctx.textAlign='right'
    const perksY=mmY+mm+10
    w.perks.forEach((p,i)=>{ctx.font='11px system-ui';ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(cw-94,perksY+i*20,90,18);ctx.fillStyle='#a1a1aa';ctx.fillText(`${PERKS[p].emoji} ${PERKS[p].title}`,cw-4,perksY+i*20+13)})
    ctx.textAlign='left'
  }

  // Storm timer
  if (w.zPhase!=='HOLD'||w.zUntil-w.now<12){
    const label=w.zPhase==='SHRINK'?'폭풍 수축 중':w.zPhase==='WARN'?'⚠️ 폭풍 경고':'폭풍 대기'
    const col=w.zPhase==='SHRINK'?'#f97316':w.zPhase==='WARN'?'#fbbf24':'#818cf8'
    ctx.fillStyle='rgba(0,0,0,0.62)';ctx.beginPath();ctx.roundRect(cw/2-90,12,180,36,8);ctx.fill()
    ctx.textAlign='center';ctx.fillStyle=col;ctx.font='bold 12px system-ui';ctx.fillText(label,cw/2,28)
    ctx.fillStyle='#f4f4f5';ctx.font='11px system-ui';ctx.fillText(`${Math.ceil(Math.max(0,w.zUntil-w.now))}s`,cw/2,42);ctx.textAlign='left'
  }

  // Boss warning HUD
  if (w.bPhase==='WARNING'){
    const rem=Math.ceil(Math.max(0,w.bWarnUntil-w.now)), pulse=0.5+0.5*Math.sin(now*6)
    ctx.fillStyle=`rgba(239,68,68,${0.7+pulse*0.3})`;ctx.beginPath();ctx.roundRect(cw/2-120,60,240,44,8);ctx.fill()
    ctx.textAlign='center';ctx.font='bold 15px system-ui';ctx.fillStyle='white';ctx.fillText(`⚠️ BOSS 출현 ${rem}s`,cw/2,80)
    ctx.font='11px system-ui';ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fillText('마커로 이동하세요!',cw/2,96);ctx.textAlign='left'
  }

  void cam
}

// ─── Camera ───────────────────────────────────────────────────────────────────
const CAM_MAX=0.9, CAM_MIN=0.28
function zoomForLen(len: number){return Math.max(CAM_MIN,Math.min(CAM_MAX,0.9-(len-35)/900))}

// ─── Perk Draft UI ────────────────────────────────────────────────────────────
function PerkDraft({draft,onPick}:{draft:PerkId[];onPick:(p:PerkId)=>void}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10">
      <div className="rounded-2xl border border-purple-700 bg-zinc-950/95 px-8 py-7 text-center shadow-2xl max-w-sm w-full mx-4">
        <p className="text-lg font-bold text-purple-300 mb-1">🎯 퍽 선택</p>
        <p className="text-xs text-zinc-500 mb-5">처치 달성! 1가지를 선택하세요</p>
        <div className="space-y-3">
          {draft.map(p=>(
            <button key={p} onClick={()=>onPick(p)}
              className="w-full flex items-center gap-3 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-left transition hover:border-purple-500 hover:bg-zinc-800 active:scale-95">
              <span className="text-2xl">{PERKS[p].emoji}</span>
              <div><p className="font-semibold text-white text-sm">{PERKS[p].title}</p><p className="text-xs text-zinc-400">{PERKS[p].desc}</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const JMAX = 70

// ─── Main Component ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props { onClose: ()=>void; strings?: any }
export default function SnakeGame({onClose}: Props) {
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const worldRef=useRef<World>(initWorld())
  const mouseRef=useRef({cx:0,cy:0})
  const boostRef=useRef(false)
  const ultRef=useRef(false)
  const useItemRef=useRef(false)
  const rafRef=useRef(0)
  const lastTRef=useRef(0)
  const frameRef=useRef(0)
  const camRef=useRef({x:0,y:0,zoom:CAM_MAX})
  const joystickDirRef=useRef<{active:boolean;angle:number}>({active:false,angle:0})
  const [display,setDisplay]=useState({phase:'playing' as GamePhase,score:0,kills:0,ult:0})
  const [draft,setDraft]=useState<PerkId[]|null>(null)
  const [isTouch,setIsTouch]=useState(false)
  const [joyVis,setJoyVis]=useState<{active:boolean;baseX:number;baseY:number;thumbX:number;thumbY:number}>({active:false,baseX:0,baseY:0,thumbX:0,thumbY:0})

  const worldToScreen=useCallback((cx:number,cy:number,cw:number,ch:number)=>{
    const cam=camRef.current; return {x:(cx-cw/2)/cam.zoom+cam.x,y:(cy-ch/2)/cam.zoom+cam.y}
  },[])

  useEffect(()=>{setIsTouch('ontouchstart' in window||navigator.maxTouchPoints>0)},[])
  const [mmPx,setMmPx]=useState(60)
  useEffect(()=>{
    const calc=()=>setMmPx(Math.max(60,Math.min(window.innerWidth,window.innerHeight)*0.14))
    calc(); window.addEventListener('resize',calc); return()=>window.removeEventListener('resize',calc)
  },[])
  useEffect(()=>{
    window.history.pushState(null,'',window.location.href)
    const onPop=()=>onClose()
    window.addEventListener('popstate',onPop)
    return()=>window.removeEventListener('popstate',onPop)
  },[onClose])
  useEffect(()=>{
    const prevTa=document.body.style.touchAction, prevOv=document.body.style.overflow
    document.body.style.touchAction='none'; document.body.style.overflow='hidden'
    const block=(e:TouchEvent)=>e.preventDefault()
    document.addEventListener('touchstart',block,{passive:false})
    document.addEventListener('touchmove',block,{passive:false})
    return()=>{
      document.body.style.touchAction=prevTa; document.body.style.overflow=prevOv
      document.removeEventListener('touchstart',block)
      document.removeEventListener('touchmove',block)
    }
  },[])

  const restart=useCallback(()=>{worldRef.current=initWorld();setDisplay({phase:'playing',score:0,kills:0,ult:0});setDraft(null)},[])
  const pickPerk=useCallback((p:PerkId)=>{worldRef.current.perks.push(p);worldRef.current.draft=null;setDraft(null)},[])

  const handleJoyStart=useCallback((e:React.TouchEvent)=>{
    e.preventDefault(); getSfxCtx()?.resume()
    const t=e.touches[0]
    setJoyVis({active:true,baseX:t.clientX,baseY:t.clientY,thumbX:t.clientX,thumbY:t.clientY})
    joystickDirRef.current={active:false,angle:0}; boostRef.current=false
  },[])
  const handleJoyMove=useCallback((e:React.TouchEvent)=>{
    e.preventDefault()
    const t=e.touches[0]
    setJoyVis(prev=>{
      if(!prev.active) return prev
      const dx=t.clientX-prev.baseX, dy=t.clientY-prev.baseY
      const d=Math.sqrt(dx*dx+dy*dy), angle=Math.atan2(dy,dx)
      if(d>10) joystickDirRef.current={active:true,angle}
      boostRef.current=d>JMAX*0.65
      const cd=Math.min(d,JMAX)
      return {...prev,thumbX:prev.baseX+Math.cos(angle)*cd,thumbY:prev.baseY+Math.sin(angle)*cd}
    })
  },[])
  const handleJoyEnd=useCallback((e:React.TouchEvent)=>{
    e.preventDefault()
    setJoyVis(prev=>({...prev,active:false}))
    joystickDirRef.current={active:false,angle:0}; boostRef.current=false
  },[])

  useEffect(()=>{
    const canvas=canvasRef.current; if (!canvas) return
    const ctx=canvas.getContext('2d'); if (!ctx) return
    function resize(){if(!canvas)return;canvas.width=canvas.offsetWidth*devicePixelRatio;canvas.height=canvas.offsetHeight*devicePixelRatio;ctx!.scale(devicePixelRatio,devicePixelRatio)}
    resize(); const ro=new ResizeObserver(resize); ro.observe(canvas)

    function loop(ts:number){
      const dt=Math.min(0.05,(ts-lastTRef.current)/1000); lastTRef.current=ts; frameRef.current++
      const w=worldRef.current; if(!canvas||!ctx) return
      const cw=canvas.offsetWidth,ch=canvas.offsetHeight,now=ts/1000

      if (w.phase==='playing'&&!w.draft) {
        const player=w.snakes[0]; let inputDir=player.dir
        if (player.alive){
          if(joystickDirRef.current.active){inputDir=joystickDirRef.current.angle}
          else{const mw=worldToScreen(mouseRef.current.cx,mouseRef.current.cy,cw,ch);const dx=mw.x-player.segs[0].x,dy=mw.y-player.segs[0].y;if(Math.abs(dx)>5||Math.abs(dy)>5) inputDir=Math.atan2(dy,dx)}
        }
        const inputUlt=ultRef.current; ultRef.current=false
        if (useItemRef.current&&player.heldItems.length>0){applyItem(player,player.heldItems.shift()!,now);useItemRef.current=false}
        tick(w,dt,inputDir,boostRef.current,inputUlt)
        for(const ev of w.soundEvents)playSound(ev);w.soundEvents.length=0
        if (w.draft) setDraft(w.draft)
      }

      if (frameRef.current%20===0||w.phase!=='playing') setDisplay({phase:w.phase,score:Math.floor(w.score||w.snakes[0]?.len||0),kills:w.pKills,ult:Math.floor(w.ultCharge)})

      const p=w.snakes[0],cam=camRef.current
      if (p?.alive){cam.x+=(p.segs[0].x-cam.x)*0.12;cam.y+=(p.segs[0].y-cam.y)*0.12;cam.zoom+=(zoomForLen(p.peakLen)-cam.zoom)*0.03}

      render(ctx,w,cw,ch,now,camRef.current)
      renderHUD(ctx,w,cw,ch,now,camRef.current)
      rafRef.current=requestAnimationFrame(loop)
    }

    rafRef.current=requestAnimationFrame(ts=>{lastTRef.current=ts;rafRef.current=requestAnimationFrame(loop)})
    return ()=>{cancelAnimationFrame(rafRef.current);ro.disconnect()}
  },[worldToScreen])

  useEffect(()=>{
    const canvas=canvasRef.current; if (!canvas) return
    const onMove=(e:MouseEvent)=>{const r=canvas.getBoundingClientRect();mouseRef.current={cx:e.clientX-r.left,cy:e.clientY-r.top}}
    const onTouchMove=(e:TouchEvent)=>{e.preventDefault();const r=canvas.getBoundingClientRect(),t=e.touches[0];mouseRef.current={cx:t.clientX-r.left,cy:t.clientY-r.top}}
    const onTouchStart=(e:TouchEvent)=>{e.preventDefault();const r=canvas.getBoundingClientRect(),t=e.touches[0];mouseRef.current={cx:t.clientX-r.left,cy:t.clientY-r.top}}
    const onDown=()=>{boostRef.current=true;getSfxCtx()?.resume()}
    const onUp=()=>{boostRef.current=false}
    const onKey=(e:KeyboardEvent)=>{
      if (e.code==='Space'||e.code==='ShiftLeft'||e.code==='ShiftRight'){e.preventDefault();boostRef.current=e.type==='keydown'}
      if ((e.code==='KeyE'||e.code==='KeyZ')&&e.type==='keydown') ultRef.current=true
      if (e.code==='KeyQ'&&e.type==='keydown') useItemRef.current=true
      if (e.key==='Escape') onClose()
    }
    canvas.addEventListener('mousemove',onMove); canvas.addEventListener('touchmove',onTouchMove,{passive:false})
    canvas.addEventListener('touchstart',onTouchStart,{passive:false})
    canvas.addEventListener('mousedown',onDown); canvas.addEventListener('mouseup',onUp)
    window.addEventListener('keydown',onKey); window.addEventListener('keyup',onKey)
    return ()=>{
      canvas.removeEventListener('mousemove',onMove); canvas.removeEventListener('touchmove',onTouchMove)
      canvas.removeEventListener('touchstart',onTouchStart)
      canvas.removeEventListener('mousedown',onDown); canvas.removeEventListener('mouseup',onUp)
      window.removeEventListener('keydown',onKey); window.removeEventListener('keyup',onKey)
    }
  },[onClose])

  return (
    <div className="relative h-full w-full overflow-hidden touch-none bg-[#07071a]">
      <canvas ref={canvasRef} className="h-full w-full cursor-none touch-none" />
      <button onClick={onClose} className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-zinc-400 transition hover:bg-black/80 hover:text-white" style={{top:mmPx+24,right:8}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      {draft&&<PerkDraft draft={draft} onPick={pickPerk}/>}
      {isTouch&&(
        <>
          {/* Left joystick zone */}
          <div
            className="pointer-events-auto absolute bottom-0 left-0 top-0 w-3/5 touch-none"
            onTouchStart={handleJoyStart}
            onTouchMove={handleJoyMove}
            onTouchEnd={handleJoyEnd}
            onTouchCancel={handleJoyEnd}
          />
          {/* Joystick visual */}
          {joyVis.active&&(
            <div className="pointer-events-none absolute inset-0" style={{zIndex:20}}>
              <div className="absolute rounded-full border-2 border-white/25 bg-white/5"
                style={{width:JMAX*2,height:JMAX*2,left:joyVis.baseX-JMAX,top:joyVis.baseY-JMAX}}/>
              <div className="absolute rounded-full bg-white/35 border border-white/20"
                style={{width:JMAX*0.8,height:JMAX*0.8,left:joyVis.thumbX-JMAX*0.4,top:joyVis.thumbY-JMAX*0.4}}/>
            </div>
          )}
          {/* Right DASH button */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-end justify-end px-6">
            <button
              className={`pointer-events-auto flex h-20 w-20 select-none flex-col items-center justify-center gap-1 rounded-full border-2 transition-colors ${display.ult>=100?'border-purple-400 bg-purple-900/60 text-purple-100':'border-zinc-600/40 bg-black/60 text-zinc-500'}`}
              onTouchStart={e=>{e.preventDefault();ultRef.current=true;getSfxCtx()?.resume()}}
            >
              <span className="text-2xl leading-none">⚡</span>
              <span className="text-[11px] font-bold">{display.ult>=100?'READY!':display.ult+'%'}</span>
            </button>
          </div>
        </>
      )}
      {display.phase==='dead'&&(
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-10 py-8 text-center shadow-2xl">
            <p className="text-4xl font-bold text-red-400">💀 게임 오버</p>
            <p className="mt-3 text-zinc-400">최종 길이: <span className="font-bold text-white">{display.score}</span></p>
            <p className="text-zinc-400">처치: <span className="font-bold text-white">{display.kills}</span></p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={restart} className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">다시 도전</button>
              <button onClick={onClose} className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500">나가기</button>
            </div>
          </div>
        </div>
      )}
      {display.phase==='win'&&(
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-10 py-8 text-center shadow-2xl">
            <p className="text-4xl font-bold text-yellow-400">🏆 우승!</p>
            <p className="mt-3 text-zinc-400">최종 길이: <span className="font-bold text-white">{display.score}</span></p>
            <p className="text-zinc-400">처치: <span className="font-bold text-white">{display.kills}</span></p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={restart} className="rounded-full bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400">다시 플레이</button>
              <button onClick={onClose} className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500">나가기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
