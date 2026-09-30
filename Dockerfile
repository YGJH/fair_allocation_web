FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
FROM node:20-bookworm-slim AS proddeps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
FROM node:20-bookworm-slim AS solverdeps
WORKDIR /app
RUN apt-get update \
  && apt-get install --no-install-recommends -y python3 python3-venv \
  && rm -rf /var/lib/apt/lists/*
COPY solver/requirements.txt ./requirements.txt
RUN python3 -m venv /opt/solver-venv \
  && /opt/solver-venv/bin/pip install --no-cache-dir -r requirements.txt

# The web runtime and private solver share one deployable application image.
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 PATH="/opt/solver-venv/bin:${PATH}"
RUN apt-get update \
  && apt-get install --no-install-recommends -y python3 \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system nodejs \
  && useradd --system --gid nodejs nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/db ./db
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/solver ./solver
COPY --from=proddeps /app/node_modules ./node_modules
COPY --from=solverdeps /opt/solver-venv /opt/solver-venv
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["node","server.js"]
