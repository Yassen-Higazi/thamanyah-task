# Podcast Management System (Backend)

This is the backend repository for a scalable Podcast Management System, designed to handle both content management and a robust discovery service. Built with NestJS, PostgreSQL, and Elasticsearch, it provides comprehensive functionalities for managing podcasts and episodes, including efficient large video uploads via `tus.io`.

The system is structured into two main components as per the task requirements:

1. **Content Management System (CMS):** An internal system for managing visual programs (podcasts, documentaries), allowing users to input/modify metadata (title, description, category, language, duration, publication date), and prepare for future multi-source data imports.

2. **Discovery System:** A public-facing system enabling users to search for programs based on various criteria.

## Technologies Used

- **NestJS:** A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Sequelize:** Powerful ORM for Node.js, used for interacting with the PostgreSQL database.
- **PostgreSQL:** Robust and reliable relational database for structured data storage.
- **Elasticsearch:** A distributed, RESTful search and analytics engine, used for the Discovery service.
- **tus.io:** An open, HTTP-based protocol for resumable file uploads, to handle large video file transfers.
- **Docker & Docker Compose:** For defining, running, and managing multi-container Docker applications (NestJS app, PostgreSQL, Elasticsearch).

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js.
- npm or Yarn
- Docker & Docker Compose.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repository-url>
   cd podcast-management-system-backend
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm i
   # OR
   yarn
   ```

### Environment Configuration

1. **Create a `.env` file:**
   Copy the provided `.env.example` file to `.env` in the root of your project.

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`:**
   Open the `.env` file and configure the necessary environment variables. The variables are crucial for connecting to PostgreSQL and Elasticsearch, and for configuring `tus.io`. Ensure the database and Elasticsearch connection details (`DATABASE_HOST`, `DATABASE_PORT`, `ELASTICSEARCH_HOST`, etc.) match the service names and exposed ports defined in your `docker-compose.yml`.

   ```env
   # Application Configuration
   PORT=3000
   NODE_ENV=development # or production, test

   # PostgreSQL Database Configuration
   DATABASE_HOST=postgres # Matches service name in docker-compose.yml
   DATABASE_PORT=5432
   DATABASE_USER=your_user
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=podcast_db

   # Elasticsearch Configuration
   ELASTICSEARCH_HOST=elasticsearch # Matches service name in docker-compose.yml
   ELASTICSEARCH_PORT=9200
   ELASTICSEARCH_USERNAME=elastic # If X-Pack Security is enabled
   ELASTICSEARCH_PASSWORD=changeme # If X-Pack Security is enabled

   # Tus.io Upload Configuration
   # This directory path is relative to the *inside* the application's Docker container.
   # For persistent storage across container restarts, ensure this path is mapped to a Docker volume.
   UPLOAD_DIR=/app/uploads
   TUS_MAX_SIZE_BYTES=10737418240 # Example: 10 GB (10 * 1024 * 1024 * 1024)
   ```

### Running the Application with Docker Compose

This project is designed to be run using Docker Compose, which orchestrates the NestJS application, PostgreSQL database, and Elasticsearch instance.

1. **Build and start all services:**
   This command will build your application's Docker image (if it's not already built), pull/create the PostgreSQL and Elasticsearch containers, and start all defined services.

   ```bash
   docker-compose up --build -d
   ```

   - The `-d` flag runs the containers in detached mode (in the background).
   - The `--build` flag ensures that your application's Docker image is built or re-built if there are changes to the Dockerfile or dependencies.

2. **Wait for services to initialize:**
   It might take a minute or two for PostgreSQL and Elasticsearch to fully start and be ready to accept connections. You can check the logs:

   ```bash
   docker-compose logs -f
   ```

   Look for messages indicating that PostgreSQL is ready for connections and Elasticsearch has started.

3. **Run Database Migrations:**
   Once PostgreSQL is up, apply the Sequelize database migrations to create the necessary tables. You need to execute this command from within your application container:

   ```bash
   docker-compose exec app npm run migrate
   # OR if using yarn:
   # docker-compose exec app yarn migrate
   ```

   - _Note: Ensure your `package.json` includes a script named `migrate` that executes your Sequelize migrations (e.g., `sequelize db:migrate`)._

