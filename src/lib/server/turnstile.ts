// Cloudflare Turnstile 人机验证（预留，后台开启后才校验；技术方案 4.5）
export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (typeof token !== 'string' || !token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    })
    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch {
    return false
  }
}
