import { expect, test, type Page } from '@playwright/test';

const screens = [
  ['splash', 'Ambler'],
  ['onboarding', 'Bring everyone’s moments together.'],
  ['auth', 'Your stories are waiting.'],
  ['profile-setup', 'How should people see you?'],
  ['home', 'Good evening, Russell'],
  ['events', 'Capture what’s happening now.'],
  ['stories', 'Your finished Ambler library.'],
  ['archive', 'Out of sight, never lost unless you delete it.'],
  ['create-basics', 'What are we capturing?'],
  ['event-type', 'What kind of story is this?'],
  ['story-style', 'Choose how the story should feel.'],
  ['privacy-route', 'Keep it private. Add the journey if you want.'],
  ['invite', 'Bring your people in.'],
  ['event-hub', 'Snowdon Weekend'],
  ['moments', 'The shared capture pool.'],
  ['add-moment', 'Add a moment'],
  ['route-capture', 'Elapsed'],
  ['guest-join', 'Join Snowdon Weekend'],
  ['guest-contribution', 'Add your moments'],
  ['guest-result', 'Added to Snowdon Weekend'],
  ['finish-build', 'Ready to turn it into a story?'],
  ['generation', 'Building Snowdon Weekend'],
  ['story-ready', 'YOUR STORY IS READY'],
  ['relive', 'The ridge changed the whole day.'],
  ['route-replay', 'Halfway ridge'],
  ['route-moment', 'Halfway ridge · 6 moments'],
  ['story-editor', 'Edit story'],
  ['theme-music', 'Theme & music'],
  ['share-export', 'Share & save'],
  ['shared-web', 'A weekend that kept climbing.'],
  ['profile', '12 stories · 19 events'],
  ['settings', 'Keep everyday controls simple.'],
  ['privacy-data', 'Private-first defaults, with clear exceptions.'],
  ['storage-hosting', 'Use Ambler normally, or keep your stories on your own server.'],
  ['add-server', 'Connect your own storage.'],
  ['server-detail', 'Your private story library at home.'],
] as const;

async function open(page: Page, id: string) {
  await page.goto('/ui-preview/' + id);
  await expect(page.getByTestId('ui-screen-' + id)).toBeVisible();
}

async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    doc: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(Math.max(metrics.doc, metrics.body)).toBeLessThanOrEqual(metrics.viewport + 2);
}

test.describe('all 36 Ambler screens', () => {
  for (const [id, marker] of screens) {
    test(id + ' renders without horizontal overflow', async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });

      await open(page, id);
      await expect(page.getByText(marker, { exact: false }).first()).toBeVisible();
      await assertNoHorizontalOverflow(page);
      await page.screenshot({ path: 'test-results/screens/' + testInfo.project.name + '/' + id + '.png', fullPage: true });
      expect(errors, 'browser/runtime errors on ' + id).toEqual([]);
    });
  }
});

test('review hub exposes quality states and five journeys', async ({ page }, testInfo) => {
  await page.goto('/ui-preview');
  await expect(page.getByTestId('ui-preview-index')).toBeVisible();
  for (const state of ['OFFLINE', 'SERVER OFFLINE', 'UPLOAD FAILED', 'LINK EXPIRED']) {
    await expect(page.getByText(state, { exact: true })).toBeVisible();
  }
  for (const journey of ['Organiser', 'Guest', 'Route Replay', 'Edit & share', 'Home Server']) {
    await expect(page.getByText(journey, { exact: true })).toBeVisible();
  }
  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: 'test-results/screens/' + testInfo.project.name + '/review-hub.png', fullPage: true });
});

