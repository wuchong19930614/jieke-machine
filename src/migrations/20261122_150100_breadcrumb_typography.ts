import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`breadcrumb_layout_font\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`breadcrumb_layout_font_size\` numeric;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`breadcrumb_layout_font_size_mobile\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_breadcrumb_layout_font\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_breadcrumb_layout_font_size\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_breadcrumb_layout_font_size_mobile\` numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`breadcrumb_layout_font\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`breadcrumb_layout_font_size\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`breadcrumb_layout_font_size_mobile\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_breadcrumb_layout_font\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_breadcrumb_layout_font_size\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_breadcrumb_layout_font_size_mobile\`;`)
}
