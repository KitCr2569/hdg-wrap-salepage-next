# HDG Wrap SalePage - Facebook Integration

Production-ready Next.js 14 application for **hdgwrapskin.com** with dual Facebook App architecture:

- **App A (Flow App):** Facebook Login with NextAuth (public_profile + email)
- **App B (HDG Messenger Bot):** Messenger Platform for automated order notifications via PSID

## Features

- Facebook Login authentication
- Order creation system
- Messenger PSID mapping via m.me referral links
- Automated order confirmations via Facebook Messenger
- SQLite database with Prisma ORM

## Setup

1. Clone and install:
```bash
git clone https://github.com/KitCr2569/hdg-wrap-salepage.git
cd hdg-wrap-salepage
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials.

3. Push database schema:
```bash
npx prisma db push
```

4. Run:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for required variables.
