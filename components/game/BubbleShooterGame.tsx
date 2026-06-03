'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Constants (BubbleShooterGameView.kt) ────────────────────────────────────
const COLS = 9, MAX_ROWS = 18, MATCH_MIN = 3, INITIAL_ROWS = 8
const SPECIAL_GRID = 0.06, SPECIAL_SHOOT = 0.08
const FEVER_THRESH = 4, FEVER_DUR = 10
const CREEP_EVERY = 8, MAX_SHOTS = 80, MAX_TRAIL = 12

// ─── Colors ───────────────────────────────────────────────────────────────────
type BubColorId = 'RED'|'BLUE'|'GREEN'|'YELLOW'|'PURPLE'|'CYAN'
const COLORS: Record<BubColorId,{base:string;light:string;dark:string;glow:string}> = {
  RED:    {base:'#FF1744',light:'#FF8A80',dark:'#CC0000',glow:'rgba(255,23,68,0.67)'},
  BLUE:   {base:'#2979FF',light:'#82B1FF',dark:'#0044DD',glow:'rgba(41,121,255,0.67)'},
  GREEN:  {base:'#00C853',light:'#69F0AE',dark:'#007722',glow:'rgba(0,200,83,0.67)'},
  YELLOW: {base:'#FFD600',light:'#FFFF6E',dark:'#BB9900',glow:'rgba(255,214,0,0.67)'},
  PURPLE: {base:'#D500F9',light:'#EA80FC',dark:'#8800CC',glow:'rgba(213,0,249,0.67)'},
  CYAN:   {base:'#00E5FF',light:'#80F8FF',dark:'#0097A7',glow:'rgba(0,229,255,0.67)'},
}
const COLOR_IDS: BubColorId[] = ['RED','BLUE','GREEN','YELLOW','PURPLE','CYAN']
type BubType = 'NORMAL'|'STAR'|'BOMB'|'RAINBOW'
const TYPE_ICON: Record<BubType,string> = {NORMAL:'',STAR:'⭐',BOMB:'💣',RAINBOW:'🌈'}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Bubble { color: BubColorId; type: BubType }
interface Particle { x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string;r:number;kind:number }
interface Ring { cx:number;cy:number;r:number;maxR:number;alpha:number;color:string }
interface FloatLabel { text:string;x:number;y:number;life:number;color:string;size:number }

interface GS {
  grid: (Bubble|null)[][]
  rsp: number  // rowShiftPhase
  R: number; rowH: number; shootCx: number; shootCy: number; flySpeed: number
  offsetX: number; gameW: number  // horizontal centering
  aimAngle: number; rawAimAngle: number
  curColor: BubColorId; curType: BubType
  nxtColor: BubColorId; nxtType: BubType
  flyActive: boolean; flyX: number; flyY: number; flyVx: number; flyVy: number
  flyColor: BubColorId; flyType: BubType
  trail: [number,number][]
  ghostRow: number; ghostCol: number
  score: number; level: number; shotsLeft: number
  combo: number; comboTimer: number; consecutiveMatches: number
  shotsSinceCreep: number; gameTimeS: number
  feverActive: boolean; feverTimer: number; shakeAmt: number
  particles: Particle[]; rings: Ring[]; floatLabels: FloatLabel[]
  phase: 'playing'|'won'|'lost'
  stars: [number,number,number,number,number][]  // x,y,r,phase,speed
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
function colsInRow(g: GS, row: number) { return (row + g.rsp) % 2 === 0 ? COLS : COLS - 1 }
function cellCx(g: GS, row: number, col: number) {
  return g.offsetX + ((row + g.rsp) % 2 === 1 ? g.R : 0) + g.R + col * 2 * g.R
}
function cellCy(g: GS, row: number) { return g.R + row * g.rowH }

function hexNbr(g: GS, r: number, c: number): [number,number][] {
  const isEven = (r + g.rsp) % 2 === 0
  if (isEven) return [[r,c-1],[r,c+1],[r-1,c-1],[r-1,c],[r+1,c-1],[r+1,c]]
  return [[r,c-1],[r,c+1],[r-1,c],[r-1,c+1],[r+1,c],[r+1,c+1]]
}

function nearestEmpty(g: GS, x: number, y: number): [number,number] {
  let best = Infinity, br = -1, bc = -1
  const er = Math.max(0, Math.min(MAX_ROWS-1, Math.floor((y - g.R) / g.rowH)))
  for (const radius of [2,4,MAX_ROWS]) {
    for (let r = Math.max(0,er-radius); r <= Math.min(MAX_ROWS-1,er+radius); r++) {
      for (let c = 0; c < colsInRow(g,r); c++) {
        if (g.grid[r][c]) continue
        const dx=x-cellCx(g,r,c), dy=y-cellCy(g,r), d=dx*dx+dy*dy
        if (d < best) { best=d; br=r; bc=c }
      }
    }
    if (br >= 0) break
  }
  return [br, bc]
}

// ─── BFS ──────────────────────────────────────────────────────────────────────
function bfsColor(g: GS, sr: number, sc: number, color: BubColorId): [number,number][] {
  const vis = new Set<string>([`${sr},${sc}`])
  const q: [number,number][] = [[sr,sc]]
  while (q.length) {
    const [r,c] = q.shift()!
    for (const [nr,nc] of hexNbr(g,r,c)) {
      if (nr < 0||nr >= MAX_ROWS||nc < 0||nc >= colsInRow(g,nr)) continue
      const k=`${nr},${nc}`; if (vis.has(k)) continue
      const b=g.grid[nr][nc]; if (!b) continue
      if (b.color===color||b.type==='RAINBOW') { vis.add(k); q.push([nr,nc]) }
    }
  }
  return [...vis].map(k=>k.split(',').map(Number) as [number,number])
}

function bfsOrphans(g: GS): [number,number][] {
  const reach = new Set<string>()
  const q: [number,number][] = []
  for (let c=0;c<COLS;c++) if (g.grid[0][c]) { const k=`0,${c}`; if (!reach.has(k)){reach.add(k);q.push([0,c])} }
  while (q.length) {
    const [r,c] = q.shift()!
    for (const [nr,nc] of hexNbr(g,r,c)) {
      if (nr < 0||nr >= MAX_ROWS||nc < 0||nc >= colsInRow(g,nr)) continue
      const k=`${nr},${nc}`; if (reach.has(k)||!g.grid[nr][nc]) continue
      reach.add(k); q.push([nr,nc])
    }
  }
  const orphans: [number,number][] = []
  for (let r=0;r<MAX_ROWS;r++) for (let c=0;c<colsInRow(g,r);c++)
    if (g.grid[r][c] && !reach.has(`${r},${c}`)) orphans.push([r,c])
  return orphans
}

// ─── Bubble canvas cache ──────────────────────────────────────────────────────
const bubCache = new Map<string, HTMLCanvasElement>()
function getBubCanvas(color: BubColorId, R: number): HTMLCanvasElement|null {
  if (typeof document==='undefined') return null
  const key=`${color}-${Math.round(R)}`
  if (bubCache.has(key)) return bubCache.get(key)!
  const dim = Math.max(4, Math.round(R*2.2))
  const c = document.createElement('canvas'); c.width=dim; c.height=dim
  const ctx = c.getContext('2d'); if (!ctx) return null
  const cx=dim/2, cy=dim/2, r=R*0.92
  const col=COLORS[color]

  // shadow
  ctx.fillStyle='rgba(0,0,0,0.33)'; ctx.beginPath(); ctx.arc(cx+r*0.07,cy+r*0.10,r*0.94,0,Math.PI*2); ctx.fill()

  // outer glow
  const grd0=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.3)
  grd0.addColorStop(0.6,col.glow); grd0.addColorStop(1,'rgba(0,0,0,0)')
  ctx.fillStyle=grd0; ctx.beginPath(); ctx.arc(cx,cy,r*1.3,0,Math.PI*2); ctx.fill()

