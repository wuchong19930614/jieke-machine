import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// 网址跳转的类型从 301 改为 308，与前台实际返回的状态码一致（见 src/lib/redirectOr404.ts）；表结构不变
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`redirects\` SET \`type\` = '308' WHERE \`type\` = '301';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`UPDATE \`redirects\` SET \`type\` = '301' WHERE \`type\` = '308';`)
}
