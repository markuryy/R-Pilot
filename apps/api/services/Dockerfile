FROM python:3.11-slim

# Install system dependencies and R
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    wget \
    gnupg \
    && wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | tee -a /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc \
    && wget https://cloud.r-project.org/bin/linux/debian/bullseye-cran40.list \
    && mv bullseye-cran40.list /etc/apt/sources.list.d/cran.list \
    && apt-get update \
    && apt-get install -y r-base r-base-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create workspace directory
RUN mkdir -p /workspace

# Install Poetry
RUN pip install poetry

# Copy only the necessary files for dependency installation
COPY pyproject.toml poetry.lock* ./

# Configure Poetry to not create a virtual environment
RUN poetry config virtualenvs.create false

# Install project dependencies
RUN poetry install --no-interaction --no-ansi

# Copy the rest of the application
COPY . .

# Set environment variables from .env file
ENV OPENAI_API_KEY=${OPENAI_API_KEY} \
    INTERPRETER_TYPE=r \
    INTERPRETER_TIMEOUT=120 \
    ENABLE_CORS=TRUE \
    ALLOWED_HOSTS=localhost:3000 \
    R_PATH=/usr/local/bin/R \
    NEXT_PUBLIC_API_URL=http://localhost:8000 \
    NEXT_PUBLIC_WS_URL=ws://localhost:8000 \
    WORKING_DIRECTORY=/workspace \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Expose the port the app runs on
EXPOSE 8000

# Set the working directory for runtime
WORKDIR /workspace

# Use poetry to run the application
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