  // main body
  const grd1=ctx.createRadialGradient(cx-r*0.28,cy-r*0.32,0,cx,cy,r)
  grd1.addColorStop(0,col.light); grd1.addColorStop(0.28,col.base); grd1.addColorStop(1,col.dark)
  ctx.fillStyle=grd1; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill()

  // rim shadow
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip()
  const grd2=ctx.createRadialGradient(cx,cy,0,cx,cy,r)
  grd2.addColorStop(0,'rgba(0,0,0,0)'); grd2.addColorStop(0.7,'rgba(0,0,0,0)'); grd2.addColorStop(1,'rgba(0,0,0,0.33)')
  ctx.fillStyle=grd2; ctx.fillRect(0,0,dim,dim)
  ctx.restore()

  // top gloss
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip()
  const grd3=ctx.createLinearGradient(cx,cy-r,cx,cy+r*0.2)
  grd3.addColorStop(0,'rgba(255,255,255,0.73)'); grd3.addColorStop(0.3,'rgba(255,255,255,0.33)'); grd3.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle=grd3; ctx.fillRect(cx-r,cy-r,r*2,r*1.2)
  ctx.restore()

  // main highlight
  const grd4=ctx.createRadialGradient(cx-r*0.26,cy-r*0.28,0,cx-r*0.26,cy-r*0.28,r*0.38)
  grd4.addColorStop(0,'rgba(255,255,255,0.87)'); grd4.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle=grd4; ctx.beginPath(); ctx.arc(cx-r*0.20,cy-r*0.22,r*0.38,0,Math.PI*2); ctx.fill()

  // tiny sparkle
  ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(cx-r*0.35,cy-r*0.35,r*0.09,0,Math.PI*2); ctx.fill()

  // rim
  ctx.strokeStyle='rgba(255,255,255,0.27)'; ctx.lineWidth=r*0.05; ctx.beginPath(); ctx.arc(cx,cy,r-r*0.025,0,Math.PI*2); ctx.stroke()

  bubCache.set(key, c)
  return c
}

// ─── Emoji cache ──────────────────────────────────────────────────────────────
const emojiCache2 = new Map<string,HTMLCanvasElement>()
function getEmoji(e:string,px:number){
  if (typeof document==='undefined') return null
  const k=`${e}-${px}`; if (emojiCache2.has(k)) return emojiCache2.get(k)!
  const c=document.createElement('canvas');c.width=px;c.height=px
  const cx=c.getContext('2d');if(!cx) return null
  cx.font=`${Math.round(px*0.82)}px system-ui`;cx.textAlign='center';cx.textBaseline='middle'
  cx.fillText(e,px/2,px/2);emojiCache2.set(k,c);return c
}

// ─── Random helpers ───────────────────────────────────────────────────────────
function randomColor(g: GS): BubColorId {
  const existing = new Set<BubColorId>()
  for (let r=0;r<MAX_ROWS;r++) for (let c=0;c<COLS;c++) if (g.grid[r]?.[c]) existing.add(g.grid[r][c]!.color)
  const pool = existing.size >= 2 ? [...existing] : COLOR_IDS.slice(0,5)
  return pool[Math.floor(Math.random()*pool.length)]
}
function differentColor(g: GS, exclude: BubColorId): BubColorId {
  const existing = new Set<BubColorId>()
  for (let r=0;r<MAX_ROWS;r++) for (let c=0;c<COLS;c++) { const b=g.grid[r]?.[c]; if (b&&b.color!==exclude) existing.add(b.color) }
  const pool = existing.size > 0 ? [...existing] : COLOR_IDS.filter(c=>c!==exclude)
  return pool[Math.floor(Math.random()*pool.length)]
}
function randomShooterPair(g: GS): {color:BubColorId;type:BubType} {
  const color=randomColor(g)
  const type: BubType = Math.random()<SPECIAL_SHOOT ? (['STAR','BOMB','RAINBOW'] as BubType[])[Math.floor(Math.random()*3)] : 'NORMAL'
  return {color,type}
}
function randomGridBubble(): Bubble {
  const color=COLOR_IDS[Math.floor(Math.random()*5)]
  const type: BubType = Math.random()<SPECIAL_GRID ? (['STAR','BOMB','RAINBOW'] as BubType[])[Math.floor(Math.random()*3)] : 'NORMAL'
  return {color,type}
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function initGame(w: number, h: number): GS {
  // R: fit INITIAL_ROWS into the top ~40% of height → ample shooting space
  const Rw = w / (2 * COLS)
  const Rh = h * 0.40 / (INITIAL_ROWS * Math.sqrt(3))
  const R = Math.min(Rw, Rh, 30)  // hard cap 30px
  const rowH = R * Math.sqrt(3)
  const gameW = 2 * COLS * R
  const offsetX = (w - gameW) / 2
  const shootCx = offsetX + COLS * R
  const shootCy = h * 0.88  // shooter near bottom
  const grid: (Bubble|null)[][]=Array.from({length:MAX_ROWS},()=>Array(COLS).fill(null))
  for (let r=0;r<INITIAL_ROWS;r++) { const cols=((r+0)%2===0)?COLS:COLS-1; for (let c=0;c<cols;c++) grid[r][c]=randomGridBubble() }
  const stars: [number,number,number,number,number][] = Array.from({length:90},()=>[Math.random()*w,Math.random()*h*0.78,Math.random()*2.2+0.3,Math.random()*6.28,Math.random()*0.8+0.4])
  const g: GS = {
    grid,rsp:0,R,rowH,shootCx,shootCy,flySpeed:gameW*1.5,
    offsetX,gameW,
    aimAngle:-Math.PI/2,rawAimAngle:-Math.PI/2,
    curColor:'RED',curType:'NORMAL',nxtColor:'BLUE',nxtType:'NORMAL',
    flyActive:false,flyX:0,flyY:0,flyVx:0,flyVy:0,flyColor:'RED',flyType:'NORMAL',
    trail:[],ghostRow:-1,ghostCol:-1,
    score:0,level:1,shotsLeft:MAX_SHOTS,
    combo:0,comboTimer:0,consecutiveMatches:0,shotsSinceCreep:0,gameTimeS:0,
    feverActive:false,feverTimer:0,shakeAmt:0,
    particles:[],rings:[],floatLabels:[],
    phase:'playing',stars,
  }
  g.curColor=randomColor(g); g.nxtColor=differentColor(g,g.curColor)
  return g
}

// ─── Effects ──────────────────────────────────────────────────────────────────
function burst(g: GS, cx: number, cy: number, base: string, light: string) {
  for (let i=0;i<18;i++) {
    const a=i/18*Math.PI*2+Math.random()*0.35, s=Math.random()*700+180
    g.particles.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,maxLife:1,color:i%3===0?light:base,r:g.R*(0.22+Math.random()*0.14),kind:0})
  }
  for (let i=0;i<10;i++) {
    const a=Math.random()*Math.PI*2, s=Math.random()*400+300
    g.particles.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1.2,maxLife:1.2,color:'white',r:g.R*0.10,kind:1})
  }
}
function showLabel(g: GS, text: string, x: number, y: number, color: string, size: number) {
  g.floatLabels.push({text,x,y,life:1.8,color,size})
}
function feverMult(g: GS) { return g.feverActive?3:1 }

