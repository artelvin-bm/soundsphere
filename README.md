# SoundSphere

SoundSphere is a web-based music collaboration and production management system. It is designed to help musicians, producers, and collaborators manage music projects, upload audio files, assign tasks, and monitor project progress in one centralized platform.

## Initial Prototype Scope

This version is an initial academic software prototype built with React and Vite.

The prototype currently supports:

- User registration and login
- Music project creation and management
- Audio file upload validation for `.mp3`, `.wav`, and `.flac`
- Task assignment for collaborators
- Project dashboard with progress tracking
- Local prototype database using browser `localStorage`
- Basic password hashing for stored user credentials

## Must-Have Feature Coverage

| Must-Have Requirement | Prototype Implementation |
|---|---|
| User registration and authentication | Users can register and log in using stored account credentials |
| Creation and management of music projects | Users can create, view, select, and delete music projects |
| Audio file upload and storage | Users can upload valid audio file records; invalid file types are rejected |
| Task assignment for collaborators | Users can create tasks and assign them to collaborators |
| Project dashboard to monitor project progress | Dashboard shows project count, uploaded files, tasks, and completion percentage |
| Secure storage of user data and files | Passwords are stored as basic hashes in the prototype; audio uploads are validated |
| Basic system performance and reliability | Input validation and local persistence are implemented |
| Database for managing users, projects, and files | Browser `localStorage` is used as a simulated prototype database |

## Software Quality Evidence

This prototype demonstrates software quality through the following:

### Correctness

The implemented features match the defined must-have requirements for the first release. The system allows users to perform the expected core workflows: login, project creation, file upload validation, task assignment, and progress tracking.

### Reliability

The application includes basic input validation. For example, project titles are required, passwords must meet a minimum length, and only accepted audio file formats are allowed.

### Usability

The interface is organized into clear sections: login, dashboard statistics, project list, audio files, and tasks. This makes the system easier to understand and use.

### Maintainability

The project uses a modular file structure. Pages, components, utilities, data, and styles are separated into different folders so that the system can be updated more easily.

### Security

The prototype includes basic password hashing for stored user credentials. Since this is an initial frontend prototype, production-level authentication and backend security are planned for future development.

### Testability

The system can be tested through manual test cases for login, registration, project creation, audio upload validation, task creation, and progress tracking.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- localStorage
- Git and GitHub

## Project Structure

```txt
soundsphere/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── README.md
└── vite.config.js
