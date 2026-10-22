// 定时任务调用校验（技术方案 6.4）：请求头必须带 Authorization: Bearer {CRON_SECRET}
import { safeEqual } from './secrets'

export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get('authorization') ?? ''
  return safeEqual(header, `Bearer ${secret}`)
}

export const unauthorized = () => Response.json({ ok: false, code: 'UNAUTHORIZED' }, { status: 401 })
