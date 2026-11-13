# SubGuard – Subscription Tracker

A small full-stack subscription tracking application built with **Java 21, Spring Boot, PostgreSQL, React, and TypeScript**.

Features: create/edit/delete subscriptions, choose monthly or yearly billing, calculate monthly-equivalent spending, search subscriptions, and highlight renewals within 7 days.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| Backend | Java 21, Spring Boot 3.5.7, Spring Web MVC |
| Persistence | Spring Data JPA, Hibernate, PostgreSQL |
| Testing | JUnit 5, Mockito |

## Requirements

- JDK 21 and Maven 3.6+ (or use IntelliJ's Maven runner)
- PostgreSQL with a local user and password
- Node.js 20+ and npm

## 1. Create a database

Open pgAdmin's Query Tool while connected to the `postgres` database and run:

```sql
CREATE DATABASE subguard_complete_db;
```

If `subguard_complete_db` already exists, **skip this step**. We use a separate database from the earlier tutorial (`subguard_db`) so its older table schema and records stay untouched. Spring/Hibernate creates the new `subscriptions` table automatically in this development database.

## 2. Start the Spring Boot backend

Open `backend/` as a Maven project in IntelliJ.

Set the `DB_PASSWORD` environment variable in the `SubguardApplication` run configuration (Run → Edit Configurations → Environment variables). Use the password for your local PostgreSQL account.

The default DB settings are `localhost:5432`, database `subguard_complete_db`, user `postgres`. For other settings, set `DB_URL` and `DB_USERNAME` environment variables.

Run `SubguardApplication` in IntelliJ, or in a terminal:

```bash
cd backend
# On Windows PowerShell, set this for the current terminal session:
$env:DB_PASSWORD="your_postgres_password"
mvn spring-boot:run
```

> Bash/macOS/Linux: `export DB_PASSWORD='your_postgres_password'` before running Maven. Never commit real passwords.

Backend URL: `http://localhost:8080`.

**Important for people following the tutorial:** This finished project replaces the original in-memory HashMap controllers. The REST endpoints now start with `/api/subscriptions`, not `/subscriptions`. It adds a `billingCycle` field and uses database-generated `Long` IDs. Use the complete `backend/` folder from this project as the finished version; do not combine two `SubscriptionController` classes with conflicting URL mappings.

## 3. Start the React frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` calls to Spring Boot on port 8080.

## REST API

| Method | URL | Description |
| --- | --- | --- |
| GET | `/api/subscriptions` | List subscriptions |
| GET | `/api/subscriptions/{id}` | Get by database ID |
| POST | `/api/subscriptions` | Create new subscription |
| PUT | `/api/subscriptions/{id}` | Replace subscription fields |
| DELETE | `/api/subscriptions/{id}` | Delete (204; 404 if missing) |
| GET | `/api/subscriptions/summary` | Monthly-equivalent total |
| GET | `/api/subscriptions/upcoming?days=7` | Renewal dates within the next 7 days |

### Sample Postman request

`POST http://localhost:8080/api/subscriptions`

Header: `Content-Type: application/json`

```json
{
  "name": "Netflix",
  "price": 15.99,
  "renewalDate": "2026-11-20",
  "billingCycle": "MONTHLY"
}
```

Expect HTTP **201 Created** with a generated numeric `id`. Use `GET /api/subscriptions` to verify persistence.

For a yearly plan, use `"billingCycle": "YEARLY"`; the monthly dashboard figure divides that plan's cost by 12.

**Current scope:** No user authentication, real payment processing, or automatic recurring-date advancement. `renewalDate` is the next date entered by the user; once it passes, the frontend marks it past due until edited. Monetary display assumes USD.

## Tests and build

```bash
cd backend
mvn test
```

The included unit test uses Mockito and does not require PostgreSQL. For the frontend:

```bash
cd frontend
npm run build
```

## GitHub upload

In a terminal opened at the **subguard** folder:

```bash
git init
git add .
git commit -m "Build SubGuard full-stack subscription tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/subguard.git
git push -u origin main
```

Create an **empty** GitHub repository named `subguard` first, without initializing a README. Replace `YOUR_USERNAME` with your actual username. If the repository is already initialized, check `git remote -v` before adding a new origin. Authentication is handled by your configured GitHub sign-in or credential manager.

**Security:** `.env`, IDE settings, build output, and `node_modules` are excluded by `.gitignore`. Do not commit PostgreSQL passwords or local credentials.
