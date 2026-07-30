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
# the companion HTTP server this plugin talks to). Installed as a plain zip next to the
# standalone binary — one of yt-dlp's recognized plugin directories — since this image has no
# pip/Python to install the PyPI package normally.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates unzip espeak-ng \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && mkdir -p /usr/local/bin/yt-dlp-plugins \
    && curl -L https://github.com/Brainicism/bgutil-ytdlp-pot-provider/releases/latest/download/bgutil-ytdlp-pot-provider.zip -o /tmp/bgutil-plugin.zip \
    && unzip -q /tmp/bgutil-plugin.zip -d /usr/local/bin/yt-dlp-plugins \
    && rm -f /tmp/bgutil-plugin.zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
