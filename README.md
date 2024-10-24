# Score VSP Web Application

## Overview
The Score VSP Web Application is a comprehensive solution designed to manage and prioritize potential operations within the Vice Presidency of the Private Sector. The application integrates various services, including a frontend interface, a backend API, a Superset dashboard for data visualization, and a PostgreSQL database for data storage. The entire application is containerized using Docker for easy deployment and management.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Custom authentication mechanism for secure access.
- **Superset Integration**: Interactive dashboards and data visualizations using Apache Superset.
- **Persistent Storage**: Data persistence using PostgreSQL.
- **Dockerized Setup**: Containerized services for easy deployment and scalability.
- **VNC Access**: Remote desktop access to manage and monitor the application.

## Architecture
The application consists of the following services:
- **Frontend**: React application served on port 3000.
- **Backend**: Django application served on port 8000.
- **Superset**: Apache Superset for data visualization served on port 8088.
- **Database**: PostgreSQL database served on port 5432.
- **Browser**: Selenium standalone Chrome for automated browser interactions.
- **VNC**: Ubuntu desktop with VNC access served on port 6080.

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Installation
1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/score_vsp.git
    cd score_vsp
    ```

2. **Build and start the containers:**
    ```bash
    docker-compose up -d --build
    ```

3. **Initialize the Superset and Backend databases:**
    ```bash
    docker-compose exec superset superset db upgrade
    docker-compose exec superset superset fab create-admin --username admin --firstname Admin --lastname User --email admin@example.com --password admin
    docker-compose exec superset superset init
    docker-compose exec backend python manage.py migrate
    ```

### Usage
- **Access the frontend:**
  Open your browser and navigate to `http://localhost:3000`.

- **Access the Superset dashboard:**
  Open your browser and navigate to `http://localhost:8088`. Login with the admin credentials created during initialization.

- **Access the backend:**
  The backend API is accessible at `http://localhost:8000`.

- **Access the PostgreSQL database:**
  Connect to the database at `localhost:5432` with the credentials specified in the `docker-compose.yml`.

- **Access the VNC server:**
  Open your browser and navigate to `http://localhost:6080`. Login with the credentials `user` and `password`.

### Configuration
- **Superset Configuration**:
  Superset configuration is managed in `superset_config.py`. The current configuration includes custom user authentication and CORS settings.
  
- **Backend Configuration**:
  The backend Django settings can be customized in the `backend/settings.py` file.

- **Environment Variables**:
  Environment variables for each service are specified in the `docker-compose.yml` file.

## Contributing
Contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### Additional Notes
- Ensure Docker and Docker Compose are installed and properly configured on your system.
- Modify the environment variables and configuration files according to your deployment needs.

---

Feel free to adjust this README to better fit your project's specific details and requirements.
