# syntax=docker/dockerfile:1

# Stage 1: Base
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 2: Build
FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

# Stage 3: API
FROM base AS api
COPY --from=build /app /app
EXPOSE 3000
# Ensure migrations are run before starting
CMD ["sh", "-c", "pnpm --filter @epios/infrastructure-postgres migrate && pnpm --filter @epios/api start"]

# Stage 4: Demo Shell
FROM nginx:stable-alpine AS work-shell
COPY --from=build /app/apps/work-shell/dist /usr/share/nginx/html
# Basic SPA config
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
