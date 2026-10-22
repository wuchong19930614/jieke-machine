// Payload 自带邮件（后台"忘记密码"等）也走 Resend，与询盘邮件共用一套发信配置
import type { EmailAdapter, SendEmailOptions } from 'payload'

import { sendMail } from './mail'

type Address = string | { name?: string; address: string }

const addressesOf = (value: SendEmailOptions['to']): string[] => {
  const list = (Array.isArray(value) ? value : value ? [value] : []) as Address[]
  return list.map((item) => (typeof item === 'string' ? item : item.address)).filter(Boolean)
}

const htmlToText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h\d|li)>/gi, '\n')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

export const resendEmailAdapter: EmailAdapter = () => ({
  name: 'resend',
  defaultFromAddress: process.env.MAIL_FROM || 'no-reply@localhost',
  defaultFromName: 'Website Admin',
  sendEmail: async (message) => {
    const html = typeof message.html === 'string' ? message.html : ''
    const text = typeof message.text === 'string' ? message.text : htmlToText(html)
    const subject = message.subject ?? ''
    const results = await Promise.all(addressesOf(message.to).map((to) => sendMail({ to, subject, text, html: html || text })))
    const failed = results.find((result) => !result.ok)
    if (failed && !failed.ok) throw new Error(`邮件发送失败：${failed.error}`)
    return results
  },
})
