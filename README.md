# Student Dashboard

A comprehensive web application designed to help students manage their academic life efficiently. This dashboard provides various tools and resources to enhance student productivity and organization.

## Features

### User Authentication

- Register with email and password
- Login with existing credentials
- Google OAuth integration for quick sign-in
- Session management for persistent login

### Dashboard

- Personalized greeting with student name
- Motivational quotes (powered by ZenQuotes API)
- Task management system
- Quick access to all features

### Attendance Tracking

- Subject-wise attendance records
- Visual representation of attendance percentages
- Color-coded indicators for attendance status
- Overall attendance summary

### Timetable

- Interactive weekly class schedule
- Color-coded subjects for easy identification
- Responsive design with hover effects
- Full week view (Monday-Saturday)

### Study Materials

- Access to subject-specific learning resources
- Organized by class and subject

### Library Resources

- Digital library collection
- Book information and availability status

### Opportunities

- Information about internships, jobs, and contests
- Career development resources

### Student Request System

- Submit various types of requests
- Track request status
- Organized request management

### Complaint System

- Submit and track complaints
- Structured complaint handling process

### Alumni Network

- Access to alumni information
- Networking opportunities

## Testing the Application

### Guest User Access

To quickly test the application without creating a new account, you can use the following guest credentials:

- **Username**: guestuser@gmail.com
- **Password**: guestuser

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, EJS (Embedded JavaScript)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js, bcrypt
- **Others**: Axios, dotenv, body-parser

## Setup Instructions

### Prerequisites

- Node.js (v14.x or higher)
- PostgreSQL database
- Git

### Installation Steps

1. **Clone the repository**

   ```
   git clone <repository-url>
   cd Student-Dashboard
   ```

2. **Install dependencies**

   ```
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL=your_postgres_connection_string
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Set up the database**

   - Create a PostgreSQL database
   - Run the SQL scripts provided in the `database_setup.sql` file to create necessary tables
   - Example command: `psql -U postgres -d student_dashboard -f database_setup.sql`

5. **Run the application**

   ```
   node index.js
   ```

6. **Access the application**
   Open your browser and go to `http://localhost:3000`

## Database Schema

The application uses several tables including:

- users: Stores user authentication details
- subjects: Stores subject information
- attendance: Tracks student attendance
- tasks: Manages to-do items
- timetable: Stores class schedules
- requests and complaints: Handles student submissions
- library: Manages library resources
- opportunities: Stores career opportunities
- alumni: Maintains alumni information

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
