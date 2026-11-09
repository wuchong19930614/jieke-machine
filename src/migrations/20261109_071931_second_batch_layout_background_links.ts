import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 手工补丁：Payload 生成的 ALTER TABLE ADD … REFERENCES 不带删除规则，默认 NO ACTION。libsql 默认开启外键，
  // 删除被引用（含历史版本里引用）的产品、案例、图片会失败；这里统一补成和建表时一样的 ON DELETE set null
  await db.run(sql`ALTER TABLE \`products_sections\` ADD \`background_color\` text;`)
  await db.run(sql`ALTER TABLE \`products_sections\` ADD \`background_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`products_sections\` ADD \`background_overlay\` numeric DEFAULT 40;`)
  await db.run(sql`CREATE INDEX \`products_sections_background_image_idx\` ON \`products_sections\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`products_applications\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products_process_steps\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`list_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`hero_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`overview_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`flow_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`detail_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`video_cover_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`contact_image_ratio_custom\` text;`)
  await db.run(sql`CREATE INDEX \`products_list_link_list_link_product_idx\` ON \`products\` (\`list_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`products_list_link_list_link_case_study_idx\` ON \`products\` (\`list_link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`_products_v_version_sections\` ADD \`background_color\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_sections\` ADD \`background_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_sections\` ADD \`background_overlay\` numeric DEFAULT 40;`)
  await db.run(sql`CREATE INDEX \`_products_v_version_sections_background_image_idx\` ON \`_products_v_version_sections\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_products_v_version_applications\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_process_steps\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_list_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_hero_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_overview_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_flow_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_detail_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_video_cover_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_contact_image_ratio_custom\` text;`)
  await db.run(sql`CREATE INDEX \`_products_v_version_list_link_version_list_link_product_idx\` ON \`_products_v\` (\`version_list_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_list_link_version_list_link_case_stu_idx\` ON \`_products_v\` (\`version_list_link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`cover_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`hero_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`gallery_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`video_cover_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_cover_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_hero_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_gallery_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_video_cover_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`content_width\` text DEFAULT '1180';`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`side_gutter\` text DEFAULT 'standard';`)
  await db.run(sql`ALTER TABLE \`theme\` ADD \`banner_width\` text DEFAULT 'content';`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_content_width\` text DEFAULT '1180';`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_side_gutter\` text DEFAULT 'standard';`)
  await db.run(sql`ALTER TABLE \`_theme_v\` ADD \`version_banner_width\` text DEFAULT 'content';`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`background_color\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`background_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`home_page_sections\` ADD \`background_overlay\` numeric DEFAULT 40;`)
  await db.run(sql`CREATE INDEX \`home_page_sections_background_image_idx\` ON \`home_page_sections\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`factory_gallery_images_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`background_color\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`background_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_sections\` ADD \`background_overlay\` numeric DEFAULT 40;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_background_image_idx\` ON \`_home_page_v_version_sections\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_factory_gallery_images_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_sections\` ADD \`background_color\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_sections\` ADD \`background_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`about_page_sections\` ADD \`background_overlay\` numeric DEFAULT 40;`)
  await db.run(sql`CREATE INDEX \`about_page_sections_background_image_idx\` ON \`about_page_sections\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_scenes_items\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_link_link_product_idx\` ON \`about_page_scenes_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_link_link_case_study_idx\` ON \`about_page_scenes_items\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`image_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`about_page_capabilities_items\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`about_page_capabilities_items_image_idx\` ON \`about_page_capabilities_items\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_capabilities_items_link_link_product_idx\` ON \`about_page_capabilities_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_capabilities_items_link_link_case_study_idx\` ON \`about_page_capabilities_items\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`intro_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`scenes_display\` text DEFAULT 'cards';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`scenes_columns\` text DEFAULT '3';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`scenes_images_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`scenes_images_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`scenes_images_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`capabilities_display\` text DEFAULT 'cards';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`capabilities_columns\` text DEFAULT '3';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`capabilities_images_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`capabilities_images_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`about_page\` ADD \`capabilities_images_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_sections\` ADD \`background_color\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_sections\` ADD \`background_image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_sections\` ADD \`background_overlay\` numeric DEFAULT 40;`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_sections_background_image_idx\` ON \`_about_page_v_version_sections\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_scenes_items\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_link_link_product_idx\` ON \`_about_page_v_version_scenes_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_link_link_case_study_idx\` ON \`_about_page_v_version_scenes_items\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`image_id\` integer REFERENCES media(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`image_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`link_product_id\` integer REFERENCES products(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`link_case_study_id\` integer REFERENCES cases(id) ON UPDATE no action ON DELETE set null;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v_version_capabilities_items\` ADD \`link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_capabilities_items_image_idx\` ON \`_about_page_v_version_capabilities_items\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_capabilities_items_link_link_produ_idx\` ON \`_about_page_v_version_capabilities_items\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_capabilities_items_link_link_case__idx\` ON \`_about_page_v_version_capabilities_items\` (\`link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_intro_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_scenes_display\` text DEFAULT 'cards';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_scenes_columns\` text DEFAULT '3';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_scenes_images_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_scenes_images_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_scenes_images_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_capabilities_display\` text DEFAULT 'cards';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_capabilities_columns\` text DEFAULT '3';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_capabilities_images_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_capabilities_images_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` ADD \`version_capabilities_images_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`list_image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`list_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`list_image_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`list_image_width\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`list_image_position\` text DEFAULT 'alternate';`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_list_image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_list_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_list_image_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_list_image_width\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_list_image_position\` text DEFAULT 'alternate';`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_image_ratio_custom\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_products_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_products_sections\`("_order", "_parent_id", "id", "module", "visible", "background") SELECT "_order", "_parent_id", "id", "module", "visible", "background" FROM \`products_sections\`;`)
  await db.run(sql`DROP TABLE \`products_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_products_sections\` RENAME TO \`products_sections\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`products_sections_order_idx\` ON \`products_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_sections_parent_id_idx\` ON \`products_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`name\` text,
  	\`name_zh\` text,
  	\`product_code\` text,
  	\`category\` text DEFAULT 'production-lines',
  	\`list_image_id\` integer,
  	\`list_image_ratio\` text DEFAULT 'default',
  	\`list_image_fit\` text DEFAULT 'default',
  	\`list_summary\` text,
  	\`slug\` text,
  	\`hero_image_id\` integer,
  	\`hero_image_ratio\` text DEFAULT 'default',
  	\`hero_image_fit\` text DEFAULT 'default',
  	\`hero_kicker\` text,
  	\`hero_kicker_hidden\` integer DEFAULT false,
  	\`hero_summary\` text,
  	\`introduction\` text,
  	\`overview_image_id\` integer,
  	\`overview_image_ratio\` text DEFAULT 'default',
  	\`overview_image_fit\` text DEFAULT 'default',
  	\`features\` text,
  	\`proposal_title\` text,
  	\`proposal_title_hidden\` integer DEFAULT false,
  	\`proposal_text\` text,
  	\`proposal_button_text\` text,
  	\`proposal_button_text_hidden\` integer DEFAULT false,
  	\`process_text\` text,
  	\`flow_image_id\` integer,
  	\`flow_image_ratio\` text DEFAULT 'default',
  	\`flow_image_fit\` text DEFAULT 'default',
  	\`spec_table\` text DEFAULT '{"models":[],"rows":[{"id":"r1","label":"Raw Material","public":false,"values":{}},{"id":"r2","label":"Final Product","public":false,"values":{}},{"id":"r3","label":"Capacity (kg/h)","public":false,"values":{}},{"id":"r4","label":"Capacity Test Conditions","public":false,"values":{}},{"id":"r5","label":"Included Equipment","public":false,"values":{}},{"id":"r6","label":"Optional Equipment","public":false,"values":{}},{"id":"r7","label":"Power (kW)","public":false,"values":{}},{"id":"r8","label":"Voltage (V)","public":false,"values":{}},{"id":"r9","label":"Frequency (Hz)","public":false,"values":{}},{"id":"r10","label":"Phase","public":false,"values":{}},{"id":"r11","label":"Dimensions (L × W × H, mm)","public":false,"values":{}},{"id":"r12","label":"Weight (kg)","public":false,"values":{}},{"id":"r13","label":"Machine Material","public":false,"values":{}},{"id":"r14","label":"Site Requirements","public":false,"values":{}},{"id":"r15","label":"Scope of Supply","public":false,"values":{}},{"id":"r16","label":"Installation & Training","public":false,"values":{}},{"id":"r17","label":"Warranty & Spare Parts","public":false,"values":{}}]}',
  	\`audience\` text,
  	\`project_support\` text,
  	\`detail_image_id\` integer,
  	\`detail_image_ratio\` text DEFAULT 'default',
  	\`detail_image_fit\` text DEFAULT 'default',
  	\`video_url\` text,
  	\`video_title\` text,
  	\`video_title_hidden\` integer DEFAULT false,
  	\`video_cover_id\` integer,
  	\`video_cover_ratio\` text DEFAULT 'default',
  	\`video_cover_fit\` text DEFAULT 'default',
  	\`form_title\` text,
  	\`form_title_hidden\` integer DEFAULT false,
  	\`form_intro\` text,
  	\`form_intro_hidden\` integer DEFAULT false,
  	\`contact_image_id\` integer,
  	\`contact_image_ratio\` text DEFAULT 'default',
  	\`contact_image_fit\` text DEFAULT 'default',
  	\`brochure_id\` integer,
  	\`brochure_in_specs\` integer DEFAULT true,
  	\`section_texts_hero_button\` text,
  	\`section_texts_brochure_button\` text,
  	\`section_texts_brochure_meta\` text,
  	\`section_texts_applications_title\` text,
  	\`section_texts_applications_subtitle\` text,
  	\`section_texts_applications_aria\` text,
  	\`section_texts_intro_kicker\` text,
  	\`section_texts_intro_title\` text,
  	\`section_texts_features_title\` text,
  	\`section_texts_process_title\` text,
  	\`section_texts_specs_title\` text,
  	\`section_texts_specs_model\` text,
  	\`section_texts_specs_swipe\` text,
  	\`section_texts_specs_empty\` text,
  	\`section_texts_audience_title\` text,
  	\`section_texts_support_title\` text,
  	\`section_texts_faq_title\` text,
  	\`section_texts_advantages_title\` text,
  	\`section_texts_advantages_subtitle\` text,
  	\`section_texts_steps_kicker\` text,
  	\`section_texts_steps_title\` text,
  	\`section_texts_steps_subtitle\` text,
  	\`section_texts_steps_aria\` text,
  	\`section_texts_step_aria\` text,
  	\`section_texts_related_title\` text,
  	\`section_texts_related_subtitle\` text,
  	\`section_texts_related_button\` text,
  	\`section_texts_cases_title\` text,
  	\`section_texts_cases_subtitle\` text,
  	\`section_texts_cases_button\` text,
  	\`section_texts_inquiry_kicker\` text,
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`list_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`overview_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`flow_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`detail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`contact_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`brochure_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_products\`("id", "_order", "name", "name_zh", "product_code", "category", "list_image_id", "list_image_ratio", "list_image_fit", "list_summary", "slug", "hero_image_id", "hero_image_ratio", "hero_image_fit", "hero_kicker", "hero_kicker_hidden", "hero_summary", "introduction", "overview_image_id", "overview_image_ratio", "overview_image_fit", "features", "proposal_title", "proposal_title_hidden", "proposal_text", "proposal_button_text", "proposal_button_text_hidden", "process_text", "flow_image_id", "flow_image_ratio", "flow_image_fit", "spec_table", "audience", "project_support", "detail_image_id", "detail_image_ratio", "detail_image_fit", "video_url", "video_title", "video_title_hidden", "video_cover_id", "video_cover_ratio", "video_cover_fit", "form_title", "form_title_hidden", "form_intro", "form_intro_hidden", "contact_image_id", "contact_image_ratio", "contact_image_fit", "brochure_id", "brochure_in_specs", "section_texts_hero_button", "section_texts_brochure_button", "section_texts_brochure_meta", "section_texts_applications_title", "section_texts_applications_subtitle", "section_texts_applications_aria", "section_texts_intro_kicker", "section_texts_intro_title", "section_texts_features_title", "section_texts_process_title", "section_texts_specs_title", "section_texts_specs_model", "section_texts_specs_swipe", "section_texts_specs_empty", "section_texts_audience_title", "section_texts_support_title", "section_texts_faq_title", "section_texts_advantages_title", "section_texts_advantages_subtitle", "section_texts_steps_kicker", "section_texts_steps_title", "section_texts_steps_subtitle", "section_texts_steps_aria", "section_texts_step_aria", "section_texts_related_title", "section_texts_related_subtitle", "section_texts_related_button", "section_texts_cases_title", "section_texts_cases_subtitle", "section_texts_cases_button", "section_texts_inquiry_kicker", "seo_seo_title", "seo_seo_description", "seo_og_image_id", "seo_noindex", "updated_at", "created_at", "_status") SELECT "id", "_order", "name", "name_zh", "product_code", "category", "list_image_id", "list_image_ratio", "list_image_fit", "list_summary", "slug", "hero_image_id", "hero_image_ratio", "hero_image_fit", "hero_kicker", "hero_kicker_hidden", "hero_summary", "introduction", "overview_image_id", "overview_image_ratio", "overview_image_fit", "features", "proposal_title", "proposal_title_hidden", "proposal_text", "proposal_button_text", "proposal_button_text_hidden", "process_text", "flow_image_id", "flow_image_ratio", "flow_image_fit", "spec_table", "audience", "project_support", "detail_image_id", "detail_image_ratio", "detail_image_fit", "video_url", "video_title", "video_title_hidden", "video_cover_id", "video_cover_ratio", "video_cover_fit", "form_title", "form_title_hidden", "form_intro", "form_intro_hidden", "contact_image_id", "contact_image_ratio", "contact_image_fit", "brochure_id", "brochure_in_specs", "section_texts_hero_button", "section_texts_brochure_button", "section_texts_brochure_meta", "section_texts_applications_title", "section_texts_applications_subtitle", "section_texts_applications_aria", "section_texts_intro_kicker", "section_texts_intro_title", "section_texts_features_title", "section_texts_process_title", "section_texts_specs_title", "section_texts_specs_model", "section_texts_specs_swipe", "section_texts_specs_empty", "section_texts_audience_title", "section_texts_support_title", "section_texts_faq_title", "section_texts_advantages_title", "section_texts_advantages_subtitle", "section_texts_steps_kicker", "section_texts_steps_title", "section_texts_steps_subtitle", "section_texts_steps_aria", "section_texts_step_aria", "section_texts_related_title", "section_texts_related_subtitle", "section_texts_related_button", "section_texts_cases_title", "section_texts_cases_subtitle", "section_texts_cases_button", "section_texts_inquiry_kicker", "seo_seo_title", "seo_seo_description", "seo_og_image_id", "seo_noindex", "updated_at", "created_at", "_status" FROM \`products\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`ALTER TABLE \`__new_products\` RENAME TO \`products\`;`)
  await db.run(sql`CREATE INDEX \`products__order_idx\` ON \`products\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_list_image_idx\` ON \`products\` (\`list_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_hero_image_idx\` ON \`products\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_overview_image_idx\` ON \`products\` (\`overview_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_flow_image_idx\` ON \`products\` (\`flow_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_detail_image_idx\` ON \`products\` (\`detail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_video_cover_idx\` ON \`products\` (\`video_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`products_contact_image_idx\` ON \`products\` (\`contact_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_brochure_idx\` ON \`products\` (\`brochure_id\`);`)
  await db.run(sql`CREATE INDEX \`products_seo_seo_og_image_idx\` ON \`products\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`products__status_idx\` ON \`products\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__products_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__products_v_version_sections\`("_order", "_parent_id", "id", "module", "visible", "background", "_uuid") SELECT "_order", "_parent_id", "id", "module", "visible", "background", "_uuid" FROM \`_products_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new__products_v_version_sections\` RENAME TO \`_products_v_version_sections\`;`)
  await db.run(sql`CREATE INDEX \`_products_v_version_sections_order_idx\` ON \`_products_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_sections_parent_id_idx\` ON \`_products_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__products_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_name\` text,
  	\`version_name_zh\` text,
  	\`version_product_code\` text,
  	\`version_category\` text DEFAULT 'production-lines',
  	\`version_list_image_id\` integer,
  	\`version_list_image_ratio\` text DEFAULT 'default',
  	\`version_list_image_fit\` text DEFAULT 'default',
  	\`version_list_summary\` text,
  	\`version_slug\` text,
  	\`version_hero_image_id\` integer,
  	\`version_hero_image_ratio\` text DEFAULT 'default',
  	\`version_hero_image_fit\` text DEFAULT 'default',
  	\`version_hero_kicker\` text,
  	\`version_hero_kicker_hidden\` integer DEFAULT false,
  	\`version_hero_summary\` text,
  	\`version_introduction\` text,
  	\`version_overview_image_id\` integer,
  	\`version_overview_image_ratio\` text DEFAULT 'default',
  	\`version_overview_image_fit\` text DEFAULT 'default',
  	\`version_features\` text,
  	\`version_proposal_title\` text,
  	\`version_proposal_title_hidden\` integer DEFAULT false,
  	\`version_proposal_text\` text,
  	\`version_proposal_button_text\` text,
  	\`version_proposal_button_text_hidden\` integer DEFAULT false,
  	\`version_process_text\` text,
  	\`version_flow_image_id\` integer,
  	\`version_flow_image_ratio\` text DEFAULT 'default',
  	\`version_flow_image_fit\` text DEFAULT 'default',
  	\`version_spec_table\` text DEFAULT '{"models":[],"rows":[{"id":"r1","label":"Raw Material","public":false,"values":{}},{"id":"r2","label":"Final Product","public":false,"values":{}},{"id":"r3","label":"Capacity (kg/h)","public":false,"values":{}},{"id":"r4","label":"Capacity Test Conditions","public":false,"values":{}},{"id":"r5","label":"Included Equipment","public":false,"values":{}},{"id":"r6","label":"Optional Equipment","public":false,"values":{}},{"id":"r7","label":"Power (kW)","public":false,"values":{}},{"id":"r8","label":"Voltage (V)","public":false,"values":{}},{"id":"r9","label":"Frequency (Hz)","public":false,"values":{}},{"id":"r10","label":"Phase","public":false,"values":{}},{"id":"r11","label":"Dimensions (L × W × H, mm)","public":false,"values":{}},{"id":"r12","label":"Weight (kg)","public":false,"values":{}},{"id":"r13","label":"Machine Material","public":false,"values":{}},{"id":"r14","label":"Site Requirements","public":false,"values":{}},{"id":"r15","label":"Scope of Supply","public":false,"values":{}},{"id":"r16","label":"Installation & Training","public":false,"values":{}},{"id":"r17","label":"Warranty & Spare Parts","public":false,"values":{}}]}',
  	\`version_audience\` text,
  	\`version_project_support\` text,
  	\`version_detail_image_id\` integer,
  	\`version_detail_image_ratio\` text DEFAULT 'default',
  	\`version_detail_image_fit\` text DEFAULT 'default',
  	\`version_video_url\` text,
  	\`version_video_title\` text,
  	\`version_video_title_hidden\` integer DEFAULT false,
  	\`version_video_cover_id\` integer,
  	\`version_video_cover_ratio\` text DEFAULT 'default',
  	\`version_video_cover_fit\` text DEFAULT 'default',
  	\`version_form_title\` text,
  	\`version_form_title_hidden\` integer DEFAULT false,
  	\`version_form_intro\` text,
  	\`version_form_intro_hidden\` integer DEFAULT false,
  	\`version_contact_image_id\` integer,
  	\`version_contact_image_ratio\` text DEFAULT 'default',
  	\`version_contact_image_fit\` text DEFAULT 'default',
  	\`version_brochure_id\` integer,
  	\`version_brochure_in_specs\` integer DEFAULT true,
  	\`version_section_texts_hero_button\` text,
  	\`version_section_texts_brochure_button\` text,
  	\`version_section_texts_brochure_meta\` text,
  	\`version_section_texts_applications_title\` text,
  	\`version_section_texts_applications_subtitle\` text,
  	\`version_section_texts_applications_aria\` text,
  	\`version_section_texts_intro_kicker\` text,
  	\`version_section_texts_intro_title\` text,
  	\`version_section_texts_features_title\` text,
  	\`version_section_texts_process_title\` text,
  	\`version_section_texts_specs_title\` text,
  	\`version_section_texts_specs_model\` text,
  	\`version_section_texts_specs_swipe\` text,
  	\`version_section_texts_specs_empty\` text,
  	\`version_section_texts_audience_title\` text,
  	\`version_section_texts_support_title\` text,
  	\`version_section_texts_faq_title\` text,
  	\`version_section_texts_advantages_title\` text,
  	\`version_section_texts_advantages_subtitle\` text,
  	\`version_section_texts_steps_kicker\` text,
  	\`version_section_texts_steps_title\` text,
  	\`version_section_texts_steps_subtitle\` text,
  	\`version_section_texts_steps_aria\` text,
  	\`version_section_texts_step_aria\` text,
  	\`version_section_texts_related_title\` text,
  	\`version_section_texts_related_subtitle\` text,
  	\`version_section_texts_related_button\` text,
  	\`version_section_texts_cases_title\` text,
  	\`version_section_texts_cases_subtitle\` text,
  	\`version_section_texts_cases_button\` text,
  	\`version_section_texts_inquiry_kicker\` text,
  	\`version_seo_seo_title\` text,
  	\`version_seo_seo_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_list_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_overview_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_flow_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_detail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_contact_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_brochure_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__products_v\`("id", "parent_id", "version__order", "version_name", "version_name_zh", "version_product_code", "version_category", "version_list_image_id", "version_list_image_ratio", "version_list_image_fit", "version_list_summary", "version_slug", "version_hero_image_id", "version_hero_image_ratio", "version_hero_image_fit", "version_hero_kicker", "version_hero_kicker_hidden", "version_hero_summary", "version_introduction", "version_overview_image_id", "version_overview_image_ratio", "version_overview_image_fit", "version_features", "version_proposal_title", "version_proposal_title_hidden", "version_proposal_text", "version_proposal_button_text", "version_proposal_button_text_hidden", "version_process_text", "version_flow_image_id", "version_flow_image_ratio", "version_flow_image_fit", "version_spec_table", "version_audience", "version_project_support", "version_detail_image_id", "version_detail_image_ratio", "version_detail_image_fit", "version_video_url", "version_video_title", "version_video_title_hidden", "version_video_cover_id", "version_video_cover_ratio", "version_video_cover_fit", "version_form_title", "version_form_title_hidden", "version_form_intro", "version_form_intro_hidden", "version_contact_image_id", "version_contact_image_ratio", "version_contact_image_fit", "version_brochure_id", "version_brochure_in_specs", "version_section_texts_hero_button", "version_section_texts_brochure_button", "version_section_texts_brochure_meta", "version_section_texts_applications_title", "version_section_texts_applications_subtitle", "version_section_texts_applications_aria", "version_section_texts_intro_kicker", "version_section_texts_intro_title", "version_section_texts_features_title", "version_section_texts_process_title", "version_section_texts_specs_title", "version_section_texts_specs_model", "version_section_texts_specs_swipe", "version_section_texts_specs_empty", "version_section_texts_audience_title", "version_section_texts_support_title", "version_section_texts_faq_title", "version_section_texts_advantages_title", "version_section_texts_advantages_subtitle", "version_section_texts_steps_kicker", "version_section_texts_steps_title", "version_section_texts_steps_subtitle", "version_section_texts_steps_aria", "version_section_texts_step_aria", "version_section_texts_related_title", "version_section_texts_related_subtitle", "version_section_texts_related_button", "version_section_texts_cases_title", "version_section_texts_cases_subtitle", "version_section_texts_cases_button", "version_section_texts_inquiry_kicker", "version_seo_seo_title", "version_seo_seo_description", "version_seo_og_image_id", "version_seo_noindex", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest") SELECT "id", "parent_id", "version__order", "version_name", "version_name_zh", "version_product_code", "version_category", "version_list_image_id", "version_list_image_ratio", "version_list_image_fit", "version_list_summary", "version_slug", "version_hero_image_id", "version_hero_image_ratio", "version_hero_image_fit", "version_hero_kicker", "version_hero_kicker_hidden", "version_hero_summary", "version_introduction", "version_overview_image_id", "version_overview_image_ratio", "version_overview_image_fit", "version_features", "version_proposal_title", "version_proposal_title_hidden", "version_proposal_text", "version_proposal_button_text", "version_proposal_button_text_hidden", "version_process_text", "version_flow_image_id", "version_flow_image_ratio", "version_flow_image_fit", "version_spec_table", "version_audience", "version_project_support", "version_detail_image_id", "version_detail_image_ratio", "version_detail_image_fit", "version_video_url", "version_video_title", "version_video_title_hidden", "version_video_cover_id", "version_video_cover_ratio", "version_video_cover_fit", "version_form_title", "version_form_title_hidden", "version_form_intro", "version_form_intro_hidden", "version_contact_image_id", "version_contact_image_ratio", "version_contact_image_fit", "version_brochure_id", "version_brochure_in_specs", "version_section_texts_hero_button", "version_section_texts_brochure_button", "version_section_texts_brochure_meta", "version_section_texts_applications_title", "version_section_texts_applications_subtitle", "version_section_texts_applications_aria", "version_section_texts_intro_kicker", "version_section_texts_intro_title", "version_section_texts_features_title", "version_section_texts_process_title", "version_section_texts_specs_title", "version_section_texts_specs_model", "version_section_texts_specs_swipe", "version_section_texts_specs_empty", "version_section_texts_audience_title", "version_section_texts_support_title", "version_section_texts_faq_title", "version_section_texts_advantages_title", "version_section_texts_advantages_subtitle", "version_section_texts_steps_kicker", "version_section_texts_steps_title", "version_section_texts_steps_subtitle", "version_section_texts_steps_aria", "version_section_texts_step_aria", "version_section_texts_related_title", "version_section_texts_related_subtitle", "version_section_texts_related_button", "version_section_texts_cases_title", "version_section_texts_cases_subtitle", "version_section_texts_cases_button", "version_section_texts_inquiry_kicker", "version_seo_seo_title", "version_seo_seo_description", "version_seo_og_image_id", "version_seo_noindex", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest" FROM \`_products_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__products_v\` RENAME TO \`_products_v\`;`)
  await db.run(sql`CREATE INDEX \`_products_v_parent_idx\` ON \`_products_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version__order_idx\` ON \`_products_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_list_image_idx\` ON \`_products_v\` (\`version_list_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_slug_idx\` ON \`_products_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_hero_image_idx\` ON \`_products_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_overview_image_idx\` ON \`_products_v\` (\`version_overview_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_flow_image_idx\` ON \`_products_v\` (\`version_flow_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_detail_image_idx\` ON \`_products_v\` (\`version_detail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_video_cover_idx\` ON \`_products_v\` (\`version_video_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_contact_image_idx\` ON \`_products_v\` (\`version_contact_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_brochure_idx\` ON \`_products_v\` (\`version_brochure_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_seo_version_seo_og_image_idx\` ON \`_products_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_updated_at_idx\` ON \`_products_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_created_at_idx\` ON \`_products_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version__status_idx\` ON \`_products_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_created_at_idx\` ON \`_products_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_updated_at_idx\` ON \`_products_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_latest_idx\` ON \`_products_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`__new_home_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page_sections\`("_order", "_parent_id", "id", "module", "visible", "background") SELECT "_order", "_parent_id", "id", "module", "visible", "background" FROM \`home_page_sections\`;`)
  await db.run(sql`DROP TABLE \`home_page_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page_sections\` RENAME TO \`home_page_sections\`;`)
  await db.run(sql`CREATE INDEX \`home_page_sections_order_idx\` ON \`home_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_parent_id_idx\` ON \`home_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v_version_sections\`("_order", "_parent_id", "id", "module", "visible", "background", "_uuid") SELECT "_order", "_parent_id", "id", "module", "visible", "background", "_uuid" FROM \`_home_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v_version_sections\` RENAME TO \`_home_page_v_version_sections\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_order_idx\` ON \`_home_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_parent_id_idx\` ON \`_home_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_sections\`("_order", "_parent_id", "id", "module", "visible", "background") SELECT "_order", "_parent_id", "id", "module", "visible", "background" FROM \`about_page_sections\`;`)
  await db.run(sql`DROP TABLE \`about_page_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_sections\` RENAME TO \`about_page_sections\`;`)
  await db.run(sql`CREATE INDEX \`about_page_sections_order_idx\` ON \`about_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_sections_parent_id_idx\` ON \`about_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_scenes_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_ratio\` text DEFAULT 'default',
  	\`image_fit\` text DEFAULT 'default',
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_scenes_items\`("_order", "_parent_id", "id", "image_id", "image_ratio", "image_fit", "title", "description") SELECT "_order", "_parent_id", "id", "image_id", "image_ratio", "image_fit", "title", "description" FROM \`about_page_scenes_items\`;`)
  await db.run(sql`DROP TABLE \`about_page_scenes_items\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_scenes_items\` RENAME TO \`about_page_scenes_items\`;`)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_order_idx\` ON \`about_page_scenes_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_parent_id_idx\` ON \`about_page_scenes_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_image_idx\` ON \`about_page_scenes_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_about_page_capabilities_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_about_page_capabilities_items\`("_order", "_parent_id", "id", "title", "description") SELECT "_order", "_parent_id", "id", "title", "description" FROM \`about_page_capabilities_items\`;`)
  await db.run(sql`DROP TABLE \`about_page_capabilities_items\`;`)
  await db.run(sql`ALTER TABLE \`__new_about_page_capabilities_items\` RENAME TO \`about_page_capabilities_items\`;`)
  await db.run(sql`CREATE INDEX \`about_page_capabilities_items_order_idx\` ON \`about_page_capabilities_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_capabilities_items_parent_id_idx\` ON \`about_page_capabilities_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__about_page_v_version_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__about_page_v_version_sections\`("_order", "_parent_id", "id", "module", "visible", "background", "_uuid") SELECT "_order", "_parent_id", "id", "module", "visible", "background", "_uuid" FROM \`_about_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_sections\`;`)
  await db.run(sql`ALTER TABLE \`__new__about_page_v_version_sections\` RENAME TO \`_about_page_v_version_sections\`;`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_sections_order_idx\` ON \`_about_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_sections_parent_id_idx\` ON \`_about_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__about_page_v_version_scenes_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_ratio\` text DEFAULT 'default',
  	\`image_fit\` text DEFAULT 'default',
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__about_page_v_version_scenes_items\`("_order", "_parent_id", "id", "image_id", "image_ratio", "image_fit", "title", "description", "_uuid") SELECT "_order", "_parent_id", "id", "image_id", "image_ratio", "image_fit", "title", "description", "_uuid" FROM \`_about_page_v_version_scenes_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_scenes_items\`;`)
  await db.run(sql`ALTER TABLE \`__new__about_page_v_version_scenes_items\` RENAME TO \`_about_page_v_version_scenes_items\`;`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_order_idx\` ON \`_about_page_v_version_scenes_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_parent_id_idx\` ON \`_about_page_v_version_scenes_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_image_idx\` ON \`_about_page_v_version_scenes_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__about_page_v_version_capabilities_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__about_page_v_version_capabilities_items\`("_order", "_parent_id", "id", "title", "description", "_uuid") SELECT "_order", "_parent_id", "id", "title", "description", "_uuid" FROM \`_about_page_v_version_capabilities_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_capabilities_items\`;`)
  await db.run(sql`ALTER TABLE \`__new__about_page_v_version_capabilities_items\` RENAME TO \`_about_page_v_version_capabilities_items\`;`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_capabilities_items_order_idx\` ON \`_about_page_v_version_capabilities_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_capabilities_items_parent_id_idx\` ON \`_about_page_v_version_capabilities_items\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`products_applications\` DROP COLUMN \`image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`products_process_steps\` DROP COLUMN \`image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_applications\` DROP COLUMN \`image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_products_v_version_process_steps\` DROP COLUMN \`image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`cover_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`hero_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`gallery_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`video_cover_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_cover_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_hero_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_gallery_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_video_cover_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`content_width\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`side_gutter\`;`)
  await db.run(sql`ALTER TABLE \`theme\` DROP COLUMN \`banner_width\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_content_width\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_side_gutter\`;`)
  await db.run(sql`ALTER TABLE \`_theme_v\` DROP COLUMN \`version_banner_width\`;`)
  await db.run(sql`ALTER TABLE \`home_page\` DROP COLUMN \`factory_gallery_images_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` DROP COLUMN \`version_factory_gallery_images_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`intro_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`scenes_display\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`scenes_columns\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`scenes_images_ratio\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`scenes_images_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`scenes_images_fit\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`capabilities_display\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`capabilities_columns\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`capabilities_images_ratio\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`capabilities_images_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`about_page\` DROP COLUMN \`capabilities_images_fit\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_intro_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_scenes_display\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_scenes_columns\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_scenes_images_ratio\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_scenes_images_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_scenes_images_fit\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_capabilities_display\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_capabilities_columns\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_capabilities_images_ratio\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_capabilities_images_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_about_page_v\` DROP COLUMN \`version_capabilities_images_fit\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`list_image_ratio\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`list_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`list_image_fit\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`list_image_width\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`list_image_position\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_list_image_ratio\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_list_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_list_image_fit\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_list_image_width\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_list_image_position\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_image_ratio_custom\`;`)
}
