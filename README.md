# HNexus

HNexus is a MERN-style Hacker News scraper app. The backend scrapes the latest Hacker News front-page stories, stores them in MongoDB, exposes story/auth/bookmark APIs, and the frontend lets users browse, paginate, authenticate, and persist bookmarks.

## Features

- Scrapes valid Hacker News stories from `https://news.ycombinator.com/`
- Stores title, URL, points, author, and posted time in MongoDB
- Displays 10 stories per page with server-side pagination
- Runs scraper automatically on backend startup
- Supports manual scraping with `POST /api/scrape`
- JWT authentication with register and login
- Paginated story feed sorted by points descending
- Protected bookmarks page
- Persistent bookmarks stored through the backend
- Authentication state managed with React Context API

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, Cheerio, Axios, JWT
- Frontend: React, TypeScript, Vite, Tailwind CSS, Axios, React Router

## Environment Variables

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hnexus
JWT_SECRET=replace_with_a_long_random_secret
HN_BASE_URL=https://news.ycombinator.com/
HN_SCRAPE_LIMIT=30
HN_REQUEST_TIMEOUT_MS=10000
HN_USER_AGENT=Mozilla/5.0
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Safe examples are included in `backend/.env.example` and `frontend/.env.example`.

## Run Locally

Install backend dependencies:

```bash
cd backend
npm install
npm run dev
```

Install frontend dependencies in another terminal:

```bash
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:4000` by default, and the frontend runs on the Vite URL printed in the terminal.

## API Routes

### Scraper

- `POST /api/scrape` - manually trigger Hacker News scraping

### Auth

- `POST /api/auth/register` - register a user
- `POST /api/auth/login` - login a user

### Stories

- `GET /api/stories?page=1&limit=10` - fetch active scraped stories sorted by points descending
- `GET /api/stories/:id` - fetch one story
- `POST /api/stories/:id/bookmark` - toggle bookmark, requires `Authorization: Bearer <token>`
- `GET /api/stories/bookmarks` - fetch authenticated user's bookmarked stories

## Notes

The scraper keeps the current valid Hacker News stories active for the main feed. `HN_SCRAPE_LIMIT=30` makes pagination visible with a 10-story page size. Set `HN_SCRAPE_LIMIT=10` if you want strict top-10 assignment mode. Older stories are cleaned up unless they are bookmarked, so bookmark records remain accurate and persistent.
