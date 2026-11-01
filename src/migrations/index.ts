import * as migration_20261021_153138_initial from './20261021_153138_initial';
import * as migration_20261022_003835_hidden_text_flags from './20261022_003835_hidden_text_flags';
import * as migration_20261022_064852_redirect_type_308 from './20261022_064852_redirect_type_308';
import * as migration_20261022_083615_floating_toggle_copy_failed from './20261022_083615_floating_toggle_copy_failed';
import * as migration_20261022_085408_server_error_copy from './20261022_085408_server_error_copy';
import * as migration_20261101_144924_media_storage_prefix from './20261101_144924_media_storage_prefix';

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
    name: '20261101_144924_media_storage_prefix'
  },
];
