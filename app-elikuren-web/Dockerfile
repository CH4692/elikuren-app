# ---- Build Stage ----
FROM node:20-slim AS builder

WORKDIR /app

# Build args (kommen aus GH Actions)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
ARG NEXT_PUBLIC_CLERK_PROXY_URL
ARG CLERK_ISSUER
ARG CLERK_WEBHOOK_SECRET

# Als ENV setzen, damit `next build` sie lesen kann
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_PROXY_URL=$NEXT_PUBLIC_CLERK_PROXY_URL

ENV CLERK_ISSUER=$CLERK_ISSUER
ENV CLERK_WEBHOOK_SECRET=$CLERK_WEBHOOK_SECRET


COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build


# ---- Production Stage ----
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

# install curl for container healthchecks
RUN apt-get update && apt-get install -y curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# create non-root user for security
RUN useradd -m nextjs

COPY --from=builder /app ./

USER nextjs

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "run", "start"]