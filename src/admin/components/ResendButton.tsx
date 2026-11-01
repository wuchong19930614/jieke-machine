'use client'
// 询盘详情侧栏的“重新发送”按钮，调用 6.2 节接口
import { Button, toast, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Target = 'notify' | 'autoReply'

const STATUS_TEXT: Record<string, string> = { pending: '待发送', sent: '已发送', failed: '失败', skipped: '不发送' }

// 接口只返回错误代码时，换成业务人员看得懂的说明
const CODE_TEXT: Record<string, string> = {
  UNAUTHORIZED: '登录已过期，请刷新页面重新登录',
  FORBIDDEN: '当前账号没有重新发送邮件的权限',
  NOT_FOUND: '找不到这条询盘，可能已被删除',
}

export function ResendButton() {
  const { id } = useDocumentInfo()
  const router = useRouter()
  const [busy, setBusy] = useState<Target | null>(null)
  const notifyStatus = useFormFields(([fields]) => fields.notifyStatus?.value as string | undefined)
  const autoReplyStatus = useFormFields(([fields]) => fields.autoReplyStatus?.value as string | undefined)

  if (!id) return null

  const send = async (target: Target) => {
    setBusy(target)
    try {
      const res = await fetch(`/api/inquiries/${id}/resend`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; error?: string | null; message?: string }
      if (res.ok && data.ok) toast.success('已重新发送')
      else toast.error(`发送失败：${data.error || CODE_TEXT[data.code ?? ''] || data.message || `服务器返回 ${res.status}，请稍后重试`}`)
      router.refresh()
    } catch {
      toast.error('网络连接失败，请检查网络后重试')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="jk-resend">
      <div className="jk-resend__row">
        <span>通知邮件：{STATUS_TEXT[notifyStatus ?? ''] ?? '—'}</span>
        <Button buttonStyle="secondary" size="small" disabled={busy !== null} onClick={() => send('notify')}>
          {busy === 'notify' ? '发送中…' : '重新发送通知'}
        </Button>
      </div>
      <div className="jk-resend__row">
        <span>客户自动回复：{STATUS_TEXT[autoReplyStatus ?? ''] ?? '—'}</span>
        <Button buttonStyle="secondary" size="small" disabled={busy !== null || autoReplyStatus === 'skipped'} onClick={() => send('autoReply')}>
          {busy === 'autoReply' ? '发送中…' : '重新发送自动回复'}
        </Button>
      </div>
    </div>
  )
}
