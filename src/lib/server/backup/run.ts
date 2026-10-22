// 定时任务的具体工作：每日数据库备份、每日增量媒体备份、过期数据清理（技术方案 6.4、9.2）
import { createWriteStream } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { PassThrough } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createGzip } from 'node:zlib'

import { createClient } from '@libsql/client'
import { get, list, put } from '@vercel/blob'
import type { Payload } from 'payload'

import { BACKUP_RETENTION_DAYS, INQUIRY_RETENTION_DAYS } from '@/lib/constants'
import { sendMail } from '@/lib/server/mail'

import { backupKey, encryptStream } from './crypto'
import { dumpDatabase } from './dump'
import { backupToken, deleteBackupFiles, listBackupFiles, mediaToken, saveBackupFile, usingLocalBackups } from './storage'

const DAY = 24 * 60 * 60 * 1000
const MEDIA_BATCH = 500
const DELETED_MANIFEST = 'backups/media/_deleted.json'

async function notifyAdmins(payload: Payload, subject: string, text: string) {
  const { docs } = await payload.find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 10, depth: 0, overrideAccess: true })
  for (const user of docs) {
    await sendMail({ to: user.email, subject, text, html: `<pre style="font-family:inherit;white-space:pre-wrap">${text.replace(/</g, '&lt;')}</pre>` }).catch(() => undefined)
  }
}

async function record(payload: Payload, data: Record<string, unknown>) {
  await payload.create({ collection: 'backups', data: data as never, overrideAccess: true, context: { disableRevalidate: true } })
}

export async function runDatabaseBackup(payload: Payload) {
  const started = Date.now()
  const day = new Date().toISOString().slice(0, 10)
  const pathname = `backups/db/${day}.sql.gz.enc`
  const dir = await mkdtemp(path.join(tmpdir(), 'jk-backup-'))
  const localFile = path.join(dir, 'backup.enc')
  const source = new PassThrough()
  let client: ReturnType<typeof createClient> | null = null
  let streamError: unknown = null
  // 写入一段导出内容。写入链路出错后 source 会被关闭、不再触发 drain，这时立即抛错，不能一直等下去
  const write = async (chunk: string) => {
    if (source.destroyed) throw streamError ?? new Error('备份文件写入中断')
    if (source.write(chunk)) return
    await new Promise<void>((resolve, reject) => {
      const onDrain = () => {
        source.off('close', onClose)
        resolve()
      }
      const onClose = () => {
        source.off('drain', onDrain)
        reject(streamError ?? new Error('备份文件写入中断'))
      }
      source.once('drain', onDrain)
      source.once('close', onClose)
    })
  }
  try {
    const key = backupKey()
    client = createClient({ url: process.env.DATABASE_URI || 'file:./dev.db', authToken: process.env.DATABASE_AUTH_TOKEN || undefined, intMode: 'bigint' })
    // 边读边写入临时文件，避免整份数据放在内存里；先挂上错误处理，出错时不会成为未处理的拒绝
    const writing = pipeline(source, createGzip({ level: 9 }), encryptStream(key), createWriteStream(localFile))
    writing.catch((error) => {
      streamError = error
    })
    const stats = await dumpDatabase(client, write)
    source.end()
    await writing
    const sizeBytes = await saveBackupFile(pathname, localFile)
    const result = { ok: true, file: pathname, sizeBytes, tables: stats.tables, rows: stats.rows, durationMs: Date.now() - started }
    await record(payload, { kind: 'database', status: 'success', file: pathname, sizeBytes, tables: stats.tables, rows: stats.rows, durationMs: result.durationMs })
    return result
  } catch (caught) {
    source.destroy()
    const error = streamError ?? caught
    const message = String((error as Error)?.message ?? error).slice(0, 1000)
    await record(payload, { kind: 'database', status: 'failed', file: pathname, error: message, durationMs: Date.now() - started }).catch(() => undefined)
    await notifyAdmins(payload, '[网站备份失败] 数据库备份没有完成', `日期：${day}\n原因：${message}\n\n请到后台“系统 › 备份记录”查看，必要时联系开发处理。`)
    return { ok: false, file: pathname, error: message, durationMs: Date.now() - started }
  } finally {
    client?.close()
    await rm(dir, { recursive: true, force: true })
  }
}

async function listAll(token: string, prefix: string) {
  const blobs: { pathname: string; url: string; size: number; uploadedAt: Date }[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix, cursor, limit: 1000, token })
    blobs.push(...page.blobs.map((b) => ({ pathname: b.pathname, url: b.url, size: b.size, uploadedAt: new Date(b.uploadedAt) })))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return blobs
}

