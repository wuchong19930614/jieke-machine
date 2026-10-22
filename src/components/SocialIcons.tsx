// 社交媒体图标：lucide-react 1.x 已移除品牌图标，这里用简单的字母和通用图形，打包进代码（技术方案 8.2 第 6 条）
import { Camera, Music2, Play } from 'lucide-react'

const Mono = ({ text }: { text: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <text x="12" y="17" textAnchor="middle" fontSize={text.length > 1 ? 13 : 17} fontWeight="700" fontFamily="Arial, sans-serif" fill="currentColor">
      {text}
    </text>
  </svg>
)

export const SOCIAL_ICONS = {
  facebook: () => <Mono text="f" />,
  instagram: () => <Camera size={18} aria-hidden="true" />,
  tiktok: () => <Music2 size={18} aria-hidden="true" />,
  youtube: () => <Play size={18} aria-hidden="true" />,
  linkedin: () => <Mono text="in" />,
} as const
