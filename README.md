# 🎬 QuickShow – Movie Ticket Booking Platform

QuickShow is a full-stack movie ticket booking platform inspired by BookMyShow and modern OTT platforms. It allows users to browse movies, watch trailers, book seats securely, complete payments through Stripe, and manage their bookings. The platform also includes an Admin Dashboard for managing movies, shows, and bookings.

---

## 🚀 Features

### 👤 User Features

- Browse currently running and upcoming movies
- Search movies by title
- Watch official movie trailers
- View detailed movie information
- Select show date and timing
- Interactive seat selection
- Real-time seat availability
- Secure Stripe payment integration
- QR Code based digital ticket
- Download ticket as PDF
- View booking history
- Responsive UI for desktop and mobile
- Clerk Authentication (Google & Email Login)

---

### 🛠️ Admin Features

- Secure Admin Dashboard
- Add new movies
- Add shows
- Manage movie schedules
- View all bookings
- Dashboard analytics
- Authentication protected admin routes

---

## ⚡ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- Clerk Authentication
- QRCode React
- jsPDF
- html2canvas

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Clerk Backend SDK
- Stripe
- Inngest

---

## 📸 Screenshots

> Add screenshots after deployment.

- Home Page
- Movie Listing
- Movie Details
- Seat Selection
- Payment
- My Bookings
- Admin Dashboard

---

## ✨ Key Features

### 🎥 Dynamic Trailer System

- Trailer URLs are stored with each movie.
- Admin can update trailers without changing code.
- Automatically displays the correct trailer for every movie.

---

### 🎟️ Smart Seat Booking

- Interactive cinema seat layout
- Real-time occupied seats
- Prevents double booking using atomic MongoDB operations
- Maximum seat validation
- Duplicate seat validation

---

### 💳 Secure Payments

- Stripe Checkout Integration
- Payment Verification
- Booking confirmation after successful payment

---

### 🎫 Digital Ticket

Each successful booking generates:

- QR Code
- PDF Ticket
- Booking ID
- Seat Numbers
- Movie Information

---

### 🔒 Authentication & Authorization

- Clerk Authentication
- Google Login
- Email Login
- Protected User Routes
- Protected Admin Routes

---

## 🏗️ Project Structure

```
QuickShow
│
├── client
│   ├── src
│   ├── components
│   ├── pages
│   ├── context
│   └── assets
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── utils
│   └── config
│
└── README.md
```

---

## 🔐 Security Features

- JWT/Clerk Authentication
- Protected Routes
- Helmet Middleware
- Rate Limiting
- Input Validation
- Atomic Seat Booking
- Booking Rollback
- Centralized Error Handling

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/V-MANAS/QuickShow.git
```

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm start
```

---

## 🔑 Environment Variables

### Client

```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
```

### Server

```
PORT=

MONGODB_URI=

CLERK_SECRET_KEY=

STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET=

TMDB_API_KEY=

INNGEST_EVENT_KEY=
```

---

## 📖 Booking Workflow

```text
User Login
      │
      ▼
Browse Movies
      │
      ▼
Select Show
      │
      ▼
Choose Seats
      │
      ▼
Atomic Seat Reservation
      │
      ▼
Stripe Checkout
      │
      ▼
Payment Verification
      │
      ▼
Booking Confirmation
      │
      ▼
QR Ticket + PDF Ticket
````
---

## 👨‍💻 Author

**Manas Varade**

- GitHub: https://github.com/V-MANAS
- LinkedIn: https://www.linkedin.com/in/manas-varade-239a9b2a3/

