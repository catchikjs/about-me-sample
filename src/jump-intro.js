import jumpingPoseUrl from './assets/curly-girl-jump.png'

const intro = document.querySelector('#jump-intro')
const site = document.querySelector('#site-content')
const jumpButton = document.querySelector('#jump-button')
const buttonLabel = document.querySelector('#jump-button-label')
const character = document.querySelector('#jump-character')
const characterImage = character.querySelector('img')
const standingPoseUrl = characterImage.src
const jumpingPose = new Image()
jumpingPose.src = jumpingPoseUrl
const shadow = document.querySelector('#jump-shadow')
const wallSwitch = document.querySelector('#welcome-switch')
const switchCaption = document.querySelector('#switch-caption')
const status = document.querySelector('#jump-status')
const meter = document.querySelector('#jump-power-meter')
const meterFill = document.querySelector('#jump-power-fill')
const bubble = document.querySelector('#jump-bubble')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const events = new AbortController()
const chargeDuration = 1100
const readyCharge = .62
let phase = 'loading'
let active = false
let inputSource = null
let inputKey = ''
let chargeStarted = 0
let charge = 0
let frame = 0
let transitionTimer = 0
let suppressedClickUntil = 0
let visibilityPause = 0
let animationStep

function updateCharge(value) {
  charge = Math.max(0, Math.min(1, value))
  const percent = Math.round(charge * 100)
  meterFill.style.width = `${percent}%`
  meter.setAttribute('aria-valuenow', String(percent))
  meter.setAttribute('aria-valuetext', `${percent}%, ${charge >= readyCharge ? '놓으면 충분히 높이 점프해요' : '힘을 더 모아주세요'}`)
  intro.classList.toggle('is-ready', charge >= readyCharge)
}

function setCharacter(lift = 0, scaleX = 1, scaleY = 1, rotation = 0, reach = 0) {
  character.style.transform = `translate(calc(-50% - ${reach}px), ${-lift}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`
}

function resetCharge() {
  cancelAnimationFrame(frame)
  inputSource = null
  inputKey = ''
  intro.classList.remove('is-charging', 'is-ready')
  updateCharge(0)
  setCharacter()
}

function beginCharge(source, key = '') {
  if (!active || !['idle', 'retry'].includes(phase)) return
  phase = 'charging'
  inputSource = source
  inputKey = key
  chargeStarted = performance.now()
  intro.classList.remove('is-retry')
  intro.classList.add('is-charging')
  status.textContent = '조금만 더… 초록색이 되면 놓아주세요!'
  buttonLabel.textContent = '힘을 모으는 중…'
  bubble.textContent = '하나, 둘…!'
  let announcedReady = false
  animationStep = (now) => {
    updateCharge((now - chargeStarted) / chargeDuration)
    if (!reducedMotion.matches) setCharacter(0, 1 + charge * .08, 1 - charge * .1)
    if (charge >= readyCharge && !announcedReady) {
      announcedReady = true
      status.textContent = '준비됐어요! 이제 손을 놓아주세요.'
      buttonLabel.textContent = '지금 놓으면 점프!'
      bubble.textContent = '이제 뛸 수 있어!'
    }
    frame = requestAnimationFrame(animationStep)
  }
  frame = requestAnimationFrame(animationStep)
}

function celebrate() {
  intro.classList.add('is-success')
  intro.classList.remove('is-ready')
  wallSwitch.setAttribute('aria-label', '켜진 환영 스위치')
  switchCaption.textContent = 'HELLO, ON!'
  document.dispatchEvent(new Event('intro:success'))
  status.textContent = '성공! 불이 환하게 켜졌어요.'
  buttonLabel.textContent = '성공! 만나러 가요'
  bubble.textContent = '와, 환해졌어!'
  if (!reducedMotion.matches) {
    const colors = ['#ffe600', '#a467ff', '#ff408e', '#00dcb0']
    document.querySelector('#jump-confetti').replaceChildren(...Array.from({ length: 22 }, (_, index) => {
      const piece = document.createElement('span')
      piece.style.setProperty('--x', `${(Math.random() - .5) * 460}px`)
      piece.style.setProperty('--y', `${100 + Math.random() * 230}px`)
      piece.style.setProperty('--turn', `${(Math.random() - .5) * 720}deg`)
      piece.style.setProperty('--delay', `${index % 4 * 25}ms`)
      piece.style.backgroundColor = colors[index % colors.length]
      return piece
    }))
  }
}

