# NovaCart Ecommerce Frontend

Vite + React 19 + Redux Toolkit + React Router v7 with dynamic Server-Side Rendering (SSR) for fast page loads and rich SEO on both local environments and Vercel.

---

## 🛠️ Environment Variables for Vercel

When deploying the frontend project to Vercel, configure the following Environment Variables in **Project Settings > Environment Variables**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `API_URL` | `https://backend-one-rho-24.vercel.app/api` | Used on the server by the Vercel Serverless Function (`api/ssr.js`) for server-side pre-fetching |
| `VITE_API_URL` | `https://backend-one-rho-24.vercel.app/api` | Used by the client-side React bundle in the user's browser |

*(Note: `VITE_BACKEND_URL` is also supported as an alias for backwards compatibility).*

---

## 🔒 Backend CORS Configuration

The backend CORS policy is configured in `backend/src/index.js`:
```javascript
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://aryan-ecommerce-mu.vercel.app",
];
```

> [!IMPORTANT]
> If your production frontend domain on Vercel is different from `https://aryan-ecommerce-mu.vercel.app`, set the `CLIENT_URL` environment variable on your backend Vercel deployment to match your frontend domain (e.g., `CLIENT_URL=https://your-frontend.vercel.app`).

---

## 🚀 Running Locally

### 1. Client-Only Vite Dev Server (Fast HMR)
```bash
npm run dev
```
Starts Vite at `http://localhost:5173` with instant hot-module-replacement.

### 2. Local Full SSR Development Server
```bash
npm run dev:ssr
```
Starts `node server.js` which dynamically intercepts requests and performs SSR via `vite.ssrLoadModule`.

### 3. Production Build & Local SSR Server
```bash
npm run build
npm start
```
Compiles client assets into `dist/client`, server bundle into `dist/server`, prepares `template.html`, and runs production Express server.

---

## 🌐 How SSR Works on Vercel

1. **Static Files Handled at Edge**: Static assets under `/assets/*`, icons, and images are served directly from `dist/client` by Vercel CDN.
2. **Serverless SSR Function (`api/ssr.js`)**: All page requests (`/`, `/products`, etc.) are routed to `api/ssr.js`.
3. **Data Pre-fetching (`entry-server.jsx`)**: The server performs a fast server-side fetch with a 5-second timeout, populates a fresh Redux store, and pre-renders the full component tree with `renderToString`.
4. **Cache Control**: Returns `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`, delivering instant CDN edge responses while keeping data fresh.
5. **Client Hydration**: Client bootstraps from `window.__PRELOADED_STATE__` with `hydrateRoot` without re-fetching or causing layout shifts.
