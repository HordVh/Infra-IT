# Infra IT — Frontend

Next.js 15 frontend for the Infra IT procurement and inventory management app.

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Fonts | DM Sans, DM Mono |
| API client | `lib/api.ts` (typed fetch wrapper) |

---

## Getting Started

Make sure the backend is running on `http://localhost:8000` before starting the frontend.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
frontend/
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components
├── lib/
│   └── api.ts            # Typed API client (calls backend at :8000)
├── public/               # Static assets
├── package.json
└── tailwind.config.ts
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Backend Connection

All API calls go through `lib/api.ts`, which targets `http://localhost:8000` by default. To change the backend URL, update the base URL constant in that file.
