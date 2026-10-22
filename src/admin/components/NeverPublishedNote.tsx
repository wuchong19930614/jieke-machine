'use client'
// 页面配置和设置从没发布过时的提示：后台状态显示“草稿”，但前台其实在用代码里的默认内容，并没有下线
import { useDocumentInfo } from '@payloadcms/ui'

export function NeverPublishedNote() {
  const { hasPublishedDoc } = useDocumentInfo()
  if (hasPublishedDoc) return null
  return <span className="jk-unpublished-note">还没有发布过：前台目前显示的是默认内容</span>
}
