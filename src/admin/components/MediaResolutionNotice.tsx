'use client'

import { useDocumentInfo } from '@payloadcms/ui'

export function MediaResolutionNotice() {
  const { data } = useDocumentInfo()
  const filename = data?.filename
  const width = data?.width
  const thumbnail = typeof filename === 'string' && filename.match(/-400x\d+(?:-[^.]*)?\.[^.]+$/i)
  if (!thumbnail || typeof width !== 'number' || width <= 400) return null

  return (
    <p className="jk-media-resolution-notice" role="status">
      此媒体记录标注宽度为 {width} px，但文件名指向 400 px 缩略图。请在本条记录中替换为高清原图，已引用这条记录的页面会随之更新。
    </p>
  )
}
