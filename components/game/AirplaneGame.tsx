'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const ARENA_RADIUS = 2500
const BASE_SPEED = 220
const BOOST_MULT = 1.7
const TURN_SPEED_PLAYER = 3.8
const TURN_SPEED_AI = 2.2
const AI_COUNT = 12
const MAX_HP = 100
const BULLET_SPEED = 680
const BULLET_DAMAGE = 12
const BULLET_RADIUS = 5
const BULLET_LIFETIME = 1.8
const FIRE_RATE = 0.32
const PLANE_RADIUS = 22
const STORM_HOLD_MS = 30_000
const STORM_WARN_MS = 15_000
const STORM_SHRINK_MS = 12_000
const STORM_SHRINK_RATIO = 0.24
const STORM_DRAIN = 8
const AI_DECISION_INTERVAL = 0.45
const ITEM_TARGET = 10
const ITEM_RADIUS = 28
const BOOST_DRAIN_INTERVAL = 0.5
const DRONE_ORBIT_R = 58
const DRONE_ORBIT_SPD = 2.2
const DRONE_FIRE_RATE = 0.55
const DRONE_RESPAWN = 4.0
const DRONE_RADIUS = 9

const AI_NAMES = [
  'Viper', 'Cobra', 'Falcon', 'Eagle', 'Hawk',
  'Talon', 'Raptor', 'Merlin', 'Kestrel', 'Osprey',
  'Harrier', 'Phoenix', 'Condor', 'Buzzard', 'Vulture',
]

const PALETTE = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16',
  '#f97316', '#14b8a6', '#a855f7', '#fb923c',
]

type ItemKind = 'shield' | 'speed' | 'rapidfire' | 'multishot' | 'repair'
const ITEM_EMOJI: Record<ItemKind, string> = {
  shield: '🛡️', speed: '⚡', rapidfire: '🔥', multishot: '💥', repair: '❤️',
}
const ITEM_DURATION: Record<ItemKind, number> = {
  shield: 0, speed: 8, rapidfire: 10, multishot: 8, repair: 0,
}
const ITEM_KINDS: ItemKind[] = ['shield', 'speed', 'rapidfire', 'multishot', 'repair']
const ITEM_COLOR: Record<ItemKind, string> = {
  shield: '#22d3ee', speed: '#fbbf24', rapidfire: '#f97316', multishot: '#a855f7', repair: '#f43f5e',
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plane {
  id: number
  x: number
  y: number
  dir: number
  targetDir: number
  hp: number
  maxHp: number
  color: string
  isPlayer: boolean
  alive: boolean
  boosting: boolean
  name: string
  kills: number
  aiTimer: number
  aiBehavior: 'pursuit' | 'evade' | 'orbit' | 'sniper'
  fireTimer: number
  shieldActive: boolean
  speedUntil: number
  rapidFireUntil: number
  multiShotUntil: number
  boostDrainAcc: number
}

interface Bullet {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  ownerId: number
  lifetime: number
  damage: number
}

interface GameItem {
  id: number
  x: number
  y: number
  kind: ItemKind
}

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number
  color: string
  r: number
}

interface Drone {
  id: number
  angle: number
  fireTimer: number
  alive: boolean
  respawnTimer: number
}

type StormPhase = 'hold' | 'warn' | 'shrink'

interface World {
  planes: Plane[]
  bullets: Bullet[]
  items: GameItem[]
  particles: Particle[]
  drones: Drone[]
  maxDrones: number
  stormR: number
  stormNextR: number
  stormPhase: StormPhase
  stormTimer: number
  nextBulletId: number
  nextItemId: number
  nextPlaneId: number
  nextDroneId: number
  kills: number
  phase: 'playing' | 'dead' | 'win'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function angleLerp(a: number, b: number, t: number) {
  let diff = b - a
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  return a + diff * t
}

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx, dy = ay - by
  return Math.sqrt(dx * dx + dy * dy)
}

function randInArena(radius: number): { x: number; y: number } {
  const angle = Math.random() * 2 * Math.PI
  const r = Math.random() * radius * 0.85
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
}

function spawnItem(world: World) {
  const p = randInArena(world.stormR * 0.85)
  const kind = ITEM_KINDS[Math.floor(Math.random() * ITEM_KINDS.length)]
  world.items.push({ id: world.nextItemId++, x: p.x, y: p.y, kind })
}

function applyItem(plane: Plane, kind: ItemKind, now: number, world?: World) {
  switch (kind) {
    case 'shield': plane.shieldActive = true; break
    case 'speed': plane.speedUntil = Math.max(plane.speedUntil, now + ITEM_DURATION.speed); break
    case 'rapidfire': plane.rapidFireUntil = Math.max(plane.rapidFireUntil, now + ITEM_DURATION.rapidfire); break
    case 'multishot':
      plane.multiShotUntil = Math.max(plane.multiShotUntil, now + ITEM_DURATION.multishot)
      if (plane.isPlayer && world && world.maxDrones < 4) {
        const add = Math.min(2, 4 - world.maxDrones)
        for (let i = 0; i < add; i++) {
          world.drones.push({ id: world.nextDroneId++, angle: Math.random() * Math.PI * 2, fireTimer: 0, alive: true, respawnTimer: 0 })
        }
        world.maxDrones += add
      }
      break
    case 'repair': plane.hp = Math.min(plane.maxHp, plane.hp + 40); break
  }
}

function spawnParticles(world: World, x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI
    const speed = 80 + Math.random() * 200
    world.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
      r: 2 + Math.random() * 5,
    })
  }
}

function killPlane(world: World, plane: Plane, killerId: number | null) {
  plane.alive = false
  spawnParticles(world, plane.x, plane.y, plane.color, 28)
  if (killerId !== null) {
    const killer = world.planes.find(p => p.id === killerId)
    if (killer) {
      killer.kills++
      if (killer.isPlayer) world.kills++
    }
  }
}

function fireBullet(world: World, plane: Plane, angleOffset = 0) {
  const dir = plane.dir + angleOffset
  world.bullets.push({
    id: world.nextBulletId++,
    x: plane.x + Math.cos(dir) * (PLANE_RADIUS + 8),
    y: plane.y + Math.sin(dir) * (PLANE_RADIUS + 8),
    vx: Math.cos(dir) * BULLET_SPEED,
    vy: Math.sin(dir) * BULLET_SPEED,
    ownerId: plane.id,
    lifetime: BULLET_LIFETIME,
    damage: BULLET_DAMAGE,
  })
}

