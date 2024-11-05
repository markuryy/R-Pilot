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

3. Build and start the containers:
   ```bash
   docker compose up --build
   ```

4. Access the application at http://localhost:3000 (or with your token: http://localhost:3000?token=your_chosen_token_here)

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
       - ALLOWED_HOSTS=rpilot.yourdomain.com,rpilot-api.yourdomain.com,localhost:3000
   
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
- With auth token: https://rpilot.yourdomain.com?token=your_chosen_token_here

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
   - If using Cloudflare Tunnel, check tunnel status: `cloudflared tunnel info rpilot`

2. **Authentication Issues**
   - If you set a custom AUTH_TOKEN, make sure to include it in the URL
   - Check the backend logs for authentication errors
   - Verify ALLOWED_HOSTS includes your domain/subdomain

3. **R or Python Issues**
   - Check container logs: `docker compose logs backend`
   - Verify R is working: `docker compose exec backend R --version`

4. **Cloudflare Tunnel Issues**
   - Check tunnel logs: `cloudflared tunnel run --loglevel debug rpilot`
   - Verify DNS records in Cloudflare dashboard
   - Ensure cloudflared is up to date
   - Make sure config.yml is in the correct location (in .cloudflared directory in your home folder)
   - Check credentials file exists in the same directory as config.yml

## Security Notes

1. If exposing to the internet:
   - Use Cloudflare Tunnel for secure access (recommended)
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
```

If using Cloudflare Tunnel, restart it after updating:
```bash
cloudflared tunnel run rpilot
