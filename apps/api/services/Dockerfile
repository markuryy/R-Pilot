FROM python:3.12-slim

# Install system dependencies and R
RUN apt-get update && apt-get install -y \
    r-base \
    r-base-dev \
    git \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Pre-install common R packages
RUN R -e "install.packages(c('tidyverse', 'ggplot2', 'dplyr', 'readr', 'lubridate'), repos='https://cloud.r-project.org/')"

# Create R package directory with write permissions
RUN mkdir -p /usr/local/lib/R/site-library && \
    chmod 777 /usr/local/lib/R/site-library

# Install poetry using pip
RUN pip install poetry

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Set working directory to services
WORKDIR /app/apps/api/services

# Configure poetry to not create virtual environment (we're in a container)
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi

# Create workspace directory with write permissions
RUN mkdir -p /workspace && chmod 777 /workspace

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
