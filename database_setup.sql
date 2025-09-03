-- Database setup for Student Dashboard application

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200)
);

-- Create session table for persistent logins
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    class_id INTEGER NOT NULL,
    color VARCHAR(50)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    u_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES subjects(id),
    present INTEGER DEFAULT 0,
    absent INTEGER DEFAULT 0
);

-- Create tasks table for todo list
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task VARCHAR(300) NOT NULL
);

-- Create timetable
CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    mon VARCHAR(100),
    tue VARCHAR(100),
    wed VARCHAR(100),
    thu VARCHAR(100),
    fri VARCHAR(100),
    sat VARCHAR(100)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    class_id INTEGER
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    requestType VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    requestType VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create library table
CREATE TABLE IF NOT EXISTS library (
    id SERIAL PRIMARY KEY,
    book_name VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    available BOOLEAN DEFAULT TRUE,
    category VARCHAR(100)
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(100),
    description TEXT,
    link VARCHAR(300),
    deadline DATE
);

-- Create alumni table
CREATE TABLE IF NOT EXISTS alumini (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    graduation_year INTEGER,
    company VARCHAR(100),
    position VARCHAR(100),
    contact_info VARCHAR(200)
);

-- Sample data insertion

-- Insert some subjects
INSERT INTO subjects (subject_name, class_id, color) VALUES
('Mathematics', 1, NULL),
('Physics', 1, NULL),
('Chemistry', 1, NULL),
('Computer Science', 1, NULL),
('English', 1, NULL);

-- Insert timetable data
INSERT INTO timetable (mon, tue, wed, thu, fri, sat) VALUES
('Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Mathematics'),
('Physics', 'Chemistry', 'Computer Science', 'English', 'Mathematics', 'Physics'),
('Chemistry', 'Computer Science', 'English', 'Mathematics', 'Physics', 'Chemistry'),
('Computer Science', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science'),
('English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'),
('Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', NULL),
('Physics', 'Chemistry', 'Computer Science', 'English', 'Mathematics', NULL),
('Chemistry', 'Computer Science', 'English', 'Mathematics', 'Physics', NULL);

-- Insert sample tasks
INSERT INTO tasks (task) VALUES
('Submit Mathematics Assignment'),
('Prepare for Physics Practical'),
('Complete Programming Project');

-- Insert sample library books
INSERT INTO library (book_name, author, available, category) VALUES
('Data Structures and Algorithms', 'Thomas Cormen', TRUE, 'Computer Science'),
('Calculus: Early Transcendentals', 'James Stewart', TRUE, 'Mathematics'),
('Physics for Scientists and Engineers', 'Serway and Jewett', FALSE, 'Physics');

-- Insert sample opportunities
INSERT INTO opportunities (title, company, description, link, deadline) VALUES
('Summer Internship', 'Tech Solutions Inc.', 'Web development internship opportunity', 'https://example.com/intern', '2023-05-30'),
('Hackathon', 'CodeFest', 'Annual coding competition with exciting prizes', 'https://example.com/hackathon', '2023-06-15');

-- Insert sample alumni
INSERT INTO alumini (name, graduation_year, company, position, contact_info) VALUES
('John Doe', 2020, 'Google', 'Software Engineer', 'john.doe@example.com'),
('Jane Smith', 2019, 'Microsoft', 'Product Manager', 'jane.smith@example.com');
