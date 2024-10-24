# Dockerfile for Django
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . /app/

# Make the entrypoint.sh script executable
RUN chmod +x /app/entrypoint.sh

# Expose the port
EXPOSE 8000

# Run the application
ENTRYPOINT ["/app/entrypoint.sh"]
