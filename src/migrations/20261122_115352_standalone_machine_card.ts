import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`products_standalone_card_specs\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    \`label_style\` text,
    \`value\` text,
    \`value_style\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_standalone_card_specs_order_idx\` ON \`products_standalone_card_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_standalone_card_specs_parent_id_idx\` ON \`products_standalone_card_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_standalone_card_materials\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    \`label_style\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_standalone_card_materials_order_idx\` ON \`products_standalone_card_materials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_standalone_card_materials_parent_id_idx\` ON \`products_standalone_card_materials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_standalone_card_specs\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`label_style\` text,
    \`value\` text,
    \`value_style\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_standalone_card_specs_order_idx\` ON \`_products_v_version_standalone_card_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_standalone_card_specs_parent_id_idx\` ON \`_products_v_version_standalone_card_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_standalone_card_materials\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`label_style\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_standalone_card_materials_order_idx\` ON \`_products_v_version_standalone_card_materials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_standalone_card_materials_parent_id_idx\` ON \`_products_v_version_standalone_card_materials\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_title\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_summary\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_image_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_details_label\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_details_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_inquiry_label\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_inquiry_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_whatsapp_label\` text;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`standalone_card_whatsapp_label_style\` text;`)
  await db.run(sql`CREATE INDEX \`products_standalone_card_standalone_card_image_idx\` ON \`products\` (\`standalone_card_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_title\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_title_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_summary\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_summary_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_image_ratio\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_image_ratio_custom\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_image_fit\` text DEFAULT 'default';`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_details_label\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_details_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_inquiry_label\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_inquiry_label_style\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_whatsapp_label\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_standalone_card_whatsapp_label_style\` text;`)
  await db.run(sql`CREATE INDEX \`_products_v_version_standalone_card_version_standalone_c_idx\` ON \`_products_v\` (\`version_standalone_card_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`products_standalone_card_specs\`;`)
  await db.run(sql`DROP TABLE \`products_standalone_card_materials\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_standalone_card_specs\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_standalone_card_materials\`;`)
  await db.run(sql`DROP INDEX \`products_standalone_card_standalone_card_image_idx\`;`)
  await db.run(sql`DROP INDEX \`_products_v_version_standalone_card_version_standalone_c_idx\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_whatsapp_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_whatsapp_label\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_inquiry_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_inquiry_label\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_details_label_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_details_label\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_image_fit\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_image_ratio\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_image_id\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_summary_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_summary\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_title_style\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_standalone_card_title\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_whatsapp_label_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_whatsapp_label\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_inquiry_label_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_inquiry_label\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_details_label_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_details_label\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_image_fit\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_image_ratio_custom\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_image_ratio\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_image_id\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_summary_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_summary\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_title_style\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`standalone_card_title\`;`)
}
