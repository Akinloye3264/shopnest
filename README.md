# ShopNest

A full-stack marketplace and employment platform for African youth. Buyers and sellers trade products; job seekers and employers connect — all in one place, starting from Gwagwalada, Abuja.

![ShopNest](docs/images/shopnest.png)

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Setup (Manual)](#local-setup-manual)
- [Local Setup (Docker)](#local-setup-docker)
- [Seeding the Database](#seeding-the-database)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [API Overview](#api-overview)

---

## Project Structure

```
shopnest/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── middleware/       # Error handling, request logging
│   │   ├── models/           # Sequelize models (User, Product, Job, Order, etc.)
│   │   ├── routes/           # API route handlers
│   │   └── utils/            # Email (OTP), verification helpers
│   ├── server.js             # Express app entry point
│   ├── seed.js               # Database seeder (users, products, jobs)
│   ├── populate.js           # Product-only seeder
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── assets/           # Static assets
│   │   ├── components/       # All page components
│   │   ├── config.ts         # API base URL
│   │   ├── index.css         # Global styles + Tailwind
│   │   └── main.tsx          # App entry point
│   ├── public/
│   │   └── shopnest.png      # App logo / favicon
│   ├── index.html
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker/
│   ├── docker-compose.yml    # Full stack Docker setup
│   └── .dockerignore
│
├── docs/
│   ├── images/               # Project screenshots / logo
│   ├── API_DOCS.md           # Full API reference
│   ├── DEPLOYMENT.md         # Render + Netlify deployment guide
│   ├── ENV_VARIABLES.md      # All environment variable descriptions
│   └── GOOGLE_OAUTH_SETUP.md # Google OAuth configuration guide
│
├── database/
│   └── shopnest_backup.sql   # PostgreSQL database backup
│
├── scripts/
│   ├── seed.sh               # Run seeder on Linux/Mac
│   └── seed.bat              # Run seeder on Windows
│
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion |
| Backend | Node.js, Express, Sequelize ORM |
| Database | PostgreSQL (production) / MySQL (local Docker) |
| Auth | JWT, OTP via email (Brevo), Google OAuth |
| Payments | Stripe Checkout |
| AI | Claude API (business assistant + resume auditor) |
| Jobs | Adzuna API (external job listings) |
| Deployment | Render (backend), Netlify (frontend) |

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [PostgreSQL](https://www.postgresql.org/) (for local dev without Docker)
- [Git](https://git-scm.com/)

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in the values:

```env
# Server
PORT=5001
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DB_DIALECT=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/shopnest

# OR individual DB vars (MySQL / local Docker)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=shopnest

# Auth
JWT_secret=your_jwt_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

# Email (Brevo / SendinBlue)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@shopnest.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# AI (Anthropic Claude)
CLAUDE_API=your_claude_api_key

# External Jobs (Adzuna)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
```

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
```

> For full descriptions of every variable see [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md).

---

## Local Setup (Manual)

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/shopnest.git
cd shopnest
```

### Step 2 — Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### Step 3 — Set up the frontend

```bash
cd ../frontend
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5001
```

### Step 4 — Start the backend

```bash
cd ../backend
npm run dev
```

Backend runs at `http://localhost:5001`. Health check: `http://localhost:5001/health`

### Step 5 — Start the frontend

```bash
cd ../frontend
npm run dev
```

App runs at `http://localhost:5173`.

### Step 6 — Seed the database (optional but recommended)

In a new terminal from the project root:

```bash
cd backend
npm run seed
```

This creates default users, sample products, and sample jobs.

**Default test accounts:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopnest.com | admin123 |
| Seller | seller@shopnest.com | seller123 |
| Buyer | buyer@shopnest.com | buyer123 |
| Employer | employer@shopnest.com | employer123 |
| Employee | employee@shopnest.com | employee123 |

---

## Local Setup (Docker)

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.

### Step 1 — Build and start all services

```bash
docker compose -f docker/docker-compose.yml up --build
```

This starts:
- MySQL database on port `3307`
- Backend API on port `5001`
- Frontend dev server on port `5173`

### Step 2 — Seed the database (optional)

In a new terminal while containers are running:

```bash
docker exec -it shopnest-backend node seed.js
```

Or use the helper scripts from the project root:

```bash
# Linux / Mac
bash scripts/seed.sh

# Windows
scripts\seed.bat
```

### Stop all services

```bash
docker compose -f docker/docker-compose.yml down
```

---

## Seeding the Database

The seeder (`backend/seed.js`) runs the following in order:

1. Creates 5 default users — admin, seller, buyer, employer, employee
2. Seeds 13 sample products across Electronics, Fashion, and Home
3. Seeds 2 sample job listings

It is safe to run multiple times — it skips records that already exist.

---

## Deployment

The live app is deployed on:

| Service | Platform | URL |
|---------|----------|-----|
| Backend | Render | `https://shopnest-2ywt.onrender.com` |
| Frontend | Netlify | `https://sshopnestt.netlify.app` |

For full step-by-step deployment instructions see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

For Google OAuth setup see [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md).

---

## User Roles

| Role | Access |
|------|--------|
| `buyer` | Browse marketplace, purchase products, message sellers, track orders, rate sellers |
| `seller` | List and manage products, receive messages from buyers |
| `employer` | Post jobs, review and manage applications |
| `employee` / `job_seeker` | Browse jobs, apply, upload resume for AI audit |
| `admin` | Full access — manage users, products, jobs, and view platform stats |

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email + OTP |
| POST | `/api/auth/login` | Login — sends OTP to email |
| POST | `/api/auth/verify-login` | Verify OTP and receive JWT |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/search` | Search users by name/email/role |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a product (seller) |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Post a job (employer) |
| POST | `/api/jobs/:id/apply` | Apply for a job |
| POST | `/api/orders/checkout` | Create Stripe checkout session |
| GET | `/api/orders/user/:userId` | Get orders for a user |
| POST | `/api/messages` | Send a message |
| GET | `/api/messages/inbox/:userId` | Get all conversations |
| GET | `/api/messages/conversation/:a/:b` | Get messages between two users |
| POST | `/api/reviews` | Submit a seller or product review |
| GET | `/api/reviews/seller/:sellerId` | Get reviews for a seller |
| POST | `/api/ai/learning-assistant` | Ask the AI business assistant |
| POST | `/api/ai/audit-resume` | Upload PDF resume for AI audit |
| GET | `/api/ai/external-jobs` | Fetch live jobs from Adzuna |
| GET | `/api/admin/stats` | Platform-wide statistics (admin) |
| GET | `/health` | Server health check |

> Full API documentation: [docs/API_DOCS.md](docs/API_DOCS.md)