function checkFever(g: GS) {
  if (!g.feverActive&&g.consecutiveMatches>=FEVER_THRESH) {
    g.feverActive=true; g.feverTimer=FEVER_DUR
    showLabel(g,'🔥 FEVER! 🔥',g.shootCx,g.shootCy-g.R*7,'#FF3D00',g.R*2.0)
    g.shakeAmt=20; SFX.fever()
  } else if (g.feverActive) g.feverTimer=FEVER_DUR
}

function dropOrphans(g: GS) {
  const orphans=bfsOrphans(g); if (!orphans.length) return
  const bonus=orphans.length*20*feverMult(g)
  g.score+=bonus
  showLabel(g,`CHAIN +${bonus}`,g.shootCx,g.shootCy-g.R*5,'#FF3D00',g.R*1.4)
  for (const [r,c] of orphans) { burst(g,cellCx(g,r,c),cellCy(g,r),COLORS[g.grid[r][c]!.color].base,COLORS[g.grid[r][c]!.color].light); g.rings.push({cx:cellCx(g,r,c),cy:cellCy(g,r),r:0,maxR:g.R*3.5,alpha:1,color:COLORS[g.grid[r][c]!.color].base}); g.grid[r][c]=null }
  SFX.chain()
}

function checkWin(g: GS) { for (let r=0;r<MAX_ROWS;r++) for (let c=0;c<colsInRow(g,r);c++) if (g.grid[r][c]) return false; return true }
function checkLoss(g: GS) {
  const dangerY=g.shootCy-g.R*3.5
  const dr=Math.max(0,Math.floor((dangerY-g.R)/g.rowH))
  for (let r=dr;r<MAX_ROWS;r++) for (let c=0;c<colsInRow(g,r);c++) if (g.grid[r][c]) return true
  return false
}

function creepDown(g: GS) {
  g.level++; g.rsp=(g.rsp+1)%2
  for (let r=MAX_ROWS-1;r>=1;r--) g.grid[r]=[...g.grid[r-1]]
  const colors=Math.min(4+Math.floor(g.level/3),5)
  g.grid[0]=Array.from({length:COLS},(_,c)=>{
    if (c>=colsInRow(g,0)) return null
    const color=COLOR_IDS[Math.floor(Math.random()*colors)]
    const type:BubType=Math.random()<0.04?(['STAR','BOMB','RAINBOW'] as BubType[])[Math.floor(Math.random()*3)]:'NORMAL'
    return {color,type}
  })
  const orphans=bfsOrphans(g); for (const [r,c] of orphans) g.grid[r][c]=null
  showLabel(g,`▼ ${_str.levelLabel} ${g.level}`,g.shootCx,cellCy(g,2),'#FF5252',g.R*1.1)
  SFX.levelUp()
}

function advanceShot(g: GS) {
  g.curColor=g.nxtColor; g.curType=g.nxtType
  const next=randomShooterPair(g); g.nxtColor=next.color; g.nxtType=next.type
  g.aimAngle=-Math.PI/2; g.rawAimAngle=-Math.PI/2
  g.shotsLeft--; g.shotsSinceCreep++
  if (g.shotsSinceCreep>=CREEP_EVERY) { creepDown(g); g.shotsSinceCreep=0; if (checkLoss(g)){g.phase='lost';return} }
  if (g.shotsLeft<=0) g.phase='lost'
}

function applyNormal(g: GS, row: number, col: number) {
  const color=g.grid[row][col]?.color; if (!color) return
  const matched=bfsColor(g,row,col,color)
  if (matched.length>=MATCH_MIN) {
    g.combo++; g.comboTimer=3; g.consecutiveMatches++
    const cm=Math.min(g.combo,5), pts=matched.length*15*cm*feverMult(g)
    g.score+=pts
    const label=(g.feverActive?'🔥 ':'')+(cm>1?`x${cm} COMBO! `:'')+`+${pts}`
    showLabel(g,label,cellCx(g,row,col),cellCy(g,row)-g.R*2,g.feverActive?'#FF3D00':cm>1?'#FF6F00':'#FFCA28',g.R*(cm>1||g.feverActive?1.3:1.0))
    for (const [r,c] of matched) { burst(g,cellCx(g,r,c),cellCy(g,r),COLORS[g.grid[r][c]!.color].base,COLORS[g.grid[r][c]!.color].light); g.rings.push({cx:cellCx(g,r,c),cy:cellCy(g,r),r:0,maxR:g.R*3.5,alpha:1,color:COLORS[g.grid[r][c]!.color].base}); g.grid[r][c]=null }
    if (matched.length>=5){g.shakeAmt=12; SFX.bigPop()} else SFX.pop()
    const orphans=bfsOrphans(g)
    if (orphans.length) {
      const bonus=orphans.length*20*cm*feverMult(g); g.score+=bonus
      showLabel(g,`CHAIN +${bonus}`,g.shootCx,g.shootCy-g.R*5,'#FF3D00',g.R*1.4)
      for (const [r,c] of orphans) { burst(g,cellCx(g,r,c),cellCy(g,r),COLORS[g.grid[r][c]!.color].base,COLORS[g.grid[r][c]!.color].light); g.grid[r][c]=null }
      SFX.chain()
    }
    checkFever(g)
  } else { g.combo=0; g.consecutiveMatches=0 }
}

