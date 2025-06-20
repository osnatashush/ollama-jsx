FROM ollama/ollama:latest

# Install required packages
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create and set permissions for the .ollama directory
RUN mkdir -p /.ollama && \
    chmod 777 /.ollama

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# Set up entrypoint
COPY ollama-entrypoint.sh /usr/local/bin/ollama-entrypoint.sh
RUN chmod +x /usr/local/bin/ollama-entrypoint.sh

# Run as root to avoid permission issues
USER root
WORKDIR /app

ENTRYPOINT ["/usr/local/bin/ollama-entrypoint.sh"]
CMD ["ollama", "serve"]
