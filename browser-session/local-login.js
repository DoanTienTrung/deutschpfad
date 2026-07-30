// Run this ONCE, on your own machine — not on the server.
//
// It opens a real, visible Chromium window with its own separate profile folder. Log into your
// Google account in that window like normal (solve any CAPTCHA/2FA yourself), then just close
// the window when you're done — the profile folder is what gets uploaded to the server as the
// starting point for browser-session's keepalive loop.
//
// Usage:
//   cd browser-session
//   npm install playwright   (one-off local install — the server uses playwright-core instead,
//                              see package.json, so this does not affect what gets deployed)
//   node local-login.js
//
// Uses your real installed Chrome by default (Google blocks Playwright's own bundled Chromium
// during login). If Chrome isn't installed, use Edge instead (preinstalled on Windows):
//   BROWSER_CHANNEL=msedge node local-login.js     (PowerShell: $env:BROWSER_CHANNEL="msedge"; node local-login.js)
//
// When the window closes, this script prints the profile folder's path. Send that whole folder
// to Claude (or scp it yourself) to upload as ./browser-profile on the server.

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, 'local-profile');

// Google's login page detects Playwright's bundled Chromium as automated ("Couldn't sign you
// in: This browser or app may not be secure") and blocks it outright. Launching a real installed
// browser instead, with the automation flags hidden, gets past that check. 'chrome' needs Google
// Chrome installed; 'msedge' works too and is preinstalled on every Windows machine.
const BROWSER_CHANNEL = process.env.BROWSER_CHANNEL || 'chrome';

async function main() {
  console.log(`Opening ${BROWSER_CHANNEL} with profile: ${PROFILE_DIR}`);
  console.log('Log into your Google account in the window that opens, then just close it.');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    channel: BROWSER_CHANNEL,
    args: ['--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await context.newPage();
  await page.goto('https://accounts.google.com/');

  // Keep the script alive until the user closes the window themselves.
  await new Promise((resolve) => {
    context.on('close', resolve);
  });

  console.log(`\nDone. Profile saved at: ${PROFILE_DIR}`);
  console.log('Upload this whole folder to the server as ./browser-profile.');
}

main();
