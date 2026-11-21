// End-to-end smoke test: runs the built userscript against mocked Reddit responses on a
// Pixel-sized viewport and saves screenshots to test/shots/.
import { readFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as fx from './fixtures.mjs';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const SHOTS = process.env.SHOTS || 'test/shots';
mkdirSync(SHOTS, { recursive: true });
const script = readFileSync('dist/bettereddit.user.js', 'utf8');

const svg = (label, hue) => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="hsl(${hue},45%,45%)"/><text x="200" y="160" font-size="40" text-anchor="middle" fill="#fff" font-family="sans-serif">${label}</text></svg>`;
const hue = (s) => [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 360, 7);

const posted = [];
let failures = 0;
const check = (cond, msg) => {
  console.log((cond ? 'PASS ' : 'FAIL ') + msg);
  if (!cond) failures++;
};

async function route(r) {
  const req = r.request();
  const u = new URL(req.url());
  const json = (obj) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(obj) });
  if (/(redd\.it|redditmedia\.com|imgur\.com)$/.test(u.hostname)) {
    if (/\.(mp4|m3u8)/.test(u.pathname)) return r.fulfill({ status: 404, body: '' });
    return r.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg(u.pathname.split('/').pop().slice(0, 10), hue(u.pathname)) });
  }
  if (!/reddit\.com$/.test(u.hostname)) return r.fulfill({ status: 200, contentType: 'text/html', body: '<h1>external</h1>' });
  const p = u.pathname;
  if (req.method() === 'POST') {
    posted.push({ path: p, body: req.postData() });
    if (p === '/api/comment') {
      const text = new URLSearchParams(req.postData()).get('text');
      return json({ json: { errors: [], data: { things: [{ kind: 't1', data: { id: 'new1', name: 't1_new1', author: 'testuser', body: text, body_html: `<div class="md"><p>${text}</p></div>`, score: 1, created_utc: Date.now() / 1000, likes: true, permalink: '/r/pics/comments/p0/x/new1/', replies: '' } }] } } });
    }
    return json({});
  }
  if (p === '/api/me.json') return json(fx.me);
  if (p === '/api/morechildren.json') return json(fx.moreChildren());
  if (p === '/subreddits/mine/subscriber.json') return json(fx.subs);
  if (p === '/subreddits/search.json') return json(fx.subs);
  if (/^\/r\/[^/]+\/about\.json$/.test(p)) return json(fx.about);
  if (/^\/user\/[^/]+\/about\.json$/.test(p)) return json({ data: { name: 'user0', link_karma: 10, comment_karma: 20, created_utc: 1.5e9 } });
  if (p.startsWith('/message/')) return json(fx.inbox);
  let m;
  if ((m = p.match(/\/comments\/([a-z0-9]+)\.json$/))) return json(fx.comments(m[1]));
  if (p.endsWith('.json')) {
    const after = u.searchParams.get('after');
    return json(fx.posts(after ? Number(after.replace('t3_p', '')) / 25 + 1 | 0 : 0));
  }
  // an HTML page: what old.reddit.com would send (the script should replace it)
  return r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><head><script>window.__origRan=true</script></head><body><div id="orig">ORIGINAL OLD REDDIT</div></body></html>' });
}

const browser = await chromium.launch();
async function newPage(colorScheme) {
  const ctx = await browser.newContext({ ...devices['Pixel 7'], colorScheme, deviceScaleFactor: 1 });
  await ctx.route('**/*', route);
  await ctx.addInitScript(script);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => {
    console.log('PAGE ERROR', e.message);
    failures++;
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('console.error:', msg.text());
  });
  return page;
}

const page = await newPage('light');
await page.goto('https://www.reddit.com/', { waitUntil: 'commit' });
await page.waitForURL('https://old.reddit.com/', { waitUntil: 'commit' });
check(true, 'www.reddit.com redirects to old.reddit.com');
await page.waitForSelector('.post');
check(await page.evaluate(() => !document.getElementById('orig') && !window.__origRan), 'original page content replaced, its scripts never ran');
check((await page.locator('.post').count()) >= 25, 'front page shows posts');
await page.waitForTimeout(400);
await page.screenshot({ path: SHOTS + '/01-front-light.png' });

// infinite scroll
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForFunction(() => document.querySelectorAll('.post').length >= 50);
check(true, 'infinite scroll loads the next page');
await page.evaluate(() => window.scrollTo(0, 500));
await page.waitForTimeout(300);

// open comments for a post that is on screen
const scrollBefore = await page.evaluate(() => window.scrollY);
await page.locator('.post').nth(8).locator('.pcbtn').click();
await page.waitForSelector('.cmt');
check(page.url().includes('/comments/p8'), 'comments button navigates in-app');
await page.waitForTimeout(300);
await page.screenshot({ path: SHOTS + '/02-comments.png' });
check((await page.locator('.ckids[data-d="1"] > .cmt').count()) > 0, 'nested comments render with depth bars');

// collapse a comment
await page.locator('.cmt[data-id="t1_c1"] > .cmain').click();
check(await page.locator('.cmt[data-id="t1_c1"]').evaluate((e) => e.classList.contains('collapsed')), 'tap collapses a comment');
check((await page.locator('.cmt[data-id="t1_c1"] > .cmain .ccollapsed').textContent()).includes('+'), 'collapsed comment shows child count');
await page.locator('.cmt[data-id="t1_c1"] > .cmain').click();

// spoiler reveal
await page.locator('.md-spoiler-text').first().click();
check(await page.locator('.md-spoiler-text').first().evaluate((e) => e.classList.contains('revealed')), 'tap reveals spoiler');

// load more comments
await page.locator('button.more').first().click();
await page.waitForSelector('.cmt[data-id="t1_m2"]');
check(await page.locator('.cmt[data-id="t1_m1"] .cmt[data-id="t1_m2"]').count() === 1, '"load more" inserts nested replies under the right parent');

// long-press menu on a comment
const box = await page.locator('.cmt[data-id="t1_c2"] > .cmain').boundingBox();
await page.mouse.move(box.x + 40, box.y + 15);
await page.mouse.down();
await page.waitForTimeout(600);
await page.mouse.up();
await page.waitForSelector('.ov.open .sheet');
await page.waitForTimeout(300);
await page.screenshot({ path: SHOTS + '/03-comment-menu.png' });
check((await page.locator('.ov.open .sitem').allTextContents()).some((t) => t.includes('Upvote')), 'long-press opens comment action sheet');
await page.locator('.ov.open .sitem', { hasText: 'Upvote' }).click();
await page.waitForTimeout(200);
check(posted.some((x) => x.path === '/api/vote' && x.body.includes('t1_c2') && x.body.includes('dir=1') && x.body.includes('uh=mh123')), 'upvote POSTs /api/vote with modhash');
check(await page.locator('.cmt[data-id="t1_c2"] > .cmain .score.up').count() === 1, 'vote is reflected in the UI');

// reply
await page.locator('.pactions button[aria-label="Reply"]').click();
await page.waitForSelector('.composer textarea');
await page.fill('.composer textarea', 'Hello from the smoke test');
await page.waitForTimeout(300);
await page.screenshot({ path: SHOTS + '/04-composer.png' });
await page.locator('.composer .btn.primary').click();
await page.waitForSelector('.cmt[data-id="t1_new1"]');
check(posted.some((x) => x.path === '/api/comment' && x.body.includes('thing_id=t3_p8')), 'reply POSTs /api/comment');
check(!(await page.locator('.composer-wrap.open').count()), 'composer closes after sending');

// back to the list restores scroll position
await page.goBack();
await page.waitForSelector('.post');
await page.waitForTimeout(200);
const scrollAfter = await page.evaluate(() => window.scrollY);
check(Math.abs(scrollAfter - scrollBefore) < 5, `back restores list scroll (${scrollBefore} → ${scrollAfter})`);
check(await page.locator('.post').nth(8).evaluate((e) => e.classList.contains('visited')), 'opened post is marked as read');

// media viewer: gallery
await page.evaluate(() => window.scrollTo(0, 0));
await page.locator('.post').nth(1).locator('.thumb').click();
await page.waitForSelector('.viewer.open img');
await page.waitForTimeout(400);
await page.screenshot({ path: SHOTS + '/05-gallery-viewer.png' });
check((await page.locator('.vcount').textContent()) === '1 / 3', 'gallery viewer shows counter');
await page.locator('.vnav.next').click();
await page.waitForTimeout(350);
check((await page.locator('.vcount').textContent()) === '2 / 3', 'gallery navigation works');
await page.goBack();
await page.waitForTimeout(300);
check(!(await page.locator('.viewer.open').count()), 'Back button closes the viewer');
check(page.url() === 'https://old.reddit.com/', 'closing the viewer keeps the page');

// video viewer
await page.locator('.post').nth(2).locator('.pbody').click();
await page.waitForSelector('.viewer.open video');
check(await page.locator('.viewer.open video.vid').count() === 1, 'reddit video opens in the viewer');
await page.goBack();
await page.waitForTimeout(300);

// drawer
await page.locator('#br-menu').click();
await page.waitForSelector('.drawer .ditem.sub');
await page.waitForTimeout(300);
await page.screenshot({ path: SHOTS + '/06-drawer.png' });
check((await page.locator('#br-badge').textContent()) === '3', 'inbox badge shows unread count');
await page.locator('.drawer .ditem.sub', { hasText: 'r/pics' }).click();
await page.waitForURL('https://old.reddit.com/r/pics', { waitUntil: 'commit' });
await page.waitForSelector('.subhead .subname');
await page.waitForTimeout(300);
await page.screenshot({ path: SHOTS + '/07-subreddit.png' });
check((await page.locator('#br-t1').textContent()) === 'r/pics', 'subreddit view has title');

// sort menu
await page.locator('#br-sort').click();
await page.locator('.ov.open .sitem', { hasText: 'Top' }).click();
await page.waitForSelector('.ov.open .sitem >> text=This week');
await page.locator('.ov.open .sitem', { hasText: 'This week' }).click();
await page.waitForURL(/\/r\/pics\/top\?t=week/, { waitUntil: 'commit' });
check(true, 'sort → top → this week navigates');

// inbox
await page.goto('https://old.reddit.com/message/inbox', { waitUntil: 'commit' });
await page.waitForSelector('.ccard.msg');
await page.screenshot({ path: SHOTS + '/08-inbox.png' });
check((await page.locator('.ccard.msg').count()) === 2, 'inbox lists messages');

// dark theme
const dark = await newPage('dark');
await dark.goto('https://old.reddit.com/r/pics/comments/p0/post_0/', { waitUntil: 'commit' });
await dark.waitForSelector('.cmt');
await dark.waitForTimeout(400);
check(await dark.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'follows system dark theme');
await dark.screenshot({ path: SHOTS + '/09-comments-dark.png' });
await dark.goto('https://old.reddit.com/', { waitUntil: 'commit' });
await dark.waitForSelector('.post');
await dark.waitForTimeout(400);
await dark.screenshot({ path: SHOTS + '/10-front-dark.png' });

// passthrough page on www keeps reddit's page but strips app nags
const pass = await newPage('light');
await pass.route('https://www.reddit.com/settings', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><div id="real">settings</div><xpromo-app-selector id="nag">GET THE APP</xpromo-app-selector><div class="XPromoPopup">popup</div></body></html>' }));
await pass.goto('https://www.reddit.com/settings');
await pass.waitForTimeout(300);
check(pass.url() === 'https://www.reddit.com/settings', 'unsupported pages stay on reddit.com');
check(await pass.locator('#real').isVisible(), 'reddit page content still shows');
check(!(await pass.locator('#nag').count()) && !(await pass.locator('.XPromoPopup').isVisible()), 'app-install nags are removed');

// if old.reddit.com bounces straight back to www, the app runs on www instead of looping
const loop = await newPage('light');
await loop.goto('https://www.reddit.com/settings', { waitUntil: 'commit' });
await loop.evaluate(() => sessionStorage.setItem('br_redir', String(Date.now())));
await loop.goto('https://www.reddit.com/r/loop', { waitUntil: 'commit' });
await loop.waitForSelector('.post', { timeout: 10000 });
check(loop.url() === 'https://www.reddit.com/r/loop', 'redirect loop is avoided (app runs on www)');

// Reddit refuses the listing JSON in its usual form: the app should fall back to another form
const blocked = await newPage('light');
await blocked.route(/old\.reddit\.com\/r\/blocked\/hot\.json/, (r) => r.fulfill({ status: 403, contentType: 'text/html', body: '<h1>blocked</h1>' }));
await blocked.goto('https://old.reddit.com/r/blocked', { waitUntil: 'commit' });
await blocked.waitForSelector('.post', { timeout: 10000 });
check(true, 'listing loads via fallback when Reddit refuses the first request (403)');

// everything refused: show the error with details
const dead = await newPage('light');
await dead.route(/\/r\/dead.*\.json/, (r) => r.fulfill({ status: 403, contentType: 'text/html', body: "<p>You've been blocked by network security.</p>" }));
await dead.goto('https://old.reddit.com/r/dead', { waitUntil: 'commit' });
await dead.waitForSelector('.errdetails', { timeout: 10000 });
await dead.locator('.errdetails summary').click();
check((await dead.locator('.errdetails pre').textContent()).includes('blocked by network security'), 'error shows response details when all fallbacks fail');
await dead.screenshot({ path: SHOTS + '/11-error.png' });

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