function snapBubble(g: GS) {
  g.flyActive=false
  const [row,col]=nearestEmpty(g,g.flyX,g.flyY)
  if (row<0||col<0){advanceShot(g);return}
  g.grid[row][col]={color:g.flyColor,type:g.flyType}
  SFX.snap()

  if (g.flyType==='STAR') {
    let pts=0; const cy0=cellCy(g,row)
    for (let c=0;c<COLS;c++){const b=g.grid[row][c];if(!b)continue;pts+=30*feverMult(g);burst(g,cellCx(g,row,c),cy0,COLORS[b.color].base,COLORS[b.color].light);g.rings.push({cx:cellCx(g,row,c),cy:cy0,r:0,maxR:g.R*3.5,alpha:1,color:COLORS[b.color].base});g.grid[row][c]=null}
    g.score+=pts; showLabel(g,`⭐ ROW! +${pts}`,cellCx(g,row,col),cy0-g.R*2,'#FFD600',g.R*1.5)
    g.shakeAmt=14; g.consecutiveMatches++; SFX.star(); checkFever(g); dropOrphans(g)
  } else if (g.flyType==='BOMB') {
    const cx0=cellCx(g,row,col),cy0=cellCy(g,row),bombR=g.R*5; let pts=0
    for (let r=0;r<MAX_ROWS;r++) for (let c=0;c<colsInRow(g,r);c++) {
      const b=g.grid[r][c]; if (!b) continue
      const dx=cellCx(g,r,c)-cx0,dy=cellCy(g,r)-cy0
      if (dx*dx+dy*dy>bombR*bombR) continue
      pts+=25*feverMult(g); burst(g,cellCx(g,r,c),cellCy(g,r),COLORS[b.color].base,COLORS[b.color].light); g.rings.push({cx:cellCx(g,r,c),cy:cellCy(g,r),r:0,maxR:g.R*4,alpha:1,color:'#FF6D00'}); g.grid[r][c]=null
    }
    g.score+=pts; showLabel(g,`💣 BOOM! +${pts}`,cx0,cy0-g.R*2,'#FF6D00',g.R*1.6)
    g.shakeAmt=18; g.consecutiveMatches++; SFX.bomb(); checkFever(g); dropOrphans(g)
  } else if (g.flyType==='RAINBOW') {
    const freq=new Map<BubColorId,number>()
    for (const [nr,nc] of hexNbr(g,row,col)) { if (nr<0||nr>=MAX_ROWS||nc<0||nc>=colsInRow(g,nr)) continue; const b=g.grid[nr][nc]; if (b) freq.set(b.color,(freq.get(b.color)??0)+1) }
    let best: BubColorId='RED', bestN=0; for (const [k,v] of freq) if (v>bestN){bestN=v;best=k}
    if (bestN>0) { g.grid[row][col]={color:best,type:'NORMAL'}; applyNormal(g,row,col) } else g.consecutiveMatches=0
  } else {
    applyNormal(g,row,col)
  }

  if (checkWin(g)){g.phase='won';return}
  if (checkLoss(g)){g.phase='lost';return}
  advanceShot(g)
}

// ─── Trajectory helper ────────────────────────────────────────────────────────
function hitsGridAt(g: GS, px: number, py: number, w: number) {
  const thresh=(2*g.R)*(2*g.R)
  for (let r=0;r<MAX_ROWS;r++) for (let c=0;c<colsInRow(g,r);c++) {
    if (!g.grid[r][c]) continue
    const dx=px-cellCx(g,r,c), dy=py-cellCy(g,r)
    if (dx*dx+dy*dy<thresh) return true
  }
  void w; return false
}

function updateGhost(g: GS, w: number) {
  if (g.R===0) return
  const wallL=g.offsetX, wallR=g.offsetX+g.gameW
  let x=g.shootCx, y=g.shootCy-g.R*1.85, vx=Math.cos(g.aimAngle), vy=Math.sin(g.aimAngle)
  const step=g.R*0.6
  for (let i=0;i<4000;i++) {
    x+=vx*step; y+=vy*step
    if (x-g.R<wallL){x=wallL+g.R;vx=Math.abs(vx)} if (x+g.R>wallR){x=wallR-g.R;vx=-Math.abs(vx)}
    if (y-g.R<=0||hitsGridAt(g,x,y,w)) { const [r,c]=nearestEmpty(g,x,y); g.ghostRow=r; g.ghostCol=c; return }
  }
  g.ghostRow=-1; g.ghostCol=-1
}

