# VEHIX frontend

React and Vite client for the VEHIX vehicle-rental management system.

## Run locally

```sh
npm install
npm run dev
```

The frontend expects the Spring Boot API at `http://localhost:8080/api`. Start the backend and MySQL database before using login, registration, bookings, or dashboards.

## Source structure

- `src/App.jsx` — application shell and route configuration
- `src/pages/` — route-level screens for fleet, booking, account, and dashboards
- `src/components/` — shared layout, access guard, vehicle card, and notice components
- `src/services/` — configured HTTP API client
- `src/data/` — shared display data and formatting
- `src/hooks/` — reusable frontend data hooks
- `src/App.css`, `src/index.css` — application and global styling

## Checks

```sh
npm run lint
npm run build
```
