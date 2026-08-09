# Goldan Wings UI

Frontend application for the **Goldan Wings** cake ordering platform, built with **Angular 17**.  
The app supports customer ordering flows, custom cake requests, add-on treats, cart and checkout, plus an admin panel for operational tasks.

## Features

- Responsive customer experience with hero, catalog, and modal-based flows
- User signup/login with token-based request interceptor
- Cake browsing and cart management (quantity updates, totals, checkout)
- Custom cake ordering with image upload support
- Add-on treats and combo selection
- Admin login and guarded admin dashboard
- Admin actions for:
  - Viewing popular orders and custom cake orders
  - Adding cakes
  - Adding custom cakes
  - Adding treat items
- Angular SSR support with Express server entry

## Tech Stack

- Angular 17 (standalone components)
- TypeScript
- RxJS
- Angular Router + Route Guard
- Angular HTTP Interceptor
- Express (SSR runtime)
- Node upload utility server (Express + Multer)

## Project Structure

```text
src/
  app/
    Components/      # UI modules (About, Header, Admin, Cart, Customize, etc.)
    Services/        # API and state services (auth, cakes, orders, cart, custom cake)
    Guards/          # Route guards (admin access)
    Interceptors/    # HTTP interceptors (auth token)
    Interfaces/      # Shared TS interfaces
```

## Prerequisites

- Node.js 18+
- npm 9+
- Running backend APIs (see **Backend Integration**)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Angular app:

   ```bash
   npm start
   ```

3. Open:
   - `http://localhost:4200`

## Available Scripts

- `npm start` — run Angular development server
- `npm run build` — production build
- `npm run watch` — development build in watch mode
- `npm test` — run unit tests (Karma)
- `npm run serve:ssr:Goldan_Wings` — serve SSR build output
- `npm run start:upload-server` — start local image upload server on `http://localhost:3000`

## Backend Integration

This UI depends on local backend services. Current service configuration includes:

- `https://localhost:7196` (auth, orders, treats, custom cake APIs)
- `http://localhost:5003` (cake APIs)
- `http://localhost:3000/upload` (local file upload helper)

If you face browser CORS errors, follow the setup in:

- `BACKEND_CORS_SETUP.md`

## Notes

- API base URLs are currently hardcoded in Angular services.
- Admin session token is kept in memory for the active browser session.
- Uploaded files are written under `src/assets/...` through `upload-server.js`.

## Build Output

Build artifacts are generated under:

- `dist/goldan-wings`

## License

This repository currently does not declare a license file.
