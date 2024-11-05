# (Experimental) Deployment Guide for R-Pilot

This guide covers deploying R-Pilot for personal use or sharing with friends using Docker.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Simple Deployment Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/markuryy/R-Pilot.git
   cd R-Pilot
   ```

2. Create a `.env` file in the root directory with your configuration:
   ```bash
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional - Set a specific auth token (recommended for sharing)
   AUTH_TOKEN=your_chosen_token_here  # e.g., AUTH_TOKEN=mysecrettoken123
   ```

3. If you want to expose R-Pilot to the internet (e.g., for friends to use):
   
   Edit the `docker-compose.yml` file and update these environment variables:
   ```yaml
   backend:
     environment:
       - ALLOWED_HOSTS=your-domain.com,localhost:3000
   
   frontend:
     environment:
       - NEXT_PUBLIC_SERVICES_URL=https://your-domain.com:8000
   ```

4. Build and start the containers:
   ```bash
   docker compose up --build
   ```

5. Access the application:
   - Local use: http://localhost:3000
   - Remote use: https://your-domain.com
   
   If you set a specific AUTH_TOKEN, the URL will be:
   - Local: http://localhost:3000?token=your_chosen_token_here
   - Remote: https://your-domain.com?token=your_chosen_token_here

## Environment Variables

### Core Variables (.env)
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `AUTH_TOKEN`: Set a specific authentication token (optional, recommended for sharing)

### Advanced Configuration
You can customize these in docker-compose.yml if needed:
- `INTERPRETER_TYPE`: Set to "r" for R programming
- `R_PATH`: Path to R executable (default: /usr/bin/R)
- `WORKING_DIRECTORY`: Directory for file operations (default: /workspace)
- `ALLOWED_HOSTS`: Comma-separated list of allowed frontend hosts
- `ENABLE_CORS`: Enable CORS (default: TRUE)

## Basic Docker Commands

- Start services:
  ```bash
  docker compose up
  ```

- Start services in background:
  ```bash
  docker compose up -d
  ```

- Stop services:
  ```bash
  docker compose down
  ```

- View logs:
  ```bash
  docker compose logs -f
  ```

## Troubleshooting

1. **Can't Access the Application**
   - Check if containers are running: `docker compose ps`
   - Verify ports 3000 and 8000 aren't in use
   - If using a domain, ensure DNS is properly configured

2. **Authentication Issues**
   - If you set a custom AUTH_TOKEN, make sure to include it in the URL
   - Check the backend logs for authentication errors
   - Verify ALLOWED_HOSTS includes your domain

3. **R or Python Issues**
   - Check container logs: `docker compose logs backend`
   - Verify R is working: `docker compose exec backend R --version`

## Security Notes

1. If exposing to the internet:
   - Always use HTTPS
   - Set a strong AUTH_TOKEN
   - Keep your OpenAI API key secure
   - Regularly update Docker images

2. For local use:
   - Basic security is already configured
   - You can optionally set AUTH_TOKEN for extra security

## Updates

To update R-Pilot:
```bash
git pull
docker compose down
docker compose up --build -d
