# R-Pilot

![](assets/images/r-pilot_demo.gif)

Your AI-powered R pair programmer, based on [IncognitoPilot](https://github.com/silvanmelchior/IncognitoPilot).

## Prerequisites

Before you begin, ensure you have the following installed:
- [Git](https://git-scm.com/) for cloning the repository
- [Python](https://www.python.org/) (version 3.9-3.12)
  - Windows: Download from https://www.python.org/downloads/
  - Mac: `brew install python@3.12`
  - Linux: `sudo apt-get install python3.12`
- [R](https://www.r-project.org/)
  - Windows: Download from https://cran.r-project.org/bin/windows/base/
  - Mac: `brew install r` or download from https://cran.r-project.org/bin/macosx/
  - Linux: `sudo apt-get install r-base`
- [Bun](https://bun.sh/)
  - Linux & macOS:
    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```
  - Windows:
    ```bash
    powershell -c "irm bun.sh/install.ps1 | iex"
    ```

## Quick Start

1. Clone and setup:
   ```bash
   git clone https://github.com/markuryy/R-Pilot.git
   cd R-Pilot
   bun install
   bun run setup
   ```

2. Start R-Pilot:
   ```bash
   bun run dev
   ```

3. Open the authentication link shown in the terminal (starts with http://localhost:3000).
   - The link includes a token that's valid for your session
   - You can share this link with others to give them access
   - The token persists in your browser for future sessions

## Manual Installation

If the setup script fails, follow these steps:

1. Create and activate a virtual environment:
   ```bash
   pushd apps/api/services
   python -m venv venv
   # On Unix/macOS:
   source venv/bin/activate
   # On Windows:
   .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install poetry
   poetry install
   popd  # Back to root
   bun install
   ```

3. Set up environment files:

   Create `apps/api/services/.env`:
   ```bash
   OPENAI_API_KEY=your_api_key_here
   INTERPRETER_TYPE=r
   R_PATH=/path/to/R  # Get this using 'which R' on Unix or 'where R' on Windows
   WORKING_DIRECTORY=/path/to/workspace
   ALLOWED_HOSTS=localhost:3000
   FRONTEND_URL=localhost:3000
   ENABLE_CORS=TRUE
   # Optional: Set a specific auth token
   AUTH_TOKEN=your_chosen_token
   # Optional: Use HTTPS for auth links
   USE_HTTPS=false
   ```

   Create `apps/web/.env.local`:
   ```bash
   NEXT_PUBLIC_SERVICES_URL=http://localhost:8000
   ```

4. Start the development servers:
   ```bash
   bun run dev
   ```
   This command starts both the backend and frontend services. If you prefer to run them separately:

   Terminal 1 (Backend):
   ```bash
   cd apps/api/services
   source venv/bin/activate  # or .\venv\Scripts\activate on Windows
   poetry shell
   uvicorn main:app --reload
   ```

   Terminal 2 (Frontend):
   ```bash
   cd apps/web
   bun run dev
   ```

## Features

- AI-powered R programming assistance
- Interactive R code execution
- Real-time output and plotting
- Sandboxed environment for sharing files
- Shareable authentication links

## Common Issues

1. Authentication Issues
   - Check terminal output for the correct authentication link
   - Make sure to use http:// in development (not https://)
   - You can set a custom token with `AUTH_TOKEN=your_token` in `apps/api/services/.env`
   - The token is saved in your browser for future sessions
   - Sharing the auth link with others will work as long as they use the same token

2. Docker Authentication
   - The authentication system works the same way in Docker
   - Use the link provided in the backend container logs
   - Container networking is automatically configured
   - Images and files are served correctly between containers

3. R Issues
   - Make sure R is installed: Run `R --version` in terminal
   - If R isn't found, reinstall from https://www.r-project.org/
   - If you must specify your own path, find it using `which R`

4. Python Issues
   - Make sure you have Python 3.9-3.12 installed (3.13+ not supported yet)
   - Windows: Download from https://www.python.org/downloads/
   - Mac: `brew install python@3.12`
   - Linux: Check your package manager for Python 3.9-3.12

5. Connection Failed
   - Check if backend is running (look for messages in terminal)
   - Make sure ports 3000 and 8000 are free
   - In Docker, check container logs with `docker compose logs`


## Deployment

This project was never meant for public deployment, so certain features like filesystem interactions will not be available in production on Vercel, for example. You may be able to containerize the whole stack and serve the frontend with nginx; open a pull request if you want to give it a try.
