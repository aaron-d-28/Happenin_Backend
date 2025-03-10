---

 📅 Happenin' Backend

**Happenin'** is a platform that helps users discover events happening around them. This repository contains the backend implementation, providing APIs for event management, user authentication, and payments.

## 🚀 Features

- **Event Listings**: View events hosted by businesses, government, and public initiatives.
- **User Roles**:
    - **Admin**: Manage all platform activities.
    - **Scheduler**: Oversee events in specific regions.
    - **User**: Discover and register for events.
- **Authentication**: JWT & cookie-based authentication for secure access.
- **Event Registration**: QR-based entry system for seamless check-ins.
- **Automated Notifications**: Stay updated with event reminders.
- **User Profile Management**: Upload and manage user details.
- **Payments**: Integrated **Razorpay** for event bookings.
- **Data Analytics**: Insights into event demographics (age, gender, etc.).
- **Media Uploads**: Support for multiple images per event.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, Cookies
- **Cloud Storage**: Cloudinary

## 📦 Installation

```bash
git clone https://github.com/yourusername/backend_happenin.git
cd backend_happenin
npm install
```

## 🔧 Configuration

Create a `.env` file with the following environment variables:

```env
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
```

## 🚀 Running the Server

```bash
npm run dev
```

## 📖 API Documentation

(Coming soon: Add API endpoints using Swagger/Postman)

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m "Add new feature"`.
4. Push to branch: `git push origin feature-name`.
5. Submit a pull request.


---
