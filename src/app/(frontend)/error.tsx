'use client'
// 通用错误页（英文界面文案 16.2）：避免显示框架默认的报错。出错时数据库可能不可用，这里只用固定英文
import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="lp-section">
      <div className="lp-message-page">
        <h1>Something Went Wrong</h1>
        <p>Sorry, something went wrong on our side. Please refresh the page or try again later.</p>
        <div className="lp-actions">
          <button type="button" className="lp-action" onClick={() => reset()}>
            Try Again
          </button>
          <Link href="/" className="lp-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
