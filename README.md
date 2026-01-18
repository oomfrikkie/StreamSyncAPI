How to install the environment

Clone the repository

Open Git Bash in the project root

Run:
bash set-up.sh
(This installs all backend dependencies)

Make sure you have a .env file in the project root

To start both Docker and the backend together, run:
bash start-dev.sh


# Docker Compose Usage

To manage the full development environment (backend, frontend, database, etc.), use Docker Compose:

## Run Backend E2E Tests

To run the backend end-to-end tests in a clean, one-off container (removes the container after the run):

```
docker compose run --rm backend-e2e
```

This ensures your tests always run in a fresh environment.

**Stop and remove all containers, networks, and volumes:**

```
docker compose down -v
```

**Start all services (always use --build to ensure changes are picked up):**

```
docker compose up --build
```

> **Tip:** Always use `docker compose up --build` (not just `up`) to make sure any code or dependency changes are reflected in your containers.

# Technology & Design Justifications

- **NestJS (Backend):** Chosen for its modular architecture, TypeScript support, and built-in validation, which enables scalable and maintainable API development.
- **TypeORM:** Used for database interaction due to its strong TypeScript integration and support for migrations and entities.
- **PostgreSQL:** Selected as the main database for its reliability, advanced features, and open-source nature.
- **Docker Compose:** Used to orchestrate multi-container environments (backend, frontend, database, admin tools) for easy local development and deployment.
- **Swagger (OpenAPI):** Integrated for automatic API documentation and testing, supporting both JSON and XML formats for maximum interoperability.
- **XML & JSON Support:** Both formats are supported for API requests and responses to ensure compatibility with a wide range of clients and legacy systems.
- **DTO Validation:** All incoming data is validated using class-validator decorators, ensuring data integrity and security.
- **Separation of Concerns:** The project is organized into modules (account, profile, content, etc.) to keep code maintainable and testable.

For any changes to the backend or frontend code, always restart the environment with `docker compose up --build` to ensure your changes are applied.