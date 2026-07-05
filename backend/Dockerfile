# --- Inventory Pro backend (FastAPI) ---
FROM python:3.12-slim

WORKDIR /app

# Faster, quieter, reproducible installs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# Configuration is supplied at runtime via environment variables
# (see .env.example) — nothing sensitive is baked into the image.
ENV PORT=8001 \
    APP_ENV=production \
    CORS_ORIGINS="http://localhost:5173" \
    ENABLE_DOCS=true

EXPOSE 8001

# Shell form so ${PORT} is expanded at container start
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
