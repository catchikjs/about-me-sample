import './style.css'
import { profile, activities, expertise, schools, awards, gallery } from './content.js'

// 루트 assets 폴더의 파일은 Vite가 해시 처리하여 빌드에 포함합니다.
const assets = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,avif,svg}', { eager: true, query: '?url', import: 'default' })
function setImage(image, path, fallback, alt = '') {
  const source = path ? assets[`../${path}`] : null
  if (!source) return
  image.alt = alt
  // 숨겨진 이미지의 지연 로딩 대기를 방지하고, 로딩 완료 후 대체 영역을 교체합니다.
  image.loading = 'eager'
  image.addEventListener('load', () => {
    image.hidden = false
    if (fallback) fallback.hidden = true
  }, { once: true })
  image.addEventListener('error', () => {
    image.hidden = true
    if (fallback) fallback.hidden = false
  }, { once: true })
  image.src = source
}
function cloneTemplate(id) {
  return document.querySelector(id).content.firstElementChild.cloneNode(true)
}

setImage(document.querySelector('#profile-photo'), profile.image, document.querySelector('#profile-fallback'), '수학교사 구정숙 프로필')
activities.forEach((activity, index) => {
  const card = cloneTemplate('#activity-template')
  card.dataset.category = activity.category
  card.querySelector('h3').textContent = activity.title
  card.querySelector('.activity-index').textContent = String(index + 1).padStart(2, '0')
  activity.years.forEach((year) => {
    const badge = document.createElement('span')
    badge.className = 'year-badge'
    badge.textContent = year
    card.querySelector('.year-badges').append(badge)
  })
  if (activity.description) {
    const description = card.querySelector('.activity-description')
    description.textContent = activity.description
    description.hidden = false
  }
  document.querySelector('#activity-list').append(card)
})
expertise.forEach((title, index) => {
  const card = cloneTemplate('#expertise-template')
  card.querySelector('h3').textContent = title
  card.querySelector('.expertise-index').textContent = String(index + 1).padStart(2, '0')
  document.querySelector('#expertise-list').append(card)
})
schools.forEach((name) => {
  const school = document.createElement('span')
  school.textContent = name
  document.querySelector('#school-list').append(school)
})
awards.forEach((award) => {
  const card = cloneTemplate('#award-template')
  card.querySelector('.award-year').textContent = `${award.year} · 수상`
  card.querySelector('h3').textContent = award.title
  card.querySelector('.award-description').textContent = award.description
  setImage(card.querySelector('img'), award.image, card.querySelector('.trophy-frame'), award.imageAlt || award.title)
  document.querySelector('#awards-list').append(card)
})
gallery.forEach((item) => {
  const card = cloneTemplate('#gallery-template')
  card.querySelector('.gallery-country').textContent = item.country
  card.querySelector('.gallery-label').textContent = item.label
  setImage(card.querySelector('img'), item.image, card.querySelector('.gallery-placeholder'), item.alt)
  document.querySelector('#gallery-list').append(card)
})
if (profile.email) {
  const emailLink = document.querySelector('#email-link')
  emailLink.href = `mailto:${profile.email}`
  emailLink.hidden = false
  document.querySelector('#contact-pending').hidden = true
}

const menuToggle = document.querySelector('.menu-toggle')
const navigation = document.querySelector('#navigation')
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false')
  navigation.classList.remove('is-open')
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true'
  menuToggle.setAttribute('aria-expanded', String(!isOpen))
  navigation.classList.toggle('is-open', !isOpen)
})
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu()
    menuToggle.focus()
  }
})
window.matchMedia('(min-width: 981px)').addEventListener('change', closeMenu)

const filters = document.querySelectorAll('.filter')
filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((filter) => {
      filter.classList.toggle('active', filter === button)
      filter.setAttribute('aria-pressed', String(filter === button))
    })
    let visibleCount = 0
    document.querySelectorAll('.activity-card').forEach((card) => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter
      if (!card.hidden) visibleCount += 1
    })
    document.querySelector('#filter-status').textContent = `${visibleCount}개의 교육 활동을 표시합니다.`
  })
})

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.remove('reveal-pending')
      revealObserver.unobserve(entry.target)
    })
  }, { threshold: 0.08 })
  if (!motionPreference.matches) {
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('reveal-pending')
      revealObserver.observe(element)
    })
  }
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      document.querySelectorAll('.reveal-pending').forEach((element) => element.classList.remove('reveal-pending'))
      revealObserver.disconnect()
    }
  })
  const navLinks = [...navigation.querySelectorAll('a')]
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      navLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
    })
  }, { rootMargin: '-15% 0px -60% 0px' })
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section))
}
