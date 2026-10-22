// 在线客服的对话统计：start_chat 只在 tawk.to 回调里推送一次，入口按最近一次打开对话的按钮记
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('在线客服统计', () => {
  it('对话开始只推送一次 start_chat', async () => {
    const dataLayer: Record<string, unknown>[] = []
    vi.stubGlobal('window', { setTimeout, clearTimeout, dataLayer })
    vi.stubGlobal('document', { createElement: () => ({ setAttribute() {}, remove() {} }), body: { appendChild() {} } })
    const { loadTawk, openTawkChat } = await import('@/lib/client/tawk')

    const loading = loadTawk('property', 'widget')
    const api = (window as unknown as { Tawk_API: { onLoad: () => void; onChatStarted: () => void } }).Tawk_API
    api.onLoad()
    openTawkChat(await loading, 'blue')
    api.onChatStarted()

    expect(dataLayer.filter((e) => e.event === 'start_chat')).toEqual([{ event: 'start_chat', entry: 'blue' }])
  })
})
