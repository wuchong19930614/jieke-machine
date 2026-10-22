'use client'
// 感谢页加载且本地会话里有尚未统计的询盘编号时推送 generate_lead，推送后立即清除，刷新不重复计数（技术方案 7.3）
import { useEffect } from 'react'

import { track } from '@/lib/client/analytics'

import { LEAD_KEY } from './InquiryForm'

export function ThankYouTracker() {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LEAD_KEY)
      if (!raw) return
      sessionStorage.removeItem(LEAD_KEY)
      const lead = JSON.parse(raw) as { ref?: string; source?: string; productName?: string }
      if (!lead.ref) return
      track('generate_lead', { form_source: lead.source, product_name: lead.productName || undefined, inquiry_ref: lead.ref })
    } catch {
      // sessionStorage 不可用时不统计
    }
  }, [])
  return null
}
