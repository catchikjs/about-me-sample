// 경력·연수는 제공된 원문을 유지합니다. description, image에 추후 자료를 추가할 수 있습니다.
export const profile = {
  email: 'scatchi@kbb.sen.go.kr',
  image: 'assets/profile.png',
}

// 여러 해·여러 분야에 걸친 활동도 하나의 항목으로 관리합니다.
export const activities = [
  { title: 'AI 에듀테크 선도교사단', years: ['2025', '2026'], categories: ['digital', 'leadership'] },
  { title: '강서양천 연수기획단', years: ['2025', '2026'], categories: ['leadership'] },
  { title: '인공지능 교육서비스 선도교사', years: ['2025'], categories: ['digital', 'leadership'] },
  { title: 'AIDT 선도교원', years: ['2025'], categories: ['digital', 'leadership'] },
  { title: '새싹연구교사 (KERIS)', years: ['2026'], categories: ['research'] },
  { title: '수업평가나눔 개념기반 탐구학습 연구분임 분임장', years: ['2026'], categories: ['research', 'leadership'] },
  { title: '천재교육 서논술형 평가 지원 플랫폼 개발 자문위원', years: ['2026'], categories: ['research'] },
  { title: 'SEN스쿨 선도교사', years: ['2025'], categories: ['digital', 'leadership'] },
  { title: '교실혁명 선도교사', years: ['2026'], categories: ['digital', 'leadership'] },
  { title: 'AIEDAP 마스터 교원', years: ['2025'], categories: ['digital', 'leadership'] },
  { title: 'AIEDAP 심화연수', years: ['2026'], categories: ['digital'] },
  { title: 'AI디지털 글로벌 교사연수 대상자 선발', years: ['2025'], categories: ['digital'], description: '프랑스·네덜란드, 7박 8일' },
  { title: 'AI 디지털 활용 수업 평가 전문가 과정', years: ['2025'], categories: ['digital'] },
  { title: 'AI 디지털 활용 수업 평가 프로젝트 1기', years: ['2026'], categories: ['digital', 'research'] },
  { title: '강서양천 수업나눔 한마당 운영', years: ['2025'], categories: ['leadership'] },
  { title: 'AI디지털교과서 현장 적합성 검토진원단', years: ['2024'], categories: ['digital', 'research'] },
  { title: '교육부 주관 특성화고 대표 수업나눔 한마당 부스 운영', years: ['2008'], categories: ['leadership'] },
]

// 연도가 확인된 경력·연수는 위 활동 목록으로 통합하고 중복 표시는 제거합니다.
export const expertise = [
  { title: '디지털수업평가 전문가' },
  { title: '2022 교육과정 수업전문가' },
  { title: '2026 AI지식역량강화 심화연수' },
  { title: '2026 수업평가 연구 전문가 부스터캠프 참석 (1박 2일)', articleUrl: 'https://enews.sen.go.kr/news/view.do?bbsSn=192453&step1=3&step2=1' },
]

export const schools = ['정신여자고등학교', '중동고등학교', '동구고등학교', '마포고등학교', '경복여고', '대일고', '여의도중학교', '영일고등학교']

export const schoolInnovation = [
  { period: '2024~2026', title: 'AI기반 교원학습공동체 리더' },
  { period: '2025.10.23', title: '디지털기반 학생 맞춤교육 선도학교 수업공개' },
  { period: '2025.09.25', title: '디지털 기기활용 수업 학습지 제작 세미나 강사' },
  { period: '2023~2025', title: '서울형마이스터선도학교 운영 담당부장' },
  { period: '2025', title: '디지털 기반 학생 맞춤교육 워크숍 진행' },
  { period: '2025', title: '디지털 기반 수업설계 공동연구 진행' },
  { period: '—', title: '전교사 1인 1프로젝트 수업 시행 기획 및 운영' },
]

export const awards = [
  { year: '2025', title: '디지털교육부문 교육부장관상', description: 'AI·디지털 교육을 향한 연구와 실천을 이어 갑니다.', image: '', imageAlt: '' },
]

// 실제 제공된 해외연수 사진입니다. 국가가 확인되지 않은 사진은 임의로 지정하지 않습니다.
export const gallery = [
  { image: 'assets/training-01.jpg', thumbnail: 'assets/training-01-thumb.jpg', alt: '해외 교육 전시회 방문증을 함께 모아 촬영한 사진' },
  { image: 'assets/training-02.jpg', thumbnail: 'assets/training-02-thumb.jpg', alt: '교육 전시회 현장과 방문증을 촬영한 사진' },
  { image: 'assets/training-03.jpg', thumbnail: 'assets/training-03-thumb.jpg', alt: 'UNESCO 방문 출입증을 촬영한 사진' },
  { image: 'assets/training-04.jpg', thumbnail: 'assets/training-04-thumb.jpg', alt: '얼굴을 블러 처리한 해외 학교 실내 연수단 단체 사진' },
  { image: 'assets/training-05.jpg', thumbnail: 'assets/training-05-thumb.jpg', alt: '얼굴을 블러 처리한 에펠탑 앞 연수 참가자 사진' },
  { image: 'assets/training-06.jpg', thumbnail: 'assets/training-06-thumb.jpg', alt: '얼굴을 블러 처리한 해외 학교 앞 연수단 단체 사진' },
]
