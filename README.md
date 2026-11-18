# Habit Tracker API

REST API for tracking daily habits, built with Node.js, Express, and SQLite.
Users register, log in with JWT authentication, and manage their own habits and streaks.

**Live API:** https://habit-tracker-api-wsxw.onrender.com/api/health
**Frontend:** https://github.com/peikcris/habit-tracker-web
**Live demo:** https://habit-tracker-web-red.vercel.app

> The demo runs on free hosting. The first request can take up to a minute while the server wakes up, and the database may reset when the server restarts.

## Features
- User registration and login (bcrypt password hashing, JWT)
- Habits CRUD, scoped to the logged-in user
- Mark habits as done per day, with undo
- Streak calculation for consecutive days
- Input validation and proper HTTP status codes

## Tech stack
Node.js, Express, SQLite (better-sqlite3), JSON Web Tokens, bcryptjs

## Run locally
```bash
git clone https://github.com/peikcris/habit-tracker-api.git
cd habit-tracker-api
npm install
```

Create a `.env` file (see `.env.example`):
```
PORT=3000
JWT_SECRET=your-long-random-secret
```

Then start the server:
```bash
npm run dev
```

## API endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/register | No | Create an account |
| POST | /api/auth/login | No | Log in, returns a token |
| GET | /api/habits?date=YYYY-MM-DD | Yes | List your habits with `completed_today` and `streak` |
| POST | /api/habits | Yes | Create a habit |
| PUT | /api/habits/:id | Yes | Rename a habit |
| DELETE | /api/habits/:id | Yes | Delete a habit |
| POST | /api/habits/:id/complete | Yes | Mark done (optional `date`) |
| DELETE | /api/habits/:id/complete/:date | Yes | Undo a completion |
| GET | /api/habits/:id/completions | Yes | List completion dates |

Protected routes need the header `Authorization: Bearer <token>`.

### Example
```bash
curl -X POST https://habit-tracker-api-wsxw.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123"}'
```

## Project structure
```
src/
├── app.js                # Express app and routes setup
├── server.js             # server entry point
├── db.js                 # SQLite connection and schema
├── middleware/auth.js    # JWT verification
└── routes/
    ├── auth.js           # register and login
    └── habits.js         # habits, completions, streaks
```

## Design notes
- Every habit query is filtered by the logged-in user's id, so users can't see each other's data.
- Passwords are hashed with bcrypt and never returned by the API.
- Login returns the same error for a wrong email or a wrong password, so it can't be used to find registered emails.
- Deployed on Render's free tier, which uses temporary storage. A production version would use a hosted database such as PostgreSQL.
