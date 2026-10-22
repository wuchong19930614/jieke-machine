// 发信（技术方案 7.1）：通过 Resend 接口发送；本地没有配置密钥时只打印到控制台
export type MailMessage = {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string
  fromName?: string
}

export type MailResult = { ok: true; id?: string; skipped?: boolean } | { ok: false; error: string }

const TIMEOUT_MS = 5000

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  if (!apiKey || !from) {
    // 正文可能含客户资料或密码重置链接，生产环境只记收件人和主题
    const body = process.env.NODE_ENV === 'production' ? '' : `\n${message.text}`
    console.info(`[邮件未发送：未配置 RESEND_API_KEY / MAIL_FROM] 收件人 ${message.to}，主题：${message.subject}${body}`)
    return { ok: true, skipped: true }
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const sender = message.fromName && !from.includes('<') ? `${message.fromName} <${from}>` : from
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: sender,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string }
    if (!res.ok) return { ok: false, error: `${res.status} ${data.name ?? ''} ${data.message ?? ''}`.trim().slice(0, 300) }
    return { ok: true, id: data.id }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    return { ok: false, error: aborted ? '发送超时（5 秒）' : String(error).slice(0, 300) }
  } finally {
    clearTimeout(timer)
  }
}

export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