// ─── Sound Manager (Web Audio API) ───────────────────────────────────────────
class SoundManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  muted = false

  private getCtx(): AudioContext | null {
    if (this.muted) return null
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.32
        this.master.connect(this.ctx.destination)
      } catch { return null }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private g(ctx: AudioContext, vol: number): GainNode {
    const n = ctx.createGain(); n.gain.value = vol; n.connect(this.master!); return n
  }

  private osc(ctx: AudioContext, type: OscillatorType, freq: number, dest: AudioNode): OscillatorNode {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq
    o.connect(dest); o.start(); return o
  }

  private noise(ctx: AudioContext, dest: AudioNode, dur: number) {
    const sr = ctx.sampleRate
    const buf = ctx.createBuffer(1, Math.ceil(sr * dur), sr)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(); src.buffer = buf
    src.connect(dest); src.start(); src.stop(ctx.currentTime + dur)
  }

  shoot() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    const gn = this.g(ctx, 0.16)
    const o = this.osc(ctx, 'sawtooth', 900, gn)
    o.frequency.exponentialRampToValueAtTime(120, now + 0.11)
    gn.gain.setValueAtTime(0.16, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.11)
    o.stop(now + 0.11)
  }

  hit(isPlayer: boolean) {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    const vol = isPlayer ? 0.45 : 0.14
    const gn = this.g(ctx, vol)
    this.noise(ctx, gn, 0.07)
    gn.gain.setValueAtTime(vol, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    if (isPlayer) {
      const og = this.g(ctx, 0.3)
      const o = this.osc(ctx, 'sine', 180, og)
      og.gain.setValueAtTime(0.3, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
      o.stop(now + 0.18)
    }
  }

  shieldBlock() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    const gn = this.g(ctx, 0.28)
    const o = this.osc(ctx, 'sine', 600, gn)
    o.frequency.exponentialRampToValueAtTime(400, now + 0.22)
    gn.gain.setValueAtTime(0.28, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    o.stop(now + 0.22)
    const gn2 = this.g(ctx, 0.12); this.noise(ctx, gn2, 0.1)
    gn2.gain.setValueAtTime(0.12, now); gn2.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
  }

  explosion(big: boolean) {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    const dur = big ? 1.4 : 0.55
    const vol = big ? 0.65 : 0.3
    const gn = this.g(ctx, vol)
    this.noise(ctx, gn, dur)
    gn.gain.setValueAtTime(vol, now); gn.gain.exponentialRampToValueAtTime(0.001, now + dur)
    const og = this.g(ctx, vol * 0.55)
    const o = this.osc(ctx, 'sine', big ? 55 : 95, og)
    o.frequency.exponentialRampToValueAtTime(18, now + dur)
    og.gain.setValueAtTime(vol * 0.55, now); og.gain.exponentialRampToValueAtTime(0.001, now + dur)
    o.stop(now + dur)
  }

  kill() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    const gn = this.g(ctx, 0.22)
    const o = this.osc(ctx, 'triangle', 440, gn)
    o.frequency.exponentialRampToValueAtTime(220, now + 0.18)
    gn.gain.setValueAtTime(0.22, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    o.stop(now + 0.22)
  }

  pickup() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    ;[523, 659, 784, 1046].forEach((f, i) => {
      const t = now + i * 0.07
      const gn = this.g(ctx, 0.11)
      const o = this.osc(ctx, 'sine', f, gn)
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.11, t + 0.02)
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      o.stop(t + 0.2)
    })
  }

  boost() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    const gn = this.g(ctx, 0.13)
    this.noise(ctx, gn, 0.28)
    gn.gain.setValueAtTime(0.13, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
    const og = this.g(ctx, 0.08)
    const o = this.osc(ctx, 'sawtooth', 1800, og)
    o.frequency.exponentialRampToValueAtTime(380, now + 0.28)
    og.gain.setValueAtTime(0.08, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
    o.stop(now + 0.28)
  }

  stormWarn() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.38
      const gn = this.g(ctx, 0)
      const o = this.osc(ctx, 'sawtooth', 440, gn)
      o.frequency.setValueAtTime(440, t); o.frequency.exponentialRampToValueAtTime(560, t + 0.18)
      gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.28, t + 0.05)
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.33)
      o.stop(t + 0.33)
    }
  }

  playerDeath() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    const gn = this.g(ctx, 0.55)
    const o = this.osc(ctx, 'sawtooth', 380, gn)
    o.frequency.exponentialRampToValueAtTime(55, now + 1.6)
    gn.gain.setValueAtTime(0.55, now); gn.gain.exponentialRampToValueAtTime(0.001, now + 1.6)
    o.stop(now + 1.6)
    const ng = this.g(ctx, 0.5); this.noise(ctx, ng, 1.2)
    ng.gain.setValueAtTime(0.5, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
  }

  win() {
    const ctx = this.getCtx(); if (!ctx) return
    const now = ctx.currentTime
    ;[523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => {
      const t = now + i * 0.13
      const gn = this.g(ctx, 0.19)
      const o = this.osc(ctx, 'triangle', f, gn)
      gn.gain.setValueAtTime(0.19, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      o.stop(t + 0.28)
    })
  }

  destroy() { this.ctx?.close(); this.ctx = null }
}

// ─── AI ───────────────────────────────────────────────────────────────────────
function updateAI(plane: Plane, world: World, dt: number, now: number) {
  plane.aiTimer -= dt
  if (plane.aiTimer > 0) return
  plane.aiTimer = AI_DECISION_INTERVAL + (Math.random() * 0.2 - 0.1)

  const fromCenter = dist(plane.x, plane.y, 0, 0)
  if (fromCenter > world.stormR * 0.88) {
    plane.targetDir = Math.atan2(-plane.y, -plane.x)
    return
  }

  let nearestEnemy: Plane | null = null
  let nearestDist = Infinity
  for (const p of world.planes) {
    if (p.id === plane.id || !p.alive) continue
    const d = dist(plane.x, plane.y, p.x, p.y)
    if (d < nearestDist) { nearestDist = d; nearestEnemy = p }
  }
  if (!nearestEnemy) return
  void now

  switch (plane.aiBehavior) {
    case 'pursuit':
      plane.targetDir = Math.atan2(nearestEnemy.y - plane.y, nearestEnemy.x - plane.x)
      break
    case 'evade': {
      const a = Math.atan2(nearestEnemy.y - plane.y, nearestEnemy.x - plane.x)
      plane.targetDir = a + Math.PI + (Math.random() - 0.5) * 1.2
      break
    }
    case 'orbit': {
      const a = Math.atan2(nearestEnemy.y - plane.y, nearestEnemy.x - plane.x)
      plane.targetDir = a + Math.PI / 2 + (Math.random() < 0.5 ? 0 : Math.PI)
      break
    }
    case 'sniper': {
      const lead = nearestDist / BULLET_SPEED
      const px = nearestEnemy.x + Math.cos(nearestEnemy.dir) * BASE_SPEED * lead
      const py = nearestEnemy.y + Math.sin(nearestEnemy.dir) * BASE_SPEED * lead
      plane.targetDir = Math.atan2(py - plane.y, px - plane.x)
      break
    }
  }
}

