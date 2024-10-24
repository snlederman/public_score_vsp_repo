#!/bin/sh

# Apply database migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start the application
exec gunicorn --workers 3 --bind 0.0.0.0:8000 myproject.wsgi:application