function jump(power) {
  if (!active || phase === 'jumping' || phase === 'success') return
  cancelAnimationFrame(frame)
  phase = 'jumping'
  inputSource = null
  inputKey = ''
  intro.classList.remove('is-charging', 'is-retry')
  intro.classList.add('is-jumping')
  setCharacter()
  jumpButton.disabled = true
  buttonLabel.textContent = '폴짝!'
  status.textContent = '꼬마가 점프하고 있어요!'
  const body = character.getBoundingClientRect()
  const target = wallSwitch.querySelector('.switch-knob').getBoundingClientRect()
  const useJumpingPose = jumpingPose.complete && jumpingPose.naturalWidth > 0
  if (useJumpingPose) characterImage.src = jumpingPoseUrl
  // The raised hand sits at 77% of the sprite width and 12% of its height.
  const handOffset = useJumpingPose ? body.height * .12 : 0
  const requiredHeight = Math.max(30, body.top + handOffset - (target.top + target.height / 2))
  const height = requiredHeight * (.22 + power * .78 / readyCharge)
  const success = power >= readyCharge
  const duration = reducedMotion.matches ? 480 : 880
  let started = performance.now()
  let touchedSwitch = false
  animationStep = (now) => {
    if (visibilityPause) {
      started += now - visibilityPause
      visibilityPause = 0
    }
    const progress = Math.min(1, (now - started) / duration)
    const lift = Math.sin(progress * Math.PI) * height
    if (!reducedMotion.matches) {
      const reach = useJumpingPose ? Math.sin(progress * Math.PI) * body.width * .27 : 0
      setCharacter(lift, 1, 1, Math.sin(progress * Math.PI * 2) * -4, reach)
      const scale = 1 - Math.sin(progress * Math.PI) * .4
      shadow.style.transform = `translateX(-50%) scale(${scale})`
      shadow.style.opacity = String(.32 - Math.sin(progress * Math.PI) * .15)
    }
    if ((reducedMotion.matches ? progress >= .46 : lift >= requiredHeight * .99) && success && !touchedSwitch) {
      touchedSwitch = true
      celebrate()
    }
    if (progress < 1) {
      frame = requestAnimationFrame(animationStep)
      return
    }
    intro.classList.remove('is-jumping')
    shadow.style.removeProperty('transform')
    shadow.style.removeProperty('opacity')
    characterImage.src = standingPoseUrl
    setCharacter()
    if (success) {
      phase = 'success'
      transitionTimer = setTimeout(() => revealSite(true), reducedMotion.matches ? 300 : 1250)
    } else {
      phase = 'retry'
      intro.classList.add('is-retry')
      jumpButton.disabled = false
      status.textContent = '조금만 더 높이! 초록색까지 모아서 다시 폴짝.'
      buttonLabel.textContent = '한 번 더, 꾹 눌렀다 놓기'
      bubble.textContent = '조금만 더 모아볼까?'
      updateCharge(0)
      jumpButton.focus({ preventScroll: true })
    }
  }
  frame = requestAnimationFrame(animationStep)
}

function releaseCharge(source) {
  if (phase !== 'charging' || inputSource !== source) return
  const power = Math.max(charge, Math.min(1, (performance.now() - chargeStarted) / chargeDuration))
  suppressedClickUntil = performance.now() + 500
  jump(power)
}