// ─── Physics ──────────────────────────────────────────────────────────────────
function updatePlane(plane: Plane, dt: number, world: World, now: number) {
  if (!plane.alive) return

  const turnRate = (plane.isPlayer ? TURN_SPEED_PLAYER : TURN_SPEED_AI) * dt
  plane.dir = angleLerp(plane.dir, plane.targetDir, Math.min(1, turnRate))

  let speedMult = 1
  if (plane.speedUntil > now) speedMult = 1.4
  if (plane.boosting) speedMult *= BOOST_MULT

  plane.x += Math.cos(plane.dir) * BASE_SPEED * speedMult * dt
  plane.y += Math.sin(plane.dir) * BASE_SPEED * speedMult * dt

  if (plane.boosting && plane.hp > 20) {
    plane.boostDrainAcc += dt
    if (plane.boostDrainAcc >= BOOST_DRAIN_INTERVAL) {
      plane.boostDrainAcc -= BOOST_DRAIN_INTERVAL
      plane.hp = Math.max(10, plane.hp - 4)
    }
  } else {
    plane.boostDrainAcc = 0
  }

  const fromCenter = dist(plane.x, plane.y, 0, 0)
  if (fromCenter > world.stormR) {
    plane.hp -= STORM_DRAIN * dt
    if (plane.hp <= 0) killPlane(world, plane, null)
  }
  if (fromCenter > ARENA_RADIUS) killPlane(world, plane, null)

  // AI auto-fire
  if (!plane.isPlayer && plane.alive) {
    plane.fireTimer -= dt
    const rate = plane.rapidFireUntil > now ? FIRE_RATE * 0.5 : FIRE_RATE
    if (plane.fireTimer <= 0) {
      plane.fireTimer = rate + Math.random() * 0.25
      for (const target of world.planes) {
        if (target.id === plane.id || !target.alive) continue
        const angleToTarget = Math.atan2(target.y - plane.y, target.x - plane.x)
        let diff = angleToTarget - plane.dir
        while (diff > Math.PI) diff -= 2 * Math.PI
        while (diff < -Math.PI) diff += 2 * Math.PI
        if (Math.abs(diff) < 0.55) {
          fireBullet(world, plane)
          if (plane.multiShotUntil > now) {
            fireBullet(world, plane, 0.18)
            fireBullet(world, plane, -0.18)
          }
          break
        }
      }
    }
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function makePlane(world: World, isPlayer: boolean, colorIdx: number, name: string): Plane {
  const p = randInArena(ARENA_RADIUS * 0.6)
  const dir = Math.random() * 2 * Math.PI
  const behaviors: Plane['aiBehavior'][] = ['pursuit', 'pursuit', 'pursuit', 'evade', 'orbit', 'orbit', 'sniper', 'sniper']
  return {
    id: world.nextPlaneId++,
    x: p.x, y: p.y,
    dir, targetDir: dir,
    hp: MAX_HP, maxHp: MAX_HP,
    color: PALETTE[colorIdx % PALETTE.length],
    isPlayer, alive: true, boosting: false,
    name, kills: 0,
    aiTimer: Math.random() * AI_DECISION_INTERVAL,
    aiBehavior: isPlayer ? 'pursuit' : behaviors[Math.floor(Math.random() * behaviors.length)],
    fireTimer: Math.random() * FIRE_RATE,
    shieldActive: false, speedUntil: 0, rapidFireUntil: 0, multiShotUntil: 0,
    boostDrainAcc: 0,
  }
}

function makeDrones(count: number): Drone[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i, angle: (Math.PI * 2 / count) * i,
    fireTimer: DRONE_FIRE_RATE * (i / count),
    alive: true, respawnTimer: 0,
  }))
}

function initWorld(playerName: string): World {
  const world: World = {
    planes: [], bullets: [], items: [], particles: [],
    drones: makeDrones(2), maxDrones: 2,
    stormR: ARENA_RADIUS, stormNextR: ARENA_RADIUS * (1 - STORM_SHRINK_RATIO),
    stormPhase: 'hold', stormTimer: STORM_HOLD_MS / 1000,
    nextBulletId: 0, nextItemId: 0, nextPlaneId: 0, nextDroneId: 2,
    kills: 0, phase: 'playing',
  }
  world.planes.push(makePlane(world, true, 0, playerName))
  for (let i = 0; i < AI_COUNT; i++) {
    world.planes.push(makePlane(world, false, i + 1, AI_NAMES[i % AI_NAMES.length]))
  }
  for (let i = 0; i < ITEM_TARGET; i++) spawnItem(world)
  return world
}

// ─── Render helpers ───────────────────────────────────────────────────────────
function shadeColor(hex: string, factor: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.round(((n >> 16) & 0xff) * factor))
  const g = Math.min(255, Math.round(((n >> 8) & 0xff) * factor))
  const b = Math.min(255, Math.round((n & 0xff) * factor))
  return `rgb(${r},${g},${b})`
}

