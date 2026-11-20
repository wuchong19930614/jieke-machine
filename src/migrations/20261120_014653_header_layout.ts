import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_logo_align\` text DEFAULT 'left';`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_logo_position\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_logo_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_logo_mobile_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_nav_align\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_nav_position\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_nav_font_size\` numeric;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`header_layout_nav_gap\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_logo_align\` text DEFAULT 'left';`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_logo_position\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_logo_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_logo_mobile_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_nav_align\` text DEFAULT 'right';`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_nav_position\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_nav_font_size\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_header_layout_nav_gap\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_logo_align\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_logo_position\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_logo_height\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_logo_mobile_height\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_nav_align\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_nav_position\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_nav_font_size\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`header_layout_nav_gap\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_logo_align\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_logo_position\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_logo_height\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_logo_mobile_height\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_nav_align\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_nav_position\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_nav_font_size\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_header_layout_nav_gap\`;`)
}
