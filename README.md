# Vendora

**An AI-powered multi-vendor marketplace where sellers grow their business and buyers discover products they love.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## About the Project

Vendora is a full-stack multi-vendor marketplace built on the PERN stack (PostgreSQL, Express.js, React, Node.js). It connects independent sellers with buyers on a single platform while giving administrators the tools to oversee operations, enforce policies, and keep the marketplace healthy.

**The problem it solves:** Small and mid-sized sellers often lack the infrastructure to run their own storefronts—payment processing, inventory management, customer communication, and marketing tools are expensive and fragmented. Buyers, in turn, want a trusted place to browse products from multiple vendors without juggling separate checkout flows. Vendora brings everything under one roof.

**Who it's for:**

| Role | Description |
|------|-------------|
| **Admin** | Manages the marketplace—approves sellers, moderates listings, configures platform settings, and monitors overall health and revenue. |
| **Seller** | Lists products, manages inventory and orders, communicates with buyers, tracks sales analytics, and receives payouts through Stripe Connect. |
| **Buyer** | Browses and searches products across vendors, checks out securely, tracks orders, and chats with sellers in real time when questions arise. |

---

## Key Features

### Implemented

- **Buyer marketplace** — Search, category filters, sorting, product shelves, AI-pick labels, favourites, cart, sale pricing, and per-user local persistence.
- **Authentication and roles** — Buyer, seller, and admin registration/login using JWT access tokens, refresh cookies, password reset, and role-protected APIs.
- **Admin console** — Marketplace analytics, inventory-value reporting, users and roles, buyer/seller role-change requests, listing moderation, user deletion, and product sale controls.
- **Email and in-app updates** — Branded SMTP emails for login and password flows, help requests, newsletter preferences, and product-sale alerts.
- **Delivery location** — Separate address page with manual entry, browser geolocation, OpenStreetMap/Leaflet pin selection, reverse geocoding, and saved location labels.
- **Help centre** — Dedicated help page with usage guidance and a support form delivered to the configured SMTP inbox.

### Planned

- **Stripe checkout and vendor payouts**
- **Seller inventory and order dashboard**
- **Socket.IO buyer–seller chat**
- **OpenAI-generated product descriptions and personalized recommendations**

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React, Vite, React Router, Axios, Tailwind CSS, Leaflet / OpenStreetMap |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | PostgreSQL (`pg` + SQL schema / migrate scripts) |
| **Auth** | JWT access + refresh cookies, bcrypt, role-based access (Admin / Seller / Buyer) |
| **Email** | Nodemailer + SMTP, newsletter preference and sale-alert workflows |
| **Maps** | Leaflet, React Leaflet, OpenStreetMap, Nominatim geocoding |
| **AI** | OpenAI API (planned: product descriptions and recommendations) |
| **Payments** | Stripe / Stripe Connect (planned) |
| **Real-Time** | Socket.IO (planned) |
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
├── client/                 # React frontend (Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Header, product cards, panels, map, toast, sale popup
│   │   ├── context/        # Auth and shop activity state
│   │   ├── lib/            # Product and newsletter helpers
│   │   ├── pages/          # Landing, shop, cart, help, location, auth, admin
│   │   └── services/       # Auth, admin, and role-request API clients
│   └── package.json
│
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # DB pool
│   │   ├── controllers/    # Auth, products, admin, sales, help, newsletter
│   │   ├── db/             # schema.sql, migrate, seed, queries
│   │   ├── middleware/     # JWT auth + role guards
│   │   ├── routes/         # Auth, products, admin, sales, help, newsletter
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

Each weekly entry records:

- **Week-wise tasks completed**
- **Features implemented**
- **Progress made**
- **Challenges faced and how they were solved**

### Week of July 6–12, 2026

Focus this week: auth, buyer shop experience, admin access, transactional email, favourites, and in-app notifications.

#### Week-wise tasks completed and features implemented

##### Authentication & sessions
- Buyer/seller **register** and **login** with bcrypt password hashing
- **JWT access tokens** + httpOnly **refresh cookies**, with `/auth/me`, `/auth/refresh`, and logout
- Shared **`AuthContext`** so the shop header shows the signed-in user (avatar/name) instead of Sign In / Register
- Session hydrate now **refreshes expired access tokens** (or clears a dead session) instead of leaving a stale logged-in UI
- Role guards for **admin**, **seller**, and **buyer**

##### Buyer marketplace (`/shop`)
- Buyer landing page with utility bar, branded header + logo, search, category pills, flatlay hero, and product shelves
- Products API with **pagination**, **search**, **category**, and **sort**
- Catalog seed: **~300 products** across **36 sellers**
- Header spacing polish and account menu with sign-out

##### Admin console access
- Dedicated **admin login** and **admin register** flows (`/admin/login`, `/admin/register`) with branded `AuthLayout`
- Admin registration gated by **`ADMIN_INVITE_CODE`**
- Entry points from regular login/register pages
- Lightweight **admin console** shell after successful admin sign-in

##### Email (SMTP)
- Gmail SMTP wiring via Nodemailer (`SMTP_*` env vars)
- **Successful-login email** sent to the account owner on every login
- **Forgot-password email** with a secure reset link (`/reset-password?token=…`)
- **Password-changed confirmation email** after a successful reset
- Branded HTML email templates (Vendora header, CTAs for reset / sign-in / shop)
- Forgot-password UI now shows “Check your email” instead of exposing the reset token in the browser

