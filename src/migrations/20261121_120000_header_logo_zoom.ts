import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE site_settings ADD COLUMN header_layout_logo_zoom numeric`)
  await db.run(sql`ALTER TABLE _site_settings_v ADD COLUMN version_header_layout_logo_zoom numeric`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE _site_settings_v DROP COLUMN version_header_layout_logo_zoom`)
  await db.run(sql`ALTER TABLE site_settings DROP COLUMN header_layout_logo_zoom`)
}
