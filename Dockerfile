FROM python:3.11-slim

# ---------------- ENV ----------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# ---------------- WORKDIR ----------------
WORKDIR /app

# ---------------- SYSTEM DEPS ----------------
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ---------------- PYTHON DEPS ----------------
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# ---------------- APP CODE ----------------
COPY backend backend

# ---------------- PORT ----------------
EXPOSE 8000

# ---------------- START ----------------
CMD ["uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
