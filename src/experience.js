const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const motionToggle = document.querySelector('#motion-toggle')
const soundToggle = document.querySelector('#sound-toggle')
let paused = reducedMotion.matches
let soundEnabled = true
let audioContext
let masterVolume
let resumePromise
let entrancePreparation
let entranceArmed = false
let entrancePlayed = false

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

// 점프 입력 중 오디오를 준비해, 애니메이션 뒤에도 모바일에서 소리가 나게 합니다.
async function prepareAudio() {
  if (!soundEnabled) return false
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return false
  try {
    audioContext ??= new AudioContextClass()
    if (!masterVolume) {
      masterVolume = audioContext.createGain()
      masterVolume.gain.value = soundEnabled ? 1 : 0
      masterVolume.connect(audioContext.destination)
    }
    if (audioContext.state !== 'running' && audioContext.state !== 'closed') {
      resumePromise ??= audioContext.resume().finally(() => { resumePromise = null })
      await resumePromise
    }
    return audioContext.state === 'running' && soundEnabled
  } catch {
    return false
  }
}

function playEntranceFanfare(start) {
  const reverb = audioContext.createConvolver()
  const wet = audioContext.createGain()
  const impulseLength = Math.floor(audioContext.sampleRate * 1.25)
  const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const samples = impulse.getChannelData(channel)
    for (let index = 0; index < impulseLength; index++) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / impulseLength) ** 3
    }
  }
  reverb.buffer = impulse
  wet.gain.value = .18
  reverb.connect(wet)
  wet.connect(masterVolume)
  const playTone = (frequency, time, length, peak, type = 'sine') => {
    const tone = audioContext.createOscillator()
    const envelope = audioContext.createGain()
    tone.type = type
    tone.frequency.setValueAtTime(frequency, time)
    envelope.gain.setValueAtTime(0, time)
    envelope.gain.linearRampToValueAtTime(peak, time + .012)
    envelope.gain.exponentialRampToValueAtTime(.0001, time + length)
    tone.connect(envelope)
    envelope.connect(masterVolume)
    envelope.connect(reverb)
    tone.start(time)
    tone.stop(time + length + .02)
    tone.onended = () => { tone.disconnect(); envelope.disconnect() }
  }
  const playBurst = (time, duration, peak, rising) => {
    const source = audioContext.createBufferSource()
    const filter = audioContext.createBiquadFilter()
    const envelope = audioContext.createGain()
    const noise = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate)
    const samples = noise.getChannelData(0)
    for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1
    source.buffer = noise
    filter.type = 'bandpass'
    filter.Q.value = .7
    filter.frequency.setValueAtTime(rising ? 350 : 3000, time)
    filter.frequency.exponentialRampToValueAtTime(rising ? 6500 : 700, time + duration)
    envelope.gain.setValueAtTime(.0001, time)
    envelope.gain.exponentialRampToValueAtTime(peak, time + duration * .35)
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration)
    source.connect(filter)
    filter.connect(envelope)
    envelope.connect(masterVolume)
    envelope.connect(reverb)
    source.start(time)
    source.stop(time + duration)
    source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect() }
  }

  // 슈욱 올라오는 소리 → 팡 → 맑은 벨 아르페지오와 밝은 장조 화음.
  playBurst(start, .38, .045, true)
  playBurst(start + .3, .18, .08, false)
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093]
  notes.forEach((frequency, index) => {
    const time = start + .08 + index * .075
    playTone(frequency, time, .8, .035)
    playTone(frequency * 2.003, time, .45, .006)
  })
  const chord = [261.63, 329.63, 392, 523.25]
  chord.forEach((frequency) => {
    playTone(frequency, start + .31, 1.5, .025, 'triangle')
  })
  const sparkles = [1567.98, 2093, 2637.02, 3135.96, 2093]
  sparkles.forEach((frequency, index) => {
    playTone(frequency, start + .7 + index * .11, .65, .018)
  })
  setTimeout(() => { reverb.disconnect(); wet.disconnect() }, 3500)
}

async function playClickSound(isEntrance = false) {
  if (!soundEnabled) return
  try {
    if (isEntrance) {
      // 활성화가 막힌 경우 나중의 무관한 클릭에서 팡파르가 재생되지 않게 합니다.
      await Promise.race([entrancePreparation, new Promise((resolve) => setTimeout(resolve, 300))])
      if (!soundEnabled || audioContext?.state !== 'running') return
    } else if (!await prepareAudio()) return
    const start = audioContext.currentTime
    if (isEntrance) {
      playEntranceFanfare(start)
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

function armEntranceSound(event) {
  if (document.querySelector('#jump-intro')?.hidden !== false || !soundEnabled) return
  if (event.type === 'keydown') {
    if (event.repeat || ![' ', 'Enter', 'ArrowUp'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return
  } else if (!event.target.closest('#jump-button')) return
  entranceArmed = true
  entrancePreparation = prepareAudio()
}
for (const type of ['pointerdown', 'pointerup', 'keydown', 'click']) {
  document.addEventListener(type, armEntranceSound, { capture: true })
}
// 스위치가 켜지는 접촉 성공 순간에만 팡파르를 재생합니다.
document.addEventListener('intro:success', () => {
  if (!entranceArmed || entrancePlayed) return
  entrancePlayed = true
  void playClickSound(true)
})
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
  void playClickSound()
})
