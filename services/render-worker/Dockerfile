# clickthru render-worker — Playwright (Chromium) + ffmpeg, standalone deploy.
FROM node:20-bookworm-slim

# ffmpeg (mp4/gif/webm dönüşümü) + ca-certs
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bağımlılıklar (express + playwright)
COPY package.json ./
RUN npm install --omit=dev

# Chromium + sistem bağımlılıklarını kur (kurulu playwright sürümüyle eşleşir)
RUN npx playwright install --with-deps chromium

COPY src ./src

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.js"]
