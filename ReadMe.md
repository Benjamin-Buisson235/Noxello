# Noxello
by Benjamin "Nox" B.

**Live:** https://noxello.nox-news.com

Noxello is a Trello-inspired project management app built as a full-stack solo project. It focuses on clear structure, fast workflows, and a clean UX for boards, lists, and cards.

**Overview**
- Create boards, lists, and cards
- Drag and drop cards across lists
- Rich card details (description, due date, labels, checklist, comments)
- Archive and restore cards
- Board collaboration with invites and members
- JWT authentication

**Tech Stack**
- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL
- Frontend: React, TypeScript, Vite, React Router
- Auth: JWT (Bearer token)

**Key Features**
- Authentication: register, login, profile update
- Boards: create, rename, delete, shared access
- Lists: create, rename, delete, reorder
- Cards: create, edit, delete, reorder, drag and drop
- Card details: description, due date (custom picker), labels, checklist, comments
- Labels: create, assign, delete
- Archive: archive/unarchive cards, dedicated archived section
- Search and filters: title/description, due date, labels
- Invites: invite members, accept/decline, remove members

**API Endpoints (core)**
Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/me`

Boards
- `GET /boards`
- `POST /boards`
- `GET /boards/:id`
- `GET /boards/:id/full`
- `PUT /boards/:id`
- `DELETE /boards/:id`

Lists
- `GET /boards/:id/lists`
- `POST /boards/:id/lists`
- `PATCH /boards/:id/lists/reorder`
- `PUT /boards/:boardId/lists/:listId`
- `DELETE /boards/:boardId/lists/:listId`

Cards
- `GET /boards/:boardId/lists/:listId/cards`
- `POST /boards/:boardId/lists/:listId/cards`
- `PATCH /boards/:boardId/lists/:listId/cards/:cardId`
- `PATCH /boards/:boardId/lists/:listId/cards/reorder`
- `PUT /boards/:boardId/lists/:listId/cards/:cardId/move`
- `PUT /boards/:boardId/lists/:listId/cards/:cardId/move-to-list`
- `PATCH /boards/:boardId/lists/:listId/cards/:cardId/archive`
- `PATCH /boards/:boardId/lists/:listId/cards/:cardId/unarchive`
- `DELETE /boards/:boardId/lists/:listId/cards/:cardId`

Labels
- `GET /boards/:boardId/labels`
- `POST /boards/:boardId/labels`
- `PUT /boards/:boardId/lists/:listId/cards/:cardId/labels`
- `DELETE /boards/:boardId/labels/:labelId`

Checklists
- `GET /boards/:boardId/lists/:listId/cards/:cardId/checklist`
- `POST /boards/:boardId/lists/:listId/cards/:cardId/checklist`
- `PATCH /boards/:boardId/lists/:listId/cards/:cardId/checklist/:itemId`
- `DELETE /boards/:boardId/lists/:listId/cards/:cardId/checklist/:itemId`
- `PATCH /boards/:boardId/lists/:listId/cards/:cardId/checklist/reorder`

Comments
- `GET /boards/:boardId/lists/:listId/cards/:cardId/comments`
- `POST /boards/:boardId/lists/:listId/cards/:cardId/comments`
- `DELETE /boards/:boardId/lists/:listId/cards/:cardId/comments/:commentId`

Members + Invites
- `GET /boards/:id/members`
- `POST /boards/:id/invite`
- `DELETE /boards/:id/members/:userId`
- `GET /boards/:id/invites`
- `POST /boards/:id/invites/accept`
- `POST /boards/:id/invites/decline`

**Repository Structure**
```text
backend/
  prisma/
    schema.prisma
  src/
    index.ts
    prisma.ts
    authMiddleware.ts
    authRoutes.ts
    boardRoutes.ts
    routes/
      boards/
        boards.ts
        lists.ts
        cards.ts
        checklists.ts
        comments.ts
        labels.ts
        members.ts
        invites.ts
        archive.ts
        utils.ts
frontend/
  src/
    api.ts
    main.tsx
    index.css
    components/
      ConfirmDialog.tsx
      PromptDialog.tsx
    hooks/
      useAuthUser.ts
    pages/
      LoginPage.tsx
      RegisterPage.tsx
      BoardsPage.tsx
      BoardDetailPage.tsx
      SettingsPage.tsx
      boards/
        components/
        hooks/
      board-detail/
        components/
        hooks/
        utils.ts
```

**Local Development**
1. Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Environment Variables**
Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
JWT_SECRET="change-me"
PORT=4000
FRONTEND_ORIGIN="http://localhost:5173"
```

Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:4000
```

**Production Deployment**
Backend (Render)
- Build: `npm run build`
- Start: `npm run start`
- Migrations: `npx prisma migrate deploy`

Frontend (Vercel)
- Set `VITE_API_URL` to your backend URL
- Vite env vars must be prefixed with `VITE_`

**Scripts**
Backend
```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate:deploy
```

Frontend
```bash
npm run dev
npm run build
npm run preview
```

**Notes**
- API uses `Authorization: Bearer <token>` for protected routes.
- Drag-and-drop is powered by `@dnd-kit`.
- UI uses custom modal components for confirmations and prompts.
