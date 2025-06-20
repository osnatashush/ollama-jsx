FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY Backend/requirements.txt Backend/requirements-models.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt -r requirements-models.txt

# Copy frontend code and build it
COPY Frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy backend code
WORKDIR /app
COPY Backend/ ./

# Create necessary directories
RUN mkdir -p /app/data /app/models

# Copy nginx config
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 3000 8006 11434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8006/health || exit 1

# Start script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
