# Contributing to Noxello

Thanks for your interest in contributing.

## Quick Start
1. Fork the repo and clone your fork.
2. Create a feature branch from `main`.
3. Install deps and run locally:

Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Project Structure
- `backend/` Express + Prisma API
- `frontend/` React + Vite app

## Development Guidelines
- Keep changes scoped and easy to review.
- Prefer small, focused commits.
- Match existing patterns and styling.
- Update README or docs when behavior changes.
- For frontend UI changes, check desktop and mobile.

## Tests
There is no automated test suite yet. Please do manual checks:
- Auth flow (register/login)
- Boards list
- Board detail with lists and cards
- Card modal (details, labels, checklist, comments)

## Submitting Changes
1. Push your branch.
2. Open a pull request.
3. Include a short summary and manual test notes.

## Reporting Issues
Provide:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if UI-related
- Console or network errors if available
