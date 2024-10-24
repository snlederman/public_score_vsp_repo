.PHONY: up down

# Start the Docker Compose services
up:
	docker-compose up -d

# Stop the Docker Compose services
down:
	docker-compose down
