import { getStore } from '@netlify/blobs'
import { randomUUID } from 'node:crypto'

const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' }
const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } })

export function koreanDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

// 방문자별 고유 키를 저장해 동시 방문 시에도 카운터 덮어쓰기를 방지합니다.
export async function countVisitors(store, visitorId, date) {
  await Promise.all([
    store.set(`visitors/${visitorId}`, '', { onlyIfNew: true }),
    store.set(`days/${date}/${visitorId}`, '', { onlyIfNew: true }),
  ])
  const [total, today] = await Promise.all([
    store.list({ prefix: 'visitors/' }),
    store.list({ prefix: `days/${date}/` }),
  ])
  return { total: total.blobs.length, today: today.blobs.length, date }
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Forbidden' }, 403)
  const savedId = request.headers.get('cookie')?.match(/(?:^|;\s*)educator_visitor=([a-f0-9-]{36})(?:;|$)/)?.[1]
  const visitorId = savedId || randomUUID()
  try {
    const store = getStore({ name: process.env.CONTEXT && process.env.CONTEXT !== 'production' ? 'visitor-statistics-preview' : 'visitor-statistics', consistency: 'strong' })
    const counts = await countVisitors(store, visitorId, koreanDate())
    return json(counts, 200, {
      'Set-Cookie': `educator_visitor=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
    })
  } catch (error) {
    console.error('Visitor statistics unavailable:', error.message)
    return json({ error: '방문 통계를 불러오지 못했습니다.' }, 503)
  }
}
