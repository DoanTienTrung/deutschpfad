// One-time bootstrap: seeds the persistent Chromium profile's cookies from a Netscape-format
// cookies.txt export (the same kind of export used for Hướng 1's static-cookies-file approach).
//
// Why this exists instead of just copying a browser profile folder onto the server: a cookie's
// *value* is encrypted on disk with a key tied to the OS/user account that created it (Windows
// DPAPI on Windows, something else on Linux). A profile logged in on Windows and copied here is
// unreadable by Linux Chromium — the real session cookies silently fail to decrypt and get
// dropped, leaving only a handful of non-auth cookies the container generates on its own. Adding
// cookies through Playwright's API instead goes through Chromium itself, so it persists them
// re-encrypted with this machine's own key — readable from here on by both this container and by
// yt-dlp's --cookies-from-browser.
//
// After this runs once, the regular keepalive.js loop is what keeps the session's cookies
// rotating — this script is not part of that loop, just the bootstrap.
//
// Usage (run once, from the server, with the browser-session container NOT already running,
// since only one process may hold a given profile directory open at a time):
//   docker compose -f docker-compose.prod.yml stop browser-session
//   docker compose -f docker-compose.prod.yml run --rm -v /path/to/cookies.txt:/tmp/cookies.txt:ro browser-session node import-cookies.js /tmp/cookies.txt
//   docker compose -f docker-compose.prod.yml start browser-session

const { chromium } = require('playwright-core');
const fs = require('fs');

const PROFILE_DIR = process.env.PROFILE_DIR || '/data/profile';
const cookiesPath = process.argv[2];

if (!cookiesPath) {
  console.error('Usage: node import-cookies.js <path-to-cookies.txt>');
  process.exit(1);
}

function parseNetscapeCookies(text) {
  const cookies = [];
  for (const rawLine of text.split('\n')) {
    let line = rawLine.trim();
    if (!line) continue;
    let httpOnly = false;
    if (line.startsWith('#HttpOnly_')) {
      httpOnly = true;
      line = line.slice('#HttpOnly_'.length);
    } else if (line.startsWith('#')) {
      continue; // plain comment line
    }
    const parts = line.split('\t');
    if (parts.length !== 7) continue;
    const [domain, , path, secureFlag, expiresStr, name, value] = parts;
    const expires = Number(expiresStr);
    cookies.push({
      name,
      value,
      domain,
      path,
      httpOnly,
      secure: secureFlag === 'TRUE',
      expires: expires > 0 ? expires : -1,
      sameSite: 'Lax',
    });
  }
  return cookies;
}

async function main() {
  const text = fs.readFileSync(cookiesPath, 'utf8');
  const cookies = parseNetscapeCookies(text);
  console.log(`Parsed ${cookies.length} cookies from ${cookiesPath}`);
  if (cookies.length === 0) {
    console.error('No cookies parsed — check the file is a Netscape-format cookies.txt export.');
    process.exit(1);
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    await context.addCookies(cookies);
    console.log(`Injected ${cookies.length} cookies into profile at ${PROFILE_DIR}`);

    const page = await context.newPage();
    await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const loggedIn = await page
      .locator('button[aria-label*="Account"], ytd-topbar-menu-button-renderer')
      .first()
      .isVisible()
      .catch(() => false);
    console.log(`Verification visit to youtube.com — session looks ${loggedIn ? 'logged in' : 'NOT logged in (check the export)'}`);
  } finally {
    await context.close();
  }
}

main();
