FROM python:3.11-slim

# Install system dependencies and R
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    wget \
    gnupg \
    && apt-get install -y r-base r-base-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app/services

# Debug: Print current directory and list files
RUN pwd && ls -la

# Install Poetry
RUN pip install poetry

# Debug: Print Poetry configuration and current directory contents
RUN poetry config --list && pwd && ls -la

# Install project dependencies with debugging
RUN poetry install --no-interaction --no-ansi || (pwd && ls -la && cat pyproject.toml)

# Set environment variables from .env file
ENV OPENAI_API_KEY=${OPENAI_API_KEY} \
    INTERPRETER_TYPE=r \
    INTERPRETER_TIMEOUT=120 \
    ENABLE_CORS=TRUE \
    ALLOWED_HOSTS=localhost:3000 \
    R_PATH=/usr/bin/R \
    NEXT_PUBLIC_API_URL=http://localhost:8000 \
    NEXT_PUBLIC_WS_URL=ws://localhost:8000 \
    WORKING_DIRECTORY=/workspace \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Expose the port the app runs on
EXPOSE 8000

# Use poetry to run the application
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
