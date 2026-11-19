import { Button } from '@payloadcms/ui'

import { previewUrl } from '@/lib/previewPath'

export function FullWidthHomePreview() {
  return (
    <Button
      aria-label="全宽预览"
      buttonStyle="secondary"
      el="anchor"
      margin={false}
      newTab
      size="small"
      url={previewUrl({ global: 'home-page' })}
      tooltip="打开新标签页，按当前浏览器宽度显示；草稿保存后可刷新预览"
    >
      全宽预览
    </Button>
  )
}