const emojiCache = new Map<string, HTMLCanvasElement>()
function getEmojiCanvas(emoji: string, sizePx: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const key = `${emoji}-${sizePx}`
  if (!emojiCache.has(key)) {
    const c = document.createElement('canvas')
    c.width = sizePx; c.height = sizePx
    const cx = c.getContext('2d')
    if (!cx) return null
    cx.font = `${Math.round(sizePx * 0.82)}px system-ui`
    cx.textAlign = 'center'; cx.textBaseline = 'middle'
    cx.fillText(emoji, sizePx / 2, sizePx / 2)
    emojiCache.set(key, c)
  }
  return emojiCache.get(key) ?? null
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render(
  ctx: CanvasRenderingContext2D,
  world: World,
  cw: number,
  ch: number,
  now: number,
  cam: { x: number; y: number; zoom: number },
) {
  ctx.clearRect(0, 0, cw, ch)
  const scale = cam.zoom
  const camX = cam.x, camY = cam.y

  ctx.save()
  ctx.translate(cw / 2, ch / 2)
  ctx.scale(scale, scale)
  ctx.translate(-camX, -camY)

  // Background
  ctx.fillStyle = '#07091a'
  ctx.fillRect(camX - cw / scale, camY - ch / scale, (cw / scale) * 2, (ch / scale) * 2)
  const arenaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, ARENA_RADIUS)
  arenaGrad.addColorStop(0, '#0a0d22')
  arenaGrad.addColorStop(0.7, '#080b1c')
  arenaGrad.addColorStop(1, '#040610')
  ctx.fillStyle = arenaGrad
  ctx.beginPath(); ctx.arc(0, 0, ARENA_RADIUS, 0, 2 * Math.PI); ctx.fill()

  // Grid dots
  const gridSize = 150
  const visW = cw / scale, visH = ch / scale
  const gx0 = Math.floor((camX - visW / 2) / gridSize) * gridSize
  const gy0 = Math.floor((camY - visH / 2) / gridSize) * gridSize
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#818cf8'
  for (let gx = gx0; gx <= camX + visW / 2; gx += gridSize) {
    for (let gy = gy0; gy <= camY + visH / 2; gy += gridSize) {
      if (gx * gx + gy * gy <= ARENA_RADIUS * ARENA_RADIUS) {
        ctx.beginPath(); ctx.arc(gx, gy, 2, 0, 2 * Math.PI); ctx.fill()
      }
    }
  }
  ctx.globalAlpha = 1

  // Storm zone
  if (world.stormR < ARENA_RADIUS) {
    ctx.save()
    ctx.globalAlpha = 0.35
    const sg = ctx.createRadialGradient(0, 0, world.stormR * 0.95, 0, 0, ARENA_RADIUS * 1.05)
    sg.addColorStop(0, 'rgba(239,68,68,0)')
    sg.addColorStop(0.35, 'rgba(239,68,68,0.65)')
    sg.addColorStop(1, 'rgba(220,38,38,0.95)')
    ctx.fillStyle = sg
    ctx.beginPath()
    ctx.arc(0, 0, ARENA_RADIUS, 0, 2 * Math.PI)
    ctx.arc(0, 0, world.stormR, 0, 2 * Math.PI, true)
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = 'rgba(239,68,68,0.75)'
    ctx.lineWidth = 8
    ctx.setLineDash([30, 20])
    ctx.beginPath(); ctx.arc(0, 0, world.stormR, 0, 2 * Math.PI); ctx.stroke()
    ctx.setLineDash([])
  }

  // Next storm ring
  if (world.stormPhase === 'warn' || world.stormPhase === 'shrink') {
    const pulse = 0.5 + 0.5 * Math.sin(now * 2.5)
    ctx.strokeStyle = `rgba(251,146,60,${0.35 + pulse * 0.45})`
    ctx.lineWidth = 5
    ctx.setLineDash([20, 15])
    ctx.beginPath(); ctx.arc(0, 0, world.stormNextR, 0, 2 * Math.PI); ctx.stroke()
    ctx.setLineDash([])
  }

  // Arena boundary
  ctx.strokeStyle = 'rgba(34,211,238,0.5)'
  ctx.lineWidth = 14
  ctx.beginPath(); ctx.arc(0, 0, ARENA_RADIUS, 0, 2 * Math.PI); ctx.stroke()

  // Particles
  for (const p of world.particles) {
    ctx.globalAlpha = p.life * 0.85
    ctx.fillStyle = p.color
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, 2 * Math.PI); ctx.fill()
  }
  ctx.globalAlpha = 1

  // Items
  for (const item of world.items) {
    const sx = (item.x - camX) * scale + cw / 2
    const sy = (item.y - camY) * scale + ch / 2
    if (sx < -60 || sx > cw + 60 || sy < -60 || sy > ch + 60) continue
    const pulse = 0.5 + 0.5 * Math.sin(now * 3 + item.id)
    const glowR = (36 + pulse * 8) / scale
    const grd = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, glowR)
    grd.addColorStop(0, ITEM_COLOR[item.kind] + 'aa')
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.beginPath(); ctx.arc(item.x, item.y, glowR, 0, 2 * Math.PI); ctx.fill()
    const screenSize = 32
    const worldSize = screenSize / scale
    const c = getEmojiCanvas(ITEM_EMOJI[item.kind], screenSize * 2)
    if (c) ctx.drawImage(c, item.x - worldSize / 2, item.y - worldSize / 2, worldSize, worldSize)
  }

  // Bullets
  for (const b of world.bullets) {
    const sx = (b.x - camX) * scale + cw / 2
    const sy = (b.y - camY) * scale + ch / 2
    if (sx < -20 || sx > cw + 20 || sy < -20 || sy > ch + 20) continue
    const owner = world.planes.find(p => p.id === b.ownerId)
    const bc = owner ? owner.color : '#fbbf24'
    ctx.shadowColor = bc; ctx.shadowBlur = 8 / scale
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(b.x, b.y, BULLET_RADIUS / scale, 0, 2 * Math.PI); ctx.fill()
    // glowing core
    ctx.fillStyle = bc
    ctx.beginPath(); ctx.arc(b.x, b.y, (BULLET_RADIUS * 0.65) / scale, 0, 2 * Math.PI); ctx.fill()
    // trail
    ctx.globalAlpha = 0.35; ctx.fillStyle = bc
    ctx.beginPath()
    ctx.arc(b.x - b.vx * 0.014, b.y - b.vy * 0.014, (BULLET_RADIUS * 0.5) / scale, 0, 2 * Math.PI)
    ctx.fill()
    ctx.globalAlpha = 1; ctx.shadowBlur = 0
  }

  // Planes
  for (const plane of world.planes) {
    if (!plane.alive) continue
    const sx = (plane.x - camX) * scale + cw / 2
    const sy = (plane.y - camY) * scale + ch / 2
    if (sx < -120 || sx > cw + 120 || sy < -120 || sy > ch + 120) continue

    if (plane.isPlayer) { ctx.shadowColor = plane.color; ctx.shadowBlur = 20 }

    const fromCenter = dist(plane.x, plane.y, 0, 0)
    if (fromCenter > world.stormR) {
      const dp = 0.5 + 0.5 * Math.sin(now * 6)
      ctx.strokeStyle = `rgba(255,23,68,${dp})`
      ctx.lineWidth = 3 / scale
      ctx.beginPath(); ctx.arc(plane.x, plane.y, (PLANE_RADIUS * 1.7) / scale, 0, 2 * Math.PI); ctx.stroke()
    }

    // draw in pixel-space for crisp shape
    ctx.save()
    ctx.scale(1 / scale, 1 / scale)
    ctx.translate(plane.x * scale, plane.y * scale)
    ctx.rotate(plane.dir)
    const R = PLANE_RADIUS

    // engine boost glow
    if (plane.boosting) {
      const grad = ctx.createRadialGradient(-R * 1.3, 0, 0, -R * 1.3, 0, R * 3)
      grad.addColorStop(0, plane.color + 'dd')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.ellipse(-R * 1.3, 0, R * 3, R * 0.65, 0, 0, 2 * Math.PI); ctx.fill()
    }

    // fuselage
    ctx.fillStyle = shadeColor(plane.color, 0.78)
    ctx.beginPath()
    ctx.moveTo(R * 1.65, 0)
    ctx.lineTo(-R * 0.9, R * 0.38)
    ctx.lineTo(-R * 1.25, 0)
    ctx.lineTo(-R * 0.9, -R * 0.38)
    ctx.closePath()
    ctx.fill()

    // wings
    ctx.fillStyle = plane.color
    ctx.beginPath()
    ctx.moveTo(R * 0.25, 0)
    ctx.lineTo(-R * 0.3, R * 1.2)
    ctx.lineTo(-R * 0.85, R * 0.52)
    ctx.lineTo(-R * 0.18, 0)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(R * 0.25, 0)
    ctx.lineTo(-R * 0.3, -R * 1.2)
    ctx.lineTo(-R * 0.85, -R * 0.52)
    ctx.lineTo(-R * 0.18, 0)
    ctx.closePath()
    ctx.fill()

    // tail fins
    ctx.fillStyle = shadeColor(plane.color, 0.68)
    ctx.beginPath()
    ctx.moveTo(-R * 0.52, 0)
    ctx.lineTo(-R * 1.12, R * 0.58)
    ctx.lineTo(-R * 1.25, R * 0.2)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(-R * 0.52, 0)
    ctx.lineTo(-R * 1.12, -R * 0.58)
    ctx.lineTo(-R * 1.25, -R * 0.2)
    ctx.closePath()
    ctx.fill()

    // cockpit
    ctx.fillStyle = plane.isPlayer ? 'rgba(165,180,252,0.88)' : 'rgba(190,205,225,0.68)'
    ctx.beginPath(); ctx.ellipse(R * 0.55, 0, R * 0.42, R * 0.2, 0, 0, 2 * Math.PI); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.beginPath(); ctx.ellipse(R * 0.63, -R * 0.06, R * 0.22, R * 0.1, -0.3, 0, 2 * Math.PI); ctx.fill()

    // outline
    ctx.strokeStyle = 'rgba(0,0,0,0.32)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(R * 1.65, 0)
    ctx.lineTo(-R * 0.9, R * 0.38)
    ctx.lineTo(-R * 1.25, 0)
    ctx.lineTo(-R * 0.9, -R * 0.38)
    ctx.closePath()
    ctx.stroke()

    ctx.restore()
    ctx.shadowBlur = 0

    // shield ring
    if (plane.shieldActive) {
      const pulse = 0.6 + 0.4 * Math.sin(now * 4)
      ctx.strokeStyle = `rgba(34,211,238,${pulse})`
      ctx.lineWidth = 3 / scale
      ctx.beginPath(); ctx.arc(plane.x, plane.y, (R * 1.85) / scale, 0, 2 * Math.PI); ctx.stroke()
    }

    // HP bar
    {
      const bw = (R * 2.8) / scale, bh = 5 / scale
      const bx = plane.x - bw / 2, by = plane.y - (R * 1.85 + 10) / scale
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.beginPath(); ctx.roundRect(bx - 1 / scale, by - 1 / scale, bw + 2 / scale, bh + 2 / scale, bh / 2); ctx.fill()
      const pct = Math.max(0, plane.hp / plane.maxHp)
      ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#f87171'
      if (pct > 0) {
        ctx.beginPath(); ctx.roundRect(bx, by, bw * pct, bh, bh / 2); ctx.fill()
      }
    }

    // name tag
    {
      const fPx = plane.isPlayer ? 13 : 11
      const wFont = fPx / scale
      const tagY = plane.y - (R * 1.85 + 18) / scale
      ctx.save()
      ctx.font = `${plane.isPlayer ? 'bold ' : ''}${wFont}px system-ui`
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      const tw = ctx.measureText(plane.name).width
      const px = 5 / scale, py = 3 / scale
      const pillH = wFont + py * 2
      ctx.fillStyle = plane.isPlayer ? 'rgba(99,102,241,0.8)' : 'rgba(0,0,0,0.62)'
      ctx.beginPath()
      ctx.roundRect(plane.x - tw / 2 - px, tagY - pillH, tw + px * 2, pillH, pillH / 2)
      ctx.fill()
      ctx.fillStyle = plane.isPlayer ? '#fff' : '#e4e4e7'
      ctx.fillText(plane.name, plane.x, tagY - py)
      ctx.restore()
    }
  }

  // Drones
  const playerForDrone = world.planes.find(p => p.isPlayer && p.alive)
  if (playerForDrone) {
    for (const drone of world.drones) {
      const ox = playerForDrone.x + Math.cos(drone.angle) * DRONE_ORBIT_R
      const oy = playerForDrone.y + Math.sin(drone.angle) * DRONE_ORBIT_R
      if (!drone.alive) {
        // Ghost (respawning)
        const pulse = 0.3 + 0.2 * Math.sin(now * 6)
        ctx.globalAlpha = pulse
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2 / scale
        ctx.beginPath(); ctx.arc(ox, oy, DRONE_RADIUS / scale, 0, 2 * Math.PI); ctx.stroke()
        ctx.globalAlpha = 1
        continue
      }
      // Glow
      ctx.save(); ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 10
      // Body
      ctx.fillStyle = '#166534'
      ctx.beginPath(); ctx.arc(ox, oy, DRONE_RADIUS / scale, 0, 2 * Math.PI); ctx.fill()
      ctx.fillStyle = '#4ade80'
      ctx.beginPath(); ctx.arc(ox, oy, (DRONE_RADIUS * 0.6) / scale, 0, 2 * Math.PI); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath(); ctx.arc(ox - (DRONE_RADIUS * 0.2) / scale, oy - (DRONE_RADIUS * 0.2) / scale, (DRONE_RADIUS * 0.22) / scale, 0, 2 * Math.PI); ctx.fill()
      ctx.restore()
      // Orbit trail line to player
      ctx.globalAlpha = 0.18
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1 / scale; ctx.setLineDash([6 / scale, 4 / scale])
      ctx.beginPath(); ctx.moveTo(playerForDrone.x, playerForDrone.y); ctx.lineTo(ox, oy); ctx.stroke()
      ctx.setLineDash([]); ctx.globalAlpha = 1
    }
  }

  ctx.restore()
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
interface AirplaneStrings {
  playerName: string; hudKills: string; hudRank: string;
  hudRankSuffix: string; hudAliveSuffix: string;
  stormShrinking: string; stormWarning: string; stormHold: string; boostHint: string;
  gameOver: string; win: string; kills: string; retry: string; playAgain: string; exit: string;
}

