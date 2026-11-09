const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const motionToggle = document.querySelector('#motion-toggle')
const soundToggle = document.querySelector('#sound-toggle')
let paused = reducedMotion.matches
let soundEnabled = true
let audioContext
let masterVolume

// 아바타 주변 키워드의 움직임을 사용자가 멈출 수 있습니다.
function syncMotion() {
  document.body.classList.toggle('background-paused', paused)
  motionToggle.disabled = reducedMotion.matches
  motionToggle.setAttribute('aria-pressed', String(paused || reducedMotion.matches))
  motionToggle.textContent = reducedMotion.matches ? '움직임 줄이기 적용 중' : paused ? '키워드 움직임 재생' : '키워드 움직임 멈춤'
}
motionToggle.addEventListener('click', () => {
  paused = !paused
  syncMotion()
})
reducedMotion.addEventListener('change', (event) => {
  paused = event.matches
  syncMotion()
})
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled
  if (masterVolume) masterVolume.gain.setTargetAtTime(soundEnabled ? 1 : 0, audioContext.currentTime, .015)
  soundToggle.setAttribute('aria-pressed', String(soundEnabled))
  soundToggle.textContent = soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'
})
syncMotion()

// 사용자가 직접 클릭할 때만 브라우저의 Web Audio로 짧은 효과음을 만듭니다.
async function playClickSound(isEntrance = false) {
  if (!soundEnabled) return
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return
  try {
    audioContext ??= new AudioContextClass()
    if (!masterVolume) {
      masterVolume = audioContext.createGain()
      masterVolume.gain.value = soundEnabled ? 1 : 0
      masterVolume.connect(audioContext.destination)
    }
    if (audioContext.state === 'suspended') await audioContext.resume()
    if (audioContext.state !== 'running' || !soundEnabled) return
    const start = audioContext.currentTime
    if (isEntrance) {
      // 은은한 저음 화음과 공명하는 높은 음에 공간 잔향을 더합니다.
      const reverb = audioContext.createConvolver()
      const wet = audioContext.createGain()
      const impulseLength = Math.floor(audioContext.sampleRate * 1.1)
      const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const samples = impulse.getChannelData(channel)
        let smooth = 0
        for (let index = 0; index < impulseLength; index++) {
          smooth = smooth * .65 + (Math.random() * 2 - 1) * .35
          samples[index] = smooth * (1 - index / impulseLength) ** 3
        }
      }
      reverb.buffer = impulse
      wet.gain.value = .3
      reverb.connect(wet)
      wet.connect(masterVolume)
      const playTone = (frequency, time, length, peak, detune = 0) => {
        const tone = audioContext.createOscillator()
        const envelope = audioContext.createGain()
        tone.type = 'sine'
        tone.frequency.setValueAtTime(frequency, time)
        tone.detune.setValueAtTime(detune, time)
        envelope.gain.setValueAtTime(0, time)
        envelope.gain.linearRampToValueAtTime(peak, time + .09)
        envelope.gain.exponentialRampToValueAtTime(.0001, time + length)
        tone.connect(envelope)
        envelope.connect(masterVolume)
        envelope.connect(reverb)
        tone.start(time)
        tone.stop(time + length + .02)
        tone.onended = () => { tone.disconnect(); envelope.disconnect() }
      }
      // 열린 화음으로 공중에 떠오르는 듯한 느낌을 만듭니다.
      const chord = [220, 329.63, 493.88]
      chord.forEach((frequency, index) => {
        playTone(frequency, start, 1.15, .018, index % 2 ? -5 : 5)
      })
      const melody = [659.25, 987.77, 880, 1318.51]
      melody.forEach((frequency, index) => {
        playTone(frequency, start + .06 + index * .11, .75, .025)
        playTone(frequency * 2.003, start + .06 + index * .11, .6, .004)
      })
      setTimeout(() => { reverb.disconnect(); wet.disconnect() }, 2500)
      return
    }
    const tone = audioContext.createOscillator()
    const volume = audioContext.createGain()
    tone.type = 'sine'
    tone.frequency.setValueAtTime(720, start)
    tone.frequency.exponentialRampToValueAtTime(1080, start + .06)
    volume.gain.setValueAtTime(0, start)
    volume.gain.linearRampToValueAtTime(.055, start + .008)
    volume.gain.exponentialRampToValueAtTime(.001, start + .14)
    tone.connect(volume)
    volume.connect(masterVolume)
    tone.start(start)
    tone.stop(start + .15)
    tone.onended = () => { tone.disconnect(); volume.disconnect() }
  } catch {
    // 소리 재생을 지원하지 않는 환경에서도 메뉴는 정상 작동합니다.
  }
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('#navigation a, .menu-toggle, .button, .filter, [data-topic]')
  if (!button) return
  if (!reducedMotion.matches && button.animate) {
    button.getAnimations().forEach((animation) => animation.cancel())
    button.animate([
      { transform: 'translateY(1px)' },
      { transform: 'translateY(0)' },
    ], { duration: 120, easing: 'ease-out' })
  }
  void playClickSound(button.matches('.intro-enter'))
})