4. **Verify Elasticsearch Indexing (Optional):**
   If your application includes initial data seeding or immediate indexing upon creation, you can verify that data is flowing into Elasticsearch:

   ```bash
   curl http://localhost:9200/_cat/indices?v
   ```

   (You might need to adjust the host/port if you've mapped them differently, or use `docker-compose exec elasticsearch curl localhost:9200/_cat/indices?v` to run it from inside the Elasticsearch container).

### Accessing the Application

Once all services are up and migrations are run, the NestJS application will be accessible:

- **API Base URL:** `http://localhost:3000` (or the `PORT` you configured in `.env`)
- **API Documentation (Swagger/OpenAPI):** If configured, typically at `http://localhost:3000/api` or `http://localhost:3000/docs`. This will detail all available endpoints.

## Project Structure

This project follows a modular and layered architecture, typical for NestJS applications, augmented for specific functionalities like `tus.io` uploads and Elasticsearch integration.

```
├── src/
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Root module
│   ├── auth/                     # Authentication & Authorization modules (e.g., JWT, Guards, Strategies)
│   ├── common/                   # Shared utilities, pipes, filters, interceptors, DTOs
│   ├── database/                 # Sequelize configuration, database models, migrations setup
│   ├── podcasts/                 # Module for podcast-related logic (controllers, services, models)
│   ├── episodes/                 # Module for episode-related logic (controllers, services, models)
│   ├── upload/                   # Module for tus.io server and file upload handlers
│   │   ├── tus-server.controller.ts # Handles tus.io protocol requests (POST, HEAD, PATCH)
│   │   ├── tus-server.service.ts  # Logic for managing tus.io uploads
│   │   └── ...
│   ├── discovery/                # Module for the Elasticsearch-powered discovery service
│   │   ├── discovery.controller.ts # Endpoints for searching programs
│   │   ├── discovery.service.ts    # Logic for interacting with Elasticsearch
│   │   └── ...
│   └── ...                       # Other feature modules
├── config/                       # Configuration files (e.g., Sequelize CLI config)
├── migrations/                   # Sequelize database migration scripts
├── seeders/                      # Sequelize database seeder scripts (optional)
├── docker-compose.yml            # Docker Compose configuration for all services
├── Dockerfile                    # Dockerfile for building the NestJS application image
├── .env.example                  # Example environment variables
├── .env                          # Local environment variables (created from .env.example)
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## API Endpoints

### Please refer to Swagger/OpenAPI documentation at `http://localhost:3000/api` for the full list of endpoints and their schemas

Here's a general overview of the main endpoint categories:

### Content Management (CMS) Endpoints

These endpoints are typically protected and used by authenticated internal users.

- **Podcasts:**
  - `POST /podcasts`: Create a new podcast.
  - `GET /podcasts`: Retrieve a list of all podcasts.
  - `GET /podcasts/:id`: Retrieve a single podcast by its ID.
  - `PUT /podcasts/:id`: Update an existing podcast.
  - `DELETE /podcasts/:id`: Delete a podcast.
- **Episodes:**
  - `POST /podcasts/:podcastId/episodes`: Add a new episode to a specific podcast.
  - `GET /podcasts/:podcastId/episodes`: Get all episodes belonging to a specific podcast.
  - `GET /episodes/:episodeId`: Get a single episode by its ID.
  - `PUT /episodes/:episodeId`: Update an existing episode.
  - `DELETE /episodes/:episodeId`: Delete an episode.

### Discovery Service Endpoints (Elasticsearch)

These endpoints are typically public-facing and used by general users to search for content.

- `GET /search`:
  - **Query Parameters:**
    - `q`: General search query string (e.g., `?q=artificial intelligence`). This will search across podcast/episode titles, descriptions, and keywords.
    - `category`: Filter by category (e.g., `?category=Technology`).
    - `presenter`: Filter by presenter name (e.g., `?presenter=John Doe`).
    - `guest`: Filter by guest name (e.g., `?guest=Jane Smith`).
    - `type`: Filter by content type (e.g., `?type=podcast` or `?type=episode`).
    - `page`, `limit`: For pagination of search results.
  - **Example Usage:**
    - `GET /search?q=AI&type=episode&category=Technology`
    - `GET /search?q=interview&presenter=Sarah`
