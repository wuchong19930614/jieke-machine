'use client'
import { Button, toast } from '@payloadcms/ui'
import { useRef, useState } from 'react'

import { exportGlobals, importGlobals, type TransferResult } from './contentTransferActions'

export function ContentTransferClient() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 服务端操作抛错（网络中断、服务出错）时恢复按钮并提示，不让页面卡在“处理中”
  const run = async (action: () => Promise<TransferResult>): Promise<TransferResult> => {
    setBusy(true)
    try {
      return await action()
    } catch (error) {
      return { ok: false, message: `操作失败：${String((error as Error)?.message ?? error)}` }
    } finally {
      setBusy(false)
    }
  }

  const onExport = async () => {
    const result = await run(exportGlobals)
    setMessage(result.message)
    if (!result.ok || !result.json) return toast.error(result.message)
    const blob = new Blob([result.json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `globals-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.warning('请先选择导出的 JSON 文件')
    if (!window.confirm('导入会覆盖各页面配置和设置的草稿内容（线上内容在发布前不受影响），确定导入吗？')) return
    const result = await run(async () => importGlobals(await file.text()))
    setMessage(result.message)
    if (result.ok) toast.success('导入完成')
    else toast.error(result.message)
  }

  return (
    <div className="jk-transfer">
      <section className="jk-transfer__card">
        <h2>导出页面配置和设置</h2>
        <p>导出首页、关于我们、各列表页、联系我们、全站设置、主题和界面文案的最新内容（含草稿）。</p>
        <Button onClick={onExport} disabled={busy}>
          导出 JSON
        </Button>
      </section>
      <section className="jk-transfer__card">
        <h2>导入页面配置和设置</h2>
        <p>导入本页导出的文件。导入后全部为草稿，需要到各页面检查后再点“发布”。</p>
        <input ref={fileRef} type="file" accept="application/json,.json" />
        <Button onClick={onImport} disabled={busy} buttonStyle="secondary">
          导入
        </Button>
      </section>
      {message ? <p className="jk-view__desc">{message}</p> : null}
    </div>
  )
}
