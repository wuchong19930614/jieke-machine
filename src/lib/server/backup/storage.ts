// 备份文件存放：线上放单独的私有 Blob 存储；本地没有配置时放项目下的 ./backups 目录（已在 .gitignore 中）
import { createReadStream } from 'node:fs'
import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

import { del, get, list, put } from '@vercel/blob'

export const backupToken = () => process.env.BACKUP_BLOB_READ_WRITE_TOKEN || ''
export const mediaToken = () => process.env.BLOB_READ_WRITE_TOKEN || ''
export const usingLocalBackups = () => !backupToken()

// 备份路径都以 backups/ 开头，本地按项目根目录存放，即 ./backups/db/…
const LOCAL_ROOT = process.cwd()

export async function saveBackupFile(pathname: string, localFile: string): Promise<number> {
  const size = (await stat(localFile)).size
  if (usingLocalBackups()) {
    const target = path.join(LOCAL_ROOT, pathname)
    await mkdir(path.dirname(target), { recursive: true })
    const { copyFile } = await import('node:fs/promises')
    await copyFile(localFile, target)
    return size
  }
  await put(pathname, createReadStream(localFile), {
    access: 'private',
    token: backupToken(),
    contentType: 'application/octet-stream',
    addRandomSuffix: false,
    allowOverwrite: true,
    multipart: size > 50 * 1024 * 1024,
  })
  return size
}

export async function openBackupFile(pathname: string): Promise<{ stream: ReadableStream<Uint8Array>; size?: number } | null> {
  if (!/^backups\/db\/[\w.-]+$/.test(pathname)) return null
  if (usingLocalBackups()) {
    const file = path.join(LOCAL_ROOT, pathname)
    try {
      const info = await stat(file)
      return { stream: Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>, size: info.size }
    } catch {
      return null
    }
  }
  const result = await get(pathname, { access: 'private', token: backupToken(), useCache: false })
  if (!result || result.statusCode !== 200) return null
  return { stream: result.stream, size: result.blob.size }
}

export type StoredFile = { pathname: string; uploadedAt: Date; size: number }

export async function listBackupFiles(prefix: string): Promise<StoredFile[]> {
  if (usingLocalBackups()) {
    const dir = path.join(LOCAL_ROOT, prefix)
    const names = await readdir(dir).catch(() => [] as string[])
    const files: StoredFile[] = []
    for (const name of names) {
      const info = await stat(path.join(dir, name))
      if (info.isFile()) files.push({ pathname: `${prefix}${name}`, uploadedAt: info.mtime, size: info.size })
    }
    return files
  }
  const files: StoredFile[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix, cursor, limit: 1000, token: backupToken() })
    files.push(...page.blobs.map((b) => ({ pathname: b.pathname, uploadedAt: new Date(b.uploadedAt), size: b.size })))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return files
}

export async function deleteBackupFiles(pathnames: string[]): Promise<void> {
  if (!pathnames.length) return
  if (usingLocalBackups()) {
    for (const p of pathnames) await rm(path.join(LOCAL_ROOT, p), { force: true })
    return
  }
  await del(pathnames, { token: backupToken() })
}
