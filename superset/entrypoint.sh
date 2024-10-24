#!/bin/bash

# Upgrade the Superset database
superset db upgrade

# Set default admin credentials if not provided
SUPerset_ADMIN_USERNAME=${SUPERSET_ADMIN_USERNAME:-admin}
SUPerset_ADMIN_FIRSTNAME=${SUPERSET_ADMIN_FIRSTNAME:-Admin}
SUPerset_ADMIN_LASTNAME=${SUPERSET_ADMIN_LASTNAME:-User}
SUPerset_ADMIN_EMAIL=${SUPERSET_ADMIN_EMAIL:-admin@example.com}
SUPerset_ADMIN_PASSWORD=${SUPERSET_ADMIN_PASSWORD:-admin}

# Check if the admin user already exists before creating it
if ! superset fab list-users | grep -q "$SUPerset_ADMIN_USERNAME"; then
    superset fab create-admin \
        --username "$SUPerset_ADMIN_USERNAME" \
        --firstname "$SUPerset_ADMIN_FIRSTNAME" \
        --lastname "$SUPerset_ADMIN_LASTNAME" \
        --email "$SUPerset_ADMIN_EMAIL" \
        --password "$SUPerset_ADMIN_PASSWORD"
fi

# Initialize Superset
superset init

# Run the server
/usr/bin/run-server.sh