function renderHUD(
  ctx: CanvasRenderingContext2D,
  world: World,
  cw: number,
  ch: number,
  now: number,
  cam: { x: number; y: number; zoom: number },
  strings: AirplaneStrings,
) {
  const player = world.planes.find(p => p.isPlayer)
  if (!player) return

  // Minimap
  const mmSize = Math.min(cw, ch) * 0.14
  const mmX = cw - mmSize - 16, mmY = 16
  const mmScale = mmSize / (ARENA_RADIUS * 2)
  ctx.globalAlpha = 0.75
  ctx.fillStyle = '#0a0d1a'; ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(mmX + mmSize / 2, mmY + mmSize / 2, mmSize / 2, 0, 2 * Math.PI)
  ctx.fill(); ctx.stroke()
  ctx.globalAlpha = 1
  ctx.save()
  ctx.beginPath(); ctx.arc(mmX + mmSize / 2, mmY + mmSize / 2, mmSize / 2 - 2, 0, 2 * Math.PI); ctx.clip()
  if (world.stormR < ARENA_RADIUS) {
    ctx.globalAlpha = 0.3; ctx.fillStyle = 'rgba(239,68,68,0.5)'
    ctx.beginPath()
    ctx.arc(mmX + mmSize / 2, mmY + mmSize / 2, mmSize / 2, 0, 2 * Math.PI)
    ctx.arc(mmX + mmSize / 2, mmY + mmSize / 2, world.stormR * mmScale, 0, 2 * Math.PI, true)
    ctx.fill(); ctx.globalAlpha = 1
  }
  for (const item of world.items) {
    ctx.fillStyle = ITEM_COLOR[item.kind]; ctx.globalAlpha = 0.8
    ctx.beginPath(); ctx.arc(mmX + mmSize / 2 + item.x * mmScale, mmY + mmSize / 2 + item.y * mmScale, 3, 0, 2 * Math.PI); ctx.fill()
    ctx.globalAlpha = 1
  }
  for (const p of world.planes) {
    if (!p.alive) continue
    ctx.fillStyle = p.isPlayer ? '#a5b4fc' : p.color
    ctx.globalAlpha = p.isPlayer ? 1 : 0.7
    ctx.beginPath(); ctx.arc(mmX + mmSize / 2 + p.x * mmScale, mmY + mmSize / 2 + p.y * mmScale, p.isPlayer ? 4 : 2.5, 0, 2 * Math.PI); ctx.fill()
  }
  ctx.globalAlpha = 1
  {
    const vpW = (cw / cam.zoom) * mmScale, vpH = (ch / cam.zoom) * mmScale
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1
    ctx.strokeRect(mmX + mmSize / 2 + cam.x * mmScale - vpW / 2, mmY + mmSize / 2 + cam.y * mmScale - vpH / 2, vpW, vpH)
  }
  ctx.restore()

  // HP bar top-left
  const hpBarW = 200, hpBarH = 14
  const hpBarX = 12, hpBarY = 12
  ctx.fillStyle = 'rgba(0,0,0,0.62)'
  ctx.beginPath(); ctx.roundRect(hpBarX - 2, hpBarY - 2, hpBarW + 4, hpBarH + 4, 8); ctx.fill()
  ctx.fillStyle = '#1e1e2e'
  ctx.beginPath(); ctx.roundRect(hpBarX, hpBarY, hpBarW, hpBarH, 6); ctx.fill()
  const hpPct = Math.max(0, player.hp / player.maxHp)
  if (hpPct > 0) {
    ctx.fillStyle = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#fbbf24' : '#f87171'
    ctx.beginPath(); ctx.roundRect(hpBarX, hpBarY, hpBarW * hpPct, hpBarH, 6); ctx.fill()
  }
  ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#f4f4f5'; ctx.textAlign = 'center'
  ctx.fillText(`HP ${Math.ceil(player.hp)} / ${player.maxHp}`, hpBarX + hpBarW / 2, hpBarY + hpBarH - 2)

  // Score bar bottom-left
  const alive = world.planes.filter(p => p.alive).length
  const rank = world.planes.filter(p => p.alive).sort((a, b) => b.hp - a.hp).findIndex(p => p.isPlayer) + 1
  ctx.fillStyle = 'rgba(0,0,0,0.62)'
  ctx.beginPath(); ctx.roundRect(12, ch - 76, 248, 64, 12); ctx.fill()
  ;[
    { label: 'HP', value: Math.ceil(player.hp).toString() },
    { label: strings.hudKills, value: world.kills.toString() },
    { label: strings.hudRank, value: `${rank}${strings.hudRankSuffix}/${alive}${strings.hudAliveSuffix}` },
  ].forEach((item, i) => {
    const x = 24 + i * 80
    ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#52525b'; ctx.textAlign = 'left'
    ctx.fillText(item.label.toUpperCase(), x, ch - 46)
    ctx.font = 'bold 15px system-ui'; ctx.fillStyle = '#f4f4f5'
    ctx.fillText(item.value, x, ch - 26)
  })

  // Drone indicator
  {
    const aliveDrones = world.drones.filter(d => d.alive).length
    const totalDrones = world.drones.length
    ctx.fillStyle = 'rgba(0,0,0,0.62)'
    ctx.beginPath(); ctx.roundRect(12, ch - 76 - 34, 120, 26, 6); ctx.fill()
    ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#4ade80'; ctx.textAlign = 'left'
    ctx.fillText(`🤖 드론 ${aliveDrones}/${totalDrones}`, 20, ch - 76 - 16)
  }

  // Active effects
  const effects: { emoji: string; color: string; remaining: number; always?: boolean }[] = []
  if (player.shieldActive) effects.push({ emoji: '🛡️', color: '#22d3ee', remaining: 999, always: true })
  if (player.speedUntil > now) effects.push({ emoji: '⚡', color: '#fbbf24', remaining: player.speedUntil - now })
  if (player.rapidFireUntil > now) effects.push({ emoji: '🔥', color: '#f97316', remaining: player.rapidFireUntil - now })
  if (player.multiShotUntil > now) effects.push({ emoji: '💥', color: '#a855f7', remaining: player.multiShotUntil - now })
  if (effects.length > 0) {
    const boxW = effects.length * 52 + 8
    ctx.fillStyle = 'rgba(0,0,0,0.62)'
    ctx.beginPath(); ctx.roundRect(12, ch - 76 - 56, boxW, 48, 10); ctx.fill()
    effects.forEach((eff, i) => {
      const ex = 12 + 8 + i * 52, ey = ch - 76 - 56 + 4
      ctx.fillStyle = eff.color + '33'
      ctx.beginPath(); ctx.roundRect(ex, ey, 44, 40, 8); ctx.fill()
      ctx.font = '18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(eff.emoji, ex + 22, ey + 16)
      ctx.font = 'bold 10px system-ui'; ctx.fillStyle = '#d4d4d8'; ctx.textBaseline = 'alphabetic'
      ctx.fillText(eff.always ? 'ON' : `${Math.ceil(eff.remaining)}s`, ex + 22, ey + 37)
    })
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  }

  // Storm timer
  if (world.stormPhase !== 'hold' || world.stormTimer < 12) {
    const label = world.stormPhase === 'shrink' ? strings.stormShrinking : world.stormPhase === 'warn' ? strings.stormWarning : strings.stormHold
    const color = world.stormPhase === 'shrink' ? '#f97316' : world.stormPhase === 'warn' ? '#fbbf24' : '#818cf8'
    ctx.fillStyle = 'rgba(0,0,0,0.62)'
    ctx.beginPath(); ctx.roundRect(cw / 2 - 90, 12, 180, 36, 8); ctx.fill()
    ctx.textAlign = 'center'; ctx.fillStyle = color; ctx.font = 'bold 12px system-ui'
    ctx.fillText(label, cw / 2, 28)
    ctx.fillStyle = '#f4f4f5'; ctx.font = '11px system-ui'
    ctx.fillText(`${Math.ceil(world.stormTimer)}s`, cw / 2, 42)
  }

  // Hint
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath(); ctx.roundRect(cw - 222, 12, 210, 28, 6); ctx.fill()
  ctx.fillStyle = '#71717a'; ctx.font = '10px system-ui'
  ctx.fillText(strings.boostHint, cw - 20, 30)
  ctx.textAlign = 'left'

  void now
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { onClose: () => void; strings: AirplaneStrings }

const CAM_MAX_ZOOM = 1.6
const CAM_MIN_ZOOM = 0.75

export default function AirplaneGame({ onClose, strings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<World>(initWorld(strings.playerName))
  const mouseRef = useRef({ cx: 0, cy: 0 })
  const boostRef = useRef(false)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)
  const frameRef = useRef(0)
  const camRef = useRef({ x: 0, y: 0, zoom: CAM_MAX_ZOOM })
  const sfxRef = useRef<SoundManager>(new SoundManager())
  const prevBoostingRef = useRef(false)
  const prevPhaseRef = useRef<World['phase']>('playing')
  const prevStormPhaseRef = useRef<StormPhase>('hold')

  const [display, setDisplay] = useState({ phase: 'playing' as World['phase'], hp: MAX_HP, kills: 0 })
  const [muted, setMuted] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  const worldToScreen = useCallback((cx: number, cy: number, cw: number, ch: number) => {
    const cam = camRef.current
    return { x: (cx - cw / 2) / cam.zoom + cam.x, y: (cy - ch / 2) / cam.zoom + cam.y }
  }, [])

  const restart = useCallback(() => {
    worldRef.current = initWorld(strings.playerName)
    prevPhaseRef.current = 'playing'
    prevBoostingRef.current = false
    prevStormPhaseRef.current = 'hold'
    setDisplay({ phase: 'playing', hp: MAX_HP, kills: 0 })
  }, [strings.playerName])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx!.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function loop(ts: number) {
      const dt = Math.min(0.05, (ts - lastTimeRef.current) / 1000)
      lastTimeRef.current = ts
      frameRef.current++
      const world = worldRef.current
      if (!canvas || !ctx) return
      const cw = canvas.offsetWidth, ch = canvas.offsetHeight
      const now = ts / 1000

      const sfx = sfxRef.current

      if (world.phase === 'playing') {
        // Player input
        const player = world.planes.find(p => p.isPlayer)
        if (player?.alive) {
          const mw = worldToScreen(mouseRef.current.cx, mouseRef.current.cy, cw, ch)
          const dx = mw.x - player.x, dy = mw.y - player.y
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) player.targetDir = Math.atan2(dy, dx)
          player.boosting = boostRef.current && player.hp > 20

          // Boost start sound
          if (player.boosting && !prevBoostingRef.current) sfx.boost()
          prevBoostingRef.current = player.boosting

          // Player fire
          player.fireTimer -= dt
          const rate = player.rapidFireUntil > now ? FIRE_RATE * 0.45 : FIRE_RATE
          if (player.fireTimer <= 0) {
            player.fireTimer = rate
            fireBullet(world, player)
            if (player.multiShotUntil > now) {
              fireBullet(world, player, 0.2)
              fireBullet(world, player, -0.2)
            }
            sfx.shoot()
          }
        }

        // AI decisions
        for (const p of world.planes) {
          if (!p.isPlayer && p.alive) updateAI(p, world, dt, now)
        }

        // Physics
        for (const p of world.planes) updatePlane(p, dt, world, now)

        // Update bullets
        const killsBefore = world.kills
        for (let bi = world.bullets.length - 1; bi >= 0; bi--) {
          const b = world.bullets[bi]
          b.x += b.vx * dt; b.y += b.vy * dt
          b.lifetime -= dt
          if (b.lifetime <= 0 || dist(b.x, b.y, 0, 0) > ARENA_RADIUS) {
            world.bullets.splice(bi, 1)
            continue
          }
          let hit = false
          for (const plane of world.planes) {
            if (!plane.alive || plane.id === b.ownerId) continue
            if (dist(b.x, b.y, plane.x, plane.y) < PLANE_RADIUS * 1.3) {
              if (plane.shieldActive) {
                plane.shieldActive = false
                spawnParticles(world, plane.x, plane.y, '#22d3ee', 10)
                sfx.shieldBlock()
              } else {
                plane.hp -= b.damage
                spawnParticles(world, b.x, b.y, plane.color, 5)
                if (plane.hp <= 0) {
                  killPlane(world, plane, b.ownerId)
                  sfx.explosion(plane.isPlayer)
                } else {
                  sfx.hit(plane.isPlayer)
                }
              }
              hit = true
              break
            }
          }
          if (hit) world.bullets.splice(bi, 1)
        }
        if (world.kills > killsBefore) sfx.kill()

        // Item collection
        for (const plane of world.planes) {
          if (!plane.alive) continue
          for (let ii = world.items.length - 1; ii >= 0; ii--) {
            const item = world.items[ii]
            if (dist(plane.x, plane.y, item.x, item.y) < ITEM_RADIUS + PLANE_RADIUS) {
              applyItem(plane, item.kind, now, world)
              spawnParticles(world, item.x, item.y, ITEM_COLOR[item.kind], 12)
              world.items.splice(ii, 1)
              if (plane.isPlayer) sfx.pickup()
            }
          }
        }

        // Drones update
        {
          const player = world.planes.find(p => p.isPlayer)
          if (player?.alive) {
            for (const drone of world.drones) {
              // Respawn
              if (!drone.alive) {
                drone.respawnTimer -= dt
                if (drone.respawnTimer <= 0) { drone.alive = true; drone.fireTimer = DRONE_FIRE_RATE }
                continue
              }
              // Orbit
              drone.angle += DRONE_ORBIT_SPD * dt

              // Auto-fire at nearest enemy
              drone.fireTimer -= dt
              if (drone.fireTimer <= 0) {
                drone.fireTimer = DRONE_FIRE_RATE
                const dx = player.x + Math.cos(drone.angle) * DRONE_ORBIT_R
                const dy = player.y + Math.sin(drone.angle) * DRONE_ORBIT_R
                const enemies = world.planes.filter(p => p.alive && !p.isPlayer)
                if (enemies.length > 0) {
                  const tgt = enemies.reduce((a, b) => dist(dx, dy, a.x, a.y) < dist(dx, dy, b.x, b.y) ? a : b)
                  const ad = Math.atan2(tgt.y - dy, tgt.x - dx)
                  world.bullets.push({
                    id: world.nextBulletId++, x: dx, y: dy,
                    vx: Math.cos(ad) * BULLET_SPEED, vy: Math.sin(ad) * BULLET_SPEED,
                    ownerId: player.id, lifetime: BULLET_LIFETIME, damage: BULLET_DAMAGE * 0.7,
                  })
                }
              }
            }

            // Check drone hit by enemy bullets
            for (let bi = world.bullets.length - 1; bi >= 0; bi--) {
              const b = world.bullets[bi]
              if (b.ownerId === player.id) continue
              for (const drone of world.drones) {
                if (!drone.alive) continue
                const ox = player.x + Math.cos(drone.angle) * DRONE_ORBIT_R
                const oy = player.y + Math.sin(drone.angle) * DRONE_ORBIT_R
                if (dist(b.x, b.y, ox, oy) < DRONE_RADIUS * 1.4) {
                  drone.alive = false
                  drone.respawnTimer = DRONE_RESPAWN
                  spawnParticles(world, ox, oy, '#4ade80', 8)
                  world.bullets.splice(bi, 1)
                  break
                }
              }
            }
          }
        }

        // Particles
        for (let pi = world.particles.length - 1; pi >= 0; pi--) {
          const p = world.particles[pi]
          p.x += p.vx * dt; p.y += p.vy * dt
          p.vx *= 0.91; p.vy *= 0.91
          p.life -= dt * 1.6
          if (p.life <= 0) world.particles.splice(pi, 1)
        }

        // Item spawn
        if (world.items.length < ITEM_TARGET && frameRef.current % 240 === 0) spawnItem(world)

        // Storm
        world.stormTimer -= dt
        if (world.stormTimer <= 0) {
          if (world.stormPhase === 'hold') {
            world.stormPhase = 'warn'; world.stormTimer = STORM_WARN_MS / 1000
            sfx.stormWarn()
          } else if (world.stormPhase === 'warn') {
            world.stormPhase = 'shrink'; world.stormTimer = STORM_SHRINK_MS / 1000
          } else {
            world.stormR = world.stormNextR
            world.stormNextR = Math.max(400, world.stormR * (1 - STORM_SHRINK_RATIO))
            world.stormPhase = 'hold'
            world.stormTimer = STORM_HOLD_MS / 1000 * 0.66
          }
        } else if (world.stormPhase === 'shrink') {
          const p = 1 - world.stormTimer / (STORM_SHRINK_MS / 1000)
          world.stormR += (world.stormNextR - world.stormR) * Math.min(0.04, p * 0.04)
        }
        prevStormPhaseRef.current = world.stormPhase

        // Win / lose
        const playerPlane = world.planes.find(p => p.isPlayer)
        if (playerPlane && !playerPlane.alive) world.phase = 'dead'
        if (world.planes.filter(p => p.alive).length === 1 && world.planes.find(p => p.isPlayer && p.alive)) world.phase = 'win'

        // Phase transition sounds
        if (world.phase !== prevPhaseRef.current) {
          if (world.phase === 'dead') sfx.playerDeath()
          else if (world.phase === 'win') sfx.win()
          prevPhaseRef.current = world.phase
        }
      }

      if (frameRef.current % 20 === 0 || world.phase !== 'playing') {
        const pl = world.planes.find(p => p.isPlayer)
        setDisplay({ phase: world.phase, hp: Math.ceil(pl?.hp ?? 0), kills: world.kills })
      }

      // Camera smooth follow
      {
        const pl = world.planes.find(p => p.isPlayer)
        const cam = camRef.current
        if (pl?.alive) {
          cam.x += (pl.x - cam.x) * 0.1
          cam.y += (pl.y - cam.y) * 0.1
          const alive = world.planes.filter(p => p.alive).length
          const targetZoom = Math.max(CAM_MIN_ZOOM, Math.min(CAM_MAX_ZOOM, 1.6 - alive * 0.028))
          cam.zoom += (targetZoom - cam.zoom) * 0.04
        }
      }

      render(ctx, world, cw, ch, now, camRef.current)
      renderHUD(ctx, world, cw, ch, now, camRef.current, strings)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(ts => {
      lastTimeRef.current = ts
      rafRef.current = requestAnimationFrame(loop)
    })

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [worldToScreen, strings])

  // Sync mute state to SoundManager
  useEffect(() => { sfxRef.current.muted = muted }, [muted])

  // Cleanup SoundManager on unmount
  useEffect(() => {
    const sfx = sfxRef.current
    return () => sfx.destroy()
  }, [])

  // Detect touch device
  useEffect(() => { setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0) }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { cx: e.clientX - r.left, cy: e.clientY - r.top }
    }
    const onTouch = (e: TouchEvent) => {
      e.preventDefault()
      const r = canvas.getBoundingClientRect(), t = e.touches[0]
      if (t) mouseRef.current = { cx: t.clientX - r.left, cy: t.clientY - r.top }
    }
    const onDown = () => { boostRef.current = true }
    const onUp = () => { boostRef.current = false }
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault(); boostRef.current = e.type === 'keydown'
      }
      if (e.key === 'Escape') onClose()
    }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onTouch, { passive: false })
    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mouseup', onUp)
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mouseup', onUp)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
    }
  }, [onClose])

  return (
    <div className="relative h-full w-full bg-[#07091a] touch-none select-none">
      <canvas ref={canvasRef} className="h-full w-full cursor-crosshair" style={{ touchAction: 'none' }} />

      {/* Mobile controls */}
      {isTouch && display.phase === 'playing' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-end justify-end px-6">
          <button
            className="pointer-events-auto flex h-20 w-20 select-none flex-col items-center justify-center gap-1 rounded-full border-2 border-white/20 bg-black/60 text-white active:bg-white/20"
            onTouchStart={e => { e.preventDefault(); boostRef.current = true; sfxRef.current.boost() }}
            onTouchEnd={e => { e.preventDefault(); boostRef.current = false }}
          >
            <span className="text-2xl leading-none">🚀</span>
            <span className="text-[11px] font-bold">BOOST</span>
          </button>
        </div>
      )}

      {/* Mobile aim hint */}
      {isTouch && display.phase === 'playing' && (
        <div className="pointer-events-none absolute left-1/2 top-14 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] text-zinc-400">
          화면 터치 → 조준 방향 | 우하단 BOOST → 가속
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={() => setMuted(m => !m)}
        className="absolute right-16 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-zinc-400 transition hover:bg-black/80 hover:text-white"
        title={muted ? '소리 켜기' : '소리 끄기'}
      >
        {muted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-zinc-400 transition hover:bg-black/80 hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {display.phase === 'dead' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-10 py-8 text-center shadow-2xl">
            <p className="text-4xl font-bold text-red-400">{strings.gameOver}</p>
            <p className="mt-3 text-zinc-400">{strings.kills} <span className="font-bold text-white">{display.kills}</span></p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={restart} className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                {strings.retry}
              </button>
              <button onClick={onClose} className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500">
                {strings.exit}
              </button>
            </div>
          </div>
        </div>
      )}

      {display.phase === 'win' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-10 py-8 text-center shadow-2xl">
            <p className="text-4xl font-bold text-yellow-400">{strings.win}</p>
            <p className="mt-3 text-zinc-400">{strings.kills} <span className="font-bold text-white">{display.kills}</span></p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={restart} className="rounded-full bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400">
                {strings.playAgain}
              </button>
              <button onClick={onClose} className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500">
                {strings.exit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
