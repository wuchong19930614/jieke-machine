// 备份往返测试：导出 → 压缩加密 → 解密 → 导入到新库，表结构和数据一致，触发器不被重复执行
import { createWriteStream } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { PassThrough } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createGzip } from 'node:zlib'

import { createClient } from '@libsql/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { decryptBackup, encryptStream } from '@/lib/server/backup/crypto'
import { dumpDatabase } from '@/lib/server/backup/dump'

let dir: string

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'jk-backup-test-'))
})
afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('数据库备份', () => {
  it('导出加密后可以完整恢复', async () => {
    const source = createClient({ url: `file:${path.join(dir, 'source.db')}`, intMode: 'bigint' })
    await source.executeMultiple(`
      PRAGMA foreign_keys=ON;
      CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, data TEXT, blob BLOB);
      CREATE TABLE products_faqs (id TEXT PRIMARY KEY, _parent_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, question TEXT);
      CREATE INDEX faqs_parent_idx ON products_faqs(_parent_id);
      CREATE TABLE audit (id INTEGER PRIMARY KEY AUTOINCREMENT, note TEXT);
      CREATE TRIGGER products_audit AFTER INSERT ON products BEGIN INSERT INTO audit(note) VALUES ('inserted ' || NEW.name); END;
      CREATE VIEW product_names AS SELECT name FROM products;
    `)
    const tx = await source.transaction('write')
    for (let i = 1; i <= 1200; i++) {
      await tx.execute({
        sql: 'INSERT INTO products (name, data, blob) VALUES (?, ?, ?)',
        args: [`Line ${i} '引号' “中文” 😀`, JSON.stringify({ i, nested: { a: [1, 2] } }), i % 3 ? null : new Uint8Array([0, 1, 255])],
      })
      await tx.execute({ sql: 'INSERT INTO products_faqs (id, _parent_id, question) VALUES (?, ?, ?)', args: [`f${i}`, i, `Q?\nline2`] })
    }
    await tx.commit()

    // 导出 → gzip → 加密
    const key = Buffer.alloc(32, 7)
    const encFile = path.join(dir, 'backup.enc')
    const stream = new PassThrough()
    const writing = pipeline(stream, createGzip(), encryptStream(key), createWriteStream(encFile))
    const stats = await dumpDatabase(source, (chunk) => {
      stream.write(chunk)
    })
    stream.end()
    await writing
    expect(stats.rowsByTable.products).toBe(1200)
    expect(stats.rowsByTable.products_faqs).toBe(1200)

    // 解密并导入新库
    const sql = decryptBackup(await readFile(encFile), key)
    const restored = createClient({ url: `file:${path.join(dir, 'restored.db')}`, intMode: 'bigint' })
    await restored.executeMultiple(sql)

    const compare = async (query: string) => {
      const a = await source.execute(query)
      const b = await restored.execute(query)
      expect(JSON.stringify(b.rows, (_, v) => (typeof v === 'bigint' ? v.toString() : v))).toBe(
        JSON.stringify(a.rows, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
      )
    }
    await compare('SELECT * FROM products ORDER BY id')
    await compare('SELECT * FROM products_faqs ORDER BY id')
    // 触发器在数据之后才建，导入时不会再写一遍审计记录
    await compare('SELECT * FROM audit ORDER BY id')
    await compare("SELECT type, name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name")
    const integrity = await restored.execute('PRAGMA integrity_check')
    expect(integrity.rows[0][0]).toBe('ok')
    const fk = await restored.execute('PRAGMA foreign_key_check')
    expect(fk.rows).toHaveLength(0)

    // 密钥错误时无法解密
    expect(() => decryptBackup(Buffer.from('not a backup'), key)).toThrow()
    source.close()
    restored.close()
  }, 30000)
})
