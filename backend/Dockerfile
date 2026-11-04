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
# Image này chỉ chạy ở máy nhà (docker compose), nơi YouTube không chặn yt-dlp. yt-dlp có bản riêng cho
# từng kiến trúc CPU: máy ARM (vd Mac Apple Silicon) cần bản aarch64.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates espeak-ng \
    && case "$(uname -m)" in aarch64|arm64) YTDLP_ASSET=yt-dlp_linux_aarch64 ;; *) YTDLP_ASSET=yt-dlp_linux ;; esac \
    && curl -L "https://github.com/yt-dlp/yt-dlp/releases/latest/download/$YTDLP_ASSET" -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
