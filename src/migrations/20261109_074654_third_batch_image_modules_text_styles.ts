import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 手工补丁：Payload 生成的 ALTER TABLE ADD … REFERENCES 不带删除规则，默认 NO ACTION。libsql 默认开启外键，
  // 删除被引用（含历史版本里引用）的产品、案例、图片会失败；这里统一补成和建表时一样的 ON DELETE set null
  await db.run(sql`CREATE TABLE \`home_page_sections_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`mobile_image_id\` integer,
  	\`link_type\` text DEFAULT 'default',
  	\`link_product_id\` integer,
  	\`link_case_study_id\` integer,
  	\`link_page\` text,
  	\`link_url\` text,
  	\`link_new_tab\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_case_study_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_sections_grid_items_order_idx\` ON \`home_page_sections_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_grid_items_parent_id_idx\` ON \`home_page_sections_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_grid_items_image_idx\` ON \`home_page_sections_grid_items\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_grid_items_mobile_image_idx\` ON \`home_page_sections_grid_items\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_grid_items_link_link_product_idx\` ON \`home_page_sections_grid_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_grid_items_link_link_case_study_idx\` ON \`home_page_sections_grid_items\` (\`link_case_study_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_factory_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_ratio\` text DEFAULT 'default',
  	\`image_ratio_custom\` text,
  	\`image_fit\` text DEFAULT 'default',
  	\`link_type\` text DEFAULT 'default',
  	\`link_product_id\` integer,
  	\`link_case_study_id\` integer,
  	\`link_page\` text,
  	\`link_url\` text,
  	\`link_new_tab\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_case_study_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_factory_gallery_items_order_idx\` ON \`home_page_factory_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_factory_gallery_items_parent_id_idx\` ON \`home_page_factory_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_factory_gallery_items_image_idx\` ON \`home_page_factory_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_factory_gallery_items_link_link_product_idx\` ON \`home_page_factory_gallery_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_factory_gallery_items_link_link_case_study_idx\` ON \`home_page_factory_gallery_items\` (\`link_case_study_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_sections_grid_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`mobile_image_id\` integer,
  	\`link_type\` text DEFAULT 'default',
  	\`link_product_id\` integer,
  	\`link_case_study_id\` integer,
  	\`link_page\` text,
  	\`link_url\` text,
  	\`link_new_tab\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_case_study_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v_version_sections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_grid_items_order_idx\` ON \`_home_page_v_version_sections_grid_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_grid_items_parent_id_idx\` ON \`_home_page_v_version_sections_grid_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_grid_items_image_idx\` ON \`_home_page_v_version_sections_grid_items\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_grid_items_mobile_image_idx\` ON \`_home_page_v_version_sections_grid_items\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_grid_items_link_link_produ_idx\` ON \`_home_page_v_version_sections_grid_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_grid_items_link_link_case__idx\` ON \`_home_page_v_version_sections_grid_items\` (\`link_case_study_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_factory_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_ratio\` text DEFAULT 'default',
  	\`image_ratio_custom\` text,
  	\`image_fit\` text DEFAULT 'default',
  	\`link_type\` text DEFAULT 'default',
  	\`link_product_id\` integer,
  	\`link_case_study_id\` integer,
  	\`link_page\` text,
  	\`link_url\` text,
  	\`link_new_tab\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_case_study_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_factory_gallery_items_order_idx\` ON \`_home_page_v_version_factory_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_factory_gallery_items_parent_id_idx\` ON \`_home_page_v_version_factory_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_factory_gallery_items_image_idx\` ON \`_home_page_v_version_factory_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_factory_gallery_items_link_link_pro_idx\` ON \`_home_page_v_version_factory_gallery_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_factory_gallery_items_link_link_cas_idx\` ON \`_home_page_v_version_factory_gallery_items\` (\`link_case_study_id\`);`)
  // 第 3 点：厂房展示从“多图字段”改成“图片列表”（每张可设链接）。把原有图片按原顺序搬到新列表，
  // 草稿和历史版本也一起搬；搬完删除旧的关联行。
  // 必须放在下面重建 home_page_rels 之前：重建后的表不再有 media_id 列。
  // 关联表的 order 可以为空，新表的 _order 不能为空，为空时按关联行 id 排
  await db.run(sql`INSERT INTO \`home_page_factory_gallery_items\` (\`_order\`, \`_parent_id\`, \`id\`, \`image_id\`)
    SELECT COALESCE(\`order\`, \`id\`), \`parent_id\`, lower(hex(randomblob(12))), \`media_id\` FROM \`home_page_rels\`
    WHERE \`path\` = 'factoryGallery.images' AND \`media_id\` IS NOT NULL ORDER BY \`parent_id\`, COALESCE(\`order\`, \`id\`);`)
  await db.run(sql`INSERT INTO \`_home_page_v_version_factory_gallery_items\` (\`_order\`, \`_parent_id\`, \`image_id\`, \`_uuid\`)
    SELECT COALESCE(\`order\`, \`id\`), \`parent_id\`, \`media_id\`, lower(hex(randomblob(12))) FROM \`_home_page_v_rels\`
    WHERE \`path\` = 'version.factoryGallery.images' AND \`media_id\` IS NOT NULL ORDER BY \`parent_id\`, COALESCE(\`order\`, \`id\`);`)
  await db.run(sql`DELETE FROM \`home_page_rels\` WHERE \`path\` = 'factoryGallery.images';`)
  await db.run(sql`DELETE FROM \`_home_page_v_rels\` WHERE \`path\` = 'version.factoryGallery.images';`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_page_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page_rels\`("id", "order", "parent_id", "path", "products_id", "cases_id") SELECT "id", "order", "parent_id", "path", "products_id", "cases_id" FROM \`home_page_rels\`;`)
  await db.run(sql`DROP TABLE \`home_page_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page_rels\` RENAME TO \`home_page_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_rels_order_idx\` ON \`home_page_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_parent_idx\` ON \`home_page_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_path_idx\` ON \`home_page_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_products_id_idx\` ON \`home_page_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_cases_id_idx\` ON \`home_page_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v_rels\`("id", "order", "parent_id", "path", "products_id", "cases_id") SELECT "id", "order", "parent_id", "path", "products_id", "cases_id" FROM \`_home_page_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v_rels\` RENAME TO \`_home_page_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_order_idx\` ON \`_home_page_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_parent_idx\` ON \`_home_page_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_path_idx\` ON \`_home_page_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_products_id_idx\` ON \`_home_page_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_cases_id_idx\` ON \`_home_page_v_rels\` (\`cases_id\`);`)
  await db.run(sql`ALTER TABLE \`products_sections\` ADD \`device\` text DEFAULT 'all';`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`hero_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`proposal_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`proposal_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`video_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`form_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_hero_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_brochure_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_applications_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_applications_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_intro_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_intro_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_features_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_process_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_specs_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_audience_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_support_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_faq_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_advantages_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_advantages_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_steps_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_steps_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_steps_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_related_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_related_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_related_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_cases_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_cases_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_cases_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`section_texts_inquiry_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_sections\` ADD \`device\` text DEFAULT 'all';`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_hero_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_proposal_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_proposal_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_video_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_form_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_hero_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_brochure_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_applications_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_applications_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_intro_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_intro_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_features_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_process_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_specs_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_audience_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_support_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_faq_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_advantages_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_advantages_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_steps_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_steps_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_steps_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_related_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_related_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_related_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_cases_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_cases_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_cases_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_section_texts_inquiry_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_back_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_overview_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_requirements_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_solution_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_delivery_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_photos_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_video_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_lines_used_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_lines_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_primary_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`section_texts_secondary_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_back_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_overview_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_requirements_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_solution_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_delivery_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_photos_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_video_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_lines_used_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_lines_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_primary_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_section_texts_secondary_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`text_levels_page_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`text_levels_section_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`text_levels_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`text_levels_body_style\` text;`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`text_levels_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_text_levels_page_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_text_levels_section_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_text_levels_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_text_levels_body_style\` text;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_text_levels_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`device\` text DEFAULT 'all';`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`desktop_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`mobile_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`columns\` text DEFAULT '3';`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`mobile_columns\` text DEFAULT '2';`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`height\` numeric;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`mobile_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`image_width\` text DEFAULT 'content';`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`home_page_sections_desktop_image_idx\` ON \`home_page_sections\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_mobile_image_idx\` ON \`home_page_sections\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_link_link_product_idx\` ON \`home_page_sections\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_link_link_case_study_idx\` ON \`home_page_sections\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`overlay\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`quote_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`product_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_link_link_product_idx\` ON \`home_page_banners_slides\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_link_link_case_study_idx\` ON \`home_page_banners_slides\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`services_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`services_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_company_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`factory_gallery_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`factory_gallery_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`factory_gallery_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_card_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_all_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`device\` text DEFAULT 'all';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`desktop_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`mobile_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`columns\` text DEFAULT '3';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`mobile_columns\` text DEFAULT '2';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`height\` numeric;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`mobile_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`image_width\` text DEFAULT 'content';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_desktop_image_idx\` ON \`_home_page_v_version_sections\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_mobile_image_idx\` ON \`_home_page_v_version_sections\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_link_link_product_idx\` ON \`_home_page_v_version_sections\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_link_link_case_study_idx\` ON \`_home_page_v_version_sections\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`overlay\` numeric DEFAULT 50;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`quote_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`product_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_link_link_product_idx\` ON \`_home_page_v_version_banners_slides\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_link_link_case_study_idx\` ON \`_home_page_v_version_banners_slides\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_services_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_services_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_company_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_factory_gallery_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_factory_gallery_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_factory_gallery_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_card_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_all_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_sections\` ADD \`device\` text DEFAULT 'all';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`banner_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`banner_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`intro_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`intro_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`intro_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`scenes_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`scenes_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`capabilities_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`capabilities_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_sections\` ADD \`device\` text DEFAULT 'all';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_banner_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_banner_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_intro_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_intro_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_intro_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_scenes_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_scenes_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_capabilities_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_capabilities_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases_page\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases_page\` ADD \`subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases_page\` ADD \`list_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`cases_page\` ADD \`list_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` ADD \`version_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` ADD \`version_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` ADD \`version_list_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` ADD \`version_list_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`title_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`heading_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`form_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_kicker_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_heading_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_form_title_style\` text;`)

}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`home_page_sections_grid_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_factory_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_sections_grid_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_factory_gallery_items\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay\` numeric DEFAULT 40,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page_sections\`("_order", "_parent_id", "id", "module", "visible", "background", "background_color", "background_image_id", "background_overlay") SELECT "_order", "_parent_id", "id", "module", "visible", "background", "background_color", "background_image_id", "background_overlay" FROM \`home_page_sections\`;`)
  await db.run(sql`DROP TABLE \`home_page_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page_sections\` RENAME TO \`home_page_sections\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_sections_order_idx\` ON \`home_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_parent_id_idx\` ON \`home_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_background_image_idx\` ON \`home_page_sections\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_home_page_banners_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`desktop_image_id\` integer,
  	\`mobile_image_id\` integer,
  	\`kicker\` text,
  	\`kicker_hidden\` integer DEFAULT false,
  	\`title\` text,
  	\`subtitle\` text,
  	\`quote_button_text\` text,
  	\`quote_button_text_hidden\` integer DEFAULT false,
  	\`product_button_text\` text,
  	\`product_button_text_hidden\` integer DEFAULT false,
  	\`product_id\` integer,
  	FOREIGN KEY (\`desktop_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page_banners_slides\`("_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "kicker", "kicker_hidden", "title", "subtitle", "quote_button_text", "quote_button_text_hidden", "product_button_text", "product_button_text_hidden", "product_id") SELECT "_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "kicker", "kicker_hidden", "title", "subtitle", "quote_button_text", "quote_button_text_hidden", "product_button_text", "product_button_text_hidden", "product_id" FROM \`home_page_banners_slides\`;`)
  await db.run(sql`DROP TABLE \`home_page_banners_slides\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page_banners_slides\` RENAME TO \`home_page_banners_slides\`;`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_order_idx\` ON \`home_page_banners_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_parent_id_idx\` ON \`home_page_banners_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_desktop_image_idx\` ON \`home_page_banners_slides\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_mobile_image_idx\` ON \`home_page_banners_slides\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_product_idx\` ON \`home_page_banners_slides\` (\`product_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	\`background_color\` text,
  	\`background_image_id\` integer,
  	\`background_overlay\` numeric DEFAULT 40,
  	\`_uuid\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v_version_sections\`("_order", "_parent_id", "id", "module", "visible", "background", "background_color", "background_image_id", "background_overlay", "_uuid") SELECT "_order", "_parent_id", "id", "module", "visible", "background", "background_color", "background_image_id", "background_overlay", "_uuid" FROM \`_home_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v_version_sections\` RENAME TO \`_home_page_v_version_sections\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_order_idx\` ON \`_home_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_parent_id_idx\` ON \`_home_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_background_image_idx\` ON \`_home_page_v_version_sections\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v_version_banners_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`desktop_image_id\` integer,
  	\`mobile_image_id\` integer,
  	\`kicker\` text,
  	\`kicker_hidden\` integer DEFAULT false,
  	\`title\` text,
  	\`subtitle\` text,
  	\`quote_button_text\` text,
  	\`quote_button_text_hidden\` integer DEFAULT false,
  	\`product_button_text\` text,
  	\`product_button_text_hidden\` integer DEFAULT false,
  	\`product_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`desktop_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v_version_banners_slides\`("_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "kicker", "kicker_hidden", "title", "subtitle", "quote_button_text", "quote_button_text_hidden", "product_button_text", "product_button_text_hidden", "product_id", "_uuid") SELECT "_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "kicker", "kicker_hidden", "title", "subtitle", "quote_button_text", "quote_button_text_hidden", "product_button_text", "product_button_text_hidden", "product_id", "_uuid" FROM \`_home_page_v_version_banners_slides\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_banners_slides\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v_version_banners_slides\` RENAME TO \`_home_page_v_version_banners_slides\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_order_idx\` ON \`_home_page_v_version_banners_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_parent_id_idx\` ON \`_home_page_v_version_banners_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_desktop_image_idx\` ON \`_home_page_v_version_banners_slides\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_mobile_image_idx\` ON \`_home_page_v_version_banners_slides\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_product_idx\` ON \`_home_page_v_version_banners_slides\` (\`product_id\`);`)
  await db.run(sql`ALTER TABLE \`home_page_rels\` ADD \`media_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_media_id_idx\` ON \`home_page_rels\` (\`media_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_rels\` ADD \`media_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_media_id_idx\` ON \`_home_page_v_rels\` (\`media_id\`);`)
  await db.run(sql`ALTER TABLE \`products_sections\` DROP COLUMN \`device\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`hero_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`proposal_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`proposal_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`video_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`form_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_hero_button_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_brochure_button_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_applications_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_applications_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_intro_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_intro_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_features_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_process_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_specs_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_audience_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_support_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_faq_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_advantages_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_advantages_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_steps_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_steps_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_steps_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_related_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_related_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_related_button_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_cases_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_cases_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_cases_button_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`section_texts_inquiry_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_sections\` DROP COLUMN \`device\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_hero_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_proposal_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_proposal_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_video_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_form_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_hero_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_brochure_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_applications_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_applications_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_intro_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_intro_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_features_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_process_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_specs_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_audience_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_support_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_faq_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_advantages_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_advantages_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_steps_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_steps_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_steps_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_related_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_related_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_related_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_cases_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_cases_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_cases_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_section_texts_inquiry_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_back_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_overview_title_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_requirements_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_solution_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_delivery_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_photos_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_video_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_lines_used_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_lines_button_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_primary_button_style\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`section_texts_secondary_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_back_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_overview_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_requirements_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_solution_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_delivery_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_photos_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_video_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_lines_used_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_lines_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_primary_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_section_texts_secondary_button_style\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`text_levels_page_title_style\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`text_levels_section_title_style\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`text_levels_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`text_levels_body_style\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`text_levels_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_text_levels_page_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_text_levels_section_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_text_levels_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_text_levels_body_style\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_text_levels_button_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`services_title_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`services_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`about_intro_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`about_intro_title_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`about_intro_company_title_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`about_intro_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`factory_gallery_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`factory_gallery_title_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`factory_gallery_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`product_lines_title_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`product_lines_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`featured_cases_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`featured_cases_title_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`featured_cases_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`featured_cases_card_button_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`featured_cases_all_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_services_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_services_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_about_intro_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_about_intro_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_about_intro_company_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_about_intro_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_factory_gallery_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_factory_gallery_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_factory_gallery_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_product_lines_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_product_lines_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_featured_cases_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_featured_cases_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_featured_cases_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_featured_cases_card_button_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_featured_cases_all_button_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page_sections\` DROP COLUMN \`device\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`banner_title_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`banner_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`intro_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`intro_title_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`intro_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`scenes_title_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`scenes_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`capabilities_title_style\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`capabilities_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_sections\` DROP COLUMN \`device\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_banner_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_banner_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_intro_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_intro_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_intro_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_scenes_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_scenes_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_capabilities_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_capabilities_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`cases_page\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`cases_page\` DROP COLUMN \`subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`cases_page\` DROP COLUMN \`list_title_style\`;`)
  await db.run(sql`ALTER TABLE \`cases_page\` DROP COLUMN \`list_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` DROP COLUMN \`version_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` DROP COLUMN \`version_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` DROP COLUMN \`version_list_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_page_v\` DROP COLUMN \`version_list_subtitle_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`title_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`heading_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`form_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_kicker_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_heading_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_form_title_style\`;`)
}
