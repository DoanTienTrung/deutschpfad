# browser-session

Keeps a real, logged-in Chromium session "warm" so `yt-dlp` on the backend can read its cookies
live via `--cookies-from-browser` — instead of a static `cookies.txt` export, which goes stale
within hours because nothing keeps it in sync with Google's own cookie rotation.

## One-time setup (do this once, not on every deploy)

A profile can only be *created* on the same OS it will be *used* on — a cookie's value is
encrypted with a key tied to the OS/account that created it (Windows DPAPI on Windows, something
else on Linux), so a profile logged into on your Windows machine and copied to the Linux server
can't be decrypted there; the real session cookies silently vanish. So the login has to happen on
Linux from the start — done here by seeding an empty Linux profile with a cookie export instead
of copying a whole profile folder over.

1. **Export a fresh `cookies.txt`** the same way as before (browser extension, e.g. "Get
   cookies.txt LOCALLY", exporting `youtube.com` + `google.com` while logged in). Send Claude the
   local file path — it gets uploaded to the server, used once, and can be deleted afterward.

2. **On the server**, with the `browser-session` service stopped (only one process may hold a
   given profile directory open at a time):
   ```
   docker compose -f docker-compose.prod.yml stop browser-session
   docker compose -f docker-compose.prod.yml run --rm \
     -v /path/to/cookies.txt:/tmp/cookies.txt:ro \
     browser-session node import-cookies.js /tmp/cookies.txt
   docker compose -f docker-compose.prod.yml start browser-session
   ```
   `import-cookies.js` injects the cookies through Chromium itself (via Playwright, not a raw
   file copy), so they get persisted re-encrypted with this machine's own key — readable from now
   on by both this container and by yt-dlp.

3. From here, `browser-session`'s keepalive loop (visits youtube.com every ~30 minutes) is what
   keeps the session's cookies rotating going forward, the same way a person's own browser would.

## If it ever needs to be redone

Google may eventually flag the profile again regardless (there's no permanent guarantee here —
see `YtDlpHealthCheckService`, which emails an alert the day this stops working). If that
happens, delete `./browser-profile` on the server and repeat the steps above with a fresh
`cookies.txt` export.
