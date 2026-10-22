// YouTube 链接解析：后台只填链接，前台自动取视频编号（技术方案 7.4）
const ID = /^[A-Za-z0-9_-]{11}$/

export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const value = url.trim()
  if (ID.test(value)) return value
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0]
      return ID.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = parsed.searchParams.get('v')
      if (v && ID.test(v)) return v
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/)
      return match ? match[1] : null
    }
  } catch {
    return null
  }
  return null
}

export const validateYoutubeUrl = (value: unknown): true | string => {
  if (value === null || value === undefined || value === '') return true
  return youtubeId(String(value)) ? true : '请填写 YouTube 视频链接，例如 https://www.youtube.com/watch?v=xxxxxxxxxxx'
}

export const youtubeThumbnail = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const youtubeEmbed = (id: string): string =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
export const youtubeWatch = (id: string): string => `https://www.youtube.com/watch?v=${id}`
