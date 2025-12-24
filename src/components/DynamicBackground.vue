<template>
  <div class="dynamic-background" aria-hidden="true">
    <transition-group name="bg-crossfade" tag="div" class="bg-layers">
      <img
        v-for="layer in layers"
        :key="layer.id"
        class="bg-image"
        :src="layer.src"
        decoding="async"
        loading="eager"
      />
    </transition-group>

    <div class="bg-overlay" />

    <canvas ref="canvasRef" class="bg-particles" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type BackgroundLayer = {
  id: number
  src: string
}

const backgroundUrls = getBackgroundUrls()
const layers = ref<BackgroundLayer[]>([])
const currentIndex = ref(0)
const isTransitioning = ref(false)
const lastSwitchAt = ref(0)

const SWITCH_COOLDOWN_MS = 1400

function getBackgroundUrls(): string[] {
  const modules = import.meta.glob('../assets/images/backgrounds/*.jpg', {
    eager: true,
    import: 'default'
  }) as Record<string, string>

  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url)
}

function pickRandomIndex(excludeIndex: number | null): number {
  if (backgroundUrls.length === 0) return 0
  if (backgroundUrls.length === 1) return 0

  let index = Math.floor(Math.random() * backgroundUrls.length)
  if (excludeIndex != null) {
    while (index === excludeIndex) {
      index = Math.floor(Math.random() * backgroundUrls.length)
    }
  }
  return index
}

function setBackground(index: number) {
  if (backgroundUrls.length === 0) return

  const safeIndex = ((index % backgroundUrls.length) + backgroundUrls.length) % backgroundUrls.length
  const src = backgroundUrls[safeIndex]
  if (!src) return

  currentIndex.value = safeIndex
  layers.value = [{ id: Date.now(), src }]
}

function switchBackground() {
  const now = Date.now()
  if (backgroundUrls.length === 0) return
  if (isTransitioning.value) return
  if (now - lastSwitchAt.value < SWITCH_COOLDOWN_MS) return

  const nextIndex =
    backgroundUrls.length === 1 ? currentIndex.value : pickRandomIndex(currentIndex.value)

  lastSwitchAt.value = now
  isTransitioning.value = true
  setBackground(nextIndex)

  window.setTimeout(() => {
    isTransitioning.value = false
  }, SWITCH_COOLDOWN_MS)
}

defineExpose({ switchBackground })

function preloadIdle(urls: string[], startAtIndex: number) {
  const rest: string[] = []
  for (let i = 0; i < urls.length; i += 1) {
    if (i === startAtIndex) continue
    const url = urls[i]
    if (url) rest.push(url)
  }

  const preload = () => {
    for (const url of rest) {
      const img = new Image()
      img.decoding = 'async'
      img.src = url
    }
  }

  const requestIdleCallback = (
    window as unknown as { requestIdleCallback?: (cb: () => void, opts?: any) => void }
  ).requestIdleCallback

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(preload, { timeout: 2000 })
  } else {
    setTimeout(preload, 300)
  }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

type Particle = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  baseAlpha: number
  phase: number
}

let rafId: number | null = null
let particles: Particle[] = []
let ctx: CanvasRenderingContext2D | null = null
let canvasW = 0
let canvasH = 0
let dpr = 1

function getParticleCount(width: number, height: number) {
  const count = Math.round((width * height) / 35000)
  return Math.max(50, Math.min(120, count))
}

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: 0.6 + Math.random() * 1.8,
    vx: (-0.05 + Math.random() * 0.1) * 60,
    vy: (-0.08 - Math.random() * 0.22) * 60,
    baseAlpha: 0.12 + Math.random() * 0.25,
    phase: Math.random() * Math.PI * 2
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  canvasW = window.innerWidth
  canvasH = window.innerHeight

  canvas.width = Math.floor(canvasW * dpr)
  canvas.height = Math.floor(canvasH * dpr)
  canvas.style.width = `${canvasW}px`
  canvas.style.height = `${canvasH}px`

  ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const count = getParticleCount(canvasW, canvasH)
  particles = Array.from({ length: count }, () => createParticle(canvasW, canvasH))
}

function step(time: number, lastTime: number | null) {
  if (!ctx) return
  const dt = lastTime == null ? 16 : Math.min(40, time - lastTime)

  ctx.clearRect(0, 0, canvasW, canvasH)

  for (const p of particles) {
    p.x += (p.vx * dt) / 1000
    p.y += (p.vy * dt) / 1000

    if (p.y + p.r < 0) {
      p.y = canvasH + p.r
      p.x = Math.random() * canvasW
    }
    if (p.x + p.r < 0) p.x = canvasW + p.r
    if (p.x - p.r > canvasW) p.x = -p.r

    const flicker = 0.55 + 0.45 * Math.sin(time * 0.001 + p.phase)
    const alpha = p.baseAlpha * flicker

    ctx.fillStyle = `rgba(255, 236, 210, ${alpha.toFixed(4)})`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function startParticles() {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  resizeCanvas()

  if (reduceMotion) return

  let last: number | null = null
  const loop = (t: number) => {
    step(t, last)
    last = t
    rafId = window.requestAnimationFrame(loop)
  }
  rafId = window.requestAnimationFrame(loop)
}

function stopParticles() {
  if (rafId != null) {
    window.cancelAnimationFrame(rafId)
    rafId = null
  }
}

onMounted(() => {
  const initialIndex = pickRandomIndex(null)
  setBackground(initialIndex)
  preloadIdle(backgroundUrls, initialIndex)

  startParticles()
  window.addEventListener('resize', resizeCanvas, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  stopParticles()
  particles = []
  ctx = null
})
</script>

<style scoped>
.dynamic-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.bg-layers {
  position: absolute;
  inset: 0;
}

.bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.95) contrast(1.05) brightness(0.72);
  transform: scale(1.02);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--bg-overlay, rgba(0, 0, 0, 0.55));
}

.bg-particles {
  position: absolute;
  inset: 0;
}

.bg-crossfade-enter-active,
.bg-crossfade-leave-active {
  transition: opacity 1200ms ease;
  will-change: opacity;
}

.bg-crossfade-enter-active {
  z-index: 1;
}

.bg-crossfade-leave-active {
  z-index: 0;
}

.bg-crossfade-enter-from,
.bg-crossfade-leave-to {
  opacity: 0;
}

.bg-crossfade-enter-to,
.bg-crossfade-leave-from {
  opacity: 1;
}
</style>