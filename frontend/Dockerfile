FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_ORIGIN
ENV VITE_API_ORIGIN=$VITE_API_ORIGIN

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Defaults to the production (HTTPS) config; local docker-compose.yml overrides this with
# nginx.dev.conf since the Let's Encrypt cert paths only exist on the production host.
ARG NGINX_CONF=nginx.conf
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

EXPOSE 80
