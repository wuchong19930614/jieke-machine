import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`content_style\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_content_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`email_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`phone_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`whatsapp_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`address_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`office_hours_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_email_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_phone_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_whatsapp_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_address_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_office_hours_style\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`content_style\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_content_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`email_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`phone_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`whatsapp_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`address_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`office_hours_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_email_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_phone_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_whatsapp_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_address_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_office_hours_style\`;`)
}
