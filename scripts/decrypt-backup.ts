// 解密数据库备份（技术方案 9.2 恢复步骤 1）
// 用法：npm run decrypt-backup -- <下载的 .sql.gz.enc 文件> [输出的 .sql 文件]
// 需要环境变量 BACKUP_ENCRYPTION_KEY（与生产环境相同，线下另有一份）
import 'dotenv/config'

import { readFile, writeFile } from 'node:fs/promises'

import { backupKey, decryptBackup } from '../src/lib/server/backup/crypto'

async function main() {
  const [input, output] = process.argv.slice(2)
  if (!input) {
    console.error('用法：npm run decrypt-backup -- <备份文件.sql.gz.enc> [输出文件.sql]')
    process.exit(1)
  }
  const sql = decryptBackup(await readFile(input), backupKey())
  const target = output || input.replace(/\.gz\.enc$/, '').replace(/\.enc$/, '') || 'restore.sql'
  await writeFile(target, sql)
  console.log(`已解密：${target}（${(sql.length / 1024 / 1024).toFixed(1)} MB）`)
  console.log('下一步：sqlite3 restore.db < 该文件；sqlite3 restore.db "PRAGMA journal_mode=WAL;"；turso db import restore.db')
}

main().catch((error) => {
  console.error(`解密失败：${(error as Error).message}`)
  process.exit(1)
})
