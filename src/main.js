import '@fontsource/hedvig-letters-serif/latin-400.css'
import '@fontsource-variable/noto-sans-kr'
import '@fontsource/jua/korean-400.css'
import './style.css'
import './pop-theme.css'
import './jump-intro.css'
import './jump-intro.js'
import './back-to-top.css'
import './section-layout.css'
import './back-to-top.js'
import './visitors.js'
import './experience.js'
import './keyword-dialog.js'
import { categoryLabels, matchesActivityFilter } from './activity-filters.js'
import { profile, activities, expertise, schools, schoolInnovation, awards, gallery } from './content.js'

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

const activityGroups = new Map()
const sortedActivities = [...activities].sort((a, b) => Math.max(0, ...b.years.map(Number)) - Math.max(0, ...a.years.map(Number)))
sortedActivities.forEach((activity) => {
  const year = activity.years.length ? String(Math.max(...activity.years.map(Number))) : '연도 미지정'
  if (!activityGroups.has(year)) {
    const group = document.createElement('tbody')
    group.className = 'activity-year-group'
    group.setAttribute('aria-label', `${year}년 활동`)
    document.querySelector('#activity-list').append(group)
    activityGroups.set(year, group)
  }
  const card = cloneTemplate('#activity-template')
  card.dataset.categories = activity.categories.join(' ')
  card.querySelector('h3').textContent = activity.title
  activity.categories.forEach((category) => {
    const tag = document.createElement('span')
    tag.className = `activity-category-tag category-${category}`
    tag.textContent = categoryLabels[category]
    card.querySelector('.activity-category').append(tag)
  })
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
  activityGroups.get(year).append(card)
})
expertise.forEach((item, index) => {
  const card = cloneTemplate('#expertise-template')
  card.querySelector('h3').textContent = item.title
  if (item.articleUrl) {
    const link = card.querySelector('.expertise-article-link')
    link.href = item.articleUrl
    link.hidden = false
    card.classList.add('expertise-with-article')
  }
  card.querySelector('.expertise-index').textContent = String(index + 1).padStart(2, '0')
  document.querySelector('#expertise-list').append(card)
})
schools.forEach((name, index) => {
  const row = document.createElement('tr')
  const number = document.createElement('td')
  number.textContent = String(index + 1).padStart(2, '0')
  const school = document.createElement('th')
  school.scope = 'row'
  school.textContent = name
  row.append(number, school)
  document.querySelector('#school-list').append(row)
})
schoolInnovation.forEach((activity, index) => {
  const row = document.createElement('tr')
  const number = document.createElement('td')
  number.textContent = String(index + 1).padStart(2, '0')
  const period = document.createElement('td')
  period.textContent = activity.period
  if (activity.period === '—') period.setAttribute('aria-label', '기간 미기재')
  const title = document.createElement('th')
  title.scope = 'row'
  title.textContent = activity.title
  row.append(number, period, title)
  document.querySelector('#school-innovation-list').append(row)
})
awards.forEach((award) => {
  const card = cloneTemplate('#award-template')
  card.querySelector('.award-year').textContent = `${award.year} 수상`
  card.querySelector('h3').textContent = award.title
  card.querySelector('.award-description').textContent = award.description
  setImage(card.querySelector('img'), award.image, card.querySelector('.trophy-frame'), award.imageAlt || award.title)
  document.querySelector('#awards-list').append(card)
})
const galleryPhotos = gallery.map((item) => ({ ...item, src: assets[`../${item.image}`], thumb: assets[`../${item.thumbnail}`] }))
galleryPhotos.forEach((item, index) => {
  const card = cloneTemplate('#gallery-template')
  const button = card.querySelector('button')
  const image = card.querySelector('img')
  image.src = item.thumb
  image.alt = item.alt
  button.dataset.photoIndex = String(index)
  button.setAttribute('aria-label', `${item.alt} 크게 보기`)
  card.querySelector('figcaption').textContent = `연수의 기록 ${String(index + 1).padStart(2, '0')}`
  document.querySelector('#gallery-list').append(card)
})
const photoDialog = document.querySelector('#photo-dialog')
const largePhoto = document.querySelector('#photo-dialog-image')
const photoCaption = document.querySelector('#photo-dialog-caption')
let currentPhoto = 0
let galleryTrigger
function showPhoto(index) {
  currentPhoto = (index + galleryPhotos.length) % galleryPhotos.length
  const item = galleryPhotos[currentPhoto]
  largePhoto.src = item.src
  largePhoto.alt = item.alt
  photoCaption.textContent = `${currentPhoto + 1} / ${galleryPhotos.length}, ${item.alt}`
}
document.querySelector('#gallery-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-photo-index]')
  if (!button) return
  galleryTrigger = button
  showPhoto(Number(button.dataset.photoIndex))
  photoDialog.showModal()
  document.body.classList.add('photo-dialog-open')
})
document.querySelector('#photo-close').addEventListener('click', () => photoDialog.close())
document.querySelector('#photo-prev').addEventListener('click', () => showPhoto(currentPhoto - 1))
document.querySelector('#photo-next').addEventListener('click', () => showPhoto(currentPhoto + 1))
photoDialog.addEventListener('click', (event) => { if (event.target === photoDialog) photoDialog.close() })
photoDialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    showPhoto(currentPhoto + (event.key === 'ArrowLeft' ? -1 : 1))
  }
})
photoDialog.addEventListener('close', () => {
  document.body.classList.remove('photo-dialog-open')
  largePhoto.removeAttribute('src')
  galleryTrigger?.focus({ preventScroll: true })
})
if (profile.email) {
  const emailLink = document.querySelector('#email-link')
  emailLink.href = `mailto:${profile.email}`
  document.querySelectorAll('[data-email-address]').forEach((address) => { address.textContent = profile.email })
  emailLink.hidden = false
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
  const count = activities.filter((activity) => matchesActivityFilter(activity.categories, button.dataset.filter)).length
  const badge = document.createElement('span')
  badge.className = 'filter-count'
  badge.textContent = String(count)
  button.append(badge)
})
document.querySelector('#filter-status').textContent = `${activities.length}개의 교육 활동을 표시합니다.`
filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((filter) => {
      filter.classList.toggle('active', filter === button)
      filter.setAttribute('aria-pressed', String(filter === button))
    })
    let visibleCount = 0
    document.querySelectorAll('.activity-card').forEach((card) => {
      card.hidden = !matchesActivityFilter(card.dataset.categories.split(' '), button.dataset.filter)
      if (!card.hidden) visibleCount += 1
    })
    document.querySelectorAll('.activity-year-group').forEach((group) => {
      group.hidden = ![...group.querySelectorAll('.activity-card')].some((card) => !card.hidden)
    })
    document.querySelector('#filter-status').textContent = `${visibleCount}개의 교육 활동을 표시합니다.`
  })
})

if ('IntersectionObserver' in window) {
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
