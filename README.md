# Koinonia YW Platform

Enterprise SMS communication platform for churches with 100-250 members across 3-10 physical locations.

## 📋 Project Status

**Phase:** Checkpoint 1 - Foundation Setup (Days 1-2)

## 🏗️ Architecture

### Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache/Queue:** Redis + Bull
- **Services:**
  - **SMS:** Twilio
  - **Payments:** Stripe
  - **Analytics:** PostHog
  - **Email:** SendGrid

### Project Structure

```
/root
├── /backend       # Node.js + Express API
│   ├── /prisma    # Database schema & migrations
│   ├── /src
│   │   ├── /api           # Routes & controllers
│   │   ├── /services      # Business logic
│   │   ├── /jobs          # Background tasks (Bull)
│   │   ├── /middleware    # Express middleware
│   │   ├── /utils         # Utility functions
│   │   ├── /config        # Configuration
│   │   ├── app.ts         # Express app
│   │   └── index.ts       # Server entry
│   └── package.json
├── /frontend      # React + Vite app
│   ├── /src
│   │   ├── /pages         # Route pages
│   │   ├── /components    # Reusable components
│   │   ├── /stores        # Zustand state
│   │   ├── /hooks         # Custom React hooks
│   │   ├── /api           # Axios client
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   └── package.json
└── package.json   # Root workspaces config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose (for PostgreSQL + Redis)
- Git

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repo-url>
cd YWMESSAGING
npm install
```

2. **Set up environment:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. **Start Docker services (PostgreSQL + Redis):**

```bash
docker-compose up -d
```

4. **Set up database:**

```bash
cd backend
npx prisma migrate dev --name initial_schema
npx prisma studio  # View database
cd ..
```

5. **Start development servers:**

```bash
# Terminal 1: Backend
npm run dev --workspace=backend

# Terminal 2: Frontend
npm run dev --workspace=frontend
```

**Backend:** http://localhost:3000
**Frontend:** http://localhost:5173

## 🔧 Configuration

### Environment Variables

See `.env.example` files in `backend/` and `frontend/` for required variables.

Key services to configure:
- **PostgreSQL:** Update `DATABASE_URL`
- **Redis:** Update `REDIS_URL`
- **Twilio:** Add account SID and auth token (test credentials)
- **Stripe:** Add test API keys
- **SendGrid:** Add API key for email
- **PostHog:** Add project key for analytics

## 📝 Development

### Running Tests

```bash
npm run test --workspaces
```

### Linting & Formatting

```bash
npm run lint --workspaces
npm run format --workspaces
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database
npx prisma studio

# Seed database (after migrations implemented)
npx prisma db seed
```

## 📚 API Documentation

Once backend is running, health check endpoint:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📦 Deployment

**Backend:** Railway
**Frontend:** Vercel
**Database:** Railway PostgreSQL

See `projectplan.md` Checkpoint 10 for detailed deployment steps.

## 📖 Documentation

- **Project Plan:** `projectplan.md` - 4-week roadmap with detailed checkpoints
- **Development Guide:** `CLAUDE.md` - Development philosophy and rules
- **Getting Started:** `README-START-HERE.md`

## 🔄 Git Workflow

```bash
# After each checkpoint
git add .
git commit -m "Checkpoint N: Feature description"
git push
```

## 🤝 Support

For issues or questions, refer to:
- Project plan: `projectplan.md`
- Task list: `tasks/todo.md`
- Code comments and docstrings

## 📞 Contact

Support email: support@connect-yw.com

---

**Next Step:** Complete Checkpoint 1 (Foundation Setup) - See `tasks/todo.md`