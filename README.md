Football Analytics System (Futballmeccsek Adatbázis)

Overview
- Modern football (soccer) analytics and prediction web application
- Tech stack: Next.js 15 + React 19 + TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL), optional PHP ML scripts
- Status: Alpha. Fully functional in Offline Demo Mode. Online mode requires Supabase configuration.

Key Features
- Match search and filtering (home/away or generic team search)
- Basic and advanced statistics (BTTS, averages, form, head-to-head)
- Legend Mode: enhanced analytics and predictions UI
- CSV import pipeline and SQL migrations for Supabase
- Responsive UI, dark/light theme ready
- Offline Demo Mode when Supabase is not configured

Architecture
- Next.js App Router under /app
- Reusable UI components under /components and /components/ui (shadcn/ui)
- Data layer under /lib with:
  - supabase.ts: client and TS types
  - matches.ts: data access with automatic offline fallback
  - football-statistics.ts: analytics and prediction helpers
  - real-matches-data.ts: additional data helpers for live data
  - offline-data.ts: curated demo dataset and filters
- Database migrations and data tools under /scripts and /migrations
- PHP feature extraction and modeling scripts in /lib/*.php (optional)

Quick Start
1) Install dependencies
- pnpm i  (or npm i)

2) Environment setup
- Copy .env.example to .env.local and fill Supabase credentials
- If you do not have Supabase yet, you can still use Offline Demo Mode; skip env setup for now

3) Run the app
- pnpm dev  (or npm run dev)
- Open http://localhost:3000

Offline Demo Mode (no Supabase required)
- The app will function without a database using a small curated offline dataset
- You can search teams, view results, and see statistics and predictions based on the offline matches
- This mode is automatically enabled when NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing

Online Mode (Supabase)
1) Create a Supabase project and obtain:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- Optional: SUPABASE_SERVICE_ROLE_KEY (for scripts only)

2) Configure environment
- Create .env.local (Next.js) using .env.example as a template

3) Create schema and tables
- The /scripts folder contains SQL to set up required tables and helper functions
- Recommended order:
  - scripts/01-create-matches-table.sql
  - scripts/02-create-helper-functions.sql
  - scripts/03-fix-column-names.sql
  - scripts/04-create-predictions-table.sql
  - migrations/001_create_predictions_and_indexes.sql
  - migrations/002_legend_mode_deployment.sql
  - migrations/003_legend_mode_monitoring.sql
  - migrations/004_enterprise_production_ready.sql
- Run these in the Supabase SQL editor or via psql

4) Import data from CSV (optional)
- Place your cleaned CSV at ./data/football_matches_cleaned.csv
- Run: node scripts/import-csv-data.js
- Batch import with validation and per-record fallback is supported

Data Access Layer
- lib/supabase.ts
  - Safe client creation; exports isSupabaseConfigured()
  - Types: Match, FormattedMatch, PredictionData
- lib/matches.ts
  - getAllMatches, searchMatches, searchMatchesByTeam, getTeamNames, getTeamStatistics
  - Security: input sanitized for ILIKE queries (escapes % and _)
  - Offline fallback for all read operations when Supabase is not configured
- lib/football-statistics.ts
  - Core analytics used by the UI cards (BTTS, averages, form, H2H, simple predictions)

Security & Hardening
- Input sanitization for database searches to mitigate LIKE-based injection
- Do not expose SUPABASE_SERVICE_ROLE_KEY to the browser; use only in server-side scripts
- Enable Row Level Security (RLS) and policies in Supabase for production
- Consider rate limiting and logging via middleware in production

Testing
- Unit: vitest (npm run test:unit)
- Integration and E2E placeholders are configured but not yet implemented

Deployment
- Vercel recommended for Next.js
- Required env vars on Vercel:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- Optional build settings:
  - NEXT_TELEMETRY_DISABLED=1
- After successful deploy, the app automatically uses Online Mode if env vars are present; otherwise falls back to Offline Demo Mode

Troubleshooting
- Supabase error: Ensure environment variables are set on both local and server environments
- Table not found: Execute SQL in /scripts and /migrations to provision schema
- CSV import fails: Run scripts/clean-csv-data.js first and verify headers with scripts/debug-csv-headers.js

Repository Guide
- docs/DEVELOPMENT_STATUS.md: current capabilities and open gaps
- docs/DEVELOPMENT_PLAN.md: production readiness roadmap
- docs/KNOWN_ISSUES.md: risk register and remediation plan

What’s New in This Iteration
- Safe Supabase client creation to prevent runtime crashes without env configuration
- Robust Offline Demo Mode with curated dataset and seamless fallback in lib/matches.ts
- LIKE/ILIKE input sanitization to mitigate wildcard injection in search queries
- Comprehensive documentation overhaul (this README + .env.example)

License
- This project is provided as-is for demonstration and development purposes.
