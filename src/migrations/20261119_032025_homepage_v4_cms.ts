import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`company_name_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`footer_intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`nav_labels_home_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`nav_labels_about_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`nav_labels_products_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`nav_labels_cases_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`nav_labels_contact_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_region_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_email_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_phone_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_contact_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_chat_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_top_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_blue_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_expand_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`floating_tools_collapse_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`contact_band_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`contact_band_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`contact_band_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_company_name_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_footer_intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_nav_labels_home_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_nav_labels_about_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_nav_labels_products_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_nav_labels_cases_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_nav_labels_contact_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_region_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_email_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_phone_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_contact_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_chat_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_top_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_blue_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_expand_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_floating_tools_collapse_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_contact_band_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_contact_band_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_contact_band_button_text_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_services_items\` ADD \`name_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_company_stats_stats\` ADD \`value_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_company_stats_stats\` ADD \`label_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page_about_intro_tags\` ADD \`label_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`company_stats_supplier_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_body_style\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`home_page\` ADD \`about_intro_image_fit\` text DEFAULT 'default';`)
  await db.run(sql`CREATE INDEX \`home_page_about_intro_about_intro_image_idx\` ON \`home_page\` (\`about_intro_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_services_items\` ADD \`name_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_company_stats_stats\` ADD \`value_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_company_stats_stats\` ADD \`label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_about_intro_tags\` ADD \`label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_company_stats_supplier_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_body_style\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_home_page_v\` ADD \`version_about_intro_image_fit\` text DEFAULT 'default';`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_about_intro_version_about_intro_ima_idx\` ON \`_home_page_v\` (\`version_about_intro_image_id\`);`)
  await db.run(sql`ALTER TABLE \`products_page\` ADD \`intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` ADD \`version_intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`email_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`phone_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`whatsapp_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`phone_whatsapp_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`address_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`contact_page\` ADD \`hours_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_intro_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_email_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_phone_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_whatsapp_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_phone_whatsapp_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_address_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` ADD \`version_hours_label_style\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`services_title\` text,
    \`services_title_hidden\` integer DEFAULT false,
    \`services_title_style\` text,
    \`services_subtitle\` text,
    \`services_subtitle_style\` text,
    \`company_stats_supplier_label\` text,
    \`company_stats_supplier_label_hidden\` integer DEFAULT false,
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
    FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home_page\`("id", "services_title", "services_title_hidden", "services_title_style", "services_subtitle", "services_subtitle_style", "company_stats_supplier_label", "company_stats_supplier_label_hidden", "about_intro_kicker", "about_intro_kicker_hidden", "about_intro_kicker_style", "about_intro_title", "about_intro_title_hidden", "about_intro_title_style", "about_intro_company_title", "about_intro_company_title_hidden", "about_intro_company_title_style", "about_intro_button_text", "about_intro_button_text_hidden", "about_intro_button_text_style", "about_intro_body", "factory_gallery_kicker", "factory_gallery_kicker_hidden", "factory_gallery_kicker_style", "factory_gallery_title", "factory_gallery_title_hidden", "factory_gallery_title_style", "factory_gallery_subtitle", "factory_gallery_subtitle_style", "factory_gallery_images_ratio", "factory_gallery_images_ratio_custom", "factory_gallery_images_fit", "product_lines_title", "product_lines_title_hidden", "product_lines_title_style", "product_lines_button_text", "product_lines_button_text_hidden", "product_lines_button_text_style", "featured_cases_kicker", "featured_cases_kicker_hidden", "featured_cases_kicker_style", "featured_cases_title", "featured_cases_title_hidden", "featured_cases_title_style", "featured_cases_subtitle", "featured_cases_subtitle_style", "featured_cases_card_button", "featured_cases_card_button_hidden", "featured_cases_card_button_style", "featured_cases_all_button", "featured_cases_all_button_hidden", "featured_cases_all_button_style", "seo_seo_title", "seo_seo_description", "seo_og_image_id", "seo_noindex", "_status", "updated_at", "created_at") SELECT "id", "services_title", "services_title_hidden", "services_title_style", "services_subtitle", "services_subtitle_style", "company_stats_supplier_label", "company_stats_supplier_label_hidden", "about_intro_kicker", "about_intro_kicker_hidden", "about_intro_kicker_style", "about_intro_title", "about_intro_title_hidden", "about_intro_title_style", "about_intro_company_title", "about_intro_company_title_hidden", "about_intro_company_title_style", "about_intro_button_text", "about_intro_button_text_hidden", "about_intro_button_text_style", "about_intro_body", "factory_gallery_kicker", "factory_gallery_kicker_hidden", "factory_gallery_kicker_style", "factory_gallery_title", "factory_gallery_title_hidden", "factory_gallery_title_style", "factory_gallery_subtitle", "factory_gallery_subtitle_style", "factory_gallery_images_ratio", "factory_gallery_images_ratio_custom", "factory_gallery_images_fit", "product_lines_title", "product_lines_title_hidden", "product_lines_title_style", "product_lines_button_text", "product_lines_button_text_hidden", "product_lines_button_text_style", "featured_cases_kicker", "featured_cases_kicker_hidden", "featured_cases_kicker_style", "featured_cases_title", "featured_cases_title_hidden", "featured_cases_title_style", "featured_cases_subtitle", "featured_cases_subtitle_style", "featured_cases_card_button", "featured_cases_card_button_hidden", "featured_cases_card_button_style", "featured_cases_all_button", "featured_cases_all_button_hidden", "featured_cases_all_button_style", "seo_seo_title", "seo_seo_description", "seo_og_image_id", "seo_noindex", "_status", "updated_at", "created_at" FROM \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`ALTER TABLE \`__new_home_page\` RENAME TO \`home_page\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_page_seo_seo_og_image_idx\` ON \`home_page\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__home_page_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version_services_title\` text,
    \`version_services_title_hidden\` integer DEFAULT false,
    \`version_services_title_style\` text,
    \`version_services_subtitle\` text,
    \`version_services_subtitle_style\` text,
    \`version_company_stats_supplier_label\` text,
    \`version_company_stats_supplier_label_hidden\` integer DEFAULT false,
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
    FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__home_page_v\`("id", "version_services_title", "version_services_title_hidden", "version_services_title_style", "version_services_subtitle", "version_services_subtitle_style", "version_company_stats_supplier_label", "version_company_stats_supplier_label_hidden", "version_about_intro_kicker", "version_about_intro_kicker_hidden", "version_about_intro_kicker_style", "version_about_intro_title", "version_about_intro_title_hidden", "version_about_intro_title_style", "version_about_intro_company_title", "version_about_intro_company_title_hidden", "version_about_intro_company_title_style", "version_about_intro_button_text", "version_about_intro_button_text_hidden", "version_about_intro_button_text_style", "version_about_intro_body", "version_factory_gallery_kicker", "version_factory_gallery_kicker_hidden", "version_factory_gallery_kicker_style", "version_factory_gallery_title", "version_factory_gallery_title_hidden", "version_factory_gallery_title_style", "version_factory_gallery_subtitle", "version_factory_gallery_subtitle_style", "version_factory_gallery_images_ratio", "version_factory_gallery_images_ratio_custom", "version_factory_gallery_images_fit", "version_product_lines_title", "version_product_lines_title_hidden", "version_product_lines_title_style", "version_product_lines_button_text", "version_product_lines_button_text_hidden", "version_product_lines_button_text_style", "version_featured_cases_kicker", "version_featured_cases_kicker_hidden", "version_featured_cases_kicker_style", "version_featured_cases_title", "version_featured_cases_title_hidden", "version_featured_cases_title_style", "version_featured_cases_subtitle", "version_featured_cases_subtitle_style", "version_featured_cases_card_button", "version_featured_cases_card_button_hidden", "version_featured_cases_card_button_style", "version_featured_cases_all_button", "version_featured_cases_all_button_hidden", "version_featured_cases_all_button_style", "version_seo_seo_title", "version_seo_seo_description", "version_seo_og_image_id", "version_seo_noindex", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest") SELECT "id", "version_services_title", "version_services_title_hidden", "version_services_title_style", "version_services_subtitle", "version_services_subtitle_style", "version_company_stats_supplier_label", "version_company_stats_supplier_label_hidden", "version_about_intro_kicker", "version_about_intro_kicker_hidden", "version_about_intro_kicker_style", "version_about_intro_title", "version_about_intro_title_hidden", "version_about_intro_title_style", "version_about_intro_company_title", "version_about_intro_company_title_hidden", "version_about_intro_company_title_style", "version_about_intro_button_text", "version_about_intro_button_text_hidden", "version_about_intro_button_text_style", "version_about_intro_body", "version_factory_gallery_kicker", "version_factory_gallery_kicker_hidden", "version_factory_gallery_kicker_style", "version_factory_gallery_title", "version_factory_gallery_title_hidden", "version_factory_gallery_title_style", "version_factory_gallery_subtitle", "version_factory_gallery_subtitle_style", "version_factory_gallery_images_ratio", "version_factory_gallery_images_ratio_custom", "version_factory_gallery_images_fit", "version_product_lines_title", "version_product_lines_title_hidden", "version_product_lines_title_style", "version_product_lines_button_text", "version_product_lines_button_text_hidden", "version_product_lines_button_text_style", "version_featured_cases_kicker", "version_featured_cases_kicker_hidden", "version_featured_cases_kicker_style", "version_featured_cases_title", "version_featured_cases_title_hidden", "version_featured_cases_title_style", "version_featured_cases_subtitle", "version_featured_cases_subtitle_style", "version_featured_cases_card_button", "version_featured_cases_card_button_hidden", "version_featured_cases_card_button_style", "version_featured_cases_all_button", "version_featured_cases_all_button_hidden", "version_featured_cases_all_button_style", "version_seo_seo_title", "version_seo_seo_description", "version_seo_og_image_id", "version_seo_noindex", "version__status", "version_updated_at", "version_created_at", "created_at", "updated_at", "latest" FROM \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__home_page_v\` RENAME TO \`_home_page_v\`;`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_seo_version_seo_og_image_idx\` ON \`_home_page_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`company_name_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`footer_intro_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`nav_labels_home_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`nav_labels_about_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`nav_labels_products_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`nav_labels_cases_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`nav_labels_contact_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_region_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_email_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_phone_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_contact_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_chat_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_top_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_blue_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_expand_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`floating_tools_collapse_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`contact_band_title_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`contact_band_text_style\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`contact_band_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_company_name_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_footer_intro_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_nav_labels_home_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_nav_labels_about_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_nav_labels_products_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_nav_labels_cases_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_nav_labels_contact_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_region_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_email_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_phone_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_contact_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_chat_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_top_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_blue_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_expand_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_floating_tools_collapse_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_contact_band_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_contact_band_text_style\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_contact_band_button_text_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page_services_items\` DROP COLUMN \`name_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page_company_stats_stats\` DROP COLUMN \`value_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page_company_stats_stats\` DROP COLUMN \`label_style\`;`)
  await db.run(sql`ALTER TABLE \`home_page_about_intro_tags\` DROP COLUMN \`label_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_services_items\` DROP COLUMN \`name_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_company_stats_stats\` DROP COLUMN \`value_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_company_stats_stats\` DROP COLUMN \`label_style\`;`)
  await db.run(sql`ALTER TABLE \`_home_page_v_version_about_intro_tags\` DROP COLUMN \`label_style\`;`)
  await db.run(sql`ALTER TABLE \`products_page\` DROP COLUMN \`intro_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_page_v\` DROP COLUMN \`version_intro_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`intro_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`email_label_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`phone_label_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`whatsapp_label_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`phone_whatsapp_label_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`address_label_style\`;`)
  await db.run(sql`ALTER TABLE \`contact_page\` DROP COLUMN \`hours_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_intro_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_email_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_phone_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_whatsapp_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_phone_whatsapp_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_address_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_contact_page_v\` DROP COLUMN \`version_hours_label_style\`;`)
}
