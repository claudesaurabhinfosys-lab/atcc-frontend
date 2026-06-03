# ATCC Risk Management — Frontend

Next.js 14 frontend for the ATCC Road Transport Risk Management Platform.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS + shadcn/ui** — white-label themeable UI
- **NextAuth.js** — authentication (JWT via Laravel Sanctum)
- **React Hook Form + Zod** — form validation
- **Zustand** — assessment wizard state
- **Recharts** — risk dashboards
- **Axios** — API calls

## Requirements
- Node.js >= 18

## Setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your Laravel backend URL
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Key Pages

| Route | Description |
|---|---|
| `/login` | Login page |
| `/dashboard` | Overview stats, risk chart, recent assessments |
| `/assessments` | List all assessments |
| `/assessments/new` | 7-step assessment wizard |
| `/assessments/[id]` | Assessment detail view |
| `/risk-register` | Company risk register |
| `/reports` | Generate and download PDF reports |
| `/admin/users` | User management (Company Admin+) |
| `/admin/company` | Company settings and branding |

## Multi-tenant White-label

Company branding (logo, colours) is loaded from the API on login and applied via CSS variables, supporting unlimited white-label tenants from a single deployment.
