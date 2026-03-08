FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1단계: 프로젝트에 필요한 애플리케이션 종속성만 계산
FROM base AS builder
# node-gyp 또는 기타 네이티브 종속성이 필요한 경우(pg 등)
RUN apk add --no-cache libc6-compat \
    python3 \
    make \
    g++

WORKDIR /app
RUN npm i -g turbo
COPY . .
# backend 패키지만 분리하여 빌드 준비
RUN turbo prune @homerunnie/backend --docker

# 2단계: 패키지 설치
FROM base AS installer
RUN apk add --no-cache libc6-compat \
    python3 \
    make \
    g++
WORKDIR /app

# lockfile이 변경되지 않는 한 캐시 재사용
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 소스코드 전체 복사 및 빌드 진행
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=@homerunnie/backend...

# 3단계: 프로덕션 실행
FROM base AS runner
WORKDIR /app

# 프로덕션 의존성만 설치하기 위해 빌드 컨텍스트 사용
COPY --from=installer /app .

# NestJS 서버 환경변수 (런타임 시 docker-compose에서 주입)
# ENV NODE_ENV=production

EXPOSE 3000

# 프로젝트 위치로 이동 (워크스페이스 환경이므로 apps/backend 위치)
WORKDIR /app/apps/backend

CMD ["pnpm", "start:prod"]
