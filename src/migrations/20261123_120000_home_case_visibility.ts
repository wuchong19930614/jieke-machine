import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE cases ADD show_on_home integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE _cases_v ADD version_show_on_home integer DEFAULT false;`)
  await db.run(sql`
    UPDATE cases SET show_on_home = true
    WHERE id IN (
      SELECT cases_id FROM home_page_rels
      WHERE path = 'featuredCases.cases'
        AND parent_id = (SELECT id FROM home_page ORDER BY created_at DESC, id DESC LIMIT 1)
    );
  `)
  await db.run(sql`
    UPDATE _cases_v SET version_show_on_home = true
    WHERE parent_id IN (SELECT id FROM cases WHERE show_on_home = true);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE _cases_v DROP COLUMN version_show_on_home;`)
  await db.run(sql`ALTER TABLE cases DROP COLUMN show_on_home;`)
}
