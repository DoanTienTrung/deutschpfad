// Periodically opens youtube.com in a persistent Chromium profile so the logged-in session's
// cookies rotate the same way they would in a real browser someone actually uses — the whole
// point of running this instead of relying on a cookies.txt snapshot, which goes stale within
// hours because it can't follow that rotation.
//
// The profile directory (PROFILE_DIR) is a bind mount shared read-only with the backend
// container, which points yt-dlp at it via --cookies-from-browser.

const { chromium } = require('playwright-core');

const PROFILE_DIR = process.env.PROFILE_DIR || '/data/profile';
const INTERVAL_MINUTES = Number(process.env.KEEPALIVE_INTERVAL_MINUTES || 30);

async function touchYoutube() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await context.newPage();
    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // A couple of seconds is enough for the page's own scripts to run and for Google to see
    // this as a normal visit — we don't need to interact with anything.
    await page.waitForTimeout(3000);
    const loggedIn = await page
      .locator('button[aria-label*="Account"], ytd-topbar-menu-button-renderer')
      .first()
      .isVisible()
      .catch(() => false);
    console.log(
      `[${new Date().toISOString()}] Visited youtube.com — session looks ${loggedIn ? 'logged in' : 'NOT logged in (check the profile)'}`
    );
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Keepalive visit failed:`, err.message);
  } finally {
    await context.close();
  }
}

async function main() {
  console.log(`Starting keepalive loop: visiting youtube.com every ${INTERVAL_MINUTES} minutes using profile ${PROFILE_DIR}`);
  // Run once immediately on startup, then on the interval.
  await touchYoutube();
  setInterval(touchYoutube, INTERVAL_MINUTES * 60 * 1000);
}

main();
