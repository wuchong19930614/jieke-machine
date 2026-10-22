import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`title\` text,
  	\`content\` text,
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_seo_og_image_idx\` ON \`pages\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_title\` text,
  	\`version_content\` text,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_version_seo_og_image_idx\` ON \`_pages_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`products_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_sections_order_idx\` ON \`products_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_sections_parent_id_idx\` ON \`products_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_applications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`name\` text,
  	\`visible\` integer DEFAULT true,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_applications_order_idx\` ON \`products_applications\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_applications_parent_id_idx\` ON \`products_applications\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_applications_image_idx\` ON \`products_applications\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`visible\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_faqs_order_idx\` ON \`products_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_faqs_parent_id_idx\` ON \`products_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_advantages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`visible\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_advantages_order_idx\` ON \`products_advantages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_advantages_parent_id_idx\` ON \`products_advantages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_process_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`image_id\` integer,
  	\`description\` text,
  	\`visible\` integer DEFAULT true,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_process_steps_order_idx\` ON \`products_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_process_steps_parent_id_idx\` ON \`products_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_process_steps_image_idx\` ON \`products_process_steps\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products\` (
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
  	\`hero_summary\` text,
  	\`introduction\` text,
  	\`overview_image_id\` integer,
  	\`overview_image_ratio\` text DEFAULT 'default',
  	\`overview_image_fit\` text DEFAULT 'default',
  	\`features\` text,
  	\`proposal_title\` text,
  	\`proposal_text\` text,
  	\`proposal_button_text\` text,
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
  	\`video_cover_id\` integer,
  	\`video_cover_ratio\` text DEFAULT 'default',
  	\`video_cover_fit\` text DEFAULT 'default',
  	\`form_title\` text,
  	\`form_intro\` text,
  	\`contact_image_id\` integer,
  	\`contact_image_ratio\` text DEFAULT 'default',
  	\`contact_image_fit\` text DEFAULT 'default',
  	\`brochure_id\` integer,
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
  await db.run(sql`CREATE TABLE \`products_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_products_id_idx\` ON \`products_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_cases_id_idx\` ON \`products_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_sections\` (
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
  await db.run(sql`CREATE INDEX \`_products_v_version_sections_order_idx\` ON \`_products_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_sections_parent_id_idx\` ON \`_products_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_applications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`name\` text,
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_applications_order_idx\` ON \`_products_v_version_applications\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_applications_parent_id_idx\` ON \`_products_v_version_applications\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_applications_image_idx\` ON \`_products_v_version_applications\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`question\` text,
  	\`answer\` text,
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_faqs_order_idx\` ON \`_products_v_version_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_faqs_parent_id_idx\` ON \`_products_v_version_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_advantages\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_advantages_order_idx\` ON \`_products_v_version_advantages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_advantages_parent_id_idx\` ON \`_products_v_version_advantages\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_process_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`image_id\` integer,
  	\`description\` text,
  	\`visible\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_process_steps_order_idx\` ON \`_products_v_version_process_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_process_steps_parent_id_idx\` ON \`_products_v_version_process_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_process_steps_image_idx\` ON \`_products_v_version_process_steps\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v\` (
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
  	\`version_hero_summary\` text,
  	\`version_introduction\` text,
  	\`version_overview_image_id\` integer,
  	\`version_overview_image_ratio\` text DEFAULT 'default',
  	\`version_overview_image_fit\` text DEFAULT 'default',
  	\`version_features\` text,
  	\`version_proposal_title\` text,
  	\`version_proposal_text\` text,
  	\`version_proposal_button_text\` text,
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
  	\`version_video_cover_id\` integer,
  	\`version_video_cover_ratio\` text DEFAULT 'default',
  	\`version_video_cover_fit\` text DEFAULT 'default',
  	\`version_form_title\` text,
  	\`version_form_intro\` text,
  	\`version_contact_image_id\` integer,
  	\`version_contact_image_ratio\` text DEFAULT 'default',
  	\`version_contact_image_fit\` text DEFAULT 'default',
  	\`version_brochure_id\` integer,
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
  await db.run(sql`CREATE TABLE \`_products_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_rels_order_idx\` ON \`_products_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_parent_idx\` ON \`_products_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_path_idx\` ON \`_products_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_products_id_idx\` ON \`_products_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_cases_id_idx\` ON \`_products_v_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE TABLE \`cases\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`title\` text,
  	\`country\` text,
  	\`capacity\` text,
  	\`cover_image_id\` integer,
  	\`cover_image_ratio\` text DEFAULT 'default',
  	\`cover_image_fit\` text DEFAULT 'default',
  	\`summary\` text,
  	\`slug\` text,
  	\`customer_name\` text,
  	\`show_customer_name\` integer DEFAULT false,
  	\`equipment_configuration\` text,
  	\`delivery_date\` text,
  	\`customer_requirements\` text,
  	\`solution\` text,
  	\`delivery_operation\` text,
  	\`hero_image_id\` integer,
  	\`hero_image_ratio\` text DEFAULT 'default',
  	\`hero_image_fit\` text DEFAULT 'default',
  	\`video_url\` text,
  	\`video_cover_id\` integer,
  	\`video_cover_ratio\` text DEFAULT 'default',
  	\`video_cover_fit\` text DEFAULT 'default',
  	\`section_texts_back\` text,
  	\`section_texts_overview_title\` text,
  	\`section_texts_customer\` text,
  	\`section_texts_country\` text,
  	\`section_texts_configuration\` text,
  	\`section_texts_capacity\` text,
  	\`section_texts_delivery_date\` text,
  	\`section_texts_requirements\` text,
  	\`section_texts_solution\` text,
  	\`section_texts_delivery\` text,
  	\`section_texts_photos\` text,
  	\`section_texts_video\` text,
  	\`section_texts_lines_used\` text,
  	\`section_texts_lines_button\` text,
  	\`section_texts_primary_button\` text,
  	\`section_texts_secondary_button\` text,
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`video_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`cases__order_idx\` ON \`cases\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cases_cover_image_idx\` ON \`cases\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`cases_slug_idx\` ON \`cases\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`cases_hero_image_idx\` ON \`cases\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`cases_video_cover_idx\` ON \`cases\` (\`video_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`cases_seo_seo_og_image_idx\` ON \`cases\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`cases_updated_at_idx\` ON \`cases\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`cases_created_at_idx\` ON \`cases\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`cases__status_idx\` ON \`cases\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`cases_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cases_rels_order_idx\` ON \`cases_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`cases_rels_parent_idx\` ON \`cases_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`cases_rels_path_idx\` ON \`cases_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`cases_rels_products_id_idx\` ON \`cases_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`cases_rels_media_id_idx\` ON \`cases_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_cases_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_title\` text,
  	\`version_country\` text,
  	\`version_capacity\` text,
  	\`version_cover_image_id\` integer,
  	\`version_cover_image_ratio\` text DEFAULT 'default',
  	\`version_cover_image_fit\` text DEFAULT 'default',
  	\`version_summary\` text,
  	\`version_slug\` text,
  	\`version_customer_name\` text,
  	\`version_show_customer_name\` integer DEFAULT false,
  	\`version_equipment_configuration\` text,
  	\`version_delivery_date\` text,
  	\`version_customer_requirements\` text,
  	\`version_solution\` text,
  	\`version_delivery_operation\` text,
  	\`version_hero_image_id\` integer,
  	\`version_hero_image_ratio\` text DEFAULT 'default',
  	\`version_hero_image_fit\` text DEFAULT 'default',
  	\`version_video_url\` text,
  	\`version_video_cover_id\` integer,
  	\`version_video_cover_ratio\` text DEFAULT 'default',
  	\`version_video_cover_fit\` text DEFAULT 'default',
  	\`version_section_texts_back\` text,
  	\`version_section_texts_overview_title\` text,
  	\`version_section_texts_customer\` text,
  	\`version_section_texts_country\` text,
  	\`version_section_texts_configuration\` text,
  	\`version_section_texts_capacity\` text,
  	\`version_section_texts_delivery_date\` text,
  	\`version_section_texts_requirements\` text,
  	\`version_section_texts_solution\` text,
  	\`version_section_texts_delivery\` text,
  	\`version_section_texts_photos\` text,
  	\`version_section_texts_video\` text,
  	\`version_section_texts_lines_used\` text,
  	\`version_section_texts_lines_button\` text,
  	\`version_section_texts_primary_button\` text,
  	\`version_section_texts_secondary_button\` text,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_video_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_cases_v_parent_idx\` ON \`_cases_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version__order_idx\` ON \`_cases_v\` (\`version__order\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version_cover_image_idx\` ON \`_cases_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version_slug_idx\` ON \`_cases_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version_hero_image_idx\` ON \`_cases_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version_video_cover_idx\` ON \`_cases_v\` (\`version_video_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_seo_version_seo_og_image_idx\` ON \`_cases_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version_updated_at_idx\` ON \`_cases_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version_created_at_idx\` ON \`_cases_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_version__status_idx\` ON \`_cases_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_created_at_idx\` ON \`_cases_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_updated_at_idx\` ON \`_cases_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_latest_idx\` ON \`_cases_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_cases_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_cases_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_cases_v_rels_order_idx\` ON \`_cases_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_rels_parent_idx\` ON \`_cases_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_rels_path_idx\` ON \`_cases_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_rels_products_id_idx\` ON \`_cases_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_rels_media_id_idx\` ON \`_cases_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`usage\` text DEFAULT 'other',
  	\`caption\` text,
  	\`license_note\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE TABLE \`inquiries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`inquiry_ref\` text,
  	\`source\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`country\` text,
  	\`phone\` text,
  	\`company\` text,
  	\`product_model\` text,
  	\`requirements\` text NOT NULL,
  	\`product_id\` integer,
  	\`product_name\` text,
  	\`product_code\` text,
  	\`page_url\` text,
  	\`landing_page\` text,
  	\`referrer\` text,
  	\`utm_source\` text,
  	\`utm_medium\` text,
  	\`utm_campaign\` text,
  	\`utm_term\` text,
  	\`utm_content\` text,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`assignee_id\` integer,
  	\`notes\` text,
  	\`notify_status\` text DEFAULT 'pending',
  	\`notify_attempts\` numeric DEFAULT 0,
  	\`notify_error\` text,
  	\`auto_reply_status\` text DEFAULT 'pending',
  	\`auto_reply_attempts\` numeric DEFAULT 0,
  	\`auto_reply_error\` text,
  	\`spam_flag\` text DEFAULT 'none',
  	\`ip_hash\` text,
  	\`user_agent\` text,
  	\`submission_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`assignee_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`inquiries_inquiry_ref_idx\` ON \`inquiries\` (\`inquiry_ref\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_product_idx\` ON \`inquiries\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_assignee_idx\` ON \`inquiries\` (\`assignee_id\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_ip_hash_idx\` ON \`inquiries\` (\`ip_hash\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`inquiries_submission_id_idx\` ON \`inquiries\` (\`submission_id\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_updated_at_idx\` ON \`inquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_created_at_idx\` ON \`inquiries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`users_edit_scope_globals\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_edit_scope_globals_order_idx\` ON \`users_edit_scope_globals\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_edit_scope_globals_parent_idx\` ON \`users_edit_scope_globals\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`edit_scope_limited\` integer DEFAULT false,
  	\`totp_secret\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`users_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_rels_order_idx\` ON \`users_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_parent_idx\` ON \`users_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_path_idx\` ON \`users_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_products_id_idx\` ON \`users_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_cases_id_idx\` ON \`users_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE TABLE \`backups\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text NOT NULL,
  	\`status\` text NOT NULL,
  	\`file\` text,
  	\`size_bytes\` numeric,
  	\`tables\` numeric,
  	\`rows\` numeric,
  	\`duration_ms\` numeric,
  	\`files_copied\` numeric,
  	\`error\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`backups_updated_at_idx\` ON \`backups\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`backups_created_at_idx\` ON \`backups\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to_type\` text DEFAULT 'reference',
  	\`to_url\` text,
  	\`type\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`redirects_from_idx\` ON \`redirects\` (\`from\`);`)
  await db.run(sql`CREATE INDEX \`redirects_updated_at_idx\` ON \`redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`redirects_created_at_idx\` ON \`redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`redirects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`redirects_rels_order_idx\` ON \`redirects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_parent_idx\` ON \`redirects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_path_idx\` ON \`redirects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_products_id_idx\` ON \`redirects_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_cases_id_idx\` ON \`redirects_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE TABLE \`exports\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`format\` text DEFAULT 'csv' NOT NULL,
  	\`limit\` numeric,
  	\`page\` numeric DEFAULT 1,
  	\`sort\` text,
  	\`sort_order\` text,
  	\`drafts\` text DEFAULT 'yes',
  	\`collection_slug\` text DEFAULT 'inquiries' NOT NULL,
  	\`where\` text DEFAULT '{}',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`exports_updated_at_idx\` ON \`exports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`exports_created_at_idx\` ON \`exports\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`exports_filename_idx\` ON \`exports\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`exports_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`exports\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exports_texts_order_parent\` ON \`exports_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`imports\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`collection_slug\` text DEFAULT 'products' NOT NULL,
  	\`import_mode\` text,
  	\`match_field\` text DEFAULT 'id',
  	\`status\` text DEFAULT 'pending',
  	\`summary_imported\` numeric,
  	\`summary_updated\` numeric,
  	\`summary_total\` numeric,
  	\`summary_issues\` numeric,
  	\`summary_issue_details\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`imports_updated_at_idx\` ON \`imports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`imports_created_at_idx\` ON \`imports\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`imports_filename_idx\` ON \`imports\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`totp_attempts\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`attempts\` numeric DEFAULT 0 NOT NULL,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`executed_at\` text NOT NULL,
  	\`completed_at\` text NOT NULL,
  	\`task_slug\` text NOT NULL,
  	\`task_i_d\` text NOT NULL,
  	\`input\` text,
  	\`output\` text,
  	\`state\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_order_idx\` ON \`payload_jobs_log\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_parent_id_idx\` ON \`payload_jobs_log\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`input\` text,
  	\`completed_at\` text,
  	\`total_tried\` numeric DEFAULT 0,
  	\`has_error\` integer DEFAULT false,
  	\`error\` text,
  	\`task_slug\` text,
  	\`queue\` text DEFAULT 'default',
  	\`wait_until\` text,
  	\`processing\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_completed_at_idx\` ON \`payload_jobs\` (\`completed_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_total_tried_idx\` ON \`payload_jobs\` (\`total_tried\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_has_error_idx\` ON \`payload_jobs\` (\`has_error\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_task_slug_idx\` ON \`payload_jobs\` (\`task_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_queue_idx\` ON \`payload_jobs\` (\`queue\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_wait_until_idx\` ON \`payload_jobs\` (\`wait_until\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_processing_idx\` ON \`payload_jobs\` (\`processing\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_updated_at_idx\` ON \`payload_jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_created_at_idx\` ON \`payload_jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	\`media_id\` integer,
  	\`inquiries_id\` integer,
  	\`users_id\` integer,
  	\`backups_id\` integer,
  	\`redirects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inquiries_id\`) REFERENCES \`inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`backups_id\`) REFERENCES \`backups\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_cases_id_idx\` ON \`payload_locked_documents_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`inquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_backups_id_idx\` ON \`payload_locked_documents_rels\` (\`backups_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`company_name\` text,
  	\`logo_id\` integer,
  	\`footer_intro\` text,
  	\`email\` text,
  	\`phone\` text,
  	\`whatsapp\` text,
  	\`address\` text,
  	\`office_hours\` text,
  	\`facebook\` text,
  	\`instagram\` text,
  	\`tiktok\` text,
  	\`youtube\` text,
  	\`linkedin\` text,
  	\`nav_labels_home\` text,
  	\`nav_labels_about\` text,
  	\`nav_labels_products\` text,
  	\`nav_labels_cases\` text,
  	\`nav_labels_contact\` text,
  	\`floating_tools_region\` text,
  	\`floating_tools_email\` text,
  	\`floating_tools_phone\` text,
  	\`floating_tools_contact\` text,
  	\`floating_tools_chat\` text,
  	\`floating_tools_top\` text,
  	\`floating_tools_blue\` text,
  	\`contact_band_title\` text,
  	\`contact_band_text\` text,
  	\`contact_band_button_text\` text,
  	\`form_texts_required_note\` text,
  	\`form_texts_name_label\` text,
  	\`form_texts_name_placeholder\` text,
  	\`form_texts_email_label\` text,
  	\`form_texts_email_placeholder\` text,
  	\`form_texts_country_label\` text,
  	\`form_texts_country_optional_label\` text,
  	\`form_texts_country_placeholder\` text,
  	\`form_texts_phone_label\` text,
  	\`form_texts_phone_placeholder\` text,
  	\`form_texts_company_label\` text,
  	\`form_texts_company_placeholder\` text,
  	\`form_texts_product_label\` text,
  	\`form_texts_product_placeholder\` text,
  	\`form_texts_product_page_placeholder\` text,
  	\`form_texts_product_prefill\` text,
  	\`form_texts_requirements_label\` text,
  	\`form_texts_requirements_placeholder\` text,
  	\`form_texts_privacy_note\` text,
  	\`form_texts_privacy_link_text\` text,
  	\`form_texts_submit_inquiry\` text,
  	\`form_texts_submit_message\` text,
  	\`form_texts_sending\` text,
  	\`form_texts_error_summary\` text,
  	\`form_texts_err_name_required\` text,
  	\`form_texts_err_name_too_long\` text,
  	\`form_texts_err_email_required\` text,
  	\`form_texts_err_email_invalid\` text,
  	\`form_texts_err_country_required\` text,
  	\`form_texts_err_phone_too_long\` text,
  	\`form_texts_err_company_too_long\` text,
  	\`form_texts_err_product_too_long\` text,
  	\`form_texts_err_requirements_required\` text,
  	\`form_texts_err_requirements_too_long\` text,
  	\`form_texts_err_rate_limited\` text,
  	\`form_texts_err_server\` text,
  	\`form_texts_err_network\` text,
  	\`form_texts_captcha_prompt\` text,
  	\`form_texts_captcha_failed\` text,
  	\`form_texts_honeypot_label\` text,
  	\`tawk_property_id\` text,
  	\`tawk_widget_id\` text,
  	\`red_panel_title\` text,
  	\`red_panel_welcome\` text,
  	\`red_panel_connecting\` text,
  	\`red_panel_online_status\` text,
  	\`red_panel_online_text\` text,
  	\`red_panel_start_chat\` text,
  	\`red_panel_opening\` text,
  	\`red_panel_chat_privacy\` text,
  	\`red_panel_offline_status\` text,
  	\`red_panel_offline_text\` text,
  	\`red_panel_failed_text\` text,
  	\`red_panel_form_title\` text,
  	\`blue_panel_aria_label\` text,
  	\`blue_panel_close_label\` text,
  	\`blue_panel_welcome\` text,
  	\`blue_panel_enter_chat\` text,
  	\`blue_panel_connecting\` text,
  	\`blue_panel_privacy\` text,
  	\`blue_panel_failed_text\` text,
  	\`blue_panel_failed_button\` text,
  	\`whatsapp_texts_message\` text,
  	\`whatsapp_texts_product_message\` text,
  	\`notify_email\` text,
  	\`auto_reply_subject\` text,
  	\`auto_reply_preheader\` text,
  	\`auto_reply_body\` text,
  	\`allow_indexing\` integer DEFAULT false,
  	\`gtm_id\` text,
  	\`turnstile_enabled\` integer DEFAULT false,
  	\`turnstile_site_key\` text,
  	\`seo_texts_title_template\` text,
  	\`seo_texts_home_title\` text,
  	\`seo_texts_default_description\` text,
  	\`default_og_image_id\` integer,
  	\`favicon_id\` integer,
  	\`apple_touch_icon_id\` integer,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`apple_touch_icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_og_image_idx\` ON \`site_settings\` (\`default_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_apple_touch_icon_idx\` ON \`site_settings\` (\`apple_touch_icon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_company_name\` text,
  	\`version_logo_id\` integer,
  	\`version_footer_intro\` text,
  	\`version_email\` text,
  	\`version_phone\` text,
  	\`version_whatsapp\` text,
  	\`version_address\` text,
  	\`version_office_hours\` text,
  	\`version_facebook\` text,
  	\`version_instagram\` text,
  	\`version_tiktok\` text,
  	\`version_youtube\` text,
  	\`version_linkedin\` text,
  	\`version_nav_labels_home\` text,
  	\`version_nav_labels_about\` text,
  	\`version_nav_labels_products\` text,
  	\`version_nav_labels_cases\` text,
  	\`version_nav_labels_contact\` text,
  	\`version_floating_tools_region\` text,
  	\`version_floating_tools_email\` text,
  	\`version_floating_tools_phone\` text,
  	\`version_floating_tools_contact\` text,
  	\`version_floating_tools_chat\` text,
  	\`version_floating_tools_top\` text,
  	\`version_floating_tools_blue\` text,
  	\`version_contact_band_title\` text,
  	\`version_contact_band_text\` text,
  	\`version_contact_band_button_text\` text,
  	\`version_form_texts_required_note\` text,
  	\`version_form_texts_name_label\` text,
  	\`version_form_texts_name_placeholder\` text,
  	\`version_form_texts_email_label\` text,
  	\`version_form_texts_email_placeholder\` text,
  	\`version_form_texts_country_label\` text,
  	\`version_form_texts_country_optional_label\` text,
  	\`version_form_texts_country_placeholder\` text,
  	\`version_form_texts_phone_label\` text,
  	\`version_form_texts_phone_placeholder\` text,
  	\`version_form_texts_company_label\` text,
  	\`version_form_texts_company_placeholder\` text,
  	\`version_form_texts_product_label\` text,
  	\`version_form_texts_product_placeholder\` text,
  	\`version_form_texts_product_page_placeholder\` text,
  	\`version_form_texts_product_prefill\` text,
  	\`version_form_texts_requirements_label\` text,
  	\`version_form_texts_requirements_placeholder\` text,
  	\`version_form_texts_privacy_note\` text,
  	\`version_form_texts_privacy_link_text\` text,
  	\`version_form_texts_submit_inquiry\` text,
  	\`version_form_texts_submit_message\` text,
  	\`version_form_texts_sending\` text,
  	\`version_form_texts_error_summary\` text,
  	\`version_form_texts_err_name_required\` text,
  	\`version_form_texts_err_name_too_long\` text,
  	\`version_form_texts_err_email_required\` text,
  	\`version_form_texts_err_email_invalid\` text,
  	\`version_form_texts_err_country_required\` text,
  	\`version_form_texts_err_phone_too_long\` text,
  	\`version_form_texts_err_company_too_long\` text,
  	\`version_form_texts_err_product_too_long\` text,
  	\`version_form_texts_err_requirements_required\` text,
  	\`version_form_texts_err_requirements_too_long\` text,
  	\`version_form_texts_err_rate_limited\` text,
  	\`version_form_texts_err_server\` text,
  	\`version_form_texts_err_network\` text,
  	\`version_form_texts_captcha_prompt\` text,
  	\`version_form_texts_captcha_failed\` text,
  	\`version_form_texts_honeypot_label\` text,
  	\`version_tawk_property_id\` text,
  	\`version_tawk_widget_id\` text,
  	\`version_red_panel_title\` text,
  	\`version_red_panel_welcome\` text,
  	\`version_red_panel_connecting\` text,
  	\`version_red_panel_online_status\` text,
  	\`version_red_panel_online_text\` text,
  	\`version_red_panel_start_chat\` text,
  	\`version_red_panel_opening\` text,
  	\`version_red_panel_chat_privacy\` text,
  	\`version_red_panel_offline_status\` text,
  	\`version_red_panel_offline_text\` text,
  	\`version_red_panel_failed_text\` text,
  	\`version_red_panel_form_title\` text,
  	\`version_blue_panel_aria_label\` text,
  	\`version_blue_panel_close_label\` text,
  	\`version_blue_panel_welcome\` text,
  	\`version_blue_panel_enter_chat\` text,
  	\`version_blue_panel_connecting\` text,
  	\`version_blue_panel_privacy\` text,
  	\`version_blue_panel_failed_text\` text,
  	\`version_blue_panel_failed_button\` text,
  	\`version_whatsapp_texts_message\` text,
  	\`version_whatsapp_texts_product_message\` text,
  	\`version_notify_email\` text,
  	\`version_auto_reply_subject\` text,
  	\`version_auto_reply_preheader\` text,
  	\`version_auto_reply_body\` text,
  	\`version_allow_indexing\` integer DEFAULT false,
  	\`version_gtm_id\` text,
  	\`version_turnstile_enabled\` integer DEFAULT false,
  	\`version_turnstile_site_key\` text,
  	\`version_seo_texts_title_template\` text,
  	\`version_seo_texts_home_title\` text,
  	\`version_seo_texts_default_description\` text,
  	\`version_default_og_image_id\` integer,
  	\`version_favicon_id\` integer,
  	\`version_apple_touch_icon_id\` integer,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_apple_touch_icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_logo_idx\` ON \`_site_settings_v\` (\`version_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_default_og_image_idx\` ON \`_site_settings_v\` (\`version_default_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_favicon_idx\` ON \`_site_settings_v\` (\`version_favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_apple_touch_icon_idx\` ON \`_site_settings_v\` (\`version_apple_touch_icon_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`theme\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`palette\` text DEFAULT 'industrial-blue',
  	\`quote_button_color\` text DEFAULT 'orange',
  	\`heading_font\` text DEFAULT 'system',
  	\`body_font\` text DEFAULT 'system',
  	\`font_scale\` text DEFAULT 'standard',
  	\`spacing_scale\` text DEFAULT 'standard',
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
  await db.run(sql`CREATE INDEX \`theme__status_idx\` ON \`theme\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_theme_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_palette\` text DEFAULT 'industrial-blue',
  	\`version_quote_button_color\` text DEFAULT 'orange',
  	\`version_heading_font\` text DEFAULT 'system',
  	\`version_body_font\` text DEFAULT 'system',
  	\`version_font_scale\` text DEFAULT 'standard',
  	\`version_spacing_scale\` text DEFAULT 'standard',
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
  await db.run(sql`CREATE INDEX \`_theme_v_version_version__status_idx\` ON \`_theme_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_created_at_idx\` ON \`_theme_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_updated_at_idx\` ON \`_theme_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_theme_v_latest_idx\` ON \`_theme_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`ui_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`common_skip_to_content\` text,
  	\`common_menu_open\` text,
  	\`common_menu_close\` text,
  	\`common_menu\` text,
  	\`common_main_nav\` text,
  	\`common_logo_alt\` text,
  	\`common_breadcrumb\` text,
  	\`common_opens_new_tab\` text,
  	\`common_close\` text,
  	\`common_play_video\` text,
  	\`common_play_video_generic\` text,
  	\`common_video_error\` text,
  	\`common_watch_on_you_tube\` text,
  	\`common_contact_us\` text,
  	\`common_click_to_enlarge\` text,
  	\`common_prev_image\` text,
  	\`common_next_image\` text,
  	\`common_image_count\` text,
  	\`common_email_title\` text,
  	\`common_phone_title\` text,
  	\`common_send_email\` text,
  	\`common_call_now\` text,
  	\`common_copy\` text,
  	\`common_copied\` text,
  	\`common_whatsapp_aria\` text,
  	\`common_home\` text,
  	\`top_bar_tagline\` text,
  	\`top_bar_email\` text,
  	\`top_bar_whatsapp\` text,
  	\`footer_quick_links\` text,
  	\`footer_contact\` text,
  	\`footer_email\` text,
  	\`footer_phone\` text,
  	\`footer_whatsapp\` text,
  	\`footer_address\` text,
  	\`footer_follow_us\` text,
  	\`footer_privacy_policy\` text,
  	\`footer_cookie_notice\` text,
  	\`footer_cookie_settings\` text,
  	\`footer_copyright\` text,
  	\`mobile_bar_quote\` text,
  	\`mobile_bar_whatsapp\` text,
  	\`banner_kicker_default\` text,
  	\`banner_quote_button\` text,
  	\`banner_product_button\` text,
  	\`banner_prev\` text,
  	\`banner_next\` text,
  	\`banner_region\` text,
  	\`banner_slide\` text,
  	\`banner_controls\` text,
  	\`banner_go_to\` text,
  	\`banner_count\` text,
  	\`banner_pause\` text,
  	\`banner_play\` text,
  	\`banner_pause_aria\` text,
  	\`banner_play_aria\` text,
  	\`product_list_view_details\` text,
  	\`product_list_empty_text\` text,
  	\`product_list_empty_button\` text,
  	\`product_hero_kicker\` text,
  	\`product_hero_button\` text,
  	\`product_brochure_button\` text,
  	\`product_brochure_meta\` text,
  	\`product_applications_title\` text,
  	\`product_applications_subtitle\` text,
  	\`product_applications_aria\` text,
  	\`product_intro_kicker\` text,
  	\`product_intro_title\` text,
  	\`product_features_title\` text,
  	\`product_proposal_title\` text,
  	\`product_proposal_button\` text,
  	\`product_process_title\` text,
  	\`product_specs_title\` text,
  	\`product_specs_model\` text,
  	\`product_specs_swipe\` text,
  	\`product_specs_empty\` text,
  	\`product_audience_title\` text,
  	\`product_support_title\` text,
  	\`product_faq_title\` text,
  	\`product_video_title\` text,
  	\`product_advantages_title\` text,
  	\`product_advantages_subtitle\` text,
  	\`product_steps_kicker\` text,
  	\`product_steps_title\` text,
  	\`product_steps_subtitle\` text,
  	\`product_steps_aria\` text,
  	\`product_step_aria\` text,
  	\`product_related_title\` text,
  	\`product_related_subtitle\` text,
  	\`product_related_button\` text,
  	\`product_cases_title\` text,
  	\`product_cases_subtitle\` text,
  	\`product_cases_button\` text,
  	\`product_inquiry_kicker\` text,
  	\`product_inquiry_title\` text,
  	\`product_inquiry_intro\` text,
  	\`case_list_country_label\` text,
  	\`case_list_equipment_label\` text,
  	\`case_list_view_case\` text,
  	\`case_list_pagination\` text,
  	\`case_list_previous\` text,
  	\`case_list_next\` text,
  	\`case_list_page_aria\` text,
  	\`case_list_page_of\` text,
  	\`case_list_empty_text\` text,
  	\`case_list_empty_button\` text,
  	\`case_detail_back\` text,
  	\`case_detail_overview_title\` text,
  	\`case_detail_customer\` text,
  	\`case_detail_country\` text,
  	\`case_detail_configuration\` text,
  	\`case_detail_capacity\` text,
  	\`case_detail_delivery_date\` text,
  	\`case_detail_requirements\` text,
  	\`case_detail_solution\` text,
  	\`case_detail_delivery\` text,
  	\`case_detail_photos\` text,
  	\`case_detail_video\` text,
  	\`case_detail_lines_used\` text,
  	\`case_detail_lines_button\` text,
  	\`case_detail_primary_button\` text,
  	\`case_detail_secondary_button\` text,
  	\`cookie_title\` text,
  	\`cookie_intro\` text,
  	\`cookie_necessary_title\` text,
  	\`cookie_necessary_status\` text,
  	\`cookie_necessary_text\` text,
  	\`cookie_analytics_title\` text,
  	\`cookie_analytics_toggle\` text,
  	\`cookie_analytics_text\` text,
  	\`cookie_on\` text,
  	\`cookie_off\` text,
  	\`cookie_chat_title\` text,
  	\`cookie_chat_status\` text,
  	\`cookie_chat_text\` text,
  	\`cookie_notice_link\` text,
  	\`cookie_save\` text,
  	\`cookie_cancel\` text,
  	\`cookie_saved\` text,
  	\`thank_you_kicker\` text,
  	\`thank_you_confirmation\` text,
  	\`thank_you_whatsapp_hint\` text,
  	\`thank_you_whatsapp_button\` text,
  	\`thank_you_back_home\` text,
  	\`thank_you_explore_products\` text,
  	\`not_found_code\` text,
  	\`not_found_back_home\` text,
  	\`not_found_explore_products\` text,
  	\`not_found_contact_us\` text,
  	\`error_title\` text,
  	\`error_text\` text,
  	\`error_retry\` text,
  	\`error_back_home\` text,
  	\`page_titles_cases_paged\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`ui_texts__status_idx\` ON \`ui_texts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_ui_texts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_common_skip_to_content\` text,
  	\`version_common_menu_open\` text,
  	\`version_common_menu_close\` text,
  	\`version_common_menu\` text,
  	\`version_common_main_nav\` text,
  	\`version_common_logo_alt\` text,
  	\`version_common_breadcrumb\` text,
  	\`version_common_opens_new_tab\` text,
  	\`version_common_close\` text,
  	\`version_common_play_video\` text,
  	\`version_common_play_video_generic\` text,
  	\`version_common_video_error\` text,
  	\`version_common_watch_on_you_tube\` text,
  	\`version_common_contact_us\` text,
  	\`version_common_click_to_enlarge\` text,
  	\`version_common_prev_image\` text,
  	\`version_common_next_image\` text,
  	\`version_common_image_count\` text,
  	\`version_common_email_title\` text,
  	\`version_common_phone_title\` text,
  	\`version_common_send_email\` text,
  	\`version_common_call_now\` text,
  	\`version_common_copy\` text,
  	\`version_common_copied\` text,
  	\`version_common_whatsapp_aria\` text,
  	\`version_common_home\` text,
  	\`version_top_bar_tagline\` text,
  	\`version_top_bar_email\` text,
  	\`version_top_bar_whatsapp\` text,
  	\`version_footer_quick_links\` text,
  	\`version_footer_contact\` text,
  	\`version_footer_email\` text,
  	\`version_footer_phone\` text,
  	\`version_footer_whatsapp\` text,
  	\`version_footer_address\` text,
  	\`version_footer_follow_us\` text,
  	\`version_footer_privacy_policy\` text,
  	\`version_footer_cookie_notice\` text,
  	\`version_footer_cookie_settings\` text,
  	\`version_footer_copyright\` text,
  	\`version_mobile_bar_quote\` text,
  	\`version_mobile_bar_whatsapp\` text,
  	\`version_banner_kicker_default\` text,
  	\`version_banner_quote_button\` text,
  	\`version_banner_product_button\` text,
  	\`version_banner_prev\` text,
  	\`version_banner_next\` text,
  	\`version_banner_region\` text,
  	\`version_banner_slide\` text,
  	\`version_banner_controls\` text,
  	\`version_banner_go_to\` text,
  	\`version_banner_count\` text,
  	\`version_banner_pause\` text,
  	\`version_banner_play\` text,
  	\`version_banner_pause_aria\` text,
  	\`version_banner_play_aria\` text,
  	\`version_product_list_view_details\` text,
  	\`version_product_list_empty_text\` text,
  	\`version_product_list_empty_button\` text,
  	\`version_product_hero_kicker\` text,
  	\`version_product_hero_button\` text,
  	\`version_product_brochure_button\` text,
  	\`version_product_brochure_meta\` text,
  	\`version_product_applications_title\` text,
  	\`version_product_applications_subtitle\` text,
  	\`version_product_applications_aria\` text,
  	\`version_product_intro_kicker\` text,
  	\`version_product_intro_title\` text,
  	\`version_product_features_title\` text,
  	\`version_product_proposal_title\` text,
  	\`version_product_proposal_button\` text,
  	\`version_product_process_title\` text,
  	\`version_product_specs_title\` text,
  	\`version_product_specs_model\` text,
  	\`version_product_specs_swipe\` text,
  	\`version_product_specs_empty\` text,
  	\`version_product_audience_title\` text,
  	\`version_product_support_title\` text,
  	\`version_product_faq_title\` text,
  	\`version_product_video_title\` text,
  	\`version_product_advantages_title\` text,
  	\`version_product_advantages_subtitle\` text,
  	\`version_product_steps_kicker\` text,
  	\`version_product_steps_title\` text,
  	\`version_product_steps_subtitle\` text,
  	\`version_product_steps_aria\` text,
  	\`version_product_step_aria\` text,
  	\`version_product_related_title\` text,
  	\`version_product_related_subtitle\` text,
  	\`version_product_related_button\` text,
  	\`version_product_cases_title\` text,
  	\`version_product_cases_subtitle\` text,
  	\`version_product_cases_button\` text,
  	\`version_product_inquiry_kicker\` text,
  	\`version_product_inquiry_title\` text,
  	\`version_product_inquiry_intro\` text,
  	\`version_case_list_country_label\` text,
  	\`version_case_list_equipment_label\` text,
  	\`version_case_list_view_case\` text,
  	\`version_case_list_pagination\` text,
  	\`version_case_list_previous\` text,
  	\`version_case_list_next\` text,
  	\`version_case_list_page_aria\` text,
  	\`version_case_list_page_of\` text,
  	\`version_case_list_empty_text\` text,
  	\`version_case_list_empty_button\` text,
  	\`version_case_detail_back\` text,
  	\`version_case_detail_overview_title\` text,
  	\`version_case_detail_customer\` text,
  	\`version_case_detail_country\` text,
  	\`version_case_detail_configuration\` text,
  	\`version_case_detail_capacity\` text,
  	\`version_case_detail_delivery_date\` text,
  	\`version_case_detail_requirements\` text,
  	\`version_case_detail_solution\` text,
  	\`version_case_detail_delivery\` text,
  	\`version_case_detail_photos\` text,
  	\`version_case_detail_video\` text,
  	\`version_case_detail_lines_used\` text,
  	\`version_case_detail_lines_button\` text,
  	\`version_case_detail_primary_button\` text,
  	\`version_case_detail_secondary_button\` text,
  	\`version_cookie_title\` text,
  	\`version_cookie_intro\` text,
  	\`version_cookie_necessary_title\` text,
  	\`version_cookie_necessary_status\` text,
  	\`version_cookie_necessary_text\` text,
  	\`version_cookie_analytics_title\` text,
  	\`version_cookie_analytics_toggle\` text,
  	\`version_cookie_analytics_text\` text,
  	\`version_cookie_on\` text,
  	\`version_cookie_off\` text,
  	\`version_cookie_chat_title\` text,
  	\`version_cookie_chat_status\` text,
  	\`version_cookie_chat_text\` text,
  	\`version_cookie_notice_link\` text,
  	\`version_cookie_save\` text,
  	\`version_cookie_cancel\` text,
  	\`version_cookie_saved\` text,
  	\`version_thank_you_kicker\` text,
  	\`version_thank_you_confirmation\` text,
  	\`version_thank_you_whatsapp_hint\` text,
  	\`version_thank_you_whatsapp_button\` text,
  	\`version_thank_you_back_home\` text,
  	\`version_thank_you_explore_products\` text,
  	\`version_not_found_code\` text,
  	\`version_not_found_back_home\` text,
  	\`version_not_found_explore_products\` text,
  	\`version_not_found_contact_us\` text,
  	\`version_error_title\` text,
  	\`version_error_text\` text,
  	\`version_error_retry\` text,
  	\`version_error_back_home\` text,
  	\`version_page_titles_cases_paged\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_ui_texts_v_version_version__status_idx\` ON \`_ui_texts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_ui_texts_v_created_at_idx\` ON \`_ui_texts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_ui_texts_v_updated_at_idx\` ON \`_ui_texts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_ui_texts_v_latest_idx\` ON \`_ui_texts_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`home_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_sections_order_idx\` ON \`home_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_sections_parent_id_idx\` ON \`home_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_banners_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`desktop_image_id\` integer,
  	\`mobile_image_id\` integer,
  	\`kicker\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`quote_button_text\` text,
  	\`product_button_text\` text,
  	\`product_id\` integer,
  	FOREIGN KEY (\`desktop_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_order_idx\` ON \`home_page_banners_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_parent_id_idx\` ON \`home_page_banners_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_desktop_image_idx\` ON \`home_page_banners_slides\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_mobile_image_idx\` ON \`home_page_banners_slides\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_product_idx\` ON \`home_page_banners_slides\` (\`product_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text DEFAULT 'factory',
  	\`name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_services_items_order_idx\` ON \`home_page_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_services_items_parent_id_idx\` ON \`home_page_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_company_stats_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_company_stats_stats_order_idx\` ON \`home_page_company_stats_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_company_stats_stats_parent_id_idx\` ON \`home_page_company_stats_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_about_intro_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_tags_order_idx\` ON \`home_page_about_intro_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_tags_parent_id_idx\` ON \`home_page_about_intro_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`services_title\` text,
  	\`services_subtitle\` text,
  	\`company_stats_supplier_label\` text,
  	\`about_intro_kicker\` text,
  	\`about_intro_title\` text,
  	\`about_intro_company_title\` text,
  	\`about_intro_button_text\` text,
  	\`about_intro_body\` text,
  	\`factory_gallery_kicker\` text,
  	\`factory_gallery_title\` text,
  	\`factory_gallery_subtitle\` text,
  	\`product_lines_title\` text,
  	\`product_lines_button_text\` text,
  	\`featured_cases_kicker\` text,
  	\`featured_cases_title\` text,
  	\`featured_cases_subtitle\` text,
  	\`featured_cases_card_button\` text,
  	\`featured_cases_all_button\` text,
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_seo_seo_og_image_idx\` ON \`home_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`home_page_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_rels_order_idx\` ON \`home_page_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_parent_idx\` ON \`home_page_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_path_idx\` ON \`home_page_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_media_id_idx\` ON \`home_page_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_products_id_idx\` ON \`home_page_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_rels_cases_id_idx\` ON \`home_page_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_sections\` (
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
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_order_idx\` ON \`_home_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_sections_parent_id_idx\` ON \`_home_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_banners_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`enabled\` integer DEFAULT true,
  	\`desktop_image_id\` integer,
  	\`mobile_image_id\` integer,
  	\`kicker\` text,
  	\`title\` text,
  	\`subtitle\` text,
  	\`quote_button_text\` text,
  	\`product_button_text\` text,
  	\`product_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`desktop_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_order_idx\` ON \`_home_page_v_version_banners_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_parent_id_idx\` ON \`_home_page_v_version_banners_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_desktop_image_idx\` ON \`_home_page_v_version_banners_slides\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_mobile_image_idx\` ON \`_home_page_v_version_banners_slides\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_product_idx\` ON \`_home_page_v_version_banners_slides\` (\`product_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_services_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`icon\` text DEFAULT 'factory',
  	\`name\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_services_items_order_idx\` ON \`_home_page_v_version_services_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_services_items_parent_id_idx\` ON \`_home_page_v_version_services_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_company_stats_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_company_stats_stats_order_idx\` ON \`_home_page_v_version_company_stats_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_company_stats_stats_parent_id_idx\` ON \`_home_page_v_version_company_stats_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_about_intro_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_tags_order_idx\` ON \`_home_page_v_version_about_intro_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_tags_parent_id_idx\` ON \`_home_page_v_version_about_intro_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_services_title\` text,
  	\`version_services_subtitle\` text,
  	\`version_company_stats_supplier_label\` text,
  	\`version_about_intro_kicker\` text,
  	\`version_about_intro_title\` text,
  	\`version_about_intro_company_title\` text,
  	\`version_about_intro_button_text\` text,
  	\`version_about_intro_body\` text,
  	\`version_factory_gallery_kicker\` text,
  	\`version_factory_gallery_title\` text,
  	\`version_factory_gallery_subtitle\` text,
  	\`version_product_lines_title\` text,
  	\`version_product_lines_button_text\` text,
  	\`version_featured_cases_kicker\` text,
  	\`version_featured_cases_title\` text,
  	\`version_featured_cases_subtitle\` text,
  	\`version_featured_cases_card_button\` text,
  	\`version_featured_cases_all_button\` text,
  	\`version_seo_seo_title\` text,
  	\`version_seo_seo_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_seo_version_seo_og_image_idx\` ON \`_home_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`products_id\` integer,
  	\`cases_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`cases_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_order_idx\` ON \`_home_page_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_parent_idx\` ON \`_home_page_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_path_idx\` ON \`_home_page_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_media_id_idx\` ON \`_home_page_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_products_id_idx\` ON \`_home_page_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_rels_cases_id_idx\` ON \`_home_page_v_rels\` (\`cases_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`module\` text,
  	\`visible\` integer DEFAULT true,
  	\`background\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_sections_order_idx\` ON \`about_page_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_sections_parent_id_idx\` ON \`about_page_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_scenes_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_order_idx\` ON \`about_page_scenes_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_parent_id_idx\` ON \`about_page_scenes_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_scenes_items_image_idx\` ON \`about_page_scenes_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_capabilities_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_capabilities_items_order_idx\` ON \`about_page_capabilities_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_capabilities_items_parent_id_idx\` ON \`about_page_capabilities_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`banner_title\` text,
  	\`banner_subtitle\` text,
  	\`intro_kicker\` text,
  	\`intro_title\` text,
  	\`intro_button_text\` text,
  	\`intro_body\` text,
  	\`intro_image_id\` integer,
  	\`intro_image_ratio\` text DEFAULT 'default',
  	\`intro_image_fit\` text DEFAULT 'default',
  	\`scenes_title\` text,
  	\`scenes_subtitle\` text,
  	\`capabilities_title\` text,
  	\`capabilities_subtitle\` text,
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`intro_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_intro_intro_image_idx\` ON \`about_page\` (\`intro_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_seo_seo_og_image_idx\` ON \`about_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page__status_idx\` ON \`about_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_sections\` (
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
  await db.run(sql`CREATE INDEX \`_about_page_v_version_sections_order_idx\` ON \`_about_page_v_version_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_sections_parent_id_idx\` ON \`_about_page_v_version_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_scenes_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_order_idx\` ON \`_about_page_v_version_scenes_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_parent_id_idx\` ON \`_about_page_v_version_scenes_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_scenes_items_image_idx\` ON \`_about_page_v_version_scenes_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_capabilities_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`description\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_capabilities_items_order_idx\` ON \`_about_page_v_version_capabilities_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_capabilities_items_parent_id_idx\` ON \`_about_page_v_version_capabilities_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_banner_title\` text,
  	\`version_banner_subtitle\` text,
  	\`version_intro_kicker\` text,
  	\`version_intro_title\` text,
  	\`version_intro_button_text\` text,
  	\`version_intro_body\` text,
  	\`version_intro_image_id\` integer,
  	\`version_intro_image_ratio\` text DEFAULT 'default',
  	\`version_intro_image_fit\` text DEFAULT 'default',
  	\`version_scenes_title\` text,
  	\`version_scenes_subtitle\` text,
  	\`version_capabilities_title\` text,
  	\`version_capabilities_subtitle\` text,
  	\`version_seo_seo_title\` text,
  	\`version_seo_seo_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_intro_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_intro_version_intro_image_idx\` ON \`_about_page_v\` (\`version_intro_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_seo_version_seo_og_image_idx\` ON \`_about_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_version__status_idx\` ON \`_about_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_created_at_idx\` ON \`_about_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_updated_at_idx\` ON \`_about_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_latest_idx\` ON \`_about_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`products_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`intro\` text,
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`products_page_seo_seo_og_image_idx\` ON \`products_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_page__status_idx\` ON \`products_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_products_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_title\` text,
  	\`version_subtitle\` text,
  	\`version_intro\` text,
  	\`version_seo_seo_title\` text,
  	\`version_seo_seo_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_page_v_version_seo_version_seo_og_image_idx\` ON \`_products_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_page_v_version_version__status_idx\` ON \`_products_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_products_page_v_created_at_idx\` ON \`_products_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_page_v_updated_at_idx\` ON \`_products_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_page_v_latest_idx\` ON \`_products_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`cases_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`list_title\` text,
  	\`list_subtitle\` text,
  	\`per_page\` numeric DEFAULT 9,
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`cases_page_seo_seo_og_image_idx\` ON \`cases_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`cases_page__status_idx\` ON \`cases_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_cases_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_title\` text,
  	\`version_subtitle\` text,
  	\`version_list_title\` text,
  	\`version_list_subtitle\` text,
  	\`version_per_page\` numeric DEFAULT 9,
  	\`version_seo_seo_title\` text,
  	\`version_seo_seo_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_cases_page_v_version_seo_version_seo_og_image_idx\` ON \`_cases_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_page_v_version_version__status_idx\` ON \`_cases_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_cases_page_v_created_at_idx\` ON \`_cases_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_cases_page_v_updated_at_idx\` ON \`_cases_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_cases_page_v_latest_idx\` ON \`_cases_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`contact_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`kicker\` text,
  	\`heading\` text,
  	\`intro\` text,
  	\`form_title\` text,
  	\`email_label\` text,
  	\`phone_label\` text,
  	\`whatsapp_label\` text,
  	\`phone_whatsapp_label\` text,
  	\`address_label\` text,
  	\`hours_label\` text,
  	\`image_id\` integer,
  	\`image_ratio\` text DEFAULT 'default',
  	\`image_fit\` text DEFAULT 'default',
  	\`seo_seo_title\` text,
  	\`seo_seo_description\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_page_image_idx\` ON \`contact_page\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`contact_page_seo_seo_og_image_idx\` ON \`contact_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`contact_page__status_idx\` ON \`contact_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_contact_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_title\` text,
  	\`version_kicker\` text,
  	\`version_heading\` text,
  	\`version_intro\` text,
  	\`version_form_title\` text,
  	\`version_email_label\` text,
  	\`version_phone_label\` text,
  	\`version_whatsapp_label\` text,
  	\`version_phone_whatsapp_label\` text,
  	\`version_address_label\` text,
  	\`version_hours_label\` text,
  	\`version_image_id\` integer,
  	\`version_image_ratio\` text DEFAULT 'default',
  	\`version_image_fit\` text DEFAULT 'default',
  	\`version_seo_seo_title\` text,
  	\`version_seo_seo_description\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_version_image_idx\` ON \`_contact_page_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_seo_version_seo_og_image_idx\` ON \`_contact_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_version_version__status_idx\` ON \`_contact_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_created_at_idx\` ON \`_contact_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_updated_at_idx\` ON \`_contact_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_contact_page_v_latest_idx\` ON \`_contact_page_v\` (\`latest\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`products_sections\`;`)
  await db.run(sql`DROP TABLE \`products_applications\`;`)
  await db.run(sql`DROP TABLE \`products_faqs\`;`)
  await db.run(sql`DROP TABLE \`products_advantages\`;`)
  await db.run(sql`DROP TABLE \`products_process_steps\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_applications\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_faqs\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_advantages\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_process_steps\`;`)
  await db.run(sql`DROP TABLE \`_products_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v_rels\`;`)
  await db.run(sql`DROP TABLE \`cases\`;`)
  await db.run(sql`DROP TABLE \`cases_rels\`;`)
  await db.run(sql`DROP TABLE \`_cases_v\`;`)
  await db.run(sql`DROP TABLE \`_cases_v_rels\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`inquiries\`;`)
  await db.run(sql`DROP TABLE \`users_edit_scope_globals\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`users_rels\`;`)
  await db.run(sql`DROP TABLE \`backups\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`redirects_rels\`;`)
  await db.run(sql`DROP TABLE \`exports\`;`)
  await db.run(sql`DROP TABLE \`exports_texts\`;`)
  await db.run(sql`DROP TABLE \`imports\`;`)
  await db.run(sql`DROP TABLE \`totp_attempts\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`theme\`;`)
  await db.run(sql`DROP TABLE \`_theme_v\`;`)
  await db.run(sql`DROP TABLE \`ui_texts\`;`)
  await db.run(sql`DROP TABLE \`_ui_texts_v\`;`)
  await db.run(sql`DROP TABLE \`home_page_sections\`;`)
  await db.run(sql`DROP TABLE \`home_page_banners_slides\`;`)
  await db.run(sql`DROP TABLE \`home_page_services_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_company_stats_stats\`;`)
  await db.run(sql`DROP TABLE \`home_page_about_intro_tags\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page_rels\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_banners_slides\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_services_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_company_stats_stats\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_about_intro_tags\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_rels\`;`)
  await db.run(sql`DROP TABLE \`about_page_sections\`;`)
  await db.run(sql`DROP TABLE \`about_page_scenes_items\`;`)
  await db.run(sql`DROP TABLE \`about_page_capabilities_items\`;`)
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_sections\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_scenes_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_capabilities_items\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v\`;`)
  await db.run(sql`DROP TABLE \`products_page\`;`)
  await db.run(sql`DROP TABLE \`_products_page_v\`;`)
  await db.run(sql`DROP TABLE \`cases_page\`;`)
  await db.run(sql`DROP TABLE \`_cases_page_v\`;`)
  await db.run(sql`DROP TABLE \`contact_page\`;`)
  await db.run(sql`DROP TABLE \`_contact_page_v\`;`)
}
