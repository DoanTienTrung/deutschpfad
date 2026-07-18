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
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates espeak-ng \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
