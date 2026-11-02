const statistics = document.querySelector('.visitor-stats')
const today = document.querySelector('#visitors-today')
const total = document.querySelector('#visitors-total')
const status = document.querySelector('#visitors-status')
let pending = false

async function refreshVisitors() {
  if (pending || document.hidden) return
  pending = true
  try {
    const response = await fetch('/.netlify/functions/visitors', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('Statistics unavailable')
    const counts = await response.json()
    if (!Number.isSafeInteger(counts.today) || !Number.isSafeInteger(counts.total)) throw new Error('Invalid statistics')
    today.textContent = counts.today.toLocaleString('ko-KR')
    total.textContent = counts.total.toLocaleString('ko-KR')
    status.textContent = '한국 시간 기준 · 동일 브라우저 중복 제외'
    statistics.dataset.state = 'ready'
  } catch {
    status.textContent = import.meta.env.DEV ? 'Netlify 배포 후 집계됩니다' : '통계 연결 대기 중'
    statistics.dataset.state = 'unavailable'
  } finally {
    pending = false
  }
}
refreshVisitors()
setInterval(refreshVisitors, 60000)
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshVisitors() })
