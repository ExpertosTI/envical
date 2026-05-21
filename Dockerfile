# ── envical — Renace Protocol ────────────────────────────────
#  Multi-stage: build con Vite, sirve estaticos con nginx:alpine.

# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime ----
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="envical" \
      org.opencontainers.image.description="Calculadora y configurador de envios - Renace.tech" \
      org.opencontainers.image.url="https://envios.renace.tech" \
      org.opencontainers.image.vendor="renace.tech"

RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/envical.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'ok\n' > /usr/share/nginx/html/healthz

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
