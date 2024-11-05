# (Experimental) Deployment Guide for R-Pilot

This guide covers deploying R-Pilot using Docker, both locally and in production with Cloudflare Tunnel.

## Local Deployment with Docker

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/markuryy/R-Pilot.git
   cd R-Pilot
   ```

2. Create a `.env` file in the root directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Build and start the containers:
   ```bash
   docker compose up --build
   ```

4. Access the application at http://localhost:3000

## Production Deployment with Cloudflare Tunnel

### Prerequisites
- A domain registered with Cloudflare
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) installed on your server

### Steps

1. Clone and prepare the application:
   ```bash
   git clone https://github.com/markuryy/R-Pilot.git
   cd R-Pilot
   ```

2. Create a `.env` file with your configuration:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Login to Cloudflare:
   ```bash
   cloudflared tunnel login
   ```

4. Create a tunnel:
   ```bash
   cloudflared tunnel create r-pilot
   ```

5. Create a configuration file `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL-ID>
   credentials-file: /root/.cloudflared/<TUNNEL-ID>.json

   ingress:
     - hostname: your-domain.com
       service: http://localhost:3000
     - hostname: api.your-domain.com
       service: http://localhost:8000
     - service: http_status:404
   ```

6. Create DNS records (replace with your tunnel ID):
   ```bash
   cloudflared tunnel route dns <TUNNEL-ID> your-domain.com
   cloudflared tunnel route dns <TUNNEL-ID> api.your-domain.com
   ```

7. Update the frontend environment in docker-compose.yml:
   ```yaml
   frontend:
     environment:
       - NEXT_PUBLIC_SERVICES_URL=https://api.your-domain.com
   ```

8. Update the backend environment in docker-compose.yml:
   ```yaml
   backend:
     environment:
       - ALLOWED_HOSTS=your-domain.com
   ```

9. Start the application:
   ```bash
   docker compose up -d
   ```

10. Start the Cloudflare Tunnel:
    ```bash
    cloudflared tunnel run r-pilot
    ```

## Environment Variables

### Backend (.env)
- `OPENAI_API_KEY`: Your OpenAI API key
- `INTERPRETER_TYPE`: Set to "r"
- `R_PATH`: Path to R executable (set automatically in Docker)
- `WORKING_DIRECTORY`: Directory for file operations (set automatically in Docker)
- `ALLOWED_HOSTS`: Comma-separated list of allowed frontend hosts
- `ENABLE_CORS`: Set to "TRUE" to enable CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_SERVICES_URL`: URL of the backend service

## Docker Commands

- Build and start services:
  ```bash
  docker compose up --build
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

1. **Connection Issues**
   - Verify that both containers are running: `docker compose ps`
   - Check container logs: `docker compose logs -f [service_name]`
   - Ensure Cloudflare Tunnel is running and properly configured

2. **R or Python Issues**
   - Connect to the backend container: `docker compose exec backend bash`
   - Verify R installation: `R --version`
   - Check Python version: `python --version`

3. **Permission Issues**
   - Ensure proper file permissions in mounted volumes
   - Check workspace directory permissions

4. **Cloudflare Tunnel Issues**
   - Verify tunnel status: `cloudflared tunnel info`
   - Check tunnel logs: `cloudflared tunnel run --loglevel debug r-pilot`

## Security Considerations

1. Always use HTTPS in production
2. Keep the OpenAI API key secure
3. Regularly update Docker images
4. Monitor system resources
5. Implement proper authentication
6. Backup workspace data regularly

## Maintenance

1. Update the application:
   ```bash
   git pull
   docker compose down
   docker compose up --build -d
   ```

2. Backup workspace data:
   ```bash
   docker compose down
   tar -czf workspace-backup.tar.gz workspace/
   docker compose up -d
   ```

3. Monitor container health:
   ```bash
   docker compose ps
   docker stats
