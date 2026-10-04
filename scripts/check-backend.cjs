const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredMigrations = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_indexes.sql',
  '004_triggers.sql',
  '005_delete_account.sql',
  '006_media_gps_columns.sql',
  '007_story_and_guest_flow.sql',
  '008_activity_story_editing.sql',
  '009_invite_and_participant_hardening.sql',
];
const errors = [];

for (const name of requiredMigrations) {
  const file = path.join(root, 'supabase', 'migrations', name);
  if (!fs.existsSync(file)) errors.push(`Missing migration: ${name}`);
}

for (const fn of ['generate-storybook', 'public-story']) {
  const file = path.join(root, 'supabase', 'functions', fn, 'index.ts');
  if (!fs.existsSync(file)) errors.push(`Missing Edge Function: ${fn}`);
}

const configPath = path.join(root, 'supabase', 'config.toml');
const config = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
if (!/\[functions\.public-story\][\s\S]*verify_jwt\s*=\s*false/.test(config)) {
  errors.push('public-story must be configured with verify_jwt=false; share-token validation happens inside the function');
}

const generate = fs.readFileSync(path.join(root, 'supabase/functions/generate-storybook/index.ts'), 'utf8');
if (!/auth\.getUser|Authorization/i.test(generate)) errors.push('generate-storybook must verify the caller identity');
if (!/organizer_id|organiser_id|is_event_organizer|organizer/i.test(generate)) errors.push('generate-storybook must enforce organiser ownership');
if (/return generateStorybookInline\(input\)/.test(generate)) errors.push('generate-storybook must not silently fall back to the weak inline engine');

const publicStory = fs.readFileSync(path.join(root, 'supabase/functions/public-story/index.ts'), 'utf8');
if (!/share[_ -]?token|token/i.test(publicStory)) errors.push('public-story must validate a share token');
if (!/createSignedUrl|signed/i.test(publicStory)) errors.push('public-story must refresh private media URLs');

const migrations = requiredMigrations
  .map((name) => fs.readFileSync(path.join(root, 'supabase/migrations', name), 'utf8'))
  .join('\n');
for (const required of ['captions', 'media_reactions', 'share_links']) {
  if (!migrations.includes(required)) errors.push(`Backend schema is missing ${required}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Backend check passed: ${requiredMigrations.length} migrations and 2 Edge Functions present with critical guards.`);
