# Official Playwright image: Node + Chromium + all OS-level deps already installed, so we don't
# need to fight with headless-Chromium system dependencies on a minimal base image ourselves.
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY keepalive.js ./

# PROFILE_DIR is a bind mount from the host (see docker-compose.prod.yml) so the logged-in
# session survives container rebuilds/restarts — it is not baked into the image.
ENV PROFILE_DIR=/data/profile

CMD ["node", "keepalive.js"]
