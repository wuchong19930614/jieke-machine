'use server'
// 全局配置的导出与导入（技术方案 5.3 第 7 点）：在后台页面中用服务端操作完成，不新增公开接口
import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/payload'
import { checkStaff } from '@/lib/staffAuth'

const SYSTEM_KEYS = ['id', 'createdAt', 'updatedAt', 'globalType', '_status']

export type TransferResult = { ok: boolean; message: string; json?: string }

// 权限不足和没通过双重验证分开说，业务人员才知道该找管理员还是重新登录
function denied(code: 'UNAUTHORIZED' | 'FORBIDDEN', action: string): TransferResult {
  return {
    ok: false,
    message: code === 'FORBIDDEN' ? `当前账号没有${action}权限：只有管理员和开发协作可以${action}` : `登录已过期或还没完成双重验证，请刷新页面重新登录后再${action}`,
  }
}

type Payload = Awaited<ReturnType<typeof getPayloadClient>>

// 结果里用后台显示的中文名称（如“首页”“全站设置”），不显示 home-page 这类键名
function globalLabel(payload: Payload, slug: string): string {
  const label = payload.config.globals.find((g) => g.slug === slug)?.label
  return typeof label === 'string' ? label : slug
}

export async function exportGlobals(): Promise<TransferResult> {
  const payload = await getPayloadClient()
  const auth = await checkStaff(payload, await headers(), ['admin', 'developer'])
  if (!auth.ok) return denied(auth.code, '导出')
  const globals: Record<string, unknown> = {}
  for (const global of payload.config.globals) {
    globals[global.slug] = await payload.findGlobal({ slug: global.slug, draft: true, depth: 0 })
  }
  const json = JSON.stringify({ format: 'jieke-globals', version: 1, exportedAt: new Date().toISOString(), globals }, null, 2)
  return { ok: true, message: `已导出 ${Object.keys(globals).length} 个页面配置和设置`, json }
}

export async function importGlobals(json: string): Promise<TransferResult> {
  const payload = await getPayloadClient()
  const auth = await checkStaff(payload, await headers(), ['admin', 'developer'])
  if (!auth.ok) return denied(auth.code, '导入')
  let parsed: { format?: string; globals?: Record<string, Record<string, unknown>> }
  try {
    parsed = JSON.parse(json)
  } catch {
    return { ok: false, message: '文件内容不是有效的 JSON，可能不是本页导出的文件，或文件已被修改损坏' }
  }
  if (parsed.format !== 'jieke-globals' || !parsed.globals) return { ok: false, message: '文件格式不对，请使用本页导出的文件' }
  const known = new Set<string>(payload.config.globals.map((g) => g.slug))
  const imported: string[] = []
  const failed: string[] = []
  for (const [slug, data] of Object.entries(parsed.globals)) {
    if (!known.has(slug) || !data || typeof data !== 'object') continue
    const clean = Object.fromEntries(Object.entries(data).filter(([key]) => !SYSTEM_KEYS.includes(key)))
    // 导入为草稿，确认无误后再到各页面点“发布”；某一项失败不影响其他项，最后一起报告
    try {
      await payload.updateGlobal({ slug: slug as never, data: clean as never, draft: true, depth: 0 })
      imported.push(globalLabel(payload, slug))
    } catch (error) {
      failed.push(`${globalLabel(payload, slug)}（${String((error as Error)?.message ?? error).slice(0, 200)}）`)
    }
  }
  const done = `已导入 ${imported.length} 项，均为草稿：${imported.join('、') || '无'}。请到对应页面检查后发布。`
  return failed.length ? { ok: false, message: `${done}以下 ${failed.length} 项导入失败：${failed.join('；')}` } : { ok: true, message: done }
}