async function readManifest(): Promise<Record<string, string>> {
  const result = await get(DELETED_MANIFEST, { access: 'private', token: backupToken(), useCache: false }).catch(() => null)
  if (!result || result.statusCode !== 200) return {}
  return (await new Response(result.stream).json().catch(() => ({}))) as Record<string, string>
}

// 媒体增量备份：文件名带随机后缀、不会原地修改，只需复制新增的文件；
// 媒体库里删除的文件记录删除时间，在备份中再保留 30 天
export async function runMediaBackup(payload: Payload) {
  const started = Date.now()
  if (usingLocalBackups() || !mediaToken()) {
    return { ok: true, copied: 0, copiedBytes: 0, remaining: 0, durationMs: 0, skipped: '未配置 Blob 存储（本地开发）' }
  }
  try {
    const source = await listAll(mediaToken(), 'media/')
    const backups = await listAll(backupToken(), 'backups/media/')
    const backedUp = new Set(backups.map((b) => b.pathname))
    const missing = source.filter((b) => !backedUp.has(`backups/${b.pathname}`))
    let copied = 0
    let copiedBytes = 0
    for (const blob of missing.slice(0, MEDIA_BATCH)) {
      const res = await fetch(blob.url)
      if (!res.ok || !res.body) continue
      await put(`backups/${blob.pathname}`, res.body, {
        access: 'private',
        token: backupToken(),
        contentType: res.headers.get('content-type') ?? undefined,
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      copied++
      copiedBytes += blob.size
    }
    // 记录已从媒体库删除的文件
    const live = new Set(source.map((b) => `backups/${b.pathname}`))
    const manifest = await readManifest()
    const now = new Date().toISOString()
    for (const b of backups) if (b.pathname !== DELETED_MANIFEST && !live.has(b.pathname) && !manifest[b.pathname]) manifest[b.pathname] = now
    for (const key of Object.keys(manifest)) if (live.has(key)) delete manifest[key]
    await put(DELETED_MANIFEST, JSON.stringify(manifest), { access: 'private', token: backupToken(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true })
    const result = { ok: true, copied, copiedBytes, remaining: Math.max(0, missing.length - MEDIA_BATCH), durationMs: Date.now() - started }
    await record(payload, { kind: 'media', status: 'success', filesCopied: copied, sizeBytes: copiedBytes, durationMs: result.durationMs })
    return result
  } catch (error) {
    const message = String((error as Error)?.message ?? error).slice(0, 1000)
    await record(payload, { kind: 'media', status: 'failed', error: message, durationMs: Date.now() - started }).catch(() => undefined)
    await notifyAdmins(payload, '[网站备份失败] 媒体文件备份没有完成', `原因：${message}\n\n请到后台“系统 › 备份记录”查看。`)
    return { ok: false, copied: 0, copiedBytes: 0, remaining: 0, durationMs: Date.now() - started, error: message }
  }
}

// 清理：删除保存满 1 年的询盘、超过 30 天的数据库备份和备份记录、媒体库删除超过 30 天的媒体备份
export async function runCleanup(payload: Payload) {
  const inquiryCutoff = new Date(Date.now() - INQUIRY_RETENTION_DAYS * DAY).toISOString()
  const deleted = await payload.delete({
    collection: 'inquiries',
    where: { createdAt: { less_than: inquiryCutoff } },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  const backupCutoff = Date.now() - BACKUP_RETENTION_DAYS * DAY
  const dbFiles = await listBackupFiles('backups/db/')
  const oldFiles = dbFiles.filter((f) => f.uploadedAt.getTime() < backupCutoff).map((f) => f.pathname)
  await deleteBackupFiles(oldFiles)
  await payload.delete({
    collection: 'backups',
    where: { createdAt: { less_than: new Date(backupCutoff).toISOString() } },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  let deletedMediaBackups = 0
  if (!usingLocalBackups()) {
    const manifest = await readManifest()
    const expired = Object.entries(manifest).filter(([, at]) => new Date(at).getTime() < backupCutoff).map(([p]) => p)
    if (expired.length) {
      await deleteBackupFiles(expired)
      for (const p of expired) delete manifest[p]
      await put(DELETED_MANIFEST, JSON.stringify(manifest), { access: 'private', token: backupToken(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true })
      deletedMediaBackups = expired.length
    }
  }
  return { ok: true, deletedInquiries: deleted.docs.length, deletedBackups: oldFiles.length, deletedMediaBackups }
}
