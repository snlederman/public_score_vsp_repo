# Use the existing Superset image
FROM apache/superset:latest

# Switch to root user to set file permissions
USER root

# Set working directory
WORKDIR /app

# Copy the custom superset_config.py into the appropriate location
COPY superset_config.py /app/pythonpath/superset_config.py

# Copy project
COPY . /app/

# Make the entrypoint.sh script executable
RUN chmod +x /app/entrypoint.sh

# Switch back to the default user for running Superset
USER superset

# Expose the port
EXPOSE 8088

# Run the application
ENTRYPOINT ["/app/entrypoint.sh"]
