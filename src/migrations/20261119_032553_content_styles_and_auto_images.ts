import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// Only the built-in modules move. Image modules keep their existing slots, and
// visibility, device settings, custom backgrounds and archived versions stay intact.
const reorderHomeModules = (table: 'home_page_sections' | '_home_page_v_version_sections') => {
  const source = sql.raw(table)
  const versions = table === '_home_page_v_version_sections' ? sql`AND _parent_id IN (SELECT id FROM _home_page_v WHERE latest = 1)` : sql``
  return sql`
    WITH priority(module, position) AS (
      VALUES ('banners', 1), ('productLines', 2), ('companyStats', 3),
        ('aboutIntro', 4), ('factoryGallery', 5), ('featuredCases', 6), ('services', 7)
    ), known AS (
      SELECT id, _parent_id, _order, position FROM ${source}
      JOIN priority USING (module)
      WHERE 1 = 1 ${versions}
    ), ranked AS (
      SELECT id, _parent_id, ROW_NUMBER() OVER (PARTITION BY _parent_id ORDER BY position, _order, id) AS slot
      FROM known
    ), slots AS (
      SELECT _parent_id, _order, ROW_NUMBER() OVER (PARTITION BY _parent_id ORDER BY _order, id) AS slot
      FROM known
    )
    UPDATE ${source} SET _order = (
      SELECT slots._order FROM ranked JOIN slots USING (_parent_id, slot)
      WHERE ranked.id = ${source}.id
    ) WHERE id IN (SELECT id FROM ranked);
  `
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(reorderHomeModules('home_page_sections'))
  await db.run(reorderHomeModules('_home_page_v_version_sections'))
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_theme\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`palette\` text DEFAULT 'industrial-blue',
    \`quote_button_color\` text DEFAULT 'orange',
    \`heading_font\` text DEFAULT 'system',
    \`body_font\` text DEFAULT 'system',
    \`font_scale\` text DEFAULT 'standard',
    \`spacing_scale\` text DEFAULT 'standard',
    \`text_levels_page_title_style\` text,
    \`text_levels_section_title_style\` text,
    \`text_levels_kicker_style\` text,
    \`text_levels_body_style\` text,
    \`text_levels_button_style\` text,
    \`content_width\` text DEFAULT '1180',
    \`side_gutter\` text DEFAULT 'standard',
    \`banner_width\` text DEFAULT 'content',
    \`default_ratios_equipment\` text DEFAULT 'original',
    \`default_ratios_factory\` text DEFAULT 'original',
    \`default_ratios_case\` text DEFAULT 'original',
    \`default_ratios_application\` text DEFAULT 'original',
    \`default_ratios_video_cover\` text DEFAULT '16/9',
    \`default_ratios_banner\` text DEFAULT 'original',
    \`_status\` text DEFAULT 'draft',
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_theme\`("id", "palette", "quote_button_color", "heading_font", "body_font", "font_scale", "spacing_scale", "text_levels_page_title_style", "text_levels_section_title_style", "text_levels_kicker_style", "text_levels_body_style", "text_levels_button_style", "content_width", "side_gutter", "banner_width", "default_ratios_equipment", "default_ratios_factory", "default_ratios_case", "default_ratios_application", "default_ratios_video_cover", "default_ratios_banner", "_status", "updated_at", "created_at") SELECT "id", "palette", "quote_button_color", "heading_font", "body_font", "font_scale", "spacing_scale", "text_levels_page_title_style", "text_levels_section_title_style", "text_levels_kicker_style", "text_levels_body_style", "text_levels_button_style", "content_width", "side_gutter", "banner_width", "default_ratios_equipment", "default_ratios_factory", "default_ratios_case", "default_ratios_application", "default_ratios_video_cover", "default_ratios_banner", "_status", "updated_at", "created_at" FROM \`theme\`;`)
  await db.run(sql`DROP TABLE \`theme\`;`)
  await db.run(sql`ALTER TABLE \`__new_theme\` RENAME TO \`theme\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`theme__status_idx\` ON \`theme\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__theme_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version_palette\` text DEFAULT 'industrial-blue',
    \`version_quote_button_color\` text DEFAULT 'orange',
    \`version_heading_font\` text DEFAULT 'system',
    \`version_body_font\` text DEFAULT 'system',
    \`version_font_scale\` text DEFAULT 'standard',
    \`version_spacing_scale\` text DEFAULT 'standard',
    \`version_text_levels_page_title_style\` text,
    \`version_text_levels_section_title_style\` text,
    \`version_text_levels_kicker_style\` text,
    \`version_text_levels_body_style\` text,
    \`version_text_levels_button_style\` text,
    \`version_content_width\` text DEFAULT '1180',
    \`version_side_gutter\` text DEFAULT 'standard',
    \`version_banner_width\` text DEFAULT 'content',
    \`version_default_ratios_equipment\` text DEFAULT 'original',
    \`version_default_ratios_factory\` text DEFAULT 'original',
    \`version_default_ratios_case\` text DEFAULT 'original',
    \`version_default_ratios_application\` text DEFAULT 'original',
    \`version_default_ratios_video_cover\` text DEFAULT '16/9',
    \`version_default_ratios_banner\` text DEFAULT 'original',
    \`version__status\` text DEFAULT 'draft',
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`latest\` integer
  );
  `)
  await db.run(sql`INSERT INTO \`__new__theme_v\`("id", "version_palette", "version_quote_button_color", "version_heading_font", "version_body_font", "version_font_scale", "version_spacing_scale", "version_text_levels_page_title_style", "version_text_levels_section_title_style", "version_text_levels_kicker_style", "version_text_levels_body_style", "version_text_levels_button_style", "version_content_width", "version_side_gutter", "version_banner_width", "version_default_ratios_equipment", "version_default_ratios_factory", "version_default_ratios_case", "version_default_ratios_application", "version_default_ratios_video_cover", "version_default_ratios_banner", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest") SELECT "id", "version_palette", "version_quote_button_color", "version_heading_font", "version_body_font", "version_font_scale", "version_spacing_scale", "version_text_levels_page_title_style", "version_text_levels_section_title_style", "version_text_levels_kicker_style", "version_text_levels_body_style", "version_text_levels_button_style", "version_content_width", "version_side_gutter", "version_banner_width", "version_default_ratios_equipment", "version_default_ratios_factory", "version_default_ratios_case", "version_default_ratios_application", "version_default_ratios_video_cover", "version_default_ratios_banner", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest" FROM \`_theme_v\`;`)
  await db.run(sql`DROP TABLE \`_theme_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__theme_v\` RENAME TO \`_theme_v\`;`)
  await db.run(sql`CREATE INDEX \`_theme_v_version_version__status_idx\` ON \`_theme_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_created_at_idx\` ON \`_theme_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_updated_at_idx\` ON \`_theme_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_latest_idx\` ON \`_theme_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`products_applications\` ADD \`name_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_faqs\` ADD \`question_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_faqs\` ADD \`answer_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_advantages\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_advantages\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_process_steps\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_process_steps\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`name_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`hero_summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`proposal_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`form_intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_applications\` ADD \`name_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_faqs\` ADD \`question_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_faqs\` ADD \`answer_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_advantages\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_advantages\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_process_steps\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_process_steps\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_name_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_hero_summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_proposal_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_form_intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`capacity_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`customer_name_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`equipment_configuration_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_capacity_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_customer_name_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_equipment_configuration_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`intro_body_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`description_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_intro_body_style\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_theme\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`palette\` text DEFAULT 'industrial-blue',
    \`quote_button_color\` text DEFAULT 'orange',
    \`heading_font\` text DEFAULT 'system',
    \`body_font\` text DEFAULT 'system',
    \`font_scale\` text DEFAULT 'standard',
    \`spacing_scale\` text DEFAULT 'standard',
    \`text_levels_page_title_style\` text,
    \`text_levels_section_title_style\` text,
    \`text_levels_kicker_style\` text,
    \`text_levels_body_style\` text,
    \`text_levels_button_style\` text,
    \`content_width\` text DEFAULT '1180',
    \`side_gutter\` text DEFAULT 'standard',
    \`banner_width\` text DEFAULT 'content',
    \`default_ratios_equipment\` text DEFAULT '4/3',
    \`default_ratios_factory\` text DEFAULT '4/3',
    \`default_ratios_case\` text DEFAULT '4/3',
    \`default_ratios_application\` text DEFAULT '1/1',
    \`default_ratios_video_cover\` text DEFAULT '16/9',
    \`default_ratios_banner\` text DEFAULT 'original',
    \`_status\` text DEFAULT 'draft',
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_theme\`("id", "palette", "quote_button_color", "heading_font", "body_font", "font_scale", "spacing_scale", "text_levels_page_title_style", "text_levels_section_title_style", "text_levels_kicker_style", "text_levels_body_style", "text_levels_button_style", "content_width", "side_gutter", "banner_width", "default_ratios_equipment", "default_ratios_factory", "default_ratios_case", "default_ratios_application", "default_ratios_video_cover", "default_ratios_banner", "_status", "updated_at", "created_at") SELECT "id", "palette", "quote_button_color", "heading_font", "body_font", "font_scale", "spacing_scale", "text_levels_page_title_style", "text_levels_section_title_style", "text_levels_kicker_style", "text_levels_body_style", "text_levels_button_style", "content_width", "side_gutter", "banner_width", "default_ratios_equipment", "default_ratios_factory", "default_ratios_case", "default_ratios_application", "default_ratios_video_cover", "default_ratios_banner", "_status", "updated_at", "created_at" FROM \`theme\`;`)
  await db.run(sql`DROP TABLE \`theme\`;`)
  await db.run(sql`ALTER TABLE \`__new_theme\` RENAME TO \`theme\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`theme__status_idx\` ON \`theme\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__theme_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version_palette\` text DEFAULT 'industrial-blue',
    \`version_quote_button_color\` text DEFAULT 'orange',
    \`version_heading_font\` text DEFAULT 'system',
    \`version_body_font\` text DEFAULT 'system',
    \`version_font_scale\` text DEFAULT 'standard',
    \`version_spacing_scale\` text DEFAULT 'standard',
    \`version_text_levels_page_title_style\` text,
    \`version_text_levels_section_title_style\` text,
    \`version_text_levels_kicker_style\` text,
    \`version_text_levels_body_style\` text,
    \`version_text_levels_button_style\` text,
    \`version_content_width\` text DEFAULT '1180',
    \`version_side_gutter\` text DEFAULT 'standard',
    \`version_banner_width\` text DEFAULT 'content',
    \`version_default_ratios_equipment\` text DEFAULT '4/3',
    \`version_default_ratios_factory\` text DEFAULT '4/3',
    \`version_default_ratios_case\` text DEFAULT '4/3',
    \`version_default_ratios_application\` text DEFAULT '1/1',
    \`version_default_ratios_video_cover\` text DEFAULT '16/9',
    \`version_default_ratios_banner\` text DEFAULT 'original',
    \`version__status\` text DEFAULT 'draft',
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`latest\` integer
  );
  `)
  await db.run(sql`INSERT INTO \`__new__theme_v\`("id", "version_palette", "version_quote_button_color", "version_heading_font", "version_body_font", "version_font_scale", "version_spacing_scale", "version_text_levels_page_title_style", "version_text_levels_section_title_style", "version_text_levels_kicker_style", "version_text_levels_body_style", "version_text_levels_button_style", "version_content_width", "version_side_gutter", "version_banner_width", "version_default_ratios_equipment", "version_default_ratios_factory", "version_default_ratios_case", "version_default_ratios_application", "version_default_ratios_video_cover", "version_default_ratios_banner", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest") SELECT "id", "version_palette", "version_quote_button_color", "version_heading_font", "version_body_font", "version_font_scale", "version_spacing_scale", "version_text_levels_page_title_style", "version_text_levels_section_title_style", "version_text_levels_kicker_style", "version_text_levels_body_style", "version_text_levels_button_style", "version_content_width", "version_side_gutter", "version_banner_width", "version_default_ratios_equipment", "version_default_ratios_factory", "version_default_ratios_case", "version_default_ratios_application", "version_default_ratios_video_cover", "version_default_ratios_banner", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest" FROM \`_theme_v\`;`)
  await db.run(sql`DROP TABLE \`_theme_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__theme_v\` RENAME TO \`_theme_v\`;`)
  await db.run(sql`CREATE INDEX \`_theme_v_version_version__status_idx\` ON \`_theme_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_created_at_idx\` ON \`_theme_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_updated_at_idx\` ON \`_theme_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_latest_idx\` ON \`_theme_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`products_applications\` DROP COLUMN \`name_style\`;`)
  await db.run(sql`ALTER TABLE \`products_faqs\` DROP COLUMN \`question_style\`;`)
  await db.run(sql`ALTER TABLE \`products_faqs\` DROP COLUMN \`answer_style\`;`)
  await db.run(sql`ALTER TABLE \`products_advantages\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`products_advantages\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`products_process_steps\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`products_process_steps\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`name_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`list_summary_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`hero_summary_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`proposal_text_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`form_intro_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_applications\` DROP COLUMN \`name_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_faqs\` DROP COLUMN \`question_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_faqs\` DROP COLUMN \`answer_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_advantages\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_advantages\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_process_steps\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_process_steps\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_name_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_list_summary_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_hero_summary_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_proposal_text_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_form_intro_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`summary_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`capacity_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`customer_name_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`equipment_configuration_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_summary_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_capacity_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_customer_name_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_equipment_configuration_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`intro_body_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` DROP COLUMN \`description_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_intro_body_style\`;`)
}
