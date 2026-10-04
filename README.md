# Forma CRM / ERP

An English-language business workspace built with React, TypeScript, NestJS and a persistent SQLite database. Includes light/dark themes, dashboard analytics, customer management, sales pipeline, invoices, product inventory, tasks, search, status filters and CSV exports. All modules support creating, editing and deleting records.

## Business documentation

See the [English business documentation](docs/BUSINESS_DOCUMENTATION.md) for business responsibilities, module workflows, reporting definitions and current operating boundaries.

## Run locally

Requirements: Node.js 22.15+ and npm. Java and Maven are not required to build, test or run the application. Node 22 may print an experimental warning for its built-in SQLite driver.

From the repository root:

```powershell
npm run install:all
```

If upgrading an existing Java/H2 workspace, follow the migration instructions below before starting the backend. Fresh installations seed automatically.

Start the NestJS backend with automatic rebuilding:

```powershell
npm run backend
```

In a second terminal:

```powershell
npm run dev
```

Open **http://localhost:5173**. The frontend proxies `/api` to **http://localhost:8080**. No environment variables or `.env` files are required. Configuration is committed in `frontend/vite.config.ts` and `backend/src/config.ts`.

## Data

SQLite stores records in `backend/data/forma.sqlite`, regardless of the working directory used to start the compiled backend. Monetary values are stored as integer cents and returned as JSON numbers. Dates remain calendar dates (`YYYY-MM-DD`).

The original 31 seed records are inserted only when the database is empty, including on restart after deleting every record, as in the Java backend. Dates in the seed dataset cover April–October 2026. Dashboard totals and charts are computed from saved records; the revenue chart uses paid invoices from completed months and treats the invoice date as the reporting date.

Currency is USD. Theme preference is saved in the browser. Google Fonts are optional; system fonts are used when unavailable.

## Migrate an existing H2 workspace

The one-time migration requires Java 21+ and the H2 **2.3.232** driver used by the previous backend. By default it finds the driver in `~/.m2/repository/com/h2database/h2/2.3.232/h2-2.3.232.jar`. No Maven build or running Spring server is needed.

1. Stop the old Spring Boot server and any H2 console connection so the database is closed.
2. Install the backend dependencies with `npm run install:backend`.
3. Run from the repository root:

   ```powershell
   npm run migrate:h2
   ```

   To specify another driver or database location:

   ```powershell
   npm run migrate:h2 -- --h2-jar C:/tools/h2-2.3.232.jar --source C:/old-workspace/data/forma --target C:/SMCode/CRM/backend/data/forma.sqlite
   ```

4. Start the NestJS backend with `npm run backend`.

The migration reads H2 in read-only mode, validates and imports all records in a transaction, and compares every field before publishing the SQLite database. It preserves IDs, the next identity value (including deleted IDs), nullable fields, Unicode, dates and monetary precision. The original `forma.mv.db` remains unchanged; `forma.mv.db.pre-nest-backup` is also retained beside it. Existing SQLite files are never overwritten. A startup guard refuses to seed over an unmigrated `forma.mv.db`.

`backend/scripts/ExportH2.java` is only a one-time JDBC export bridge. The server and application logic are TypeScript. The Spring-specific `/h2-console` endpoint is no longer part of the application; inspect the active database with a SQLite client. The preserved H2 file is an archive and does not receive new changes. For rollback, keep the SQLite file as well and check out the previous Java version; it will use the original H2 snapshot.

## Build and verify

```powershell
npm test
npm run build
npm run start:backend
```

Frontend build: `frontend/dist`. Backend build: `backend/dist`, entry point `main.js`. Deploy it together with `backend/package.json`, `backend/package-lock.json`, production dependencies (`npm ci --omit=dev`) and the persistent `backend/data` directory. For development and local viewing, use the Vite server above to retain the API proxy.

Tests cover all five modules and statuses, CRUD, required and optional fields, validation boundaries, immutable record types, HTTP errors, persistence across restarts, seed totals and migration rollback. A real H2 integration test additionally verifies Unicode, nulls, monetary values, the identity counter and the unchanged source file. This last test runs when Java and the H2 driver are available; otherwise it is explicitly skipped. Set `H2_JAR` to use a driver outside the default Maven cache.

## REST API

The existing routes, JSON fields and successful HTTP status codes are preserved:

| Method | Route | Response |
| --- | --- | --- |
| GET | `/api/records` | 200, all business records |
| POST | `/api/records` | 201, created record |
| PUT | `/api/records/{id}` | 200, updated record |
| DELETE | `/api/records/{id}` | 204, empty body |

Records contain `id`, `type`, `name`, `company`, `email`, `status`, `amount`, `date`, `owner`, `quantity` and `notes`. The server generates IDs on create and uses the URL ID on update. Unknown body fields are ignored. Validation failures return 400; missing records return 404. Error responses retain `timestamp`, `status`, `error`, `message` and `path`.

Validation enforces required fields, original string limits, valid email addresses, nonnegative amounts with at most ten integer digits and two decimal places, nonnegative 32-bit integer quantities, valid calendar dates, record types and their matching statuses. A record's type cannot be changed. Email and notes may be null or omitted; email may also be empty.

Implementation references: [NestJS validation](https://docs.nestjs.com/techniques/validation), [Node.js SQLite](https://nodejs.org/download/release/v22.15.0/docs/api/sqlite.html), [H2 tools](https://h2database.com/html/tutorial.html#command_line_tools).

This is a local single-workspace CRM/ERP starter. The displayed profile is a seeded persona, not a login session. Invoices are tracking records; products are a simple stock register. Authentication, tax accounting, payment processing, warehouse movements, and multi-user permissions are not implemented.