function cancelCharge() {
  if (phase !== 'charging') return
  resetCharge()
  phase = 'idle'
  buttonLabel.textContent = '꾹 눌렀다가, 놓으면 점프!'
  status.textContent = '다시 꾹 눌러 힘을 모아주세요.'
  bubble.textContent = '저 위에 불을 켜볼까?'
}

function revealSite(withTransition = false) {
  if (!active) return
  active = false
  phase = 'complete'
  cancelAnimationFrame(frame)
  clearTimeout(transitionTimer)
  events.abort()
  site.hidden = false
  site.inert = false
  document.body.classList.remove('jump-intro-active')
  intro.hidden = true
  if (withTransition && !reducedMotion.matches && typeof site.animate === 'function') {
    site.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' })
  }
  window.scrollTo({ top: 0, behavior: 'instant' })
  document.querySelector('#hero-title').focus({ preventScroll: true })
  document.dispatchEvent(new Event('intro:entered'))
}

function startIntro() {
  // Existing section links open directly, and loading errors leave the introduction available.
  if (location.hash && document.querySelector('#site-content').querySelector(`[id="${CSS.escape(location.hash.slice(1))}"]`)) return
  if (active || (characterImage.complete && !characterImage.naturalWidth)) return
  active = true
  phase = characterImage.naturalWidth ? 'idle' : 'loading'
  intro.hidden = false
  site.hidden = true
  site.inert = true
  document.body.classList.add('jump-intro-active')
  window.scrollTo({ top: 0, behavior: 'instant' })
  setCharacter()
  const options = { signal: events.signal }
  if (phase === 'loading') {
    jumpButton.disabled = true
    status.textContent = '꼬마가 점프를 준비하고 있어요…'
    characterImage.addEventListener('load', () => {
      if (!active || phase !== 'loading') return
      phase = 'idle'
      jumpButton.disabled = false
      status.textContent = '꾹 눌러 힘을 모아주세요.'
    }, { ...options, once: true })
    characterImage.addEventListener('error', () => revealSite(), { ...options, once: true })
  }

  jumpButton.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary) return
    event.preventDefault()
    jumpButton.focus({ preventScroll: true })
    beginCharge('pointer')
    if (phase === 'charging') jumpButton.setPointerCapture(event.pointerId)
  }, options)
  jumpButton.addEventListener('pointerup', (event) => {
    releaseCharge('pointer')
    if (jumpButton.hasPointerCapture(event.pointerId)) jumpButton.releasePointerCapture(event.pointerId)
  }, options)
  jumpButton.addEventListener('pointercancel', cancelCharge, options)
  jumpButton.addEventListener('lostpointercapture', cancelCharge, options)
  jumpButton.addEventListener('click', (event) => {
    if (event.detail === 0 && performance.now() > suppressedClickUntil && ['idle', 'retry'].includes(phase)) jump(.8)
  }, options)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') return cancelCharge()
    if (![' ', 'ArrowUp', 'Enter'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.target.closest('a, button:not(#jump-button), input, textarea, select')) return
    event.preventDefault()
    if (!event.repeat) beginCharge('keyboard', event.key)
  }, options)
  document.addEventListener('keyup', (event) => {
    if (event.key !== inputKey || inputSource !== 'keyboard') return
    event.preventDefault()
    releaseCharge('keyboard')
  }, options)
  document.querySelector('#jump-skip').addEventListener('click', () => revealSite(), options)
  document.querySelector('.jump-intro-brand').addEventListener('click', (event) => {
    event.preventDefault()
    revealSite()
  }, options)
  window.addEventListener('blur', cancelCharge, options)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (phase === 'charging') cancelCharge()
      else if (phase === 'jumping') {
        cancelAnimationFrame(frame)
        visibilityPause = performance.now()
      }
    } else if (phase === 'jumping' && visibilityPause) frame = requestAnimationFrame(animationStep)
  }, options)
}

startIntro()
