'use client'
// YouTube 视频（技术方案 7.4）：先只显示封面和播放按钮，点击后才加载 youtube-nocookie 播放器；
// 加载失败时显示 “Watch on YouTube” 和联系我们
import { Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { imageSrc } from '@/components/Img'
import { youtubeEmbed, youtubeThumbnail, youtubeWatch } from '@/lib/youtube'

type Props = {
  videoId: string
  title: string
  cover?: { url: string; alt: string } | null
  texts: { playAria: string; videoError: string; watchOnYouTube: string; contactUs: string; opensNewTab: string }
  sizes?: string
}

export function VideoEmbed({ videoId, title, cover, texts, sizes = '(max-width: 767px) 100vw, 880px' }: Props) {
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!playing || loaded) return
    const timer = window.setTimeout(() => setFailed(true), 10000)
    return () => window.clearTimeout(timer)
  }, [playing, loaded])

  const coverUrl = cover?.url ? imageSrc(cover.url) : youtubeThumbnail(videoId)

  return (
    <div className="lp-video">
      {playing ? (
        <iframe
          src={youtubeEmbed(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => {
            setLoaded(true)
            setFailed(false)
          }}
        />
      ) : (
        <button type="button" aria-label={texts.playAria} onClick={() => setPlaying(true)}>
          <Image src={coverUrl} alt={cover?.alt ?? ''} fill sizes={sizes} style={{ objectFit: 'cover' }} />
          <span className="lp-video__play" aria-hidden="true">
            <Play size={30} />
          </span>
        </button>
      )}
      {failed ? (
        <div className="lp-video__fallback" role="alert">
          <p>{texts.videoError}</p>
          <a href={youtubeWatch(videoId)} target="_blank" rel="noopener noreferrer">
            {texts.watchOnYouTube}
            <span className="sr-only"> {texts.opensNewTab}</span>
          </a>
          <Link href="/contact/" className="lp-action">
            {texts.contactUs}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
