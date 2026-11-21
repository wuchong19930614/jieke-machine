import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE theme ADD COLUMN base_font_size numeric`)
  await db.run(sql`ALTER TABLE theme ADD COLUMN previous_base_font_size numeric`)
  await db.run(sql`ALTER TABLE _theme_v ADD COLUMN version_base_font_size numeric`)
  await db.run(sql`ALTER TABLE _theme_v ADD COLUMN version_previous_base_font_size numeric`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE _theme_v DROP COLUMN version_previous_base_font_size`)
  await db.run(sql`ALTER TABLE _theme_v DROP COLUMN version_base_font_size`)
  await db.run(sql`ALTER TABLE theme DROP COLUMN previous_base_font_size`)
  await db.run(sql`ALTER TABLE theme DROP COLUMN base_font_size`)
}
