// 访客 IP 只存哈希值（技术方案 3.7）：带密钥的 HMAC，不能通过穷举 IP 反推
import { derivedKey, hmac } from './secrets'

export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') ?? '0.0.0.0'
}

export function hashIp(ip: string): string {
  return hmac(derivedKey('ip-hash', process.env.IP_HASH_SECRET), ip).slice(0, 32)
}

export async function readJson(request: Request, maxBytes = 64 * 1024): Promise<unknown> {
  const text = await request.text()
  if (text.length > maxBytes) throw new Error('请求内容过大')
  return text ? JSON.parse(text) : {}
}
