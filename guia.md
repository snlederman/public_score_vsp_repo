# Guía Detallada para Implementar una Aplicación Web en Azure con CI/CD

Esta guía te proporcionará un paso a paso completo para implementar una aplicación web en Azure utilizando CI/CD con GitHub Actions. Incluirá la configuración de staging slots, el uso de Azure Key Vault para gestionar secretos, y las consideraciones de seguridad implementadas en el proyecto.

Resumen de Recursos Necesarios y Estimación de Costos

Antes de comenzar, es importante conocer los recursos que necesitaremos y tener una idea aproximada de los costos asociados. Los recursos principales incluyen:

	•	Grupo de Recursos: Para organizar todos los servicios relacionados.
	•	Azure Container Registry (ACR): Almacén privado de imágenes Docker.
	•	Azure App Service Plan: Plan de hospedaje para las aplicaciones web.
	•	Azure Web Apps: Tres instancias para el backend, frontend y Superset, cada una con un slot de staging.
	•	Azure Database for PostgreSQL Flexible Server: Base de datos para almacenar los datos de la aplicación.
	•	Azure Key Vault: Para almacenar y gestionar secretos de manera segura.
	•	Twilio SendGrid: Servicio para enviar correos electrónicos (gratis hasta 100 correos electrónicos al día).

Estimación de Costos Mensuales Aproximados:

	•	Azure Container Registry (Basic SKU): $0.167 por día (~$5 al mes).
	•	Azure App Service Plan (S1 SKU): $0.095 por hora (~$69.35 al mes).
	•	Azure Database for PostgreSQL (B1ms SKU): $0.02 por hora (~$12.99 al mes).
	•	Azure Key Vault: $0.03 por 10,000 transacciones (~$1 al mes).
	•	Twilio SendGrid (Plan Gratis): $0.

