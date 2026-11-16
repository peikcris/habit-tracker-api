# Habit Tracker API

REST API for tracking daily habits, built with Node.js, Express, and SQLite.
Users register, log in with JWT authentication, and manage their own habits.

## Features
- User registration and login (bcrypt password hashing, JWT)
- Habits CRUD, scoped to the logged-in user
- Mark habits as done per day, with undo
- Input validation and proper HTTP status codes

## Tech stack
Node.js, Express, SQLite (better-sqlite3), JSON Web Tokens, bcryptjs

## Getting started
```bash
git clone https://github.com/peikcris/habit-tracker-api.git
cd habit-tracker-api
npm install
cp .env.example .env   # then set JWT_SECRET
npm run dev
```

## API endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create an account |
| POST | /api/auth/login | No | Log in, returns a token |
| GET | /api/habits | Yes | List your habits |
| POST | /api/habits | Yes | Create a habit |
| PUT | /api/habits/:id | Yes | Rename a habit |
| DELETE | /api/habits/:id | Yes | Delete a habit |
| POST | /api/habits/:id/complete | Yes | Mark done (optional `date`) |
| DELETE | /api/habits/:id/complete/:date | Yes | Undo a completion |
| GET | /api/habits/:id/completions | Yes | List completion dates |

Protected routes need the header `Authorization: Bearer <token>`.
