# Academic Visits System

A full-stack web application for managing academic visit requests, approvals, and documentation within educational institutions. The system features role-based access control with four distinct user roles: Administrator, Instructor, Director, and Study Abroad Department.

## Features

- **Role-Based Access Control (RBAC)** with 4 distinct roles:
  - **Administrator**: Full system control, user management, complete history access
  - **Instructor**: Create and track visit requests, upload documents and images
  - **Director**: View approved requests for their academic division
  - **Study Abroad Department**: Evaluate, approve, or reject visit requests

- **Visit Request Management**:
  - Create academic visit requests with detailed information
  - Track status (Pending, Approved, Rejected)
  - Upload required documents (Request Form, Response Letter, Visit Report)
  - Upload visit evidence (exactly 3 images for visit reports)

- **Document Management**:
  - Secure file upload for PDF and Word documents
  - Image upload for visit evidence
  - Document download functionality

- **Status Tracking**:
  - Real-time status updates
  - Complete audit trail with visit history
  - Rejection reason tracking

- **Security**:
  - JWT-based authentication
  - Password hashing with bcrypt
  - Protected routes and API endpoints
  - Rate limiting and security headers

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **Helmet** for security headers
- **Express Rate Limit** for API protection

### Frontend
- **React.js** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure

```
academic-visits-system/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── visitController.js    # Visit management
│   │   ├── documentController.js # File uploads
│   │   └── userController.js     # User management
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication & authorization
│   │   └── upload.js             # File upload configuration
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── visits.js             # Visit routes
│   │   ├── documents.js          # Document routes
│   │   └── users.js              # User management routes
│   ├── scripts/
│   │   ├── initDatabase.js       # Database initialization
│   │   └── seedDatabase.js       # Sample data seeding
│   ├── server.js                 # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── DirectorDashboard.jsx
│   │   │   ├── StudyAbroadDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateVisit.jsx
│   │   │   └── VisitDetails.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Database Schema

The system uses PostgreSQL with the following tables:

- **roles**: User roles (Administrator, Instructor, Director, StudyAbroad)
- **divisions**: Academic divisions (Engineering, Business, Arts, Sciences, Health)
- **users**: User accounts with role and division assignments
- **visits**: Academic visit requests with status tracking
- **documents**: Uploaded documents (PDF, Word)
- **visit_images**: Visit evidence images (exactly 3 per report)
- **visit_history**: Audit trail for status changes

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=academic_visits
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ```

4. **Initialize the database**:
   ```bash
   npm run init-db
   ```

5. **Seed the database with sample data** (optional):
   ```bash
   npm run seed-db
   ```

6. **Start the backend server**:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## Sample Login Credentials

After running the seed script, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@university.edu | password123 |
| Instructor | instructor1@university.edu | password123 |
| Director | director@university.edu | password123 |
| Study Abroad | studyabroad@university.edu | password123 |

## Usage Guide

### For Instructors

1. **Login** with your instructor credentials
2. **Create a new visit request** by clicking "New Visit Request"
3. **Fill in visit details**: title, purpose, destination, and dates
4. **Upload required documents**:
   - Request Form (PDF or Word)
   - Response Letter (PDF or Word)
5. **After visit completion**: Upload Visit Report with exactly 3 images
6. **Track status** of your requests in the dashboard

### For Directors

1. **Login** with your director credentials
2. **View approved visits** for your academic division
3. **Monitor faculty travel activities** within your division

### For Study Abroad Department

1. **Login** with your Study Abroad credentials
2. **View all visit requests** in the system
3. **Filter by status** (Pending, Approved, Rejected)
4. **Review pending requests** and approve or reject them
5. **Provide rejection reasons** when rejecting requests
6. **View complete visit history** for auditing

### For Administrators

1. **Login** with your admin credentials
2. **Manage users**: View, create, update, or delete user accounts
3. **View complete visit history** across all divisions
4. **Access all system data** for administrative purposes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Visits
- `POST /api/visits` - Create new visit request
- `GET /api/visits/my-visits` - Get current user's visits
- `GET /api/visits/all` - Get all visits (Study Abroad/Admin)
- `GET /api/visits/division` - Get division visits (Director)
- `GET /api/visits/history` - Get complete visit history
- `GET /api/visits/:id` - Get visit details
- `PATCH /api/visits/:id/status` - Update visit status

### Documents
- `POST /api/documents/:visitId/document` - Upload document
- `POST /api/documents/:visitId/images` - Upload visit images
- `GET /api/documents/document/:id` - Download document
- `GET /api/documents/image/:id` - Get image

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/roles` - Get all roles
- `GET /api/users/divisions` - Get all divisions
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Every endpoint protected with role checks
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet middleware for security headers
- **File Validation**: Strict file type and size validation
- **SQL Injection Prevention**: Parameterized queries throughout

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### File Upload Issues
- Ensure `uploads` directory exists and has write permissions
- Check file size limits in `.env`
- Verify file types are allowed (PDF, Word, JPEG, PNG)

### CORS Issues
- Ensure backend CORS is configured for frontend URL
- Check proxy configuration in `vite.config.js`

## License

ISC

## Support

For issues or questions, please contact the development team.
