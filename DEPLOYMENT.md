# (Experimental) Deployment Guide for R-Pilot

This guide covers deploying R-Pilot for personal use or sharing with friends using Docker.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## Simple Deployment Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/markuryy/R-Pilot.git
   cd R-Pilot
   ```

2. Create a `.env` file in the root directory with your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Build and start the containers:
   ```bash
   docker compose up --build
   ```

4. Check the backend logs for the authentication link:
   ```bash
   docker compose logs backend
   ```

5. Access the application using the authentication link shown in the logs.
   - The link includes a token that's valid for your session
   - You can share this link with others to give them access
   - The token persists in browsers for future sessions

## Container Architecture

R-Pilot uses a two-container setup:

1. Backend Container (Python/FastAPI)
   - Handles API requests and websocket connections
   - Runs R interpreter with pre-installed packages
   - Communicates with OpenAI API
   - Available at http://localhost:8000

2. Frontend Container (Next.js)
   - Serves the web interface
   - Communicates with backend via HTTP and WebSocket
   - Available at http://localhost:3000

The containers are connected through:
- A shared Docker network for container-to-container communication
- Port mapping to make services available on localhost
- Environment variables configured for proper networking

## R Environment in Docker

The backend container includes a fully functional R environment:

Pre-installed R Packages:
- tidyverse: Collection of data science packages
- ggplot2: Data visualization
- dplyr: Data manipulation
- readr: Data import
- lubridate: Date/time handling

Additional Features:
- R and R-dev packages are pre-installed
- Package installation directory is properly configured
- Write permissions are set up for package operations
- Workspace directory is available for file operations

## Deploying with Cloudflare Tunnel (Recommended for Sharing)

This method lets you securely expose R-Pilot through a subdomain (e.g., rpilot.yourdomain.com) without opening ports or configuring complex networking.

### Prerequisites
- A domain registered with Cloudflare
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) installed

### Setup Steps

1. Login to Cloudflare:
   ```bash
   cloudflared tunnel login
   ```

2. Create a tunnel (you'll get a TUNNEL_ID):
   ```bash
   cloudflared tunnel create rpilot
   ```

3. Create the cloudflared config file:

   On Linux/macOS, create at: `/home/YOUR_USERNAME/.cloudflared/config.yml`
   On Windows, create at: `C:\Users\YOUR_USERNAME\.cloudflared\config.yml`

   Note: Replace YOUR_USERNAME with your actual username. This is NOT in the R-Pilot project folder, but in your home directory.

   Content of config.yml:
   ```yaml
   tunnel: TUNNEL_ID
   credentials-file: /home/YOUR_USERNAME/.cloudflared/TUNNEL_ID.json  # On Windows: C:\Users\YOUR_USERNAME\.cloudflared\TUNNEL_ID.json

   ingress:
     - hostname: rpilot.yourdomain.com
       service: http://localhost:3000
     - hostname: rpilot-api.yourdomain.com
       service: http://localhost:8000
     - service: http_status:404
   ```

   The .cloudflared directory and credentials file are automatically created when you run `cloudflared tunnel login`. You just need to create the config.yml file in the same directory.

4. Create DNS records for your subdomains:
   ```bash
   cloudflared tunnel route dns TUNNEL_ID rpilot.yourdomain.com
   cloudflared tunnel route dns TUNNEL_ID rpilot-api.yourdomain.com
   ```

5. Update docker-compose.yml:
   ```yaml
   backend:
     environment:
       - ALLOWED_HOSTS=rpilot.yourdomain.com rpilot-api.yourdomain.com localhost:3000
       - FRONTEND_URL=rpilot.yourdomain.com
   
   frontend:
     environment:
       - NEXT_PUBLIC_SERVICES_URL=https://rpilot-api.yourdomain.com
   ```

6. Start R-Pilot:
   ```bash
   docker compose up -d
   ```

7. Start the tunnel:
   ```bash
   cloudflared tunnel run rpilot
   ```

Your R-Pilot instance will now be available at:
- Frontend: https://rpilot.yourdomain.com
- With auth token: Check backend logs with `docker compose logs backend`

## Environment Variables

### Required Variables (.env)
- `OPENAI_API_KEY`: Your OpenAI API key (get one at https://platform.openai.com/api-keys)

### Container Configuration
The Docker containers are pre-configured with appropriate paths and settings:
- R is installed at `/usr/bin/R`
- Common R packages are pre-installed
- Working directory is set to `/workspace`
- All necessary environment variables are set in docker-compose.yml

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

1. **Authentication Issues**
   - Check backend logs with `docker compose logs backend` for the correct authentication link
   - Make sure to use http:// in development, https:// with Cloudflare
   - The token persists in browsers for future sessions
   - Sharing the auth link with others will work as long as they use the same token

2. **OpenAI API Issues**
   - Verify your API key is correct in the root .env file
   - Check backend logs for any API errors
   - Make sure containers have internet access
   - The backend container uses Google DNS (8.8.8.8) for reliable external access

3. **R Package Issues**
   - Common data science packages are pre-installed
   - Package installation during runtime may require compilation
   - Check backend logs for package-related messages
   - The container has necessary build tools installed

4. **WebSocket Connection Issues**
   - WebSocket URLs are automatically derived from the NEXT_PUBLIC_SERVICES_URL
   - In development, they use ws:// for http:// and wss:// for https://
   - Check browser console for connection errors
   - Verify ALLOWED_HOSTS includes the correct domains

5. **Container Networking**
   - Frontend container accesses backend via localhost:8000
   - Backend container is accessible as 'backend:8000' within the network
   - File and image serving works through the mapped ports

6. **Cloudflare Tunnel Issues**
   - Check tunnel logs: `cloudflared tunnel run --loglevel debug rpilot`
   - Verify DNS records in Cloudflare dashboard
   - Ensure cloudflared is up to date
   - Make sure config.yml is in the correct location (in .cloudflared directory in your home folder)
   - Check credentials file exists in the same directory as config.yml

## Security Notes

1. If exposing to the internet:
   - Use Cloudflare Tunnel for secure access (recommended)
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
```

If using Cloudflare Tunnel, restart it after updating:
```bash
cloudflared tunnel run rpilot
