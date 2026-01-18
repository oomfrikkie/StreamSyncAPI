# Technology Choices & Rationale

## Authentication: Why JWT?

We chose JWT (JSON Web Tokens) for authentication because:
- **Statelessness:** JWTs allow the backend to remain stateless, as all user session data is encoded in the token itself, reducing server memory usage.
- **Scalability:** Stateless authentication makes it easier to scale the application horizontally (across multiple servers/containers).
- **Interoperability:** JWTs are a widely adopted standard, compatible with many frontend frameworks and third-party services.
- **Security:** JWTs can be signed and optionally encrypted, ensuring data integrity and authenticity.
- **Flexibility:** JWTs can carry custom claims, making it easy to include user roles, permissions, and other metadata.

## Other Key Decisions

- **Docker:** We use Docker to ensure consistent environments across development, testing, and production.
- **PostgreSQL:** Chosen for its reliability, advanced features, and strong support for relational data.
- **NestJS:** Provides a modular, scalable structure for building robust backend APIs.
bash start-dev.sh

# Docker Compose Usage

To manage the full development environment (backend, frontend, database, etc.), use Docker Compose:

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