// ─── Tick ─────────────────────────────────────────────────────────────────────
function tick(g: GS, dt: number, w: number) {
  if (g.R===0) return
  g.gameTimeS+=dt
  g.aimAngle+=(g.rawAimAngle-g.aimAngle)*0.55

  if (g.flyActive) {
    // trail
    if (g.trail.length>=MAX_TRAIL) g.trail.shift()
    g.trail.push([g.flyX,g.flyY])
    g.flyX+=g.flyVx*g.flySpeed*dt; g.flyY+=g.flyVy*g.flySpeed*dt
    const wallL=g.offsetX, wallR=g.offsetX+g.gameW
    if (g.flyX-g.R<wallL){g.flyX=wallL+g.R;g.flyVx=Math.abs(g.flyVx)}
    if (g.flyX+g.R>wallR){g.flyX=wallR-g.R;g.flyVx=-Math.abs(g.flyVx)}
    if (g.flyY-g.R<=0){g.trail=[]; snapBubble(g)}
    else if (hitsGridAt(g,g.flyX,g.flyY,w)){g.trail=[]; snapBubble(g)}
  } else {
    updateGhost(g,w)
  }

  // effects
  for (let i=g.particles.length-1;i>=0;i--) {
    const p=g.particles[i]; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=650*dt; p.vx*=0.96; p.life-=dt*2.0
    if (p.life<=0) g.particles.splice(i,1)
  }
  for (let i=g.rings.length-1;i>=0;i--) {
    const r=g.rings[i]; r.r+=r.maxR*dt*2.8; r.alpha-=dt*2.2; if (r.alpha<=0) g.rings.splice(i,1)
  }
  for (let i=g.floatLabels.length-1;i>=0;i--) {
    const fl=g.floatLabels[i]; fl.y-=85*dt; fl.life-=dt; if (fl.life<=0) g.floatLabels.splice(i,1)
  }
  if (g.shakeAmt>0.5) g.shakeAmt*=0.80; else g.shakeAmt=0
  if (g.comboTimer>0){g.comboTimer-=dt;if(g.comboTimer<=0) g.combo=0}
  if (g.feverActive){g.feverTimer-=dt;if(g.feverTimer<=0){g.feverActive=false;g.consecutiveMatches=0}}
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render(ctx: CanvasRenderingContext2D, g: GS, cw: number, ch: number) {
  ctx.clearRect(0,0,cw,ch)
  const t=g.gameTimeS
  let sx=0,sy=0
  if (g.shakeAmt>0.5){sx=(Math.random()*2-1)*g.shakeAmt;sy=(Math.random()*2-1)*g.shakeAmt}
  ctx.save(); if (g.shakeAmt>0.5) ctx.translate(sx,sy)

  // Background
  const bg=ctx.createLinearGradient(0,0,0,ch)
  bg.addColorStop(0,'#1A0E4A'); bg.addColorStop(0.5,'#23145E'); bg.addColorStop(1,'#1C2870')
  ctx.fillStyle=bg; ctx.fillRect(0,0,cw,ch)

  // FEVER tint
  if (g.feverActive) {
    const fa=Math.sin(t*4)*0.5+0.5
    ctx.fillStyle=`rgba(255,50,0,${fa*0.15})`; ctx.fillRect(0,0,cw,ch)
  }

  // Aurora
  const aAlpha=(Math.sin(t*0.3)*0.5+0.5)*0.22+0.10
  const a1y=ch*0.42+Math.sin(t*0.5)*ch*0.04
  const aGrd=ctx.createLinearGradient(0,a1y-ch*0.09,0,a1y+ch*0.16)
  aGrd.addColorStop(0,'rgba(0,0,0,0)'); aGrd.addColorStop(0.5,`rgba(0,240,130,${aAlpha})`); aGrd.addColorStop(1,'rgba(0,0,0,0)')
  ctx.fillStyle=aGrd; ctx.fillRect(0,a1y-ch*0.09,cw,ch*0.25)

  // Stars
  for (const [sx2,sy2,sr,sph,sspd] of g.stars) {
    const tw=0.60+0.40*Math.sin(t*sspd+sph)
    ctx.fillStyle=`rgba(255,255,255,${tw*0.9})`; ctx.beginPath(); ctx.arc(sx2,sy2,sr*tw,0,Math.PI*2); ctx.fill()
  }

  // Mountains
  ctx.fillStyle='#120B38'; drawMtn(ctx,cw,ch,[0,.12,.26,.40,.55,.70,.84,1],[1,.64,.50,.70,.58,.72,.60,1],.55)
  ctx.fillStyle='#1A1045'; drawMtn(ctx,cw,ch,[0,.14,.28,.44,.58,.74,.88,1],[1,.76,.63,.80,.70,.84,.73,1],.70)
  ctx.fillStyle='#120E30'; ctx.fillRect(0,ch*0.90,cw,ch*0.10)

  // Rings
  for (const ring of g.rings) {
    const a=Math.round(ring.alpha*200)
    ctx.strokeStyle=hexAlpha(ring.color,a); ctx.lineWidth=g.R*0.12*ring.alpha
    ctx.beginPath(); ctx.arc(ring.cx,ring.cy,ring.r,0,Math.PI*2); ctx.stroke()
  }

  // Side panels (dim area outside game zone on wide screens)
  if (g.offsetX > 0) {
    ctx.fillStyle='rgba(0,0,0,0.55)'
    ctx.fillRect(0,0,g.offsetX,ch)
    ctx.fillRect(g.offsetX+g.gameW,0,cw-g.offsetX-g.gameW,ch)
  }

  // Danger line (only within game area)
  const dangerY=g.shootCy-g.R*3.5
  ctx.strokeStyle='rgba(255,51,51,0.6)'; ctx.lineWidth=2; ctx.setLineDash([16,10])
  ctx.lineDashOffset=-(t*30%26); ctx.beginPath(); ctx.moveTo(g.offsetX,dangerY); ctx.lineTo(g.offsetX+g.gameW,dangerY); ctx.stroke()
  ctx.setLineDash([]); ctx.lineDashOffset=0

  // Grid bubbles
  const fevPulse=g.feverActive?Math.sin(t*6)*0.08+0.92:1
  for (let r=0;r<MAX_ROWS;r++) {
    for (let c=0;c<colsInRow(g,r);c++) {
      const bub=g.grid[r][c]; if (!bub) continue
      const cx=cellCx(g,r,c),cy2=cellCy(g,r)
      if (cy2+g.R<0||cy2-g.R>g.shootCy*0.97) continue
      drawBub(ctx,g,cx,cy2,bub.color,g.R*fevPulse)
      // shimmer
      const wave=Math.sin(t*2.2+c*0.5+r*0.3)*0.12+0.88
      const shimA=Math.max(0,Math.min(60,Math.round((wave-0.85)/0.15*60)))
      if (shimA>0){ctx.fillStyle=`rgba(255,255,255,${shimA/255})`; ctx.beginPath(); ctx.arc(cx,cy2,g.R*0.88,0,Math.PI*2); ctx.fill()}
      // fever glow
      if (g.feverActive){const fa=Math.round((Math.sin(t*6+c*0.4+r*0.3)*0.5+0.5)*70);ctx.fillStyle=`rgba(255,80,0,${fa/255})`;ctx.beginPath();ctx.arc(cx,cy2,g.R*1.18,0,Math.PI*2);ctx.fill()}
      if (bub.type!=='NORMAL') drawIcon(ctx,g,cx,cy2,bub.type,g.R*fevPulse)
    }
  }

  // Ghost preview
  if (!g.flyActive && g.ghostRow>=0 && g.ghostCol>=0 && g.ghostRow<MAX_ROWS && g.ghostCol<colsInRow(g,g.ghostRow)) {
    const gx=cellCx(g,g.ghostRow,g.ghostCol), gy=cellCy(g,g.ghostRow)
    const baseHex=COLORS[g.curColor].base
    ctx.fillStyle=hexAlpha(baseHex,0x44); ctx.beginPath(); ctx.arc(gx,gy,g.R*0.9,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle=hexAlpha(baseHex,0xBB); ctx.lineWidth=2.5; ctx.setLineDash([8,6])
    ctx.beginPath(); ctx.arc(gx,gy,g.R*0.92,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([])
    const pulse=Math.sin(t*5)*0.12+0.88
    ctx.strokeStyle=hexAlpha(COLORS[g.curColor].glow,0x55); ctx.lineWidth=2
    ctx.beginPath(); ctx.arc(gx,gy,g.R*1.15*pulse,0,Math.PI*2); ctx.stroke()
  }

  // Aim guide
  if (!g.flyActive) {
    const dotR=g.R*0.115, step=g.R*0.55
    let ax=g.shootCx, ay=g.shootCy-g.R*1.85, avx=Math.cos(g.aimAngle), avy=Math.sin(g.aimAngle)
    let adist=0; const maxD=ch*1.4; let bounces=0
    while (adist<maxD&&ay>0&&bounces<=3) {
      const prog=adist/maxD, alpha=Math.round((1-prog)*220)
      ctx.fillStyle=`rgba(167,139,250,${alpha/4/255})`; ctx.beginPath(); ctx.arc(ax,ay,dotR*2.2,0,Math.PI*2); ctx.fill()
      ctx.fillStyle=hexAlpha(COLORS[g.curColor].glow,Math.round(alpha/3)); ctx.beginPath(); ctx.arc(ax,ay,dotR*1.5,0,Math.PI*2); ctx.fill()
      ctx.fillStyle=hexAlpha(COLORS[g.curColor].base,alpha); ctx.beginPath(); ctx.arc(ax,ay,dotR,0,Math.PI*2); ctx.fill()
      ax+=avx*step; ay+=avy*step; adist+=step
      const wL=g.offsetX, wR=g.offsetX+g.gameW
      if (ax-g.R<wL){ax=wL+g.R;avx=Math.abs(avx);bounces++} if (ax+g.R>wR){ax=wR-g.R;avx=-Math.abs(avx);bounces++}
      let hit=false
      for (let r=0;r<MAX_ROWS&&!hit;r++) for (let c=0;c<colsInRow(g,r)&&!hit;c++) {
        if (!g.grid[r][c]) continue
        const dx=ax-cellCx(g,r,c),dy=ay-cellCy(g,r)
        if (dx*dx+dy*dy<(2*g.R)*(2*g.R)*0.6) { ctx.strokeStyle='rgba(167,139,250,0.73)'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(ax,ay,g.R*0.8,0,Math.PI*2); ctx.stroke(); hit=true }
      }
      if (hit) break
    }
  }

  // Trail
  if (g.flyActive) {
    for (let i=0;i<g.trail.length;i++) {
      const [tx,ty]=g.trail[i], frac=(i+1)/g.trail.length, alpha=Math.round(frac*frac*160), r2=g.R*0.85*frac
      ctx.fillStyle=`rgba(167,139,250,${alpha/4/255})`; ctx.beginPath(); ctx.arc(tx,ty,r2*2,0,Math.PI*2); ctx.fill()
      ctx.fillStyle=hexAlpha(COLORS[g.flyColor].glow,Math.round(alpha/3)); ctx.beginPath(); ctx.arc(tx,ty,r2*1.4,0,Math.PI*2); ctx.fill()
      ctx.fillStyle=hexAlpha(COLORS[g.flyColor].base,alpha); ctx.beginPath(); ctx.arc(tx,ty,r2,0,Math.PI*2); ctx.fill()
    }
    drawBub(ctx,g,g.flyX,g.flyY,g.flyColor,g.R)
    if (g.flyType!=='NORMAL') drawIcon(ctx,g,g.flyX,g.flyY,g.flyType,g.R)
  }

  // Shooter platform
  drawShooter(ctx,g,cw,t)

  // Particles
  for (const p of g.particles) {
    const a=Math.round(p.life/p.maxLife*255)
    if (p.kind===1){
      ctx.fillStyle=hexAlpha(p.color,Math.round(a/4)); ctx.beginPath(); ctx.arc(p.x-p.vx*0.002,p.y-p.vy*0.002,p.r*2,0,Math.PI*2); ctx.fill()
      ctx.fillStyle=hexAlpha(p.color,a); ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill()
    } else {
      ctx.fillStyle=hexAlpha(p.color,Math.round(a/3)); ctx.beginPath(); ctx.arc(p.x,p.y,p.r*1.7,0,Math.PI*2); ctx.fill()
      ctx.fillStyle=hexAlpha(p.color,a); ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill()
    }
  }

  // Float labels
  for (const fl of g.floatLabels) {
    const a=Math.round(Math.min(1,fl.life)*255), sca=Math.max(0.6,Math.min(1.2,fl.life))
    const sz=fl.size*sca
    ctx.font=`bold ${sz}px system-ui`; ctx.textAlign='center'
    ctx.fillStyle=`rgba(0,0,0,${a/255})`; ctx.lineWidth=5
    ctx.strokeStyle=`rgba(0,0,0,${a/255})`; ctx.strokeText(fl.text,fl.x,fl.y)
    ctx.fillStyle=hexAlpha(fl.color,a); ctx.fillText(fl.text,fl.x,fl.y)
  }
  ctx.textAlign='left'

  // HUD
  drawHUD(ctx,g,cw,t)

  ctx.restore()
}

function drawMtn(ctx: CanvasRenderingContext2D, w: number, h: number, xs: number[], ys: number[], top: number) {
  ctx.beginPath(); ctx.moveTo(0,h); ctx.lineTo(0,h*top)
  for (let i=0;i<xs.length;i++) ctx.lineTo(xs[i]*w,h*ys[i])
  ctx.lineTo(w,h); ctx.closePath(); ctx.fill()
}

function drawBub(ctx: CanvasRenderingContext2D, g: GS, cx: number, cy: number, color: BubColorId, r: number) {
  const bmp=getBubCanvas(color,g.R); if (!bmp) return
  const half=bmp.width*r/(2*g.R)
  ctx.drawImage(bmp,cx-half,cy-half,half*2,half*2)
}

function drawIcon(ctx: CanvasRenderingContext2D, g: GS, cx: number, cy: number, type: BubType, r: number) {
  const icon=TYPE_ICON[type]; if (!icon) return
  const px=r*1.9, ec=getEmoji(icon,Math.round(px*2))
  if (ec) ctx.drawImage(ec,cx-px/2,cy-px/2+r*0.1,px,px)
}

function drawShooter(ctx: CanvasRenderingContext2D, g: GS, cw: number, t: number) {
  const cx=g.shootCx, cy=g.shootCy, ringR=g.R*2.15

  // Rotating spokes
  for (let i=0;i<12;i++) {
    const angle=(i/12)*Math.PI*2+t*0.52, r=ringR, r2=r+g.R*0.4
    const alpha=Math.sin(angle+t)*0.5+0.5
    ctx.strokeStyle=`rgba(255,255,255,${Math.round(alpha*160)/255})`; ctx.lineWidth=g.R*0.22; ctx.lineCap='round'
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r); ctx.lineTo(cx+Math.cos(angle)*r2,cy+Math.sin(angle)*r2); ctx.stroke()
  }

  // Glow ring
  const pulse=Math.sin(t*(g.feverActive?8:3))*0.15+0.85
  const glowCol=g.feverActive?'rgba(255,61,0,0.67)':COLORS[g.curColor].glow
  const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,ringR*1.3*pulse)
  grd.addColorStop(0,'rgba(0,0,0,0)'); grd.addColorStop(0.7,glowCol); grd.addColorStop(1,'rgba(0,0,0,0)')
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,ringR*1.3*pulse,0,Math.PI*2); ctx.fill()

  ctx.strokeStyle=g.feverActive?'rgba(255,140,0,0.8)':'rgba(255,255,255,0.8)'; ctx.lineWidth=3; ctx.lineCap='butt'
  ctx.beginPath(); ctx.arc(cx,cy,ringR,0,Math.PI*2); ctx.stroke()

  // Current bubble
  drawBub(ctx,g,cx,cy-g.R*0.15,g.curColor,g.R*1.08)
  if (g.curType!=='NORMAL') drawIcon(ctx,g,cx,cy-g.R*0.15,g.curType,g.R*1.08)
  drawEyes(ctx,g,cx,cy-g.R*0.15,g.R*1.08,t)

  // Shots left
  ctx.font=`bold ${g.R*0.62}px system-ui`; ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,0.93)'
  ctx.fillText(`${g.shotsLeft}`,cx,cy+g.R*1.85)

  // Next bubble
  const nxCx=cx-g.R*2.5, nxCy=cy+g.R*0.2
  drawBub(ctx,g,nxCx,nxCy,g.nxtColor,g.R*0.68)
  if (g.nxtType!=='NORMAL') drawIcon(ctx,g,nxCx,nxCy,g.nxtType,g.R*0.68)
  ctx.font=`${g.R*0.38}px system-ui`; ctx.fillStyle='rgba(255,255,255,0.67)'; ctx.fillText(_str.next,nxCx,nxCy+g.R*1.1)
  ctx.textAlign='left'
}

function drawEyes(ctx: CanvasRenderingContext2D, g: GS, cx: number, cy: number, r: number, t: number) {
  const eo=r*0.27, er=r*0.175
  ctx.fillStyle='#F5F5F5'; ctx.beginPath(); ctx.arc(cx-eo,cy-eo*0.55,er,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx+eo,cy-eo*0.55,er,0,Math.PI*2); ctx.fill()
  ctx.strokeStyle='rgba(100,100,100,1)'; ctx.lineWidth=er*0.35
  ctx.beginPath(); ctx.arc(cx-eo,cy-eo*0.55,er*1.28,0,Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.arc(cx+eo,cy-eo*0.55,er*1.28,0,Math.PI*2); ctx.stroke()
  ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(cx-eo+er*0.25,cy-eo*0.45,er*0.58,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx+eo+er*0.25,cy-eo*0.45,er*0.58,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cx-eo,cy-eo*0.70,er*0.20,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx+eo,cy-eo*0.70,er*0.20,0,Math.PI*2); ctx.fill()
  const ty2=cy+r*0.6
  ctx.strokeStyle='#E53935'; ctx.lineWidth=r*0.08; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(cx,cy+r*0.28); ctx.lineTo(cx,ty2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx,ty2); ctx.lineTo(cx-r*0.18,ty2+r*0.2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx,ty2); ctx.lineTo(cx+r*0.18,ty2+r*0.2); ctx.stroke()
  void t
}

function drawHUD(ctx: CanvasRenderingContext2D, g: GS, cw: number, t: number) {
  const cx=g.shootCx, lx=g.offsetX+g.R*0.4, rx=g.offsetX+g.gameW-g.R*0.4
  ctx.shadowColor='rgba(0,0,0,0.7)'; ctx.shadowBlur=8
  ctx.font=`bold ${g.R*1.6}px system-ui`; ctx.textAlign='center'; ctx.fillStyle='white'
  ctx.fillText(`${g.score}`,cx,g.R*2.2); ctx.shadowBlur=0

  ctx.font=`bold ${g.R*0.8}px system-ui`; ctx.textAlign='right'; ctx.fillStyle='#FFB300'
  ctx.fillText(`${_str.hudShotsLeft} ${g.shotsLeft}`,rx,g.R*1.5)
  ctx.textAlign='left'; ctx.fillStyle='#80DEEA'
  ctx.fillText(`Lv.${g.level}`,lx,g.R*1.5)

  if (g.feverActive) {
    const barW=g.gameW*0.7, barH=g.R*0.45, barX=cx-barW/2, barY=g.R*2.8
    ctx.fillStyle='rgba(255,61,0,0.33)'; ctx.beginPath(); ctx.roundRect(barX,barY,barW,barH,barH/2); ctx.fill()
    const frac=Math.max(0,g.feverTimer/FEVER_DUR)
    ctx.fillStyle=`rgba(255,${80+Math.round(frac*120)},0,0.86)`
    ctx.beginPath(); ctx.roundRect(barX,barY,barW*frac,barH,barH/2); ctx.fill()
    const pulse2=Math.sin(t*8)*0.15+0.85
    ctx.font=`bold ${g.R*0.75*pulse2}px system-ui`; ctx.fillStyle='#FF6D00'; ctx.textAlign='center'
    ctx.fillText('🔥 FEVER x3 🔥',cx,barY+barH+g.R*0.7)
  }

  if (g.combo>=2&&g.comboTimer>0) {
    const pulse2=Math.sin(t*8)*0.15+0.85
    ctx.font=`bold ${g.R*1.2*pulse2}px system-ui`; ctx.fillStyle='#FF6F00'; ctx.textAlign='left'
    ctx.fillText(`🔥 x${g.combo}`,lx,g.shootCy-g.R*5)
  }
  ctx.textAlign='left'
  void cw
}

// ─── Sound (Web Audio API — no asset files needed) ───────────────────────────
let audioCtx: AudioContext | null = null
function getAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)()
  return audioCtx
}

