import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_expand\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_collapse\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_expand\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_collapse\` text;`)
  await db.run(sql`ALTER TABLE \`ui_texts\` ADD \`common_copy_failed\` text;`)
  await db.run(sql`ALTER TABLE \`_ui_texts_v\` ADD \`version_common_copy_failed\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_expand\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_collapse\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_expand\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_collapse\`;`)
  await db.run(sql`ALTER TABLE \`ui_texts\` DROP COLUMN \`common_copy_failed\`;`)
  await db.run(sql`ALTER TABLE \`_ui_texts_v\` DROP COLUMN \`version_common_copy_failed\`;`)
}
