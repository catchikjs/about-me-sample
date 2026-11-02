const photo = document.querySelector('.teacher-illustration')
const visual = document.querySelector('.hero-visual')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
const canvas = document.createElement('canvas')
canvas.className = 'photo-starlight'
canvas.setAttribute('aria-hidden', 'true')
visual.append(canvas)
const context = canvas.getContext('2d')
const colors = ['#f4c3dc', '#b9d9ff', '#ffe6a2', '#ffffff', '#d5c7f6']
let particles = []
let frame = 0
let lastTime = 0
let lastEmission = -Infinity
let width = 0
let height = 0

function clearStars() {
  cancelAnimationFrame(frame)
  frame = 0
  particles = []
  context?.clearRect(0, 0, width, height)
}
function resize() {
  clearStars()
  const bounds = visual.getBoundingClientRect()
  width = bounds.width
  height = bounds.height
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  context?.setTransform(ratio, 0, 0, ratio, 0, 0)
}
function draw(now) {
  const elapsed = Math.min((now - lastTime) / 1000, .04)
  lastTime = now
  context.clearRect(0, 0, width, height)
  particles = particles.filter((star) => star.age < star.life)
  for (const star of particles) {
    star.age += elapsed
    star.x += star.vx * elapsed
    star.vy += 100 * elapsed
    star.y += star.vy * elapsed
    const progress = Math.min(star.age / star.life, 1)
    const opacity = Math.min(star.age / .07, 1) * (1 - progress) ** 1.4
    const size = star.size * (1 - progress * .5) * (1 + Math.sin(star.age * 17) * .16)
    context.save()
    context.translate(star.x, star.y)
    context.rotate(star.angle + star.age * star.spin)
    context.globalAlpha = opacity
    context.fillStyle = star.color
    context.shadowColor = star.color
    context.shadowBlur = 12
    context.beginPath()
    // 네 방향으로 빛나는 작은 별을 그립니다.
    for (let point = 0; point < 8; point++) {
      const angle = point * Math.PI / 4
      const radius = point % 2 === 0 ? size : size * .24
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (point === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath()
    context.fill()
    context.fillStyle = '#ffffff'
    context.beginPath()
    context.arc(0, 0, size * .18, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
  frame = particles.length ? requestAnimationFrame(draw) : 0
}
photo.addEventListener('pointermove', (event) => {
  if (!context || reducedMotion.matches || !finePointer.matches || document.hidden || event.pointerType === 'touch') return
  const now = performance.now()
  if (now - lastEmission < 32) return
  lastEmission = now
  const bounds = visual.getBoundingClientRect()
  for (let index = 0; index < 3 && particles.length < 100; index++) {
    particles.push({
      x: event.clientX - bounds.left + (Math.random() - .5) * 22,
      y: event.clientY - bounds.top + (Math.random() - .5) * 15,
      vx: (Math.random() - .5) * 65,
      vy: 25 + Math.random() * 55,
      size: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: .7 + Math.random() * .65,
      age: 0,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - .5) * 2,
    })
  }
  if (!frame) {
    lastTime = now
    frame = requestAnimationFrame(draw)
  }
})
if (context) {
  resize()
  new ResizeObserver(resize).observe(visual)
}
reducedMotion.addEventListener('change', clearStars)
finePointer.addEventListener('change', clearStars)
document.addEventListener('visibilitychange', () => { if (document.hidden) clearStars() })
