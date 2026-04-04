FROM python:3.12-slim

ARG CLERK_ISSUER
ARG CLERK_WEBHOOK_SECRET

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV CLERK_ISSUER=$CLERK_ISSUER
ENV CLERK_WEBHOOK_SECRET=$CLERK_WEBHOOK_SECRET

WORKDIR /app

RUN apt-get update && apt-get install -y curl \
    && pip install --no-cache-dir uv \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./
RUN uv sync

COPY . .

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]