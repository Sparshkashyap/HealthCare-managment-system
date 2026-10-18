# Healthcare Management System

A full-stack healthcare management application built with Node.js, Express.js, PostgreSQL, Prisma, and React + Vite.

## Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop (recommended for local PostgreSQL)
- PostgreSQL 16 (optional if using Docker)

## Project Structure

- `server/` - Express + Prisma + JWT API
- `client/` - Vite React + TypeScript + Tailwind frontend

## Environment Setup

Copy the example environment files and update values:

```bash
cp server/.env.example server/.env
```

Example values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/healthcare?schema=public"
JWT_SECRET="change-me-to-a-long-random-secret"
JWT_EXPIRES_IN="1d"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

## Database Setup

### Option 1: Run PostgreSQL with Docker

```bash
docker run --name healthcare-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=healthcare \
  -p 5432:5432 \
  -d postgres:16
```

Then create the database if needed:

```bash
psql postgresql://postgres:postgres@localhost:5432/postgres -c "CREATE DATABASE healthcare;"
```

### Prisma Migration

```bash
npm run db:migrate
```

### Seed Demo Data

```bash
npm run db:seed
```

## Install Dependencies

```bash
npm install
```

## Start Development Servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Build

```bash
npm run build
```

## Run Tests

```bash
npm run test
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Patients

- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`

### Doctors

- `GET /api/doctors`
- `POST /api/doctors`
- `GET /api/doctors/:id`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`

### Patient-Doctor Assignments

- `GET /api/mappings`
- `POST /api/mappings`
- `GET /api/mappings/:patientId`
- `DELETE /api/mappings/:id`

### Health

- `GET /api/health`

## Demo Credentials

The development seed script creates demo users. Check the seed output for the generated login account information.

## Troubleshooting

- If the database connection fails, ensure PostgreSQL is running and your `DATABASE_URL` is correct.
- If port 5000 is used by another process, change `PORT` in the server environment file.
- If Prisma migration errors occur, run `npx prisma migrate reset --force` in the server folder and rerun the migration.
- If the frontend fails to connect to the API, ensure `CLIENT_URL` and the backend CORS configuration match your local URLs.

## Notes

This project is intended for demonstration and development use. It is not a certified clinical system and should not be used for production patient care without additional compliance and security review.
