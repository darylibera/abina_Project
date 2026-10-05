# Abina — Interior Design Studio

A full-stack interior design **booking platform** connecting customers with interior designers.

## 🎯 Features

### Customer Module
- Register / Login / Logout
- Browse designer portfolios
- View designer service packages
- Book consultations (date, time, address, notes)
- Track booking status (pending → accepted → scheduled → in-progress → completed)
- Cancel bookings
- Leave ratings & reviews
- Receive in-app notifications

### Designer Module
- Register as interior designer
- Create & update profile
- Upload portfolio designs
- Manage service packages with pricing
- Accept / reject / schedule booking requests
- View customer reviews
- Receive booking notifications

### Admin Module
- Manage all users
- View all bookings
- Manage designs and messages
- View all reviews
- Generate reports (via collection views)

### Notification Module
- Booking confirmations
- Status change alerts
- Review notifications

### Feedback & Review Module
- Customer ratings (1–5 stars)
- Written reviews
- Designer rating display

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (cloud)
- **Architecture:** REST API (MVC-style)

## 📁 Project Structure
\`\`\`
abina/
├── server.js              # Express server + all API routes
├── .env                   # Environment variables (not in git)
├── package.json
├── public/
│   ├── index.html         # Landing page
│   ├── register.html      # User registration
│   ├── login.html         # Login
│   ├── dashboard.html     # Role-based dashboard
│   ├── designers.html     # Browse designers
│   ├── designer.html      # Designer profile + booking
│   ├── gallery.html       # Portfolio
│   ├── contact.html       # Contact form
│   ├── admin.html         # Admin panel
│   ├── css/style.css
│   └── js/                # All client-side logic
\`\`\`

## 🚀 Setup

### 1. Install Node.js
https://nodejs.org

### 2. Clone & install
\`\`\`bash
git clone <your-repo-url>
cd abina
npm install
\`\`\`

### 3. Create \`.env\` file
\`\`\`
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/abina?retryWrites=true&w=majority
PORT=3000


MONGO_URL=mongodb+srv://abinaadmin:0987654321@abinacluster.9l2i9ge.mongodb.net/abina?retryWrites=true&w=majority
PORT=3000
\`\`\`

### 4. Run
\`\`\`bash
npm start
\`\`\`

Open http://localhost:3000

## 🔑 Default Login
- **Admin:** `admin@abina.com` / `admin123`

## 📊 Database Collections
- **users** — customers, designers, admins
- **designs** — portfolio items
- **bookings** — appointment bookings with status workflow
- **messages** — contact form submissions
- **reviews** — customer ratings & feedback
- **notifications** — in-app alerts

## 🔄 Booking Workflow
\`\`\`
Customer books → pending
Designer accepts → accepted
Designer schedules → scheduled
Designer starts → in-progress
Designer completes → completed
Customer leaves review
\`\`\`
