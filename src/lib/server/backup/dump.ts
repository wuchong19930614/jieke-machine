// 数据库导出为 SQL 文本（技术方案 9.2，已在本地验证）：
// 只读事务保证一致快照；按 rowid 递增分页读取，不用 OFFSET，读取行数约等于总行数；
// 先建表写数据，再建索引、视图和触发器，避免导入时触发器被重复执行
import type { Client, InValue } from '@libsql/client'

const PAGE_SIZE = 500

const quoteIdent = (s: unknown) => `"${String(s).replaceAll('"', '""')}"`

const literal = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'bigint' || typeof v === 'number') return String(v)
  if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) {
    const bytes = v instanceof ArrayBuffer ? new Uint8Array(v) : new Uint8Array(v.buffer, v.byteOffset, v.byteLength)
    return `X'${Buffer.from(bytes).toString('hex')}'`
  }
  return `'${String(v).replaceAll("'", "''")}'`
}

export type DumpStats = { tables: number; rows: number; rowsByTable: Record<string, number> }

export async function dumpDatabase(client: Client, write: (chunk: string) => Promise<void> | void): Promise<DumpStats> {
  const tx = await client.transaction('read')
  try {
    await write('PRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n')
    const schema = await tx.execute(
      "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'libsql_%' AND name NOT LIKE '_litestream_%' ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 WHEN 'view' THEN 2 ELSE 3 END, name",
    )
    const tables = schema.rows.filter((r) => r.type === 'table')
    const rowsByTable: Record<string, number> = {}
    let total = 0
    for (const table of tables) {
      await write(`${table.sql};\n`)
      const name = String(table.name)
      let last: InValue = -9223372036854775808n
      rowsByTable[name] = 0
      for (;;) {
        const page = await tx.execute({
          sql: `SELECT rowid AS __rid, * FROM ${quoteIdent(name)} WHERE rowid > ? ORDER BY rowid LIMIT ${PAGE_SIZE}`,
          args: [last],
        })
        if (!page.rows.length) break
        const columns = page.columns.slice(1)
        const cols = columns.map(quoteIdent).join(',')
        let chunk = ''
        for (const row of page.rows) {
          const values = columns.map((_, i) => literal(row[i + 1])).join(',')
          chunk += `INSERT INTO ${quoteIdent(name)}(${cols}) VALUES(${values});\n`
        }
        await write(chunk)
        rowsByTable[name] += page.rows.length
        total += page.rows.length
        last = page.rows[page.rows.length - 1][0] as InValue
      }
    }
    for (const item of schema.rows.filter((r) => r.type !== 'table')) await write(`${item.sql};\n`)
    await write('COMMIT;\n')
    return { tables: tables.length, rows: total, rowsByTable }
  } finally {
    await tx.commit().catch(() => tx.close())
  }
}
