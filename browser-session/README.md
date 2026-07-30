# browser-session

Keeps a real, logged-in Chromium session "warm" so `yt-dlp` on the backend can read its cookies
live via `--cookies-from-browser` — instead of a static `cookies.txt` export, which goes stale
within hours because nothing keeps it in sync with Google's own cookie rotation.

## One-time setup (do this once, not on every deploy)

1. **On your own machine** (not the server):
   ```
   cd browser-session
   npm install
   node local-login.js
   ```
   This opens your real installed Chrome (Google blocks Playwright's own bundled Chromium
   during login — it detects the automation flags and refuses to sign in). If Chrome isn't
   installed, use Edge instead (preinstalled on Windows):
   `BROWSER_CHANNEL=msedge node local-login.js` (PowerShell:
   `$env:BROWSER_CHANNEL="msedge"; node local-login.js`).

   Log into your Google account normally (solve any CAPTCHA/2FA yourself), then just close
   the window.

2. This creates a `browser-session/local-profile/` folder — send that whole folder up to the
   server as `./browser-profile` (same level as `docker-compose.prod.yml`), e.g.:
   ```
   scp -r browser-session/local-profile ubuntu@<host>:~/deutschpfad/browser-profile
   ```

3. Deploy as normal (`docker compose up -d`). The `browser-session` service picks up that
   profile and starts visiting youtube.com every ~30 minutes to keep the session's cookies
   rotating; the backend reads cookies from the same profile directory (read-only).

## If it ever needs to be redone

Google may eventually flag the profile again regardless (there's no permanent guarantee here —
see YtDlpHealthCheckService, which emails an alert the day this stops working). If that
happens, repeat the steps above with a fresh `local-login.js` run.
