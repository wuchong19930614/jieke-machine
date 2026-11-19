import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`cases_photos\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`image_id\` integer,
    \`image_ratio\` text DEFAULT 'default',
    \`image_ratio_custom\` text,
    \`image_fit\` text DEFAULT 'default',
    \`caption\` text,
    \`caption_style\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`cases_photos_order_idx\` ON \`cases_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`cases_photos_parent_id_idx\` ON \`cases_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`cases_photos_image_idx\` ON \`cases_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_cases_v_version_photos\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`image_id\` integer,
    \`image_ratio\` text DEFAULT 'default',
    \`image_ratio_custom\` text,
    \`image_fit\` text DEFAULT 'default',
    \`caption\` text,
    \`caption_style\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_cases_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_cases_v_version_photos_order_idx\` ON \`_cases_v_version_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_photos_parent_id_idx\` ON \`_cases_v_version_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_cases_v_version_photos_image_idx\` ON \`_cases_v_version_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_about_intro_photos\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`image_id\` integer,
    \`image_ratio\` text DEFAULT 'default',
    \`image_ratio_custom\` text,
    \`image_fit\` text DEFAULT 'default',
    \`caption\` text,
    \`caption_style\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_photos_order_idx\` ON \`home_page_about_intro_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_photos_parent_id_idx\` ON \`home_page_about_intro_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_photos_image_idx\` ON \`home_page_about_intro_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_about_intro_photos\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`image_id\` integer,
    \`image_ratio\` text DEFAULT 'default',
    \`image_ratio_custom\` text,
    \`image_fit\` text DEFAULT 'default',
    \`caption\` text,
    \`caption_style\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_photos_order_idx\` ON \`_home_page_v_version_about_intro_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_photos_parent_id_idx\` ON \`_home_page_v_version_about_intro_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_photos_image_idx\` ON \`_home_page_v_version_about_intro_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`about_page_intro_photos\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`image_id\` integer,
    \`image_ratio\` text DEFAULT 'default',
    \`image_ratio_custom\` text,
    \`image_fit\` text DEFAULT 'default',
    \`caption\` text,
    \`caption_style\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_intro_photos_order_idx\` ON \`about_page_intro_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_page_intro_photos_parent_id_idx\` ON \`about_page_intro_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_intro_photos_image_idx\` ON \`about_page_intro_photos\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v_version_intro_photos\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`image_id\` integer,
    \`image_ratio\` text DEFAULT 'default',
    \`image_ratio_custom\` text,
    \`image_fit\` text DEFAULT 'default',
    \`caption\` text,
    \`caption_style\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_intro_photos_order_idx\` ON \`_about_page_v_version_intro_photos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_intro_photos_parent_id_idx\` ON \`_about_page_v_version_intro_photos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_intro_photos_image_idx\` ON \`_about_page_v_version_intro_photos\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`cover_caption\` text;`)
  await db.run(sql`ALTER TABLE \`cases\` ADD \`cover_caption_style\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_cover_caption\` text;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` ADD \`version_cover_caption_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`quote_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`quote_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`quote_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`quote_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`quote_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`quote_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`product_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`product_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`product_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`product_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`product_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_banners_slides\` ADD \`product_link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_quote_link_quote_link_product_idx\` ON \`home_page_banners_slides\` (\`quote_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_quote_link_quote_link_case_stud_idx\` ON \`home_page_banners_slides\` (\`quote_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_product_link_product_link_produ_idx\` ON \`home_page_banners_slides\` (\`product_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_product_link_product_link_case__idx\` ON \`home_page_banners_slides\` (\`product_link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`show_top_bar\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_button_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_button_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_button_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_button_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_button_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_button_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_subtitle_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_button\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_button_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`product_lines_inquiry_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_all_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_all_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_all_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_all_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_all_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`featured_cases_all_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_custom\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_title\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_title_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_text\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_text_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_button_text\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_button_text_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`inquiry_link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_button_link_about_intro_button_lin_idx\` ON \`home_page\` (\`about_intro_button_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_button_link_about_intro_button_l_1_idx\` ON \`home_page\` (\`about_intro_button_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_product_lines_inquiry_link_product_lines_inqui_idx\` ON \`home_page\` (\`product_lines_inquiry_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_product_lines_inquiry_link_product_lines_inq_1_idx\` ON \`home_page\` (\`product_lines_inquiry_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_featured_cases_all_link_featured_cases_all_lin_idx\` ON \`home_page\` (\`featured_cases_all_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_featured_cases_all_link_featured_cases_all_l_1_idx\` ON \`home_page\` (\`featured_cases_all_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_inquiry_link_inquiry_link_product_idx\` ON \`home_page\` (\`inquiry_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_inquiry_link_inquiry_link_case_study_idx\` ON \`home_page\` (\`inquiry_link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`quote_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`quote_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`quote_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`quote_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`quote_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`quote_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`product_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`product_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`product_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`product_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`product_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_banners_slides\` ADD \`product_link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_quote_link_quote_lin_idx\` ON \`_home_page_v_version_banners_slides\` (\`quote_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_quote_link_quote_l_1_idx\` ON \`_home_page_v_version_banners_slides\` (\`quote_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_product_link_product_idx\` ON \`_home_page_v_version_banners_slides\` (\`product_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_product_link_produ_1_idx\` ON \`_home_page_v_version_banners_slides\` (\`product_link_case_study_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_show_top_bar\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_button_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_button_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_button_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_button_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_button_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_button_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_subtitle_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_subtitle_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_button\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_button_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_button_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_product_lines_inquiry_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_all_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_all_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_all_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_all_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_all_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_featured_cases_all_link_new_tab\` integer;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_custom\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_title\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_title_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_text\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_text_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_button_text\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_button_text_hidden\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_link_type\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_link_product_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_link_case_study_id\` integer REFERENCES cases(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_link_page\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_link_url\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_inquiry_link_new_tab\` integer;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_button_link_version_abo_idx\` ON \`_home_page_v\` (\`version_about_intro_button_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_button_link_version_a_1_idx\` ON \`_home_page_v\` (\`version_about_intro_button_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_product_lines_inquiry_link_version__idx\` ON \`_home_page_v\` (\`version_product_lines_inquiry_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_product_lines_inquiry_link_versio_1_idx\` ON \`_home_page_v\` (\`version_product_lines_inquiry_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_featured_cases_all_link_version_fea_idx\` ON \`_home_page_v\` (\`version_featured_cases_all_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_featured_cases_all_link_version_f_1_idx\` ON \`_home_page_v\` (\`version_featured_cases_all_link_case_study_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_inquiry_link_version_inquiry_link_p_idx\` ON \`_home_page_v\` (\`version_inquiry_link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_inquiry_link_version_inquiry_link_c_idx\` ON \`_home_page_v\` (\`version_inquiry_link_case_study_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`cases_photos\`;`)
  await db.run(sql`DROP TABLE \`_cases_v_version_photos\`;`)
  await db.run(sql`DROP TABLE \`home_page_about_intro_photos\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_about_intro_photos\`;`)
  await db.run(sql`DROP TABLE \`about_page_intro_photos\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v_version_intro_photos\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_page_banners_slides\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`enabled\` integer DEFAULT true,
    \`desktop_image_id\` integer,
    \`mobile_image_id\` integer,
    \`overlay\` numeric DEFAULT 50,
    \`kicker\` text,
    \`kicker_hidden\` integer DEFAULT false,
    \`kicker_style\` text,
    \`title\` text,
    \`title_style\` text,
    \`subtitle\` text,
    \`subtitle_style\` text,
    \`quote_button_text\` text,
    \`quote_button_text_hidden\` integer DEFAULT false,
    \`quote_button_text_style\` text,
    \`product_button_text\` text,
    \`product_button_text_hidden\` integer DEFAULT false,
    \`product_button_text_style\` text,
    \`product_id\` integer,
    \`link_type\` text DEFAULT 'default',
    \`link_product_id\` integer,
    \`link_case_study_id\` integer,
    \`link_page\` text,
    \`link_url\` text,
    \`link_new_tab\` integer,
    FOREIGN KEY (\`desktop_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`link_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`link_case_study_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page_banners_slides\`("_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "overlay", "kicker", "kicker_hidden", "kicker_style", "title", "title_style", "subtitle", "subtitle_style", "quote_button_text", "quote_button_text_hidden", "quote_button_text_style", "product_button_text", "product_button_text_hidden", "product_button_text_style", "product_id", "link_type", "link_product_id", "link_case_study_id", "link_page", "link_url", "link_new_tab") SELECT "_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "overlay", "kicker", "kicker_hidden", "kicker_style", "title", "title_style", "subtitle", "subtitle_style", "quote_button_text", "quote_button_text_hidden", "quote_button_text_style", "product_button_text", "product_button_text_hidden", "product_button_text_style", "product_id", "link_type", "link_product_id", "link_case_study_id", "link_page", "link_url", "link_new_tab" FROM \`home_page_banners_slides\`;`)
  await db.run(sql`DROP TABLE \`home_page_banners_slides\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page_banners_slides\` RENAME TO \`home_page_banners_slides\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_order_idx\` ON \`home_page_banners_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_parent_id_idx\` ON \`home_page_banners_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_desktop_image_idx\` ON \`home_page_banners_slides\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_mobile_image_idx\` ON \`home_page_banners_slides\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_product_idx\` ON \`home_page_banners_slides\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_link_link_product_idx\` ON \`home_page_banners_slides\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_banners_slides_link_link_case_study_idx\` ON \`home_page_banners_slides\` (\`link_case_study_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_home_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`services_title\` text,
    \`services_title_hidden\` integer DEFAULT false,
    \`services_title_style\` text,
    \`services_subtitle\` text,
    \`services_subtitle_style\` text,
    \`company_stats_supplier_label\` text,
    \`company_stats_supplier_label_hidden\` integer DEFAULT false,
    \`company_stats_supplier_label_style\` text,
    \`about_intro_kicker\` text,
    \`about_intro_kicker_hidden\` integer DEFAULT false,
    \`about_intro_kicker_style\` text,
    \`about_intro_title\` text,
    \`about_intro_title_hidden\` integer DEFAULT false,
    \`about_intro_title_style\` text,
    \`about_intro_company_title\` text,
    \`about_intro_company_title_hidden\` integer DEFAULT false,
    \`about_intro_company_title_style\` text,
    \`about_intro_button_text\` text,
    \`about_intro_button_text_hidden\` integer DEFAULT false,
    \`about_intro_button_text_style\` text,
    \`about_intro_body\` text,
    \`about_intro_body_style\` text,
    \`about_intro_image_id\` integer,
    \`about_intro_image_ratio\` text DEFAULT 'default',
    \`about_intro_image_ratio_custom\` text,
    \`about_intro_image_fit\` text DEFAULT 'default',
    \`factory_gallery_kicker\` text,
    \`factory_gallery_kicker_hidden\` integer DEFAULT false,
    \`factory_gallery_kicker_style\` text,
    \`factory_gallery_title\` text,
    \`factory_gallery_title_hidden\` integer DEFAULT false,
    \`factory_gallery_title_style\` text,
    \`factory_gallery_subtitle\` text,
    \`factory_gallery_subtitle_style\` text,
    \`factory_gallery_images_ratio\` text DEFAULT 'default',
    \`factory_gallery_images_ratio_custom\` text,
    \`factory_gallery_images_fit\` text DEFAULT 'default',
    \`product_lines_title\` text,
    \`product_lines_title_hidden\` integer DEFAULT false,
    \`product_lines_title_style\` text,
    \`product_lines_button_text\` text,
    \`product_lines_button_text_hidden\` integer DEFAULT false,
    \`product_lines_button_text_style\` text,
    \`featured_cases_kicker\` text,
    \`featured_cases_kicker_hidden\` integer DEFAULT false,
    \`featured_cases_kicker_style\` text,
    \`featured_cases_title\` text,
    \`featured_cases_title_hidden\` integer DEFAULT false,
    \`featured_cases_title_style\` text,
    \`featured_cases_subtitle\` text,
    \`featured_cases_subtitle_style\` text,
    \`featured_cases_card_button\` text,
    \`featured_cases_card_button_hidden\` integer DEFAULT false,
    \`featured_cases_card_button_style\` text,
    \`featured_cases_all_button\` text,
    \`featured_cases_all_button_hidden\` integer DEFAULT false,
    \`featured_cases_all_button_style\` text,
    \`seo_seo_title\` text,
    \`seo_seo_description\` text,
    \`seo_og_image_id\` integer,
    \`seo_noindex\` integer DEFAULT false,
    \`_status\` text DEFAULT 'draft',
    \`updated_at\` text,
    \`created_at\` text,
    FOREIGN KEY (\`about_intro_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "services_title", "services_title_hidden", "services_title_style", "services_subtitle", "services_subtitle_style", "company_stats_supplier_label", "company_stats_supplier_label_hidden", "company_stats_supplier_label_style", "about_intro_kicker", "about_intro_kicker_hidden", "about_intro_kicker_style", "about_intro_title", "about_intro_title_hidden", "about_intro_title_style", "about_intro_company_title", "about_intro_company_title_hidden", "about_intro_company_title_style", "about_intro_button_text", "about_intro_button_text_hidden", "about_intro_button_text_style", "about_intro_body", "about_intro_body_style", "about_intro_image_id", "about_intro_image_ratio", "about_intro_image_ratio_custom", "about_intro_image_fit", "factory_gallery_kicker", "factory_gallery_kicker_hidden", "factory_gallery_kicker_style", "factory_gallery_title", "factory_gallery_title_hidden", "factory_gallery_title_style", "factory_gallery_subtitle", "factory_gallery_subtitle_style", "factory_gallery_images_ratio", "factory_gallery_images_ratio_custom", "factory_gallery_images_fit", "product_lines_title", "product_lines_title_hidden", "product_lines_title_style", "product_lines_button_text", "product_lines_button_text_hidden", "product_lines_button_text_style", "featured_cases_kicker", "featured_cases_kicker_hidden", "featured_cases_kicker_style", "featured_cases_title", "featured_cases_title_hidden", "featured_cases_title_style", "featured_cases_subtitle", "featured_cases_subtitle_style", "featured_cases_card_button", "featured_cases_card_button_hidden", "featured_cases_card_button_style", "featured_cases_all_button", "featured_cases_all_button_hidden", "featured_cases_all_button_style", "seo_seo_title", "seo_seo_description", "seo_og_image_id", "seo_noindex", "_status", "updated_at", "created_at") SELECT "id", "services_title", "services_title_hidden", "services_title_style", "services_subtitle", "services_subtitle_style", "company_stats_supplier_label", "company_stats_supplier_label_hidden", "company_stats_supplier_label_style", "about_intro_kicker", "about_intro_kicker_hidden", "about_intro_kicker_style", "about_intro_title", "about_intro_title_hidden", "about_intro_title_style", "about_intro_company_title", "about_intro_company_title_hidden", "about_intro_company_title_style", "about_intro_button_text", "about_intro_button_text_hidden", "about_intro_button_text_style", "about_intro_body", "about_intro_body_style", "about_intro_image_id", "about_intro_image_ratio", "about_intro_image_ratio_custom", "about_intro_image_fit", "factory_gallery_kicker", "factory_gallery_kicker_hidden", "factory_gallery_kicker_style", "factory_gallery_title", "factory_gallery_title_hidden", "factory_gallery_title_style", "factory_gallery_subtitle", "factory_gallery_subtitle_style", "factory_gallery_images_ratio", "factory_gallery_images_ratio_custom", "factory_gallery_images_fit", "product_lines_title", "product_lines_title_hidden", "product_lines_title_style", "product_lines_button_text", "product_lines_button_text_hidden", "product_lines_button_text_style", "featured_cases_kicker", "featured_cases_kicker_hidden", "featured_cases_kicker_style", "featured_cases_title", "featured_cases_title_hidden", "featured_cases_title_style", "featured_cases_subtitle", "featured_cases_subtitle_style", "featured_cases_card_button", "featured_cases_card_button_hidden", "featured_cases_card_button_style", "featured_cases_all_button", "featured_cases_all_button_hidden", "featured_cases_all_button_style", "seo_seo_title", "seo_seo_description", "seo_og_image_id", "seo_noindex", "_status", "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_about_intro_image_idx\` ON \`home_page\` (\`about_intro_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_seo_seo_og_image_idx\` ON \`home_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v_version_banners_slides\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`enabled\` integer DEFAULT true,
    \`desktop_image_id\` integer,
    \`mobile_image_id\` integer,
    \`overlay\` numeric DEFAULT 50,
    \`kicker\` text,
    \`kicker_hidden\` integer DEFAULT false,
    \`kicker_style\` text,
    \`title\` text,
    \`title_style\` text,
    \`subtitle\` text,
    \`subtitle_style\` text,
    \`quote_button_text\` text,
    \`quote_button_text_hidden\` integer DEFAULT false,
    \`quote_button_text_style\` text,
    \`product_button_text\` text,
    \`product_button_text_hidden\` integer DEFAULT false,
    \`product_button_text_style\` text,
    \`product_id\` integer,
    \`link_type\` text DEFAULT 'default',
    \`link_product_id\` integer,
    \`link_case_study_id\` integer,
    \`link_page\` text,
    \`link_url\` text,
    \`link_new_tab\` integer,
    \`_uuid\` text,
    FOREIGN KEY (\`desktop_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`mobile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`link_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`link_case_study_id\`) REFERENCES \`cases\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v_version_banners_slides\`("_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "overlay", "kicker", "kicker_hidden", "kicker_style", "title", "title_style", "subtitle", "subtitle_style", "quote_button_text", "quote_button_text_hidden", "quote_button_text_style", "product_button_text", "product_button_text_hidden", "product_button_text_style", "product_id", "link_type", "link_product_id", "link_case_study_id", "link_page", "link_url", "link_new_tab", "_uuid") SELECT "_order", "_parent_id", "id", "enabled", "desktop_image_id", "mobile_image_id", "overlay", "kicker", "kicker_hidden", "kicker_style", "title", "title_style", "subtitle", "subtitle_style", "quote_button_text", "quote_button_text_hidden", "quote_button_text_style", "product_button_text", "product_button_text_hidden", "product_button_text_style", "product_id", "link_type", "link_product_id", "link_case_study_id", "link_page", "link_url", "link_new_tab", "_uuid" FROM \`_home_page_v_version_banners_slides\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_banners_slides\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v_version_banners_slides\` RENAME TO \`_home_page_v_version_banners_slides\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_order_idx\` ON \`_home_page_v_version_banners_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_parent_id_idx\` ON \`_home_page_v_version_banners_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_desktop_image_idx\` ON \`_home_page_v_version_banners_slides\` (\`desktop_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_mobile_image_idx\` ON \`_home_page_v_version_banners_slides\` (\`mobile_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_product_idx\` ON \`_home_page_v_version_banners_slides\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_link_link_product_idx\` ON \`_home_page_v_version_banners_slides\` (\`link_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_banners_slides_link_link_case_study_idx\` ON \`_home_page_v_version_banners_slides\` (\`link_case_study_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version_services_title\` text,
    \`version_services_title_hidden\` integer DEFAULT false,
    \`version_services_title_style\` text,
    \`version_services_subtitle\` text,
    \`version_services_subtitle_style\` text,
    \`version_company_stats_supplier_label\` text,
    \`version_company_stats_supplier_label_hidden\` integer DEFAULT false,
    \`version_company_stats_supplier_label_style\` text,
    \`version_about_intro_kicker\` text,
    \`version_about_intro_kicker_hidden\` integer DEFAULT false,
    \`version_about_intro_kicker_style\` text,
    \`version_about_intro_title\` text,
    \`version_about_intro_title_hidden\` integer DEFAULT false,
    \`version_about_intro_title_style\` text,
    \`version_about_intro_company_title\` text,
    \`version_about_intro_company_title_hidden\` integer DEFAULT false,
    \`version_about_intro_company_title_style\` text,
    \`version_about_intro_button_text\` text,
    \`version_about_intro_button_text_hidden\` integer DEFAULT false,
    \`version_about_intro_button_text_style\` text,
    \`version_about_intro_body\` text,
    \`version_about_intro_body_style\` text,
    \`version_about_intro_image_id\` integer,
    \`version_about_intro_image_ratio\` text DEFAULT 'default',
    \`version_about_intro_image_ratio_custom\` text,
    \`version_about_intro_image_fit\` text DEFAULT 'default',
    \`version_factory_gallery_kicker\` text,
    \`version_factory_gallery_kicker_hidden\` integer DEFAULT false,
    \`version_factory_gallery_kicker_style\` text,
    \`version_factory_gallery_title\` text,
    \`version_factory_gallery_title_hidden\` integer DEFAULT false,
    \`version_factory_gallery_title_style\` text,
    \`version_factory_gallery_subtitle\` text,
    \`version_factory_gallery_subtitle_style\` text,
    \`version_factory_gallery_images_ratio\` text DEFAULT 'default',
    \`version_factory_gallery_images_ratio_custom\` text,
    \`version_factory_gallery_images_fit\` text DEFAULT 'default',
    \`version_product_lines_title\` text,
    \`version_product_lines_title_hidden\` integer DEFAULT false,
    \`version_product_lines_title_style\` text,
    \`version_product_lines_button_text\` text,
    \`version_product_lines_button_text_hidden\` integer DEFAULT false,
    \`version_product_lines_button_text_style\` text,
    \`version_featured_cases_kicker\` text,
    \`version_featured_cases_kicker_hidden\` integer DEFAULT false,
    \`version_featured_cases_kicker_style\` text,
    \`version_featured_cases_title\` text,
    \`version_featured_cases_title_hidden\` integer DEFAULT false,
    \`version_featured_cases_title_style\` text,
    \`version_featured_cases_subtitle\` text,
    \`version_featured_cases_subtitle_style\` text,
    \`version_featured_cases_card_button\` text,
    \`version_featured_cases_card_button_hidden\` integer DEFAULT false,
    \`version_featured_cases_card_button_style\` text,
    \`version_featured_cases_all_button\` text,
    \`version_featured_cases_all_button_hidden\` integer DEFAULT false,
    \`version_featured_cases_all_button_style\` text,
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
    FOREIGN KEY (\`version_about_intro_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v\`("id", "version_services_title", "version_services_title_hidden", "version_services_title_style", "version_services_subtitle", "version_services_subtitle_style", "version_company_stats_supplier_label", "version_company_stats_supplier_label_hidden", "version_company_stats_supplier_label_style", "version_about_intro_kicker", "version_about_intro_kicker_hidden", "version_about_intro_kicker_style", "version_about_intro_title", "version_about_intro_title_hidden", "version_about_intro_title_style", "version_about_intro_company_title", "version_about_intro_company_title_hidden", "version_about_intro_company_title_style", "version_about_intro_button_text", "version_about_intro_button_text_hidden", "version_about_intro_button_text_style", "version_about_intro_body", "version_about_intro_body_style", "version_about_intro_image_id", "version_about_intro_image_ratio", "version_about_intro_image_ratio_custom", "version_about_intro_image_fit", "version_factory_gallery_kicker", "version_factory_gallery_kicker_hidden", "version_factory_gallery_kicker_style", "version_factory_gallery_title", "version_factory_gallery_title_hidden", "version_factory_gallery_title_style", "version_factory_gallery_subtitle", "version_factory_gallery_subtitle_style", "version_factory_gallery_images_ratio", "version_factory_gallery_images_ratio_custom", "version_factory_gallery_images_fit", "version_product_lines_title", "version_product_lines_title_hidden", "version_product_lines_title_style", "version_product_lines_button_text", "version_product_lines_button_text_hidden", "version_product_lines_button_text_style", "version_featured_cases_kicker", "version_featured_cases_kicker_hidden", "version_featured_cases_kicker_style", "version_featured_cases_title", "version_featured_cases_title_hidden", "version_featured_cases_title_style", "version_featured_cases_subtitle", "version_featured_cases_subtitle_style", "version_featured_cases_card_button", "version_featured_cases_card_button_hidden", "version_featured_cases_card_button_style", "version_featured_cases_all_button", "version_featured_cases_all_button_hidden", "version_featured_cases_all_button_style", "version_seo_seo_title", "version_seo_seo_description", "version_seo_og_image_id", "version_seo_noindex", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest") SELECT "id", "version_services_title", "version_services_title_hidden", "version_services_title_style", "version_services_subtitle", "version_services_subtitle_style", "version_company_stats_supplier_label", "version_company_stats_supplier_label_hidden", "version_company_stats_supplier_label_style", "version_about_intro_kicker", "version_about_intro_kicker_hidden", "version_about_intro_kicker_style", "version_about_intro_title", "version_about_intro_title_hidden", "version_about_intro_title_style", "version_about_intro_company_title", "version_about_intro_company_title_hidden", "version_about_intro_company_title_style", "version_about_intro_button_text", "version_about_intro_button_text_hidden", "version_about_intro_button_text_style", "version_about_intro_body", "version_about_intro_body_style", "version_about_intro_image_id", "version_about_intro_image_ratio", "version_about_intro_image_ratio_custom", "version_about_intro_image_fit", "version_factory_gallery_kicker", "version_factory_gallery_kicker_hidden", "version_factory_gallery_kicker_style", "version_factory_gallery_title", "version_factory_gallery_title_hidden", "version_factory_gallery_title_style", "version_factory_gallery_subtitle", "version_factory_gallery_subtitle_style", "version_factory_gallery_images_ratio", "version_factory_gallery_images_ratio_custom", "version_factory_gallery_images_fit", "version_product_lines_title", "version_product_lines_title_hidden", "version_product_lines_title_style", "version_product_lines_button_text", "version_product_lines_button_text_hidden", "version_product_lines_button_text_style", "version_featured_cases_kicker", "version_featured_cases_kicker_hidden", "version_featured_cases_kicker_style", "version_featured_cases_title", "version_featured_cases_title_hidden", "version_featured_cases_title_style", "version_featured_cases_subtitle", "version_featured_cases_subtitle_style", "version_featured_cases_card_button", "version_featured_cases_card_button_hidden", "version_featured_cases_card_button_style", "version_featured_cases_all_button", "version_featured_cases_all_button_hidden", "version_featured_cases_all_button_style", "version_seo_seo_title", "version_seo_seo_description", "version_seo_og_image_id", "version_seo_noindex", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest" FROM \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v\` RENAME TO \`_home_page_v\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_version_about_intro_ima_idx\` ON \`_home_page_v\` (\`version_about_intro_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_seo_version_seo_og_image_idx\` ON \`_home_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`cover_caption\`;`)
  await db.run(sql`ALTER TABLE \`cases\` DROP COLUMN \`cover_caption_style\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_cover_caption\`;`)
  await db.run(sql`ALTER TABLE \`_cases_v\` DROP COLUMN \`version_cover_caption_style\`;`)
}
