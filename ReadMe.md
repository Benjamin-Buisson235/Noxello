# MiniTrello

MiniTrello is a simplified version of Trello, built solo by me, Benjamin B, for an Epitech project.  
The goal: organize work as **boards**, **columns** (lists) and **cards**, with a clean split between frontend and backend.

---

## Project Goal

Recreate the core principles of Trello:

- Manage **project boards**
- Organize boards into **columns** (lists)
- Add **cards** inside columns
- Move cards between columns
- Secure everything with **user authentication**
- Modern front + back architecture

Drag & drop is not implemented yet, but the data model and API are ready for it.

---

## Architecture Overview

The project is split into two parts:

- `backend/`: REST API (auth + boards + lists + cards)
- `frontend/`: React application (UI, navigation, API calls)

### Backend

Technologies:

- **Node.js**, **TypeScript**
- **Express** (REST routes)
- **Prisma** (ORM)
- **SQLite** (dev database)
- **JWT** for authentication

Key models:

- `User`  
  `id`, `email`, `passwordHash`, `name`, `createdAt`  
  → owns many `Board`
- `Board`  
  `id`, `title`, `position`, `createdAt`, `ownerId`
- `List` (column)  
  `id`, `title`, `position`, `boardId`
- `Card`  
  `id`, `title`, `position`, `listId`

Main routes:

**Auth**

- `POST /auth/register` – create an account
- `POST /auth/login` – log in
- `GET /auth/me` – return current user
- `PUT /auth/me` – update profile (name)

**Boards**

- `GET /boards` – list boards for the logged-in user
- `POST /boards` – create a new board
- `GET /boards/:id` – get a single board
- `GET /boards/:id/full` – get a board with its lists + cards (ordered by position)
- `PUT /boards/:id` – rename a board
- `DELETE /boards/:id` – delete a board

**Lists (columns)**

- `GET /boards/:id/lists` – list columns of a board
- `POST /boards/:id/lists` – create a column in a board
- `PATCH /boards/:id/lists/reorder` – reorder columns in a board
- `PUT /boards/:boardId/lists/:listId` – rename a column
- `DELETE /boards/:boardId/lists/:listId` – delete a column

**Cards**

- `GET /boards/:boardId/lists/:listId/cards` – list cards in a column
- `POST /boards/:boardId/lists/:listId/cards` – create a card
- `PATCH /boards/:boardId/lists/:listId/cards/reorder` – reorder cards in a column
- `PUT /boards/:boardId/lists/:listId/cards/:cardId/move` – move a card to another column
- `DELETE /boards/:boardId/lists/:listId/cards/:cardId` – delete a card

All board/list/card routes are protected by a `requireAuth` middleware that checks the JWT sent in `Authorization: Bearer <token>`.

---

### Frontend

Technologies:

- **React** + **TypeScript**
- **Vite**
- **Axios** (API calls)
- **React Router** (routing)

Pages:

- `/login` – sign in
- `/register` – create an account
- `/boards` – list and manage boards
- `/boards/:id` – board detail (columns + cards)
- `/settings` – account settings (profile information coming from `/auth/me`)

The JWT token is stored in `localStorage` after login/register and automatically injected into API calls via an Axios instance (`api.ts`) that sets the `Authorization` header.

---

## Current Features

### Authentication

- Account creation (`/register`) with:
  - email
  - password (hashed on the backend)
  - name (optional)
- Login (`/login`)
- JWT generated on sign up / sign in
- Token stored on the frontend and sent automatically to the API
- Automatic redirection to `/login` if the user is not authenticated
- `/settings` page:
  - fetches the current user (`/auth/me`)
  - allows updating the profile name

### Boards

- Create a board with a title from `/boards`
- List boards belonging to the logged-in user
- Each board is displayed as a card with:
  - title
  - position
  - creation date
  - **Rename** and **Delete** actions
- Navigate to a board detail page `/boards/:id`

### Columns (Lists)

On the board detail page:

- Create new columns with a title
- Columns are ordered by `position`
- Each column card shows:
  - title
  - position
  - creation date
  - **Rename** and **Delete** actions
- Deleting a column is confirmed with a custom in-app modal (not the browser alert)

### Cards

Inside each column:

- Add cards using a “+ Add a card” area
  - pressing **Enter** creates the card
- Cards are displayed as small blocks inside the column
- Each card has:
  - its title
  - a **Move left** / **Move right** button to send it to the previous/next column
  - a **Move to list** dropdown to send it to any column
  - **Move up** / **Move down** buttons to reorder within a column
  - a **Delete** button
- Deleting a card also uses a custom confirmation modal

Card movement is not drag & drop yet, but the move API and left/right behaviour are in place and persist to the database.
Column and card reordering are supported via explicit reorder endpoints.

### Interface / UX

- Custom **dark violet** theme with gradients
- Centered forms, rounded cards, consistent spacing
- Board view and board detail view styled with the same visual identity
- Custom confirmation modals for destructive actions:
  - delete board
  - delete column
  - delete card

---

## Roadmap (next steps)

Possible future improvements to get closer to full Trello:

1. **Drag & drop**
   - True drag & drop for cards between columns
   - Drag & drop to reorder cards inside a column
   - Drag & drop to reorder columns inside a board

2. **Richer cards**
   - Description, due date, labels, checklists
   - Card detail modal

3. **Board collaboration**
   - Invite other users to a board
   - Basic permissions (owner / member)

4. **Quality of life**
   - Global loading & error handling
   - Search/filter cards
   - Better responsive design (mobile view)

---

## Run the project locally

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

- The backend runs on `http://localhost:4000`
- For Postgres, set `DATABASE_URL` to your connection string (see `backend/.env.example`)
- The `.env` file should contain at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
JWT_SECRET="change-me-to-a-longer-secret"
PORT=4000
```

- For production deployments, use:

```bash
npx prisma migrate deploy
```

- On Render, set the Pre-Deploy Command to:

```bash
npx prisma migrate deploy
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- The frontend runs on `http://localhost:5173`
- Axios configuration uses `VITE_API_URL` when defined, otherwise defaults to `http://localhost:4000`
  - See `frontend/.env.example` for the expected env var name

---

## Repository Structure (simplified)

```text
backend/
  src/
    index.ts           Express entrypoint, routes mounted ```
    authRoutes.ts      /auth (register, login, /me)
    boardRoutes.ts     /boards + lists + cards (CRUD + move)
    authMiddleware.ts  requireAuth (JWT)
    prisma.ts          Prisma client
  prisma/
    schema.prisma      User, Board, List, Card models
  .env                 Local environment variables (not committed)
  package.json

frontend/
  src/
    main.tsx           Main router
    api.ts             Axios instance + JWT injection
    pages/
      LoginPage.tsx
      RegisterPage.tsx
      BoardsPage.tsx       Boards dashboard
      BoardDetailPage.tsx  Columns + cards + move/delete
      SettingsPage.tsx     User profile (/auth/me)
    index.css          Global styles, dark violet theme
    App.css            Layout & common components styling
  public/              Vite static assets (favicon, etc.)
  package.json
```
