# Vendora Client

The React/Vite frontend for Vendora, an AI-powered multi-vendor marketplace.

## Current pages

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page and newsletter signup |
| `/shop` | Buyer marketplace with search, filters, favourites, cart, and sale alerts |
| `/cart` | Full shopping bag and order summary |
| `/delivery-location` | Manual address and OpenStreetMap location picker |
| `/help` | Help guide and contact form |
| `/role-request` | Buyer/seller role-change request |
| `/login`, `/register` | Buyer and seller authentication |
| `/admin` | Admin analytics, users/roles, moderation, and sale controls |

## Main frontend features

- JWT session hydration through `AuthContext`
- Per-user/guest favourites, notifications, cart, and delivery location through `ShopActivityContext`
- Product search, category filtering, sorting, pagination, AI-pick shelves, and sale pricing
- Header panels for notifications, favourites, and the shopping bag
- Toast feedback for cart and favourite actions
- Sale popup for logged-in buyers who do not receive sale-alert emails
- Leaflet/OpenStreetMap location selection and geocoding
- Responsive desktop and mobile navigation

## Progress reporting

The repository-level [Weekly Progress](../README.md#weekly-progress) log records:

- Week-wise tasks completed
- Features implemented
- Progress made
- Challenges faced and how they were solved

## Local development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the Express server on port `4000`.

Useful commands:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

See the repository [README](../README.md) for full setup, environment variables, database commands, and weekly progress.
