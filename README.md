# Forma CRM / ERP

An English-language business workspace built with React, TypeScript, Java 21, Spring Boot and a persistent H2 database. Includes light/dark themes, dashboard analytics, customer management, sales pipeline, invoices, product inventory, tasks, search, status filters and CSV exports. All modules support creating, editing and deleting records.

## Run locally

Requirements: Java 21+, Maven 3.6.3+, Node.js 22+, npm.

From the repository root, start the backend:

```powershell
mvn -f backend/pom.xml spring-boot:run
```

In a second terminal:

```powershell
npm --prefix frontend install
npm run dev
```

Open **http://localhost:5173**. The frontend proxies `/api` to **http://localhost:8080**. No environment variables or `.env` files are required. Frontend and backend configuration are committed directly in `frontend/vite.config.ts` and `backend/src/main/resources/application.properties`.

## Data

Seed data is inserted only when the database is empty. H2 persists records under `backend/data` when launched with the command above. Dates in the seed dataset cover April–October 2026. Dashboard totals and charts are computed from saved records; the revenue chart uses paid invoices from completed months and treats the invoice date as the reporting date.

H2 console: http://localhost:8080/h2-console

- JDBC URL: `jdbc:h2:file:./data/forma`
- User: `sa`
- Password: `forma-local`

Currency is USD. Theme preference is saved in the browser. Google Fonts are optional; system fonts are used when unavailable.

## Build and verify

```powershell
npm run build
mvn -f backend/pom.xml test
mvn -f backend/pom.xml package
```

Frontend build: `frontend/dist`. Backend executable: `backend/target/forma-crm-1.0.0.jar`. For development and local viewing, use the Vite server above to retain the API proxy.

## REST API

- `GET /api/records` — list all business records
- `POST /api/records` — create a record
- `PUT /api/records/{id}` — update a record
- `DELETE /api/records/{id}` — delete a record

Server validation enforces required fields, valid email addresses, nonnegative amounts/quantities, valid record types and matching statuses.

This is a local single-workspace CRM/ERP starter. The displayed profile is a seeded persona, not a login session. Invoices are tracking records; products are a simple stock register. Authentication, tax accounting, payment processing, warehouse movements, and multi-user permissions are not implemented.
