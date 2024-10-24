# superset_config.py

import os
from dotenv import load_dotenv

load_dotenv()

# Load variables from .env
DEBUG_SUPERSET = os.getenv('DEBUG') == 'True'
FRONTEND_URL = os.getenv('ALLOWED_ORIGINS')
POSTGRES_DB = os.getenv('POSTGRES_DB')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_SERVER_NAME = os.getenv('POSTGRES_SERVER_NAME')
POSTGRES_USER = os.getenv('POSTGRES_USER')
SUPERSET_URL = os.getenv('REACT_APP_SUPERSET_URL')
TOKEN = os.getenv('GUEST_TOKEN_JWT_SECRET')

SQLALCHEMY_DATABASE_URI = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER_NAME}:5432/{POSTGRES_DB}'

# Enable embedded dashboards and row-level security
FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
    "GUEST_ROLE_SUPPORTED": True,
}

# Guest token JWT secret key (ensure this is kept secret)
GUEST_ROLE_NAME = "Public"
GUEST_TOKEN_JWT_SECRET = TOKEN
GUEST_TOKEN_JWT_ALGO = "HS256"
GUEST_TOKEN_HEADER_NAME = "X-GuestToken"
GUEST_TOKEN_JWT_EXP_SECONDS = 300 # 5 minutes

# Configure CORS and security settings
ENABLE_CORS = True
CORS_OPTIONS = {
    'supports_credentials': True,
    'origins': [
        FRONTEND_URL,
    ],
}

# Security settings
HTTP_HEADERS = {'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'no-referrer',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                }

TALISMAN_ENABLED = True
TALISMAN_CONFIG = {
    'frame_options': 'DENY',
    'content_security_policy': "default-src 'self';"
                                           f" script-src 'self' {FRONTEND_URL};"
                                           f" style-src 'self' 'unsafe-inline' {FRONTEND_URL};"
                                           f" img-src 'self' {SUPERSET_URL} https://static.scarf.sh https://apachesuperset.gateway.scarf.sh;"
                                           f" frame-src {SUPERSET_URL};"
                                           f" frame-ancestors {FRONTEND_URL};",
    'force_https': not DEBUG_SUPERSET,
    'session_cookie_secure': not DEBUG_SUPERSET,
}

WTF_CSRF_ENABLED = False
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG_SUPERSET
SESSION_COOKIE_SAMESITE = 'Strict'
ENABLE_PROXY_FIX = True
PREFERRED_URL_SCHEME = 'https'
