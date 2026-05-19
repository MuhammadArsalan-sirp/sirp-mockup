# SIRP — OmniSense incident workspace mockup

Interactive Vite + React mockup of the SIRP OmniSense incident detail workspace
and surrounding shells (dashboard, incidents list, threat intel, entities,
autonomy, administration). Used for design review and stakeholder demos.

## Run locally

```bash
nvm use 20           # Node 20+ required
npm install
npm run dev          # http://localhost:5173
```

## Build

```bash
npm run build        # outputs to ./dist
npm run preview      # serve the production build locally
npm run typecheck    # standalone TS check (not part of build)
```

## Stack

- Vite 7 · React 19 · TypeScript 5
- Tailwind v4 · shadcn/ui (Radix primitives)
- Recharts · Lucide icons · React Router
- TanStack Query / Table

## Deployment

Vercel. SPA rewrites are configured in [`vercel.json`](./vercel.json) so deep
links (`/incidents/INC-…`) survive a hard refresh.
