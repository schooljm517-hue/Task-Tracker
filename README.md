# Task Tracker

A full-stack task management application with user authentication, categories, tasks, search, filtering, and pagination.

## Features
- Register and login with JWT authentication
- Create and view categories
- Create, view, update, delete, search, filter, and paginate tasks
- Tasks are scoped to the authenticated user only

## Tech Stack
- Frontend: React 19, Vite, React Router, Axios
- Backend: Node.js, Express.js, Sequelize, MySQL, JWT, bcrypt, dotenv, cors

## Installation

### Backend
```bash
cd backend
npm install
cp .env.example .env
```

Update the environment variables in the backend .env file.

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
```

## Environment Variables

Backend:
- PORT
- NODE_ENV
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- JWT_SECRET
- CLIENT_URL

Frontend:
- VITE_API_URL

## Database Setup
Create a MySQL database and configure the credentials in the backend .env file.

## Running Locally
```bash
cd backend
npm run dev
```

In a second terminal:
```bash
cd frontend
npm run dev
```

## Deployment
- Frontend: Vercel
- Backend + Database: Railway

## API Endpoints
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/categories
- POST /api/categories
- GET /api/tasks
- GET /api/tasks/:id
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

## Folder Structure
- backend/config
- backend/controllers
- backend/middlewares
- backend/models
- backend/routes
- backend/seeders
- frontend/src/components
- frontend/src/pages
- frontend/src/layouts
- frontend/src/services
- frontend/src/context
