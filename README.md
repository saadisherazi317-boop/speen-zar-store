# SPEEN ZAR — Real Backend Starter

This version moves products out of browser localStorage and into a SQLite database, with server-side admin authentication and real image uploads.

## Run
1. Install Node.js 20+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD` and `SESSION_SECRET`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Admin
Click ADMIN LOGIN in the footer. Credentials come from `.env`.

## Important for going live
This starter is ready for deployment, but before a public launch you should use HTTPS, a production session store, a managed database/cloud storage, backups, rate limiting/CSRF protection, and a real payment/order provider. Do not publish the demo password.
