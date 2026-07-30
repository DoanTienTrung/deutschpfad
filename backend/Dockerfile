# ---- Stage 1: Build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# yt-dlp: standalone binary, used only to fetch existing YouTube caption tracks
# (--skip-download, subtitles only) — never downloads video/audio content.
# espeak-ng: rule/dictionary-based German grapheme-to-phoneme engine, used to generate the IPA
# shown to users instead of asking an LLM to guess it (LLM-generated IPA was unreliable,
# especially for digit-written numbers).
# bgutil-ytdlp-pot-provider plugin: client side of the PO-token workaround for YouTube's
# "Sign in to confirm you're not a bot" block on the EC2 IP (see docker-compose.prod.yml for
# the companion HTTP server this plugin talks to). Dropped in as the raw .zip release (yt-dlp
# loads plugin packages straight out of a zip, no extraction needed) into the XDG config plugin
# directory — this container runs as root, so that's /root/.config/yt-dlp/plugins/. This is the
# location that was actually verified working (`yt-dlp -v` showing the provider under "PO Token
# Providers"); an earlier attempt at <yt-dlp-binary-dir>/yt-dlp-plugins/ silently did nothing —
# do not move this without re-verifying with `yt-dlp -v ... 2>&1 | grep -i 'plugin\|pot'`.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates espeak-ng \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && mkdir -p /root/.config/yt-dlp/plugins \
    && curl -L https://github.com/Brainicism/bgutil-ytdlp-pot-provider/releases/latest/download/bgutil-ytdlp-pot-provider.zip -o /root/.config/yt-dlp/plugins/bgutil-ytdlp-pot-provider.zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
