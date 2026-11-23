import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Preserve the previous choices for rollback. Older theme versions remain intact.
  await db.run(sql`
    CREATE TABLE theme_typography_rollback (
      source TEXT NOT NULL,
      id INTEGER NOT NULL,
      heading_font TEXT,
      body_font TEXT,
      font_weight TEXT,
      PRIMARY KEY (source, id)
    )
  `)
  await db.run(sql`
    INSERT INTO theme_typography_rollback
    SELECT 'theme', id, heading_font, body_font, font_weight FROM theme
    UNION ALL
    SELECT 'version', id, version_heading_font, version_body_font, version_font_weight
    FROM _theme_v WHERE latest = 1
  `)
  await db.run(sql`
    UPDATE theme
    SET heading_font = 'barlow-condensed', body_font = 'barlow', font_weight = 'inherit'
  `)
  await db.run(sql`
    UPDATE _theme_v
    SET version_heading_font = 'barlow-condensed', version_body_font = 'barlow', version_font_weight = 'inherit'
    WHERE latest = 1
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Only restore values still set to the migration's defaults.
  await db.run(sql`
    UPDATE theme
    SET heading_font = CASE WHEN theme.heading_font = 'barlow-condensed' THEN prior.heading_font ELSE theme.heading_font END,
        body_font = CASE WHEN theme.body_font = 'barlow' THEN prior.body_font ELSE theme.body_font END,
        font_weight = CASE WHEN theme.font_weight = 'inherit' THEN prior.font_weight ELSE theme.font_weight END
    FROM theme_typography_rollback AS prior
    WHERE prior.source = 'theme' AND prior.id = theme.id
  `)
  await db.run(sql`
    UPDATE _theme_v
    SET version_heading_font = CASE WHEN version_heading_font = 'barlow-condensed' THEN prior.heading_font ELSE version_heading_font END,
        version_body_font = CASE WHEN version_body_font = 'barlow' THEN prior.body_font ELSE version_body_font END,
        version_font_weight = CASE WHEN version_font_weight = 'inherit' THEN prior.font_weight ELSE version_font_weight END
    FROM theme_typography_rollback AS prior
    WHERE prior.source = 'version' AND prior.id = _theme_v.id
  `)
  await db.run(sql`DROP TABLE theme_typography_rollback`)
}
