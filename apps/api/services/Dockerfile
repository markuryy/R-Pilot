FROM python:3.12-slim

# Install system dependencies and R
RUN apt-get update && apt-get install -y \
    r-base \
    r-base-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Set working directory
WORKDIR /app

# Copy poetry files
COPY pyproject.toml poetry.lock ./

# Configure poetry to not create virtual environment (we're in a container)
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi

# Copy application code
COPY . .

# Create workspace directory
RUN mkdir -p /workspace

# Set environment variables
ENV INTERPRETER_TYPE=r
ENV R_PATH=/usr/bin/R
ENV WORKING_DIRECTORY=/workspace
ENV ENABLE_CORS=TRUE
ENV ALLOWED_HOSTS=*

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
