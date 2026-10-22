import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// 询盘“服务器错误”提示改为英文界面文案 10.5 的写法（不再固定提到 WhatsApp）。
// 默认文案保存设置时会写进数据库，所以只替换仍是旧默认值的记录：主表和后台编辑读取的最新版本；后台改过的不动；表结构不变
const OLD = "Sorry, we couldn't send your inquiry. Please try again, or contact us by email at {businessEmail} or on WhatsApp."
const NEW = "Sorry, we couldn't send your inquiry. Please try again, or email us at {businessEmail}."

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`site_settings\` SET \`form_texts_err_server\` = ${NEW} WHERE \`form_texts_err_server\` = ${OLD};`)
  await db.run(sql`UPDATE \`_site_settings_v\` SET \`version_form_texts_err_server\` = ${NEW} WHERE \`latest\` = 1 AND \`version_form_texts_err_server\` = ${OLD};`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`UPDATE \`site_settings\` SET \`form_texts_err_server\` = ${OLD} WHERE \`form_texts_err_server\` = ${NEW};`)
  await db.run(sql`UPDATE \`_site_settings_v\` SET \`version_form_texts_err_server\` = ${OLD} WHERE \`latest\` = 1 AND \`version_form_texts_err_server\` = ${NEW};`)
}
