# 🎓 Zouglah Academic System (ZAS)

A comprehensive full-stack academic management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) to manage students, teachers, parents, classes, subjects, attendance, grades, timetables, and messaging.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)
- [Branding & Logo](#branding--logo)
- [Color Palette](#color-palette)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Role-Based Access Control
- **Admin**: Full system management
- **Teacher**: Manage attendance, grades, and classes
- **Student**: View grades, attendance, and timetable
- **Parent**: Monitor child's progress

### Core Functionality
- ✅ User Authentication & Authorization (JWT)
- ✅ Student, Teacher, Parent Management (CRUD)
- ✅ Class & Subject Management
- ✅ Attendance Tracking
- ✅ Grade Management
- ✅ Timetable Management
- ✅ Messaging System
- ✅ Dashboard Analytics with Charts
- ✅ Responsive Design
- ✅ Modern UI with Tailwind CSS

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📁 Project Structure

```
ZAS/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── scripts/         # Seed scripts
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ZAS
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zas
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. Or use MongoDB Atlas connection string in `.env`

## 🏃 Running the Application

### 1. Start MongoDB
Ensure MongoDB is running on your system.

### 2. Seed the Database (Optional)
```bash
cd backend
node scripts/seed.js
```

This will create sample data including:
- Admin user
- Teachers, Students, Parents
- Classes and Subjects
- Sample attendance and grades

### 3. Start Backend Server
```bash
cd backend
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5000`

### 4. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### 5. Access the Application
Open your browser and navigate to `http://localhost:3000`

## 🔑 Default Credentials

After seeding the database, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@zas.com | admin123 |
| Teacher | teacher1@zas.com | teacher123 |
| Student | student1@zas.com | student123 |
| Parent | parent1@zas.com | parent123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (Admin only)

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create teacher (Admin only)
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)

### Parents
- `GET /api/parents` - Get all parents
- `GET /api/parents/:id` - Get parent by ID
- `POST /api/parents` - Create parent (Admin only)
- `PUT /api/parents/:id` - Update parent
- `DELETE /api/parents/:id` - Delete parent (Admin only)

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Attendance
- `POST /api/attendance` - Mark attendance (Teacher/Admin)
- `GET /api/attendance/class/:classId` - Get attendance by class
- `GET /api/attendance/student/:studentId` - Get attendance by student

### Grades
- `POST /api/grades` - Create grade (Teacher/Admin)
- `GET /api/grades` - Get all grades (Admin/Teacher)
- `GET /api/grades/student/:studentId` - Get grades by student
- `PUT /api/grades/:id` - Update grade (Teacher/Admin)
- `DELETE /api/grades/:id` - Delete grade (Teacher/Admin)

### Timetable
- `GET /api/timetable/class/:classId` - Get timetable by class
- `POST /api/timetable` - Create timetable entry (Admin only)
- `PUT /api/timetable/:id` - Update timetable entry (Admin only)
- `DELETE /api/timetable/:id` - Delete timetable entry (Admin only)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get messages for user
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/teacher` - Teacher dashboard stats
- `GET /api/dashboard/student` - Student dashboard stats
- `GET /api/dashboard/parent` - Parent dashboard stats

## 🎨 Branding & Logo

### ASCII Logo
```
╔════════════════════════════════════════╗
║   ╔═══╗╦  ╦╔═╗╦  ╦╔═╗╦═╗╔═╗  ╔═╗╔═╗╔═╗  ║
║   ║ ╦ ║╚╗╔╝╠═╣║  ║║ ╦╠╦╝║╣   ╚═╗║ ║║ ║  ║
║   ╚═╝╚╝ ╚╝ ╩ ╩╚═╝╚═╝╩╚═╚═╝  ╚═╝╚═╝╚═╝  ║
║                                        ║
║     Academic Management System        ║
╚════════════════════════════════════════╝
```

### Logo Design Suggestions

#### Icon-Based Logo
For the UI, we recommend using a **graduation cap** icon as the primary logo element. This can be implemented using:

1. **Lucide React Icon** (already included):
   ```jsx
   <GraduationCap className="h-8 w-8 text-primary-600" />
   ```

2. **SVG Logo** (for navbar/header):
   ```svg
   <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
     <path d="M20 8L8 14V20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20V14L20 8Z" 
           fill="#0ea5e9" stroke="#0369a1" stroke-width="2"/>
     <path d="M20 8V32" stroke="#0369a1" stroke-width="2"/>
   </svg>
   ```

#### Logo Placement
- **Navbar**: Top-left corner with text "ZAS" next to it
- **Sidebar**: Top section with full name "Zouglah Academic System"
- **Favicon**: Simplified graduation cap icon (16x16 or 32x32)

### Brand Colors
See [Color Palette](#color-palette) section below.

## 🎨 Color Palette

### Primary Colors (Blue)
- **Primary 50**: `#f0f9ff` - Light backgrounds
- **Primary 100**: `#e0f2fe` - Hover states
- **Primary 500**: `#0ea5e9` - Main brand color
- **Primary 600**: `#0284c7` - Buttons, links
- **Primary 700**: `#0369a1` - Hover states
- **Primary 900**: `#0c4a6e` - Text, borders

### Secondary Colors (Purple)
- **Secondary 50**: `#faf5ff` - Light backgrounds
- **Secondary 100**: `#f3e8ff` - Hover states
- **Secondary 500**: `#a855f7` - Accent color
- **Secondary 600**: `#9333ea` - Buttons, links
- **Secondary 700**: `#7e22ce` - Hover states

### Status Colors
- **Success/Green**: `#10b981` - Present, success messages
- **Error/Red**: `#ef4444` - Absent, error messages
- **Warning/Yellow**: `#f59e0b` - Late, warnings
- **Info/Blue**: `#3b82f6` - Information messages

### Neutral Colors
- **Gray 50**: `#f9fafb` - Background
- **Gray 100**: `#f3f4f6` - Card backgrounds
- **Gray 500**: `#6b7280` - Secondary text
- **Gray 700**: `#374151` - Primary text
- **Gray 900**: `#111827` - Headings

### Usage in Tailwind
The color palette is already configured in `frontend/tailwind.config.js`. Use classes like:
- `bg-primary-600` for primary buttons
- `text-primary-600` for primary text
- `border-primary-300` for borders
- `bg-secondary-500` for accent elements

## 📸 Screenshots

### Dashboard Views
- **Admin Dashboard**: Overview with charts and statistics
- **Teacher Dashboard**: Quick stats and recent activities
- **Student Dashboard**: Personal grades and attendance
- **Parent Dashboard**: Child progress overview

### Key Features
- Modern, responsive design
- Role-based navigation
- Real-time data updates
- Interactive charts and graphs
- Clean, professional UI

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected API routes
- Input validation
- CORS configuration
- Helmet security headers

## 🧪 Testing

To test the application:

1. Seed the database with sample data
2. Login with different roles
3. Test CRUD operations
4. Verify role-based permissions
5. Test messaging functionality
6. Check attendance and grade management

## 📝 Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- MongoDB indexes are set up for performance
- The application uses ES6 modules
- Frontend uses Vite for fast development

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change `PORT` in backend `.env`
- Update Vite proxy in `frontend/vite.config.js`

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend `.env`
- Verify token expiration

## 📞 Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ using the MERN Stack**
