'use client'
// “YouTube 链接”输入框下方：写清放视频的步骤，粘贴链接后显示视频缩略图，确认没贴错（产品、案例共用）
import { useFormFields } from '@payloadcms/ui'

import { youtubeId, youtubeThumbnail } from '@/lib/youtube'

export function YouTubePreview() {
  const value = useFormFields(([fields]) => fields.videoUrl?.value as string | undefined)
  const id = youtubeId(value)
  return (
    <div className="jk-video">
      <p className="jk-video__guide">
        怎么放视频：① 把视频上传到公司 YouTube 频道 → ② 复制视频链接 → ③ 粘贴到上面。网站不直接存视频文件，下面的“视频封面”只能放图片。
      </p>
      {id ? (
        <div className="jk-video__preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- 后台预览直接用 YouTube 缩略图 */}
          <img src={youtubeThumbnail(id)} alt="YouTube 视频缩略图" width={160} height={90} />
          <span>已识别视频，缩略图如左。不是这个视频的话，请检查链接。</span>
        </div>
      ) : value?.trim() ? (
        <p className="jk-video__bad">没认出这是 YouTube 视频链接，请复制浏览器地址栏里的视频网址，例如 https://www.youtube.com/watch?v=xxxxxxxxxxx</p>
      ) : null}
    </div>
  )
}
