# Hostel Management System Backend

## Setup

1. Copy `.env.example` to `.env` and update MySQL credentials.
2. Run `schema.sql`, then `sample-data.sql` in MySQL.
3. Install dependencies with `npm install`.
4. Start the server with `npm run dev`.

## API Routes

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
