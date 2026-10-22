// 由环境变量派生各用途的密钥，避免同一把密钥直接用在多个地方
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const base = (): string => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('缺少环境变量 PAYLOAD_SECRET')
  return secret
}

export const derivedKey = (purpose: string, explicit?: string): Buffer =>
  createHash('sha256').update(`${purpose}:${explicit || base()}`).digest()

export const hmac = (key: Buffer, value: string): string => createHmac('sha256', key).update(value).digest('base64url')

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}
