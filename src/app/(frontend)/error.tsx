'use client'
// 通用错误页（英文界面文案 16.2）：避免显示框架默认的报错。文案取“界面文案 › 错误页”，取不到时用默认英文
import Link from 'next/link'

import { useErrorTexts } from '@/components/client/ErrorTexts'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useErrorTexts()
  return (
    <section className="lp-section">
      <div className="lp-message-page">
        <h1>{t.title}</h1>
        <p>{t.text}</p>
        <div className="lp-actions">
          <button type="button" className="lp-action" onClick={() => reset()}>
            {t.retry}
          </button>
          <Link href="/" className="lp-outline">
            {t.backHome}
          </Link>
        </div>
      </div>
    </section>
  )
}