function playTone(freq: number, dur: number, vol: number, type: OscillatorType = 'sine', decay = 0.8) {
  const ctx = getAudio(); if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(freq * decay, ctx.currentTime + dur)
  gain.gain.setValueAtTime(vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur)
}

function playNoise(dur: number, vol: number, filterFreq = 800) {
  const ctx = getAudio(); if (!ctx) return
  const bufSize = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = filterFreq
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
  src.start(); src.stop(ctx.currentTime + dur)
}

const SFX = {
  shoot() { playTone(600, 0.08, 0.15, 'sine', 0.5) },
  snap()  { playTone(900, 0.06, 0.12, 'triangle', 0.7); playNoise(0.04, 0.06, 1200) },
  pop()   {
    playTone(880, 0.12, 0.18, 'sine', 0.5)
    playTone(1100, 0.10, 0.12, 'sine', 0.6)
    playNoise(0.08, 0.10, 2000)
  },
  bigPop() {
    playTone(440, 0.20, 0.25, 'sawtooth', 0.3)
    playTone(660, 0.18, 0.20, 'sine', 0.4)
    playNoise(0.15, 0.18, 1000)
  },
  chain()  { playTone(1200, 0.15, 0.15, 'sine', 0.7); playTone(1500, 0.12, 0.10, 'sine', 0.8) },
  star()   { [1000,1200,1500,1800].forEach((f,i)=>{ setTimeout(()=>playTone(f,0.12,0.18,'sine',0.9), i*40) }) },
  bomb()   {
    playNoise(0.25, 0.35, 400)
    playTone(180, 0.30, 0.30, 'sawtooth', 0.2)
  },
  fever()  { [800,1000,1200,1000,1400].forEach((f,i)=>{ setTimeout(()=>playTone(f,0.15,0.20,'sine',0.95), i*60) }) },
  levelUp(){ [600,800,1000,1200].forEach((f,i)=>{ setTimeout(()=>playTone(f,0.10,0.15,'sine',0.9), i*50) }) },
}

