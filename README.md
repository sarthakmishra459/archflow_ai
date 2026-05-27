# Archflow AI Backend

This repository contains the Spring Boot backend for Archflow AI.

## Overview

The backend exposes REST APIs for authentication, diagram management, analytics, and AI-driven diagram generation/editing.

> Note: Current configuration uses `server.servlet.context-path=/api` and controllers are mapped under `/api`. As a result, the effective API base path is:
>
> `http://localhost:8080/api/api`

## Backend Startup

From the project root:

```bash
./mvnw.cmd spring-boot:run
```

Or build and run the packaged JAR:

```bash
./mvnw.cmd package
java -jar target/archflow_ai-0.0.1-SNAPSHOT.jar
```

## API Base URL

Use this URL in the frontend during local development:

```text
http://127.0.0.1:8080/api/api
```

## Authentication

### Register

`POST /api/api/auth/register`

Body:

```json
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "TestPass123!"
}
```

### Login

`POST /api/api/auth/login`

Body:

```json
{
  "username": "user1",
  "password": "TestPass123!"
}
```

### Authenticated requests

Use the JWT token returned from login in the `Authorization` header:

```http
Authorization: Bearer <token>
```

## Diagram Endpoints

### Create diagram

`POST /api/api/diagrams`

Payload example:

```json
{
  "name": "My Diagram",
  "description": "A sample diagram",
  "graphJson": "{\"nodes\":[],\"edges\":[]}",
  "isPublic": false
}
```

### Get my diagrams

`GET /api/api/diagrams`

### Get diagram by ID

`GET /api/api/diagrams/{id}`

### Update diagram

`PUT /api/api/diagrams/{id}`

### Delete diagram

`DELETE /api/api/diagrams/{id}`

### Create version snapshot

`POST /api/api/diagrams/{id}/version`

### Get version history

`GET /api/api/diagrams/{id}/versions`

### Rollback to version

`POST /api/api/diagrams/{id}/rollback/{versionId}`

## AI Endpoints

### Generate diagram

`POST /api/api/ai/generate`

Payload:

```json
{
  "prompt": "Generate a system architecture for a payment service",
  "provider": "gemini"
}
```

### Edit diagram

`POST /api/api/ai/edit`

Payload:

```json
{
  "editInstruction": "Add a cache layer",
  "currentGraphJson": "{\"nodes\":[],\"edges\":[]}",
  "provider": "gemini"
}
```

## Analytics

`GET /api/api/analytics`

This returns aggregated prompt usage and latency statistics.

## Swagger / OpenAPI

Swagger/OpenAPI is not currently configured in this project.

To add interactive API docs for the frontend team, include a dependency like:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.2.0</version>
</dependency>
```

Then use:

```text
http://localhost:8080/api/api/swagger-ui/index.html
```

## Notes for Frontend Developers

- The backend uses JWT authentication for protected endpoints.
- Always include the `Authorization` header for diagram and AI routes.
- The effective API URL is `http://127.0.0.1:8080/api/api`.
- If you need Swagger docs, add the SpringDoc dependency above and restart the backend.
