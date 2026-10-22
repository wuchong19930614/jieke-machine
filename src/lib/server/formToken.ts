// 表单令牌（技术方案 6.5）：签发时间 + 服务端签名，用于最短填写时间检查，无法伪造
import { derivedKey, hmac, safeEqual } from './secrets'

export const FORM_TOKEN_TTL_SECONDS = 2 * 60 * 60
export const MIN_FILL_MS = 3000

const key = () => derivedKey('form-token')

export function issueFormToken(now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ t: now })).toString('base64url')
  return `${payload}.${hmac(key(), payload)}`
}

export type TokenCheck = { valid: false } | { valid: true; issuedAt: number; ageMs: number }

export function checkFormToken(token: unknown, now = Date.now()): TokenCheck {
  if (typeof token !== 'string' || !token.includes('.')) return { valid: false }
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !safeEqual(signature, hmac(key(), payload))) return { valid: false }
  try {
    const { t } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { t?: number }
    if (typeof t !== 'number') return { valid: false }
    const ageMs = now - t
    if (ageMs < 0 || ageMs > FORM_TOKEN_TTL_SECONDS * 1000) return { valid: false }
    return { valid: true, issuedAt: t, ageMs }
  } catch {
    return { valid: false }
  }
}
