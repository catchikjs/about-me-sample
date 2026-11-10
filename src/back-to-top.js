const backToTop = document.querySelector('#back-to-top')
const site = document.querySelector('#site-content')
const topLink = document.querySelector('.header .brand')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let updatePending = false

function syncBackToTop() {
  updatePending = false
  const hidden = site.hidden || window.scrollY <= 320
  if (hidden && document.activeElement === backToTop) topLink.focus({ preventScroll: true })
  backToTop.hidden = hidden
}

window.addEventListener('scroll', () => {
  if (updatePending) return
  updatePending = true
  requestAnimationFrame(syncBackToTop)
}, { passive: true })
window.addEventListener('pageshow', syncBackToTop)
document.addEventListener('intro:entered', syncBackToTop)

backToTop.addEventListener('click', () => {
  // 버튼이 사라져도 초점은 맨 위 메뉴의 로고에 남습니다.
  topLink.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' })
  history.replaceState(history.state, '', '#home')
})

syncBackToTop()
