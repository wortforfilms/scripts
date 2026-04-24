FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/maataa-ui/package.json apps/maataa-ui/package.json
COPY packages/runtime-db/package.json packages/runtime-db/package.json
COPY packages/ai-rj-training/package.json packages/ai-rj-training/package.json

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm --filter @maataa/maataa-ui build

EXPOSE 3000

CMD ["pnpm", "--filter", "@maataa/maataa-ui", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