##### Favourites & notifications
- Heart button on product cards to save / unsave favourites (placed next to rating so it doesn’t overlap the price tag)
- Header **favourites** icon with count badge and a popup list of saved products
- Favouriting a product creates an in-app **notification** (“Added to favourites”)
- Header **bell** popup with unread badge count
- Per-notification **Mark read** / **Mark unread**, plus **Mark all read** and **Clear all**
- Favourites and notifications persist in `localStorage` (per signed-in user or guest)

#### Progress made
- Completed the core authentication lifecycle from registration through token refresh, logout, forgot password, and password reset
- Replaced the initial static marketplace concept with a database-backed catalog and reusable product API
- Established separate buyer and admin entry points with role-aware navigation
- Added the first persistent buyer engagement features through favourites and notifications
- Established a reusable SMTP foundation for later support, newsletter, and sale-alert emails

#### Challenges faced and solutions
- **Expired tokens left stale logged-in UI:** session hydration was updated to try `/auth/refresh` and clear invalid sessions when refresh fails
- **Sensitive reset information could appear in the browser:** reset tokens were moved to email links and the UI now only confirms that an email was sent
- **Header actions competed for limited space and overlapped product pricing:** spacing was refined and the favourite control was moved beside the rating
- **User activity disappeared after refresh:** favourites and notifications were stored under per-user/guest `localStorage` keys
- **Admin registration needed protection:** registration was gated behind `ADMIN_INVITE_CODE` and admin APIs were protected with role middleware

#### Still ahead
- Seller dashboard, Stripe checkout, Socket.IO chat, OpenAI descriptions/recommendations

---

### Week of July 13–19, 2026

Focus this week: shopping flow, customer support, delivery location, admin operations, role requests, sale alerts, and UI polish.

#### Week-wise tasks completed and features implemented

##### Cart and shopping feedback
- Added a persistent **shopping cart** with add-to-bag actions, quantity controls, item removal, and per-user/guest storage
- Added a header cart panel and a full **`/cart`** page
- Redesigned the cart with clearer item rows, sale savings, delivery information, a sticky order summary, and an improved empty state
- Added success toast messages when products are added to the cart or favourites
- Product cards and cart rows now display sale percentages, original prices, and discounted prices

##### Help centre and support email
- Replaced the old `mailto:` Help action with a dedicated **`/help`** page
- Added “How it works” guidance and a **Contact us** form
- Help requests are sent through the server to `SMTP_USER`, use the customer email as `replyTo`, and send a confirmation email to the customer

##### Newsletter and sale alerts
- Added newsletter subscription and Yes/No preference confirmation for regular product and discount updates
- Stored marketing preferences in `newsletter_subscribers`
- New-product and sale emails are sent only to subscribers with `marketing_opt_in = TRUE`
- Admin-applied sales trigger a branded deal email for opted-in subscribers
- Logged-in buyers who are not opted in receive an in-app sale popup instead

##### Delivery location
- Added a separate **`/delivery-location`** page
- Users can enter an address manually, find a typed address on the map, click the world map to drop a pin, or use browser geolocation
- Integrated **Leaflet**, **OpenStreetMap**, and Nominatim forward/reverse geocoding
- Delivery locations persist per user/guest, update the utility-bar label, and support edit, clear, and add-new actions

##### Admin console
- Rebuilt **`/admin`** with Analytics, Users & Roles, and Moderation sections
- Analytics now reports users, sellers, products, newsletter activity, inventory value, category value, top sellers, price bands, ratings, and low-stock products
- Admins can search users, delete accounts, and switch only **buyer ↔ seller** roles; admin roles are locked
- Added buyer/seller **role-change requests** with admin approve/reject actions
- Added listing moderation to hide, restore, or permanently delete products
- Added per-product sale controls, including sale percentage, clear-sale action, and an “On sale” filter
- Hidden products are excluded from the public catalog and AI-pick feeds

##### UI and quality improvements
- Added favourites/cart toast notifications and sale badges
- Improved desktop and mobile utility navigation for Help, delivery location, and role requests
- Added safety checks that prevent admins from changing admin roles or deleting their own account

#### Progress made
- Expanded the buyer flow from product discovery into a usable cart, delivery-location, discount, and checkout-preparation experience
- Replaced external email-client support with an in-app help workflow backed by SMTP
- Turned the admin shell into an operational console with analytics, account management, moderation, role requests, and sale controls
- Added targeted sale communication: opted-in subscribers receive email while other logged-in buyers receive an in-app popup
- Improved consistency across desktop and mobile navigation and added immediate feedback for important buyer actions

#### Challenges faced and solutions
- **Help still opened the system email client:** the `mailto:` link was removed, Help became a dedicated route, and stale-bundle behavior was verified with a hard refresh/browser check
- **Delivery labels stayed tied to an old map point:** every map selection now reverse-geocodes the new coordinates and regenerates the short label
- **Location setup needed several input methods:** manual entry, forward geocoding, map-pin selection, and browser geolocation were combined on one dedicated page
- **A second Vite process caused port confusion and Chrome frame errors:** the active process and port were verified, duplicate dev servers were identified, and the app was reopened on the correct origin
- **Role management could accidentally alter administrators:** both API and UI now lock admin roles and allow only buyer-to-seller or seller-to-buyer changes
- **Sale alerts needed different behavior by preference:** email delivery is filtered by `marketing_opt_in = TRUE`; non-opted-in logged-in buyers receive a deduplicated in-app sale popup
- **Hidden listings could still leak into buyer feeds:** public catalog and AI-pick queries now explicitly exclude moderated products

#### Still ahead
- Stripe checkout and vendor payouts
- Seller inventory/order dashboard
- Socket.IO buyer–seller chat
- OpenAI-generated descriptions and personalized recommendations

---

## License

This project is licensed under the [MIT License](LICENSE).
