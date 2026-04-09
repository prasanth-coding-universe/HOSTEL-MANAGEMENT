# Hostel Management System

Full-stack Hostel Management System built with:

- React frontend
- Node.js + Express backend
- MySQL database

## Project Structure

- `frontend/` - React application
- `backend/` - Express API with MySQL integration
- `backend/sql/schema.sql` - Database schema
- `backend/sql/sample-data.sql` - Sample hostel data

## Features

- Login and signup for admin/reception access
- Dashboard with summary cards
- Students page with add, edit, search, sort, and delete
- Rooms page with add, edit, search, filters, occupancy badges, and warden assignment
- Wardens page with add, edit, search, sort, list, and delete
- Room-to-warden assignment support for hostel supervision
- Allocation page with student-room assignment dropdowns and searchable records
- Axios-based frontend API integration
- Environment-variable-based backend database connection

## Backend Setup

1. Open MySQL and create the database/tables:
   - Run `backend/sql/schema.sql`
2. Insert sample records:
   - Run `backend/sql/sample-data.sql`
3. Configure backend environment:
   - Copy `backend/.env.example` to `backend/.env`
4. Install backend packages:
   - `cd backend`
   - `npm install`
5. Start backend:
   - `npm run dev`

## Frontend Setup

1. Configure frontend environment:
   - Copy `frontend/.env.example` to `frontend/.env`
2. Install frontend packages:
   - `cd frontend`
   - `npm install`
3. Start frontend:
   - `npm start`

## Default URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API Base: `http://localhost:5000/api`

## Notes

- The project supports protected admin access using a Users table.
- The backend supports both local MySQL `.env` values and Railway MySQL variables.
- Backend routes implemented:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/students`
  - `GET /api/students`
  - `PUT /api/students/:id`
  - `DELETE /api/students/:id`
  - `POST /api/rooms`
  - `GET /api/rooms`
  - `PUT /api/rooms/:id`
  - `PUT /api/rooms/:id/warden`
  - `POST /api/wardens`
  - `GET /api/wardens`
  - `PUT /api/wardens/:id`
  - `DELETE /api/wardens/:id`
  - `POST /api/allocations`
  - `GET /api/allocations`
