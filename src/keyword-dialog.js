import { activities, expertise, schools, awards } from './content.js'

// 팝업은 기존 소개와 content.js의 사실을 재사용합니다.
const topics = {
  math: {
    title: '구쌤의 수학교실', icon: 'book', href: 'https://jsku-class2.streamlit.app/', link: '수학교실 열기 (새 탭)', external: true,
    description: '구쌤의 수학교실로 이동됩니다',
    items: [],
  },
  ai: {
    title: 'AI, 배움을 위한 도구', icon: 'spark', href: '#activities', link: '교육 활동 전체 보기',
    description: '새로운 기술을 활용하되 언제나 학생의 배움을 중심에 둡니다. 교실의 실천을 AI와 디지털 교육의 변화로 연결합니다.',
    items: activities.filter((item) => item.categories.includes('digital')).slice(0, 5).map((item) => ({ text: item.title, period: item.years.join(', ') })),
  },
  sharing: {
    title: '함께 나누며 자랍니다', icon: 'people', href: '#sharing', link: '강의와 수업 나눔 보기',
    description: '수업 연구와 실천 경험을 나누며 함께 성장하는 교육 공동체를 지향합니다. AI 수업, 수업과 평가, 기초학력, 교사 성장을 주제로 나눕니다.',
    items: ['서울시 직업계고 수학교사 대상 기초학력향상 디지털수업연수', `강의 및 연수 활동 학교: ${schools.join(', ')}`, 'AI 기반 교원학습공동체 리더 (2024~2026)'],
  },
  research: {
    title: '오늘도 배우는 교사', icon: 'spark', href: '#expertise', link: '전문성과 연수 살펴보기',
    description: '연구하는 마음은 배움에 대한 겸손이요, 학생들을 향한 가장 깊은 사랑이다. 끊임없는 배움으로 교육 전문성을 확장합니다.',
    items: [...expertise.slice(0, 3).map((item) => item.title), ...awards.map((item) => `${item.year} ${item.title}`)],
  },
  global: {
    title: '세상에서 만난 배움', icon: 'globe', href: '#global', link: '해외연수 기록 보기',
    description: '세계의 교육을 경험하고, 교실의 새로운 가능성을 탐색합니다. 프랑스와 네덜란드에서 AI 디지털 교육의 배움을 이어 갔습니다.',
    items: [
      { text: 'AI 디지털 해외 글로벌 연수, 프랑스와 네덜란드', period: '2026.01' },
      'AI 디지털 글로벌 교사연수 대상자 선발 (2025)',
      '교육 전시회와 UNESCO 방문, 해외 학교 연수의 기록',
      'AI디지털부문 교육부장관상 수상(2025)',
    ],
  },
}

function setupKeywords() {
  const dialog = document.querySelector('#keyword-dialog')
  const stage = document.querySelector('.hero-visual')
  const links = [...document.querySelectorAll('[data-topic]')]
  const title = document.querySelector('#keyword-dialog-title')
  const description = document.querySelector('#keyword-dialog-description')
  const list = document.querySelector('#keyword-dialog-list')
  const detailLink = document.querySelector('#keyword-dialog-link')
  let trigger
  let restoreFocus = true
  let pointerStartedOnBackdrop = false

  if (!dialog || typeof dialog.showModal !== 'function') return

  links.forEach((link) => {
    link.setAttribute('aria-controls', dialog.id)
    link.setAttribute('aria-expanded', 'false')
    link.addEventListener('click', (event) => {
      const topic = topics[link.dataset.topic]
      if (!topic) return
      // 키워드는 안내 팝업만 열고, 실제 이동은 팝업 안 링크에서 실행합니다.
      event.preventDefault()
      trigger = link
      restoreFocus = true
      title.textContent = topic.title
      description.textContent = topic.description
      document.querySelector('#keyword-dialog-icon').setAttribute('href', `#icon-${topic.icon}`)
      detailLink.href = topic.href
      detailLink.textContent = topic.link
      if (topic.external) {
        detailLink.target = '_blank'
        detailLink.rel = 'noopener noreferrer'
      } else {
        detailLink.removeAttribute('target')
        detailLink.removeAttribute('rel')
      }
      list.hidden = topic.items.length === 0
      list.replaceChildren(...topic.items.map((item) => {
        const li = document.createElement('li')
        if (typeof item === 'string') li.textContent = item
        else {
          const period = document.createElement('span')
          period.className = 'detail-period'
          period.textContent = item.period
          li.append(period, document.createTextNode(item.text))
        }
        return li
      }))
      link.closest('.keyword-item').classList.add('is-dismissed')
      link.setAttribute('aria-expanded', 'true')
      document.body.classList.add('keyword-dialog-open')
      dialog.showModal()
      // 긴 팝업도 제목부터 읽을 수 있도록 스크롤 위치와 초점을 함께 맞춥니다.
      dialog.scrollTop = 0
      title.focus({ preventScroll: true })
    })
    const item = link.closest('.keyword-item')
    item.addEventListener('pointerleave', () => item.classList.remove('is-dismissed'))
    item.addEventListener('focusout', () => item.classList.remove('is-dismissed'))
  })

  document.querySelector('#keyword-close').addEventListener('click', () => dialog.close())
  dialog.addEventListener('pointerdown', (event) => {
    pointerStartedOnBackdrop = event.target === dialog
  })
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && pointerStartedOnBackdrop) dialog.close()
    pointerStartedOnBackdrop = false
  })
  dialog.addEventListener('close', () => {
    document.body.classList.remove('keyword-dialog-open')
    trigger?.setAttribute('aria-expanded', 'false')
    if (restoreFocus) trigger?.focus({ preventScroll: true })
    trigger?.closest('.keyword-item').classList.add('is-dismissed')
  })
  detailLink.addEventListener('click', (event) => {
    if (detailLink.origin !== location.origin || !detailLink.hash) return
    const section = document.querySelector(detailLink.hash)
    if (!section) return
    event.preventDefault()
    restoreFocus = false
    dialog.close()
    const heading = section.querySelector('h2')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
    section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    history.replaceState(null, '', detailLink.hash)
  })
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || dialog.open) return
    stage.querySelectorAll('.keyword-item:hover, .keyword-item:focus-within').forEach((item) => item.classList.add('is-dismissed'))
  })

  let inView = true
  const syncMotion = () => stage.classList.toggle('is-running', inView && !document.hidden)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      syncMotion()
    }, { threshold: .1 }).observe(stage)
  } else syncMotion()
  document.addEventListener('visibilitychange', syncMotion)
}

setupKeywords()
