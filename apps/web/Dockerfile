FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Install dependencies using bun at the root level
RUN bun install

# Set working directory to web app
WORKDIR /app/apps/web

# Create .env.local with the services URL
ARG NEXT_PUBLIC_SERVICES_URL
RUN echo "NEXT_PUBLIC_SERVICES_URL=$NEXT_PUBLIC_SERVICES_URL" > .env.local

# Disable lint during build
ENV NEXT_DISABLE_ESLINT=true

# Build the application
RUN bun run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", ".next/standalone/server.js"]
