import * as migration_20261021_153138_initial from './20261021_153138_initial';
import * as migration_20261022_003835_hidden_text_flags from './20261022_003835_hidden_text_flags';
import * as migration_20261022_064852_redirect_type_308 from './20261022_064852_redirect_type_308';

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
    name: '20261022_064852_redirect_type_308'
  },
];