test('onboarding progresses Capture → Build → Relive → auth', async ({ page }) => {
  await open(page, 'onboarding');
  await expect(page.getByText('01 · CAPTURE')).toBeVisible();
  await page.getByText('Continue', { exact: true }).click();
  await expect(page.getByText('02 · BUILD')).toBeVisible();
  await page.getByText('Continue', { exact: true }).click();
  await expect(page.getByText('03 · RELIVE')).toBeVisible();
  await page.getByText('Get started', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-auth')).toBeVisible();
});

test('event and story discovery controls update rendered content', async ({ page }) => {
  await open(page, 'events');
  await expect(page.getByText('Snowdon Weekend', { exact: true })).toBeVisible();
  await page.getByText('Upcoming', { exact: true }).click();
  await expect(page.getByText('Saturday in Barcelona', { exact: true })).toBeVisible();
  await page.getByText('Past', { exact: true }).click();
  await expect(page.getByText("Sophie's 40th Birthday Celebration at The Orangery", { exact: true })).toBeVisible();

  await open(page, 'stories');
  await page.getByText('Celebrations', { exact: true }).click();
  await expect(page.getByText("Sophie's 40th", { exact: true })).toBeVisible();
  await expect(page.getByText('Snowdon Weekend', { exact: true })).toHaveCount(0);
  await page.getByText('All', { exact: true }).click();
  const search = page.getByPlaceholder('Search stories, places or people');
  await search.fill('Barcelona');
  await expect(page.getByText('Barcelona', { exact: true })).toBeVisible();
  await expect(page.getByText('Snowdon Weekend', { exact: true })).toHaveCount(0);
});

test('event type categories and search change the available choices', async ({ page }) => {
  await open(page, 'event-type');
  await page.getByText('Family & life', { exact: true }).click();
  await expect(page.getByText('Family reunion', { exact: true })).toBeVisible();
  await expect(page.getByText('School trip', { exact: true })).toBeVisible();
  await expect(page.getByText('Road trip', { exact: true })).toHaveCount(0);

  const search = page.getByPlaceholder('Search 52 event types');
  await search.fill('school');
  await expect(page.getByText('School trip', { exact: true })).toBeVisible();
  await expect(page.getByText('Family reunion', { exact: true })).toHaveCount(0);
});

test('Moments filters and viewer reflect the selected media set', async ({ page }) => {
  await open(page, 'moments');
  await expect(page.getByText('10 moments', { exact: true })).toBeVisible();
  await page.getByText('Videos', { exact: true }).click();
  await expect(page.getByText('3 videos', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open video moment by RS' }).first().click();
  await expect(page.getByText('Moment details', { exact: true })).toBeVisible();
  await page.getByText('Close moment', { exact: true }).click();
  await expect(page.getByText('Moment details', { exact: true })).toHaveCount(0);

  await page.getByText('Photos', { exact: true }).click();
  await expect(page.getByText('7 photos', { exact: true })).toBeVisible();
  await page.getByText('Mine', { exact: true }).click();
  await expect(page.getByText('3 by you', { exact: true })).toBeVisible();
});

test('event creation choices persist visibly through the prototype', async ({ page }) => {
  await open(page, 'event-type');
  await page.getByText('Road trip', { exact: true }).click();
  await expect(page.getByText('Continue with Road trip', { exact: true })).toBeVisible();
  await page.getByText('Continue with Road trip', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-story-style')).toBeVisible();

  await page.getByText('Cinematic', { exact: true }).click();
  await page.getByText('Continue', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-privacy-route')).toBeVisible();

  await page.getByText('Anyone with a private link', { exact: true }).click();
  await page.getByText('Create event', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-invite')).toBeVisible();
});

test('invite, route capture and guest contribution expose clear state changes', async ({ page }) => {
  await open(page, 'invite');
  await page.getByText('Copy link', { exact: true }).click();
  await expect(page.getByText('Link copied', { exact: true })).toBeVisible();

  await open(page, 'route-capture');
  await expect(page.getByText('RECORDING', { exact: true })).toBeVisible();
  await page.getByText('Pause', { exact: true }).click();
  await expect(page.getByText('PAUSED', { exact: true })).toBeVisible();
  await page.getByText('Resume', { exact: true }).click();
  await expect(page.getByText('RECORDING', { exact: true })).toBeVisible();

  await open(page, 'guest-contribution');
  await page.getByText('Video', { exact: true }).click();
  await page.getByText('Add to event', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-guest-result')).toBeVisible();
});

test('Route Replay supports pause, explore, expand and media return', async ({ page }) => {
  await open(page, 'route-replay');

  await page.getByRole('button', { name: 'Pause replay' }).click();
  await expect(page.getByText('Paused · summit ahead', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Explore map' }).click();
  await expect(page.getByText('Explore mode · camera released', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Expand route' }).click();
  await expect(page.getByText('FULL ROUTE', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Open Summit clip media' }).click();
  await expect(page.getByTestId('ui-screen-route-moment')).toBeVisible();
  await page.getByText('Return to replay', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-route-replay')).toBeVisible();
});

test('editor, sharing and revoke/recreate states behave', async ({ page }) => {
  await open(page, 'story-editor');
  await page.getByText('Choose cover', { exact: true }).click();
  await expect(page.getByText('Cover selection', { exact: true })).toBeVisible();
  await page.getByText('Regenerate this section', { exact: true }).click();
  await expect(page.getByText('Regenerate section', { exact: true })).toBeVisible();

  await open(page, 'theme-music');
  await page.getByText('Warm Gold', { exact: true }).click();
  await page.getByText('Apply to story', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-story-editor')).toBeVisible();

  await open(page, 'share-export');
  await page.getByText('Revoke', { exact: true }).click();
  await expect(page.getByText('REVOKED', { exact: true })).toBeVisible();
  await page.getByText('Create new link', { exact: true }).click();
  await expect(page.getByText('ACTIVE', { exact: true })).toBeVisible();
  await page.getByText('Ambler Home Server', { exact: true }).click();
  await expect(page.getByText('Saved · full story + originals', { exact: true })).toBeVisible();
});

test('Home Server connect, destination, connection and sync states behave', async ({ page }) => {
  await open(page, 'storage-hosting');
  await page.getByText('Ambler Cloud', { exact: true }).click();
  await page.getByText('Add another server', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-add-server')).toBeVisible();

  await page.getByText('Scan QR', { exact: true }).click();
  await expect(page.getByText('Scan the QR shown by your Ambler Server', { exact: true })).toBeVisible();
  await page.getByText('Connect securely', { exact: true }).click();
  await expect(page.getByTestId('ui-screen-server-detail')).toBeVisible();

  await page.getByText('Test connection', { exact: true }).click();
  await expect(page.getByText('Connection good', { exact: true })).toBeVisible();
  await page.getByText('Sync now', { exact: true }).click();
  await expect(page.getByText('Syncing…', { exact: true })).toBeVisible();
});

test('reduced motion preserves Route Replay information immediately', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 430, height: 932 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/ui-preview/route-replay');
  await expect(page.getByTestId('ui-screen-route-replay')).toBeVisible();
  await expect(page.getByText('Halfway ridge', { exact: true })).toBeVisible({ timeout: 1_000 });
  await expect(page.getByText('6 moments · 10:42 · 4.6 km', { exact: true })).toBeVisible({ timeout: 1_000 });
  await context.close();
});

test('temporary stress population renders every awkward state without overflow', async ({ page }, testInfo) => {
  await page.goto('/ui-preview/stress');
  await expect(page.getByTestId('ui-stress-route')).toBeVisible();

  const markers = [
    "Sophie's 40th Birthday Celebration at The Orangery — Family, Friends, School Reunion and Surprise Weekend Gathering",
    'One Quiet Afternoon',
    'Five-a-side Final',
    'Walking the Thames',
    '187',
    'Thumbnail unavailable',
    'Upload failed at 64%',
    'Story generation interrupted',
    'No route captured',
    'GPS accuracy too low',
    'Private link revoked',
    'Invite expired',
    'RECONNECTING',
    '980 GB used',
    'No server configured',
  ];

  for (const marker of markers) {
    await expect(page.getByText(marker, { exact: false }).first()).toBeVisible();
  }

  await page.getByText('Retry story build', { exact: true }).click();
  await expect(page.getByText('Story build retry queued', { exact: true })).toBeVisible();
  await page.getByText('Add Ambler Server', { exact: true }).click();
  await expect(page.getByText('Server setup opened', { exact: true })).toBeVisible();

  await assertNoHorizontalOverflow(page);
  await page.screenshot({ path: 'test-results/screens/' + testInfo.project.name + '/stress.png', fullPage: true });
});
