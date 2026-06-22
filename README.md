# Vendora

**An AI-powered multi-vendor marketplace where sellers grow their business and buyers discover products they love.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## About the Project

Vendora is a full-stack multi-vendor marketplace built on the PERN stack (PostgreSQL, Express.js, React 18, Node.js). It connects independent sellers with buyers on a single platform while giving administrators the tools to oversee operations, enforce policies, and keep the marketplace healthy.

**The problem it solves:** Small and mid-sized sellers often lack the infrastructure to run their own storefronts—payment processing, inventory management, customer communication, and marketing tools are expensive and fragmented. Buyers, in turn, want a trusted place to browse products from multiple vendors without juggling separate checkout flows. Vendora brings everything under one roof.

**Who it's for:**

| Role | Description |
|------|-------------|
| **Admin** | Manages the marketplace—approves sellers, moderates listings, configures platform settings, and monitors overall health and revenue. |
| **Seller** | Lists products, manages inventory and orders, communicates with buyers, tracks sales analytics, and receives payouts through Stripe Connect. |
| **Buyer** | Browses and searches products across vendors, checks out securely, tracks orders, and chats with sellers in real time when questions arise. |

---

## Key Features

- **AI product description generator & smart recommendations** — Sellers can generate polished product copy with a single click using the OpenAI API. Buyers receive personalized product suggestions based on browsing history and purchase patterns.

- **Stripe payments with vendor payouts** — Secure checkout powered by Stripe, with automatic commission splits and scheduled payouts to sellers via Stripe Connect.

- **Real-time buyer–seller chat** — Built on Socket.IO, enabling instant messaging between buyers and sellers for pre-sale questions, order updates, and support—without leaving the platform.

- **Analytics dashboard for sellers** — Interactive charts and KPIs (powered by Recharts) covering revenue trends, top products, order volume, and conversion metrics so sellers can make data-driven decisions.

- **Email & in-app notification system** — Sellers and buyers stay informed through transactional emails (order confirmations, payout notices) and in-app alerts for messages, order status changes, and platform announcements.

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, React Router, Axios, Recharts, Tailwind CSS |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | JWT, bcrypt, role-based access control (Admin / Seller / Buyer) |
| **AI** | OpenAI API (GPT) — product descriptions, recommendation engine |
| **Payments** | Stripe, Stripe Connect (vendor payouts) |
| **Real-Time** | Socket.IO (buyer–seller chat, live notifications) |
| **DevOps** | Docker, GitHub Actions, environment-based configuration |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** or **yarn**
- **PostgreSQL** 14+ (local instance or hosted, e.g. Supabase, Neon, Railway)
- Accounts for **OpenAI**, **Stripe**, and an **SMTP** provider (e.g. SendGrid, Mailgun, or Gmail App Password)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/vendora.git
cd vendora
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

Copy the example env files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

See [Environment Variables](#environment-variables) below for the full list of required keys.

### 4. Set up the database

```bash
cd server
npx prisma migrate dev
npx prisma db seed   # optional: seed demo data
```

### 5. Run locally

Open two terminal windows:

```bash
# Terminal 1 — API server (default: http://localhost:5000)
cd server && npm run dev

# Terminal 2 — React client (default: http://localhost:5173)
cd client && npm run dev
```

Visit `http://localhost:5173` in your browser. The client proxies API requests to the Express server during development.

---

## Folder Structure

Vendora is organized as a monorepo with separate `client` and `server` packages:

```
vendora/
├── client/                 # React 18 frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level views (buyer, seller, admin)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Auth & global state
│   │   ├── services/       # API client & Socket.IO setup
│   │   └── utils/
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── prisma/             # Schema, migrations, seed
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # REST API routes
│   │   ├── services/       # Business logic (Stripe, OpenAI, email)
│   │   ├── sockets/        # Socket.IO event handlers
│   │   └── utils/
│   └── package.json
│
├── .github/workflows/      # CI/CD pipelines
└── README.md
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:password@host:5432/vendora`) |
| `JWT_SECRET` | Secret key for signing JWT access tokens |
| `OPENAI_API_KEY` | OpenAI API key for product descriptions and recommendations |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments and Connect payouts |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for event verification |
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.sendgrid.net`) |
| `SMTP_PORT` | SMTP port (typically `587` for TLS) |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password or API key |
| `SMTP_FROM` | Default sender address (e.g. `noreply@vendora.app`) |
| `CLIENT_URL` | Frontend origin for CORS and email links (e.g. `http://localhost:5173`) |
| `PORT` | API server port (default: `5000`) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client-side checkout |

> **Never commit `.env` files to version control.** Use `.env.example` files with placeholder values for documentation only.

---

## License

This project is licensed under the [MIT License](LICENSE).
