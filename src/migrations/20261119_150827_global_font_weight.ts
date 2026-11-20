import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`theme\` ADD \`font_weight\` text DEFAULT 'inherit';`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_font_weight\` text DEFAULT 'inherit';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`font_weight\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_font_weight\`;`)
}
