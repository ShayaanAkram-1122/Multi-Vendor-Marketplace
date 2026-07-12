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
| **Database** | PostgreSQL (`pg` + SQL schema / migrate scripts) |
| **Auth** | JWT access + refresh cookies, bcrypt, role-based access (Admin / Seller / Buyer) |
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

Create a root `.env` (see [Environment Variables](#environment-variables)). The API loads it from the project root.

### 4. Set up the database

```bash
cd server
npm run db:migrate
npm run db:seed   # optional: seed sellers + ~300 products
```

### 5. Run locally

From the repo root (or two terminals):

```bash
# Terminal 1 — API server (default: http://localhost:4000)
cd server && npm run dev

# Terminal 2 — React client (default: http://localhost:5173)
cd client && npm run dev
```

Visit `http://localhost:5173`. The Vite client proxies `/api` to the Express server.

---

## Folder Structure

Vendora is organized as a monorepo with separate `client` and `server` packages:

```
vendora/
├── client/                 # React 18 frontend (Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Header, product cards, AuthLayout, etc.
│   │   ├── context/        # AuthProvider / useAuth
│   │   ├── lib/            # API helpers (products, adminAuth)
│   │   ├── pages/          # Landing, shop, auth, admin
│   │   ├── services/       # authApi
│   │   └── data/           # Local catalog fallback
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # DB pool
│   │   ├── controllers/    # Auth, products
│   │   ├── db/             # schema.sql, migrate, seed, queries
│   │   ├── middleware/     # JWT auth + role guards
│   │   ├── routes/         # /api/auth, /api/products
│   │   └── utils/          # tokens, mail
│   └── package.json
│
├── .env                    # Local secrets (not committed)
└── README.md
```

---

## Environment Variables

### Server (root `.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` / `DB_*` | PostgreSQL connection |
| `JWT_SECRET` | Secret for signing JWT access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh-token hashing material |
| `ACCESS_TOKEN_EXPIRES` | Access token lifetime (e.g. `15m`) |
| `REFRESH_TOKEN_EXPIRES` | Refresh token lifetime (e.g. `7d`) |
| `ADMIN_INVITE_CODE` | Invite code required to register an admin |
| `OPENAI_API_KEY` | OpenAI API key (descriptions / recommendations — upcoming) |
| `STRIPE_SECRET_KEY` | Stripe secret key (upcoming) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (upcoming) |
| `SMTP_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (typically `587`) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password or Gmail App Password |
| `SMTP_FROM` | Sender address |
| `CLIENT_URL` | Frontend origin for CORS and email links (`http://localhost:5173`) |
| `PORT` | API server port (default: `4000`) |

### Client (`client/.env` — optional)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (defaults to `/api` with Vite proxy) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (upcoming) |

> **Never commit `.env` files to version control.** Use `.env.example` files with placeholder values for documentation only.

---

## Weekly Progress

### Week of July 6–12, 2026

Focus this week: auth, buyer shop experience, admin access, and transactional email.

#### Authentication & sessions
- Buyer/seller **register** and **login** with bcrypt password hashing
- **JWT access tokens** + httpOnly **refresh cookies**, with `/auth/me`, `/auth/refresh`, and logout
- Shared **`AuthContext`** so the shop header shows the signed-in user (avatar/name) instead of Sign In / Register
- Session hydrate now **refreshes expired access tokens** (or clears a dead session) instead of leaving a stale logged-in UI
- Role guards for **admin**, **seller**, and **buyer**

#### Buyer marketplace (`/shop`)
- Buyer landing page with utility bar, branded header + logo, search, category pills, flatlay hero, and product shelves
- Products API with **pagination**, **search**, **category**, and **sort**
- Catalog seed: **~300 products** across **36 sellers**
- Header spacing polish and account menu with sign-out

#### Admin console access
- Dedicated **admin login** and **admin register** flows (`/admin/login`, `/admin/register`) with branded `AuthLayout`
- Admin registration gated by **`ADMIN_INVITE_CODE`**
- Entry points from regular login/register pages
- Lightweight **admin console** shell after successful admin sign-in

#### Email (SMTP)
- Gmail SMTP wiring via Nodemailer (`SMTP_*` env vars)
- **Successful-login email** sent to the account owner on every login
- **Forgot-password email** with a secure reset link (`/reset-password?token=…`)
- **Password-changed confirmation email** after a successful reset
- Branded HTML email templates (Vendora header, CTAs for reset / sign-in / shop)
- Forgot-password UI now shows “Check your email” instead of exposing the reset token in the browser

#### Still ahead
- Seller dashboard, Stripe checkout, Socket.IO chat, OpenAI descriptions/recommendations

---

## License

This project is licensed under the [MIT License](LICENSE).
