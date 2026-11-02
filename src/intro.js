const intro = document.querySelector('#intro-screen')
const typing = document.querySelector('#intro-typing')
const enter = document.querySelector('#intro-enter')
const site = document.querySelector('#site-content')
const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
const message = [...'내 소개를 시작할께..']
let position = 0
let typingTimer
let entering = false

function finishTyping() {
  clearTimeout(typingTimer)
  typing.textContent = message.join('')
  enter.hidden = false
  intro.classList.add('typing-complete')
}
function typeNext() {
  if (motion.matches) return finishTyping()
  typing.textContent = message.slice(0, ++position).join('')
  if (position < message.length) typingTimer = setTimeout(typeNext, 145)
  else finishTyping()
}
if (motion.matches) finishTyping()
else typingTimer = setTimeout(typeNext, 450)
motion.addEventListener('change', (event) => { if (event.matches) finishTyping() })

// 화면 전역의 여러 지점에서 컬러 팝이 터지고 소개 화면이 등장합니다.
function playEntryTransition(origin) {
  const layer = document.createElement('div')
  layer.className = 'intro-pop-transition'
  layer.setAttribute('aria-hidden', 'true')
  const animations = []
  const animate = (element, frames, options) => {
    const animation = element.animate(frames, options)
    animations.push(animation)
    return animation.finished.catch(() => {})
  }
  const stopForReducedMotion = (event) => {
    if (event.matches) animations.forEach((animation) => animation.finish())
  }
  const cleanup = () => {
    animations.forEach((animation) => animation.cancel())
    motion.removeEventListener('change', stopForReducedMotion)
    layer.remove()
  }
  motion.addEventListener('change', stopForReducedMotion)
  try {
    document.body.append(layer)
    const colors = ['#ff4279', '#2e8dff', '#ffd239', '#23cda0', '#9b53ff']
    const random = (min, max) => min + Math.random() * (max - min)
    const chooseColor = () => colors[Math.floor(Math.random() * colors.length)]
    const mobile = window.innerWidth < 700
    const count = mobile ? 12 : 18
    const centers = [origin]
    // 매번 새로 뽑은 위치를 사용하고, 지나치게 한곳에 몰릴 때만 다시 뽑습니다.
    for (let index = 1; index < count; index++) {
      let point
      for (let attempt = 0; attempt < 12; attempt++) {
        point = { x: random(.02, .98) * window.innerWidth, y: random(.03, .97) * window.innerHeight }
        if (centers.every(center => Math.hypot((center.x - point.x) / window.innerWidth, (center.y - point.y) / window.innerHeight) > .12)) break
      }
      centers.push(point)
    }
    const bursts = centers.flatMap((center, burstIndex) => {
      const delay = burstIndex === 0 ? 0 : random(0, 170)
      const duration = random(280, 440)
      const color = chooseColor()
      // 작은 점부터 큰 비눗방울까지 크기와 두께, 속도가 모두 다릅니다.
      const size = random(mobile ? 25 : 40, mobile ? 140 : 230)
      const ring = document.createElement('span')
      ring.className = 'intro-pop-ring random-pop-circle'
      Object.assign(ring.style, {
        left: `${center.x}px`, top: `${center.y}px`,
        width: `${size}px`, height: `${size}px`,
        borderColor: color, borderWidth: `${random(2, 6)}px`,
        backgroundColor: Math.random() < .5 ? `${color}26` : 'transparent',
      })
      layer.append(ring)
      const driftX = random(-70, 70)
      const driftY = random(-90, 35)
      const stretch = random(.7, 1.25)
      const ripple = animate(ring, [
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.05)' },
        { opacity: random(.65, .95), transform: `translate(-50%,-50%) scale(${stretch},${2 - stretch})`, offset: .35 },
        { opacity: .55, transform: `translate(calc(-50% + ${driftX * .3}px),calc(-50% + ${driftY * .3}px)) scale(1.15)`, offset: .58 },
        { opacity: 0, transform: `translate(calc(-50% + ${driftX}px),calc(-50% + ${driftY}px)) scale(${random(1.3, 1.9)})` },
      ], { duration, delay, easing: 'cubic-bezier(.16,.65,.25,1)', fill: 'both' })
      const particles = Array.from({ length: Math.floor(random(5, 10)) }, () => {
        const piece = document.createElement('span')
        piece.className = 'intro-pop-piece random-pop-droplet'
        const particleSize = random(4, 20)
        Object.assign(piece.style, {
          left: `${center.x}px`, top: `${center.y}px`,
          width: `${particleSize}px`, height: `${particleSize}px`,
          backgroundColor: chooseColor(),
        })
        layer.append(piece)
        const angle = random(0, Math.PI * 2)
        const radius = size * random(.5, 1.15)
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return animate(piece, [
          { opacity: 0, transform: 'translate(-50%,-50%) scale(.2)' },
          { opacity: 1, transform: `translate(${x * .45}px,${y * .45 - 12}px) scale(${random(.8, 1.4)})`, offset: .3 },
          { opacity: 0, transform: `translate(${x}px,${y + random(15, 70)}px) scale(.1)` },
        ], { duration: random(260, 410), delay: delay + random(0, 20), easing: 'ease-out', fill: 'both' })
      })
      return [ripple, ...particles]
    })
    const copy = animate(document.querySelector('.hero-copy'), [
      { opacity: .6, transform: 'translateY(28px) scale(.94)' },
      { opacity: 1, transform: 'translateY(-8px) scale(1.025)', offset: .5 },
      { opacity: 1, transform: 'translateY(3px) scale(.995)', offset: .78 },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], { duration: 460, easing: 'ease-out', fill: 'both' })
    const photo = animate(document.querySelector('.hero-visual'), [
      { opacity: .6, transform: 'translateY(40px) scale(.85) rotate(-5deg)' },
      { opacity: 1, transform: 'translateY(-12px) scale(1.045) rotate(2deg)', offset: .5 },
      { opacity: 1, transform: 'translateY(4px) scale(.99) rotate(-.5deg)', offset: .8 },
      { opacity: 1, transform: 'translateY(0) scale(1) rotate(0deg)' },
    ], { duration: 500, easing: 'ease-out', fill: 'both' })
    void Promise.all([...bursts, copy, photo]).finally(cleanup)
  } catch {
    cleanup()
  }
}

enter.addEventListener('click', () => {
  if (entering) return
  entering = true
  const buttonBounds = enter.getBoundingClientRect()
  const origin = { x: buttonBounds.left + buttonBounds.width / 2, y: buttonBounds.top + buttonBounds.height / 2 }
  clearTimeout(typingTimer)
  // 중간 화면이나 애니메이션 완료를 기다리지 않고 즉시 입장합니다.
  intro.hidden = true
  site.hidden = false
  site.inert = false
  document.body.classList.remove('intro-active')
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.querySelector('#hero-title').focus({ preventScroll: true })
  document.dispatchEvent(new Event('intro:entered'))
  if (!motion.matches && typeof site.animate === 'function') playEntryTransition(origin)
})
