# MovieBook Frontend + MongoDB Atlas Backend

## 1. Backend

Open `moviebook_backend` in a terminal.

Edit `.env`:

PORT=5000
MONGO_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/moviebook_backend?retryWrites=true&w=majority
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123

Then:

npm install
npm run seed:admin
npm run seed:data
npm run dev

Backend URL:
http://localhost:5000

## 2. Frontend

Open `moviebook` in another terminal.

The file `.env` already contains:

REACT_APP_API_URL=http://localhost:5000/api

Then:

npm install
npm start

Frontend URL:
http://localhost:3000

## 3. MongoDB Atlas

Create a database named `moviebook_backend` or let MongoDB create it automatically.
Add your current IP address in Atlas Network Access.
Create/use a database user with read/write access.

## 4. Admin login

After `npm run seed:admin`:

Email: admin@gmail.com
Password: admin123

Change the admin password for a real deployment.

## 5. API routes

POST /api/users/signup
POST /api/users/login
GET /api/users
DELETE /api/users/:id

GET /api/movies
POST /api/movies
PUT /api/movies/:id
DELETE /api/movies/:id

GET /api/theatres

POST /api/bookings
GET /api/bookings
GET /api/bookings/user/:userId
