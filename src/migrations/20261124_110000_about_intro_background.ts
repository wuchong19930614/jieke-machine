import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE about_intro_background_rollback (
      source TEXT NOT NULL,
      id TEXT NOT NULL,
      background TEXT NOT NULL,
      PRIMARY KEY (source, id)
    )
  `)

  await db.run(sql`
    INSERT INTO about_intro_background_rollback
    SELECT source, id, background
    FROM (
      SELECT 'published' AS source, id, module, background, background_color, background_image_id
      FROM about_page_sections
      UNION ALL
      SELECT 'latest', sections.id, sections.module, sections.background, sections.background_color, sections.background_image_id
      FROM _about_page_v_version_sections AS sections
      JOIN _about_page_v AS version ON version.id = sections._parent_id
      WHERE version.latest = 1
    )
    WHERE module = 'intro' AND background_image_id IS NULL
      AND (
        background IN ('dark', 'graphite')
        OR (background = 'custom' AND lower(trim(background_color)) IN ('#20252b', '#21262d', '#22272e', '#000000', '#000'))
      )
  `)

  await db.run(sql`
    UPDATE about_page_sections SET background = 'default'
    WHERE id IN (SELECT id FROM about_intro_background_rollback WHERE source = 'published')
  `)
  await db.run(sql`
    UPDATE _about_page_v_version_sections SET background = 'default'
    WHERE id IN (SELECT id FROM about_intro_background_rollback WHERE source = 'latest')
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`
    UPDATE about_page_sections
    SET background = prior.background
    FROM about_intro_background_rollback AS prior
    WHERE prior.source = 'published' AND prior.id = about_page_sections.id
      AND about_page_sections.background = 'default' AND about_page_sections.background_image_id IS NULL
  `)
  await db.run(sql`
    UPDATE _about_page_v_version_sections
    SET background = prior.background
    FROM about_intro_background_rollback AS prior
    WHERE prior.source = 'latest' AND prior.id = _about_page_v_version_sections.id
      AND _about_page_v_version_sections.background = 'default' AND _about_page_v_version_sections.background_image_id IS NULL
  `)
  await db.run(sql`DROP TABLE about_intro_background_rollback`)
}
