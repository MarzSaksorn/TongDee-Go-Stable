# syntax=docker/dockerfile:1
FROM node:22.14.0-alpine3.21 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_SUPABASE_URL=https://jbafdzoihklmfurywmhs.supabase.co
ARG VITE_SUPABASE_ANON_KEY=sb_publishable_HwSmpUyHTmW5xoe5B_Y3_g_PlttMSC4
ARG GOOGLE_MAPS_PLATFORM_KEY=
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    GOOGLE_MAPS_PLATFORM_KEY=${GOOGLE_MAPS_PLATFORM_KEY}
RUN npm run build

FROM node:22.14.0-alpine3.21 AS runtime
ENV NODE_ENV=production \
    PORT=3002
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3002) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.cjs"]