// ─── i18n strings (set from component, used in canvas draw functions) ────────
interface BubbleStrings {
  clear: string; gameOver: string; score: string; retry: string; exit: string
  hudShotsLeft: string; next: string; aimHint: string; levelLabel: string
}
const DEFAULT_STRINGS: BubbleStrings = {
  clear:'🎉 클리어!', gameOver:'💥 게임 오버', score:'점수', retry:'🔄 다시 하기', exit:'나가기',
  hudShotsLeft:'남은 발:', next:'다음', aimHint:'마우스 이동 → 조준 | 클릭 → 발사', levelLabel:'레벨',
}
let _str: BubbleStrings = DEFAULT_STRINGS

function hexAlpha(hex: string, alpha: number): string {
  if (hex.startsWith('rgba')||hex.startsWith('rgb')) {
    if (hex.startsWith('rgba')) return hex.replace(/[\d.]+\)$/,`${alpha/255})`)
    return hex.replace('rgb','rgba').replace(')',`,${alpha/255})`)
  }
  const n=parseInt(hex.replace('#',''),16)
  return `rgba(${(n>>16)&0xff},${(n>>8)&0xff},${n&0xff},${alpha/255})`
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { onClose: ()=>void; strings?: Partial<BubbleStrings> }
export default function BubbleShooterGame({onClose, strings}: Props) {
  // merge incoming strings with defaults (supports partial override)
  _str = strings ? { ...DEFAULT_STRINGS, ...strings } : DEFAULT_STRINGS
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const gsRef=useRef<GS|null>(null)
  const rafRef=useRef(0)
  const lastTRef=useRef(0)
  const [display,setDisplay]=useState({phase:'playing' as GS['phase'],score:0})

  const restart=useCallback(()=>{
    const canvas=canvasRef.current; if (!canvas) return
    gsRef.current=initGame(canvas.offsetWidth,canvas.offsetHeight)
    setDisplay({phase:'playing',score:0})
  },[])

  useEffect(()=>{
    const canvas=canvasRef.current; if (!canvas) return
    const ctx=canvas.getContext('2d'); if (!ctx) return

    function resize(){
      if (!canvas) return
      canvas.width=canvas.offsetWidth*devicePixelRatio; canvas.height=canvas.offsetHeight*devicePixelRatio
      ctx!.scale(devicePixelRatio,devicePixelRatio)
      bubCache.clear()
      gsRef.current=initGame(canvas.offsetWidth,canvas.offsetHeight)
    }
    resize()
    const ro=new ResizeObserver(resize); ro.observe(canvas)

    function loop(ts:number){
      const dt=Math.min(0.05,(ts-lastTRef.current)/1000); lastTRef.current=ts
      const g=gsRef.current; if (!canvas||!ctx||!g) return
      const cw=canvas.offsetWidth,ch=canvas.offsetHeight

      if (g.phase==='playing') tick(g,dt,cw)

      if (g.phase!==display.phase||g.score!==display.score)
        setDisplay({phase:g.phase,score:g.score})

      render(ctx,g,cw,ch)
      rafRef.current=requestAnimationFrame(loop)
    }
    rafRef.current=requestAnimationFrame(ts=>{lastTRef.current=ts;rafRef.current=requestAnimationFrame(loop)})
    return ()=>{cancelAnimationFrame(rafRef.current);ro.disconnect()}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  // Input
  useEffect(()=>{
    const canvas=canvasRef.current; if (!canvas) return
    const getPos=(e:MouseEvent|TouchEvent):{x:number;y:number}=>{
      const r=canvas.getBoundingClientRect()
      if ('touches' in e){const t=e.touches[0]||e.changedTouches[0];return{x:t.clientX-r.left,y:t.clientY-r.top}}
      return{x:(e as MouseEvent).clientX-r.left,y:(e as MouseEvent).clientY-r.top}
    }
    const updateAim=(x:number,y:number)=>{
      const g=gsRef.current; if (!g) return
      if (y-g.shootCy>-g.R*0.5) return
      g.rawAimAngle=Math.max(-Math.PI+0.14,Math.min(-0.14,Math.atan2(y-g.shootCy,x-g.shootCx)))
    }
    const shoot=()=>{
      const g=gsRef.current; if (!g||g.flyActive||g.shotsLeft<=0||g.phase!=='playing') return
      g.flyX=g.shootCx; g.flyY=g.shootCy-g.R*1.85
      g.flyVx=Math.cos(g.aimAngle); g.flyVy=Math.sin(g.aimAngle)
      g.flyColor=g.curColor; g.flyType=g.curType; g.flyActive=true
      g.ghostRow=-1; g.ghostCol=-1
      SFX.shoot()
    }
    const onMove=(e:MouseEvent)=>{const{x,y}=getPos(e);updateAim(x,y)}
    const onTouch=(e:TouchEvent)=>{e.preventDefault();const{x,y}=getPos(e);updateAim(x,y)}
    const onUp=(e:MouseEvent|TouchEvent)=>{const{x,y}=getPos(e);updateAim(x,y);shoot()}
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.code==='Space'){e.preventDefault();const g=gsRef.current;if(g&&!g.flyActive)g.rawAimAngle=g.aimAngle}}

    canvas.addEventListener('mousemove',onMove)
    canvas.addEventListener('touchmove',onTouch,{passive:false})
    canvas.addEventListener('mouseup',onUp)
    canvas.addEventListener('touchend',onTouch,{passive:false})
    canvas.addEventListener('touchend',onUp as unknown as EventListenerOrEventListenerObject)
    window.addEventListener('keydown',onKey)
    return ()=>{
      canvas.removeEventListener('mousemove',onMove); canvas.removeEventListener('touchmove',onTouch)
      canvas.removeEventListener('mouseup',onUp)
      canvas.removeEventListener('touchend',onTouch)
      canvas.removeEventListener('touchend',onUp as unknown as EventListenerOrEventListenerObject)
      window.removeEventListener('keydown',onKey)
    }
  },[onClose])

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full cursor-crosshair" />
      <button onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-zinc-400 transition hover:bg-black/80 hover:text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      {(display.phase==='won'||display.phase==='lost')&&(
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-[#0D0D2B] px-8 py-8 text-center shadow-2xl">
            <p className="text-5xl mb-2">{display.phase==='won'?'🎉':'💥'}</p>
            <p className={`text-3xl font-black ${display.phase==='won'?'text-green-400':'text-red-400'}`}>
              {display.phase==='won' ? _str.clear : _str.gameOver}
            </p>
            <p className="mt-4 text-zinc-400 text-sm">{_str.score}</p>
            <p className="text-5xl font-black text-yellow-400 mt-1">{display.score}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={restart}
                className={`rounded-full px-6 py-2.5 text-sm font-bold text-white transition active:scale-95 ${display.phase==='won'?'bg-green-600 hover:bg-green-500':'bg-red-600 hover:bg-red-500'}`}>
                {_str.retry}
              </button>
              <button onClick={onClose}
                className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500">
                {_str.exit}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zinc-500 pointer-events-none">
        {_str.aimHint}
      </div>
    </div>
  )
}
