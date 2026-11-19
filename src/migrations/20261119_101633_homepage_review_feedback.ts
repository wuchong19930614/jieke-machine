import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`home_page_about_intro_tags\` ADD \`visible\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`company_stats_company_name\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`company_stats_company_name_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`company_stats_company_name_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_tags_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_about_intro_tags\` ADD \`visible\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_company_stats_company_name\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_company_stats_company_name_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_company_stats_company_name_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_tags_hidden\` integer DEFAULT false;`)
  // Match the new default for existing public content and the latest preview.
  // Swap only the two requested slots, including when custom image sections sit between them.
  await db.run(sql`
    WITH swaps AS MATERIALIZED (
      SELECT cases.id AS case_id, services.id AS service_id,
             cases._order AS case_order, services._order AS service_order
      FROM home_page_sections AS cases
      JOIN home_page_sections AS services ON services._parent_id = cases._parent_id
      WHERE cases.module = 'featuredCases' AND services.module = 'services' AND cases._order < services._order
    )
    UPDATE home_page_sections AS section
    SET _order = CASE WHEN section.id = swaps.case_id THEN swaps.service_order ELSE swaps.case_order END
    FROM swaps
    WHERE section.id IN (swaps.case_id, swaps.service_id);
  `)
  await db.run(sql`
    WITH swaps AS MATERIALIZED (
      SELECT cases.id AS case_id, services.id AS service_id,
             cases._order AS case_order, services._order AS service_order
      FROM _home_page_v_version_sections AS cases
      JOIN _home_page_v_version_sections AS services ON services._parent_id = cases._parent_id
      JOIN _home_page_v AS version ON version.id = cases._parent_id AND version.latest = 1
      WHERE cases.module = 'featuredCases' AND services.module = 'services' AND cases._order < services._order
    )
    UPDATE _home_page_v_version_sections AS section
    SET _order = CASE WHEN section.id = swaps.case_id THEN swaps.service_order ELSE swaps.case_order END
    FROM swaps
    WHERE section.id IN (swaps.case_id, swaps.service_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The arranged sections are CMS content. Leave the active order available to editors on rollback.
  await db.run(sql`ALTER TABLE \`home_page_about_intro_tags\` DROP COLUMN \`visible\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`company_stats_company_name\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`company_stats_company_name_hidden\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`company_stats_company_name_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`about_intro_tags_hidden\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_about_intro_tags\` DROP COLUMN \`visible\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_company_stats_company_name\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_company_stats_company_name_hidden\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_company_stats_company_name_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_about_intro_tags_hidden\`;`)
}
