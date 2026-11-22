import * as migration_20261021_153138_initial from './20261021_153138_initial';
import * as migration_20261022_003835_hidden_text_flags from './20261022_003835_hidden_text_flags';
import * as migration_20261022_064852_redirect_type_308 from './20261022_064852_redirect_type_308';
import * as migration_20261022_083615_floating_toggle_copy_failed from './20261022_083615_floating_toggle_copy_failed';
import * as migration_20261022_085408_server_error_copy from './20261022_085408_server_error_copy';
import * as migration_20261101_144924_media_storage_prefix from './20261101_144924_media_storage_prefix';
import * as migration_20261109_064929_first_batch_image_ratio_brochure from './20261109_064929_first_batch_image_ratio_brochure';
import * as migration_20261109_071931_second_batch_layout_background_links from './20261109_071931_second_batch_layout_background_links';
import * as migration_20261109_074654_third_batch_image_modules_text_styles from './20261109_074654_third_batch_image_modules_text_styles';
import * as migration_20261119_032025_homepage_v4_cms from './20261119_032025_homepage_v4_cms';
import * as migration_20261119_032553_content_styles_and_auto_images from './20261119_032553_content_styles_and_auto_images';
import * as migration_20261119_033105_public_ui_text_styles from './20261119_033105_public_ui_text_styles';
import * as migration_20261119_035448_contact_and_auxiliary_text_styles from './20261119_035448_contact_and_auxiliary_text_styles';
import * as migration_20261119_064752_homepage_v4_editorial from './20261119_064752_homepage_v4_editorial';
import * as migration_20261119_101633_homepage_review_feedback from './20261119_101633_homepage_review_feedback';
import * as migration_20261119_150827_global_font_weight from './20261119_150827_global_font_weight';
import * as migration_20261120_014653_header_layout from './20261120_014653_header_layout';
import * as migration_20261120_101500_theme_font_size from './20261120_101500_theme_font_size';
import * as migration_20261121_120000_header_logo_zoom from './20261121_120000_header_logo_zoom';
import * as migration_20261122_115352_standalone_machine_card from './20261122_115352_standalone_machine_card';

export const migrations = [
  {
    up: migration_20261021_153138_initial.up,
    down: migration_20261021_153138_initial.down,
    name: '20261021_153138_initial',
  },
  {
    up: migration_20261022_003835_hidden_text_flags.up,
    down: migration_20261022_003835_hidden_text_flags.down,
    name: '20261022_003835_hidden_text_flags',
  },
  {
    up: migration_20261022_064852_redirect_type_308.up,
    down: migration_20261022_064852_redirect_type_308.down,
    name: '20261022_064852_redirect_type_308',
  },
  {
    up: migration_20261022_083615_floating_toggle_copy_failed.up,
    down: migration_20261022_083615_floating_toggle_copy_failed.down,
    name: '20261022_083615_floating_toggle_copy_failed',
  },
  {
    up: migration_20261022_085408_server_error_copy.up,
    down: migration_20261022_085408_server_error_copy.down,
    name: '20261022_085408_server_error_copy',
  },
  {
    up: migration_20261101_144924_media_storage_prefix.up,
    down: migration_20261101_144924_media_storage_prefix.down,
    name: '20261101_144924_media_storage_prefix',
  },
  {
    up: migration_20261109_064929_first_batch_image_ratio_brochure.up,
    down: migration_20261109_064929_first_batch_image_ratio_brochure.down,
    name: '20261109_064929_first_batch_image_ratio_brochure',
  },
  {
    up: migration_20261109_071931_second_batch_layout_background_links.up,
    down: migration_20261109_071931_second_batch_layout_background_links.down,
    name: '20261109_071931_second_batch_layout_background_links',
  },
  {
    up: migration_20261109_074654_third_batch_image_modules_text_styles.up,
    down: migration_20261109_074654_third_batch_image_modules_text_styles.down,
    name: '20261109_074654_third_batch_image_modules_text_styles',
  },
  {
    up: migration_20261119_032025_homepage_v4_cms.up,
    down: migration_20261119_032025_homepage_v4_cms.down,
    name: '20261119_032025_homepage_v4_cms',
  },
  {
    up: migration_20261119_032553_content_styles_and_auto_images.up,
    down: migration_20261119_032553_content_styles_and_auto_images.down,
    name: '20261119_032553_content_styles_and_auto_images',
  },
  {
    up: migration_20261119_033105_public_ui_text_styles.up,
    down: migration_20261119_033105_public_ui_text_styles.down,
    name: '20261119_033105_public_ui_text_styles',
  },
  {
    up: migration_20261119_035448_contact_and_auxiliary_text_styles.up,
    down: migration_20261119_035448_contact_and_auxiliary_text_styles.down,
    name: '20261119_035448_contact_and_auxiliary_text_styles',
  },
  {
    up: migration_20261119_064752_homepage_v4_editorial.up,
    down: migration_20261119_064752_homepage_v4_editorial.down,
    name: '20261119_064752_homepage_v4_editorial',
  },
  {
    up: migration_20261119_101633_homepage_review_feedback.up,
    down: migration_20261119_101633_homepage_review_feedback.down,
    name: '20261119_101633_homepage_review_feedback',
  },
  {
    up: migration_20261119_150827_global_font_weight.up,
    down: migration_20261119_150827_global_font_weight.down,
    name: '20261119_150827_global_font_weight',
  },
  {
    up: migration_20261120_014653_header_layout.up,
    down: migration_20261120_014653_header_layout.down,
    name: '20261120_014653_header_layout',
  },
  {
    up: migration_20261120_101500_theme_font_size.up,
    down: migration_20261120_101500_theme_font_size.down,
    name: '20261120_101500_theme_font_size',
  },
  {
    up: migration_20261121_120000_header_logo_zoom.up,
    down: migration_20261121_120000_header_logo_zoom.down,
    name: '20261121_120000_header_logo_zoom',
  },
  {
    up: migration_20261122_115352_standalone_machine_card.up,
    down: migration_20261122_115352_standalone_machine_card.down,
    name: '20261122_115352_standalone_machine_card'
  },
];