Nota: Estos son costos aproximados y pueden variar según el uso y la región. Se recomienda utilizar la [Calculadora de Precios de Azure](https://azure.microsoft.com/en-us/pricing/calculator/) para obtener una estimación más precisa.

## Paso 1: Crear una Suscripción y Grupo de Recursos

1.1 Crear una Suscripción (si no la tienes)

Una suscripción en Azure es necesaria para acceder a los servicios de la nube.

	1.	Inicia sesión en Azure Portal.
	2.	Ve a Cost Management + Billing.
	3.	Selecciona Suscripciones y luego Añadir.
	4.	Sigue los pasos para crear una nueva suscripción.

1.2 Crear un Grupo de Recursos

Un grupo de recursos en Azure es una carpeta donde guardas todos los servicios relacionados de un proyecto.

Via Portal de Azure:

	1.	En la barra de búsqueda, escribe Resource Groups y selecciona Crear.
	2.	Completa el formulario:
	•	Nombre del Grupo de Recursos: myResourceGroup.
	•	Región: East US (o la más cercana a tu ubicación).
	3.	Haz clic en Review + Create y luego en Create.

## Paso 2: Crear el Azure Container Registry (ACR)

El ACR es un registro privado para almacenar imágenes Docker de tus aplicaciones.

Via Portal de Azure:

	1.	En la barra de búsqueda, escribe Container Registry y selecciona Crear.
	2.	Selecciona tu grupo de recursos (myResourceGroup).
	3.	Configura:
	•	Nombre del Registro: myacrvspscore.
	•	SKU: Basic.
	4.	Haz clic en Review + Create y luego en Create.

## Paso 3: Iniciar Sesión en ACR

Necesitas iniciar sesión en tu ACR para poder subir las imágenes de tu aplicación.

Iniciar sesión en ACR

```console
az acr login --name myacrvspscore
```

## Paso 4: Build y Push de las Imágenes Docker al ACR

Construye y sube las imágenes Docker de tu backend, frontend y Superset.

Build de las imágenes Docker

```console
docker-compose -f docker-compose.yml build backend frontend superset
```
Push de las imágenes al ACR

```console
docker-compose -f docker-compose.yml push backend frontend superset
```

## Paso 5: Crear el App Service Plan y las WebApps con Slots de Staging

5.1 Crear un App Service Plan

El App Service Plan determina los recursos asignados a tus aplicaciones web. Para utilizar slots de implementación, debes seleccionar al menos el nivel Standard.

Crear un plan de App Service

```console
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku S1 --is-linux
```

Nota: El nivel S1 Standard permite hasta 5 slots de implementación.

5.2 Crear las WebApps y sus Slots de Staging

Crea las aplicaciones web para el backend, frontend y Superset, junto con sus slots de staging.

Crear WebApp para backend y su slot de staging

```console
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myBackendApp --deployment-container-image-name myacrvspscore.azurecr.io/mybackend:latest
az webapp deployment slot create --resource-group myResourceGroup --name myBackendApp --slot staging
```

Crear WebApp para frontend y su slot de staging

```console
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myFrontendApp --deployment-container-image-name myacrvspscore.azurecr.io/myfrontend:latest
az webapp deployment slot create --resource-group myResourceGroup --name myFrontendApp --slot staging
```

Crear WebApp para Superset y su slot de staging

```console
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name mySupersetApp --deployment-container-image-name myacrvspscore.azurecr.io/superset:latest
az webapp deployment slot create --resource-group myResourceGroup --name mySupersetApp --slot staging
```

## Paso 6: Configurar Azure Active Directory y GitHub Actions

6.1 Crear un App Registration “GitHubActionsSP”

Esto permite a GitHub Actions interactuar de manera segura con tus recursos de Azure.

	1.	Ve a Azure Active Directory en el portal de Azure.
	2.	Selecciona App registrations y luego haz clic en New registration.
	3.	Completa el formulario:
	•	Name: GitHubActionsSP.
	•	Supported account types: Accounts in this organizational directory only.
	4.	Haz clic en Register.
	5.	Toma nota del Application (client) ID y Directory (tenant) ID.
	6.	Ve a Certificates & secrets y selecciona New client secret.
	•	Añade una descripción y selecciona la duración.
	7.	Copia el valor del secreto generado.

6.2 Otorgar Role Assignment (Contribuidor) al App Service Plan

Asigna el rol de Contributor a la aplicación registrada para que pueda gestionar recursos.

Otorgar el rol de Contribuidor

```console
az role assignment create --assignee <application_client_id> --role Contributor --scope /subscriptions/<subscription_id>/resourceGroups/myResourceGroup
```

## Paso 7: Crear el Azure Database for PostgreSQL Flexible Server

Crea una base de datos PostgreSQL para almacenar los datos de tu aplicación.

Crear una base de datos PostgreSQL

```console
az postgres flexible-server create --resource-group myResourceGroup --name mypostgresservervspscore --admin-user myadmin --admin-password vspscore2024 --sku-name Standard_B1ms --storage-size 32 --version 13
```

## Paso 8: Configurar Azure Key Vault y Variables de Entorno

8.1 Crear un Azure Key Vault

El Key Vault te permite almacenar y acceder a secretos de forma segura.

Crear un Key Vault

```console
az keyvault create --name myKeyVault --resource-group myResourceGroup --location eastus
```
8.2 Agregar Secretos al Key Vault

Agrega los secretos necesarios para tu aplicación.

Agregar secretos

```console
az keyvault secret set --vault-name myKeyVault --name SECRET-KEY --value <your_secret_key>
az keyvault secret set --vault-name myKeyVault --name POSTGRES-PASSWORD --value vspscore2024
az keyvault secret set --vault-name myKeyVault --name SENDGRID-API-KEY --value <your_sendgrid_api_key>
az keyvault secret set --vault-name myKeyVault --name GUEST-TOKEN-JWT-SECRET --value <your_jwt_secret>
az keyvault secret set --vault-name myKeyVault --name SUPERSET-ADMIN-PS --value <your_superset_admin_password>
az keyvault secret set --vault-name myKeyVault --name SUPERSET-SECRET-KEY --value <your_superset_secret_key>
```

8.3 Configurar Identidad Gestionada en las WebApps

	1.	Ve a cada WebApp en el portal de Azure.
	2.	Navega a Identity y habilita la System Assigned Managed Identity.
	3.	Toma nota del Object ID de cada aplicación.

8.4 Otorgar Acceso a las WebApps en el Key Vault

Asigna el rol de Key Vault Secrets User a las identidades de las WebApps.

Otorgar acceso al Key Vault

```console
az keyvault set-policy --name myKeyVault --object-id <webapp_object_id> --secret-permissions get list
```

8.5 Configurar Variables de Entorno en las WebApps

Para acceder a los secretos del Key Vault desde las WebApps, utiliza la sintaxis @Microsoft.KeyVault(SecretUri=...).

Ejemplo para SECRET_KEY:

	1.	Ve a Configuration en tu WebApp.
	2.	Añade una nueva variable de aplicación:
	•	Name: SECRET_KEY
	•	Value: @Microsoft.KeyVault(SecretUri=https://myKeyVault.vault.azure.net/secrets/SECRET-KEY)
	3.	Repite este proceso para cada secreto necesario.

8.6 Agregar Variables de Entorno Adicionales

Además de los secretos, necesitas configurar otras variables de entorno.

Para myBackendApp y su slot de staging:

	•	ALLOWED_HOSTS
	•	ALLOWED_ORIGINS
	•	DEBUG
	•	DEFAULT_FROM_EMAIL
	•	DOCKER_REGISTRY_SERVER_PASSWORD
	•	DOCKER_REGISTRY_SERVER_URL
	•	DOCKER_REGISTRY_SERVER_USERNAME
	•	JWT_ACCESS_TOKEN_LIFETIME
	•	JWT_REFRESH_TOKEN_LIFETIME
	•	POSTGRES_DB
	•	POSTGRES_SERVER_NAME
	•	POSTGRES_USER
	•	REACT_APP_DASHBOARD_ID
	•	REACT_APP_SUPERSET_URL
	•	SUPERSET_ADMIN_USERNAME

Para mySupersetApp y su slot de staging:

	•	ALLOWED_ORIGINS
	•	DEBUG
	•	DOCKER_REGISTRY_SERVER_PASSWORD
	•	DOCKER_REGISTRY_SERVER_URL
	•	DOCKER_REGISTRY_SERVER_USERNAME
	•	GUEST_TOKEN_JWT_SECRET
	•	POSTGRES_DB
	•	POSTGRES_SERVER_NAME
	•	POSTGRES_USER
	•	REACT_APP_SUPERSET_URL
	•	SUPERSET_ADMIN_EMAIL
	•	SUPERSET_ADMIN_FIRSTNAME
	•	SUPERSET_ADMIN_LASTNAME
	•	SUPERSET_ADMIN_USERNAME
	•	SUPERSET_SECRET_KEY

Para myFrontendApp y su slot de staging:

	•	DOCKER_REGISTRY_SERVER_PASSWORD
	•	DOCKER_REGISTRY_SERVER_URL
	•	DOCKER_REGISTRY_SERVER_USERNAME
	•	REACT_APP_API_URL
	•	REACT_APP_DASHBOARD_ID
	•	REACT_APP_SUPERSET_URL

Dónde encontrar la información para las variables DOCKER_REGISTRY_SERVER_*:

	•	DOCKER_REGISTRY_SERVER_URL: URL de tu ACR, por ejemplo, myacrvspscore.azurecr.io.
	•	DOCKER_REGISTRY_SERVER_USERNAME: El nombre de usuario para el ACR, puede ser el client ID de tu App Registration.
	•	DOCKER_REGISTRY_SERVER_PASSWORD: El client secret de tu App Registration.

## Paso 9: Configurar Secrets y Variables de Entorno en GitHub Actions

9.1 Configurar Secrets en GitHub Actions

Ve a Settings en tu repositorio de GitHub y luego a Secrets and variables > Actions > New Repository Secret. Añade los siguientes secretos:

	•	ACR_LOGIN_SERVER: myacrvspscore.azurecr.io
	•	AZURE_CLIENT_ID: Application (client) ID de tu App Registration.
	•	AZURE_CLIENT_SECRET: El secreto generado para tu App Registration.
	•	AZURE_DATABASE_URL: postgresql://myadmin:vspscore2024@mypostgresservervspscore.postgres.database.azure.com:5432/postgres?sslmode=require
	•	AZURE_SUBSCRIPTION_ID: Tu ID de suscripción en Azure.
	•	AZURE_TENANT_ID: Directory (tenant) ID de tu App Registration.

9.2 Configurar Variables de Entorno en GitHub Actions

En tu archivo deploy.yml, puedes utilizar estos secretos para configurar las variables de entorno necesarias durante el proceso de CI/CD.

## Paso 10: Configurar CI/CD en GitHub Actions

Crea un archivo deploy.yml en el directorio .github/workflows/ de tu repositorio:

```console
name: Build, Deploy, and Configure Azure Resources

on:
  push:
    branches:
      - main

permissions:
  id-token: write
  contents: read

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      # Paso 1: Checkout del código
      - name: Checkout Code
        uses: actions/checkout@v2

      # Paso 2: Configurar Docker Buildx
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      # Paso 3: Instalar Docker Compose
      - name: Install Docker Compose
        run: |
          sudo apt-get update
          sudo apt-get install -y docker-compose

      # Paso 4: Login al Azure Container Registry
      - name: Login to Azure Container Registry
        uses: azure/docker-login@v1
        with:
          login-server: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.AZURE_CLIENT_ID }}
          password: ${{ secrets.AZURE_CLIENT_SECRET }}

      # Paso 5: Build y push de las imágenes Docker
      - name: Build and push Docker images
        run: |
          export DATABASE_URL=${{ secrets.AZURE_DATABASE_URL }}
          
          # Build de las imágenes
          docker-compose -f docker-compose.yml build backend frontend superset

          # Push de las imágenes al ACR
          docker-compose -f docker-compose.yml push backend frontend superset

      # Paso 6: Login a Azure
      - name: Azure Login
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          auth-type: 'SERVICE_PRINCIPAL'

      # Paso 7: Configurar Variables de Entorno en las WebApps
      - name: Set Environment Variables in Azure Web Apps
        run: |
          az webapp config appsettings set --resource-group myResourceGroup --name myBackendApp --settings DATABASE_URL=${{ secrets.AZURE_DATABASE_URL }}
          az webapp config appsettings set --resource-group myResourceGroup --name mySupersetApp --settings SQLALCHEMY_DATABASE_URI=${{ secrets.AZURE_DATABASE_URL }}

      # Paso 8: Desplegar a los Slots de Staging
      - name: Deploy Backend to Staging Slot
        uses: azure/webapps-deploy@v2
        with:
          app-name: myBackendApp
          slot-name: staging
          images: myacrvspscore.azurecr.io/mybackend:latest

      - name: Deploy Frontend to Staging Slot
        uses: azure/webapps-deploy@v2
        with:
          app-name: myFrontendApp
          slot-name: staging
          images: myacrvspscore.azurecr.io/myfrontend:latest

      - name: Deploy Superset to Staging Slot
        uses: azure/webapps-deploy@v2
        with:
          app-name: mySupersetApp
          slot-name: staging
          images: myacrvspscore.azurecr.io/superset:latest

      # Paso 9: Swap de Slots (Staging a Producción)
      - name: Swap Slots for Backend
        run: az webapp deployment slot swap --resource-group myResourceGroup --name myBackendApp --slot staging

      - name: Swap Slots for Frontend
        run: az webapp deployment slot swap --resource-group myResourceGroup --name myFrontendApp --slot staging

      - name: Swap Slots for Superset
        run: az webapp deployment slot swap --resource-group myResourceGroup --name mySupersetApp --slot staging
```

## Paso 11: Crear el Servicio de Envío de Emails con Twilio SendGrid

Twilio SendGrid es un servicio que permite enviar correos electrónicos de forma sencilla y segura.

11.1 Crear una Cuenta de Twilio SendGrid

	1.	Ve a Azure Marketplace.
	2.	Busca Twilio SendGrid y selecciona Twilio SendGrid Email Delivery.
	3.	Haz clic en Crear y sigue los pasos para configurar el servicio.
	•	Selecciona el plan Free (hasta 100 correos electrónicos al día).
	4.	Una vez creado, obtén la API Key desde el panel de SendGrid.

11.2 Configurar SendGrid en tu Aplicación

Agrega la API Key de SendGrid a tu Azure Key Vault:

```console
az keyvault secret set --vault-name myKeyVault --name SENDGRID-API-KEY --value <your_sendgrid_api_key>
```

En las variables de entorno de tu WebApp (backend), añade:

	•	EMAIL_BACKEND: django.core.mail.backends.smtp.EmailBackend
	•	EMAIL_HOST: smtp.sendgrid.net
	•	EMAIL_PORT: 587
	•	EMAIL_USE_TLS: True
	•	EMAIL_HOST_USER: apikey
	•	EMAIL_HOST_PASSWORD: Utiliza el secreto del Key Vault: @Microsoft.KeyVault(SecretUri=https://myKeyVault.vault.azure.net/secrets/SENDGRID-API-KEY)
	•	DEFAULT_FROM_EMAIL: Tu correo electrónico de remitente.

# Consideraciones de Seguridad Implementadas

1. TLS/SSL Encryption

	•	Implementación:
	•	Las aplicaciones web en Azure usan HTTPS de forma predeterminada con certificados SSL automáticos.
	•	Se ha habilitado “HTTPS Only” en la configuración de las WebApps para garantizar que todas las comunicaciones estén cifradas.

2. Authentication and Authorization

	•	Backend:
	•	Se utiliza JWT (JSON Web Tokens) para la autenticación de las API entre el frontend y el backend.
	•	Se ha configurado django-rest-framework con autenticación JWT.
	•	Superset:
	•	Se ha implementado autenticación basada en tokens para el iframe embebido.
	•	Se utiliza un token de invitado (guest token) que se genera y gestiona de manera segura.
	•	Se ha establecido control de acceso basado en roles (RBAC) para los usuarios que acceden a Superset.

3. Gestión Segura de Secretos

	•	Azure Key Vault:
	•	Los secretos sensibles (como SECRET_KEY, POSTGRES_PASSWORD, SENDGRID_API_KEY) se almacenan en Azure Key Vault.
	•	Las WebApps acceden a estos secretos mediante referencias en las variables de entorno utilizando @Microsoft.KeyVault(SecretUri=...).
	•	Se ha habilitado la identidad gestionada en las WebApps y se ha configurado el control de acceso adecuado en el Key Vault.

4. Headers de Seguridad

	•	Configuración en settings.py (backend):
	•	Se ha habilitado HTTP Strict Transport Security (HSTS) con SECURE_HSTS_SECONDS, SECURE_HSTS_INCLUDE_SUBDOMAINS y SECURE_HSTS_PRELOAD.
	•	Se ha establecido X_FRAME_OPTIONS a 'DENY' para prevenir ataques de clickjacking.
	•	Se ha activado SECURE_CONTENT_TYPE_NOSNIFF para evitar que los navegadores intenten adivinar el tipo de contenido.
	•	Configuración en superset_config.py (Superset):
	•	Se ha implementado una política de seguridad de contenido (CSP) personalizada utilizando TALISMAN_CONFIG.
	•	Se han configurado los encabezados de seguridad adicionales como Referrer-Policy y X-Content-Type-Options.

# Código Relevante

A continuación, se presentan fragmentos de código clave relacionados con las configuraciones mencionadas.

docker-compose.yml

```console
services:
  backend:
    image: myacrvspscore.azurecr.io/mybackend:latest
    build:
      context: ./myproject
    volumes:
      - ./myproject:/app
      - ./myproject/logs:/app/logs
    ports:
      - "8000:8000"
    entrypoint: >
      sh -c "./entrypoint.sh"

  frontend:
    image: myacrvspscore.azurecr.io/myfrontend:latest
    build:
      context: ./myfrontend
    volumes:
      - ./myfrontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend

  superset:
    image: myacrvspscore.azurecr.io/superset:latest
    build:
      context: ./superset
    ports:
      - "8088:8088"
    volumes:
      - ./superset/superset_config.py:/app/pythonpath/superset_config.py
      - superset_home:/app/superset_home
    entrypoint: >
      sh -c "./entrypoint.sh"

volumes:
  superset_home:
```

myproject/settings.py (Extracto de Configuración de Seguridad)

```console
#Additional security settings for production
if not DEBUG:
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    X_FRAME_OPTIONS = 'DENY'
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_AGE = 1800
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_SAVE_EVERY_REQUEST = True

#Email backend to send emails
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS =  True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
DEFAULT_FROM_EMAIL = DEFAULT_FROM_EMAIL
```

superset/superset_config.py (Extracto de Configuración de Seguridad)

```console
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
```

# Conclusión

Siguiendo esta guía, podrás implementar tu aplicación web en Azure con CI/CD, asegurando buenas prácticas de seguridad y gestión de secretos.