# SoundSphere

SoundSphere is a web-based music collaboration and production management system. It is designed to help musicians, producers, and collaborators manage music projects, upload audio files, assign tasks, and monitor project progress in one centralized platform.

## Project Overview

SoundSphere allows users to create music projects, upload audio files, assign production tasks, and track project progress through a dashboard. The system was developed as an academic software prototype to demonstrate software quality through working functionality, database integration, version control, modular design, input validation, and testing evidence.

## Current Prototype Scope

The current prototype supports:

- User registration and login
- Persistent login session
- Light and dark theme toggle
- Music project creation, editing, viewing, and deletion
- Audio file upload, storage, playback, and deletion
- Task creation, editing, status updating, and deletion
- Project dashboard with statistics and progress tracking
- Project search/filtering
- Custom confirmation dialogs for delete actions
- Azure SQL Database for structured data storage
- Azure Blob Storage for audio file storage
- Node.js and Express backend API

## Must-Have Feature Coverage

| Must-Have Requirement | Prototype Implementation |
|---|---|
| User registration and authentication | Users can register and log in through the backend API. Passwords are hashed using bcrypt before being stored. |
| Creation and management of music projects | Users can create, view, edit, search, select, and delete music projects. |
| Audio file upload and storage | Users can upload `.mp3`, `.wav`, and `.flac` files. Audio files are stored in Azure Blob Storage. |
| Task assignment for collaborators | Users can create tasks, assign them to collaborators, edit task details, update task status, and delete tasks. |
| Project dashboard to monitor project progress | Dashboard displays active projects, uploaded files, total tasks, completed tasks, and project completion percentage. |
| Secure storage of user data and files | User passwords are hashed with bcrypt. Audio files are stored in Azure Blob Storage, while metadata is stored in Azure SQL Database. |
| Basic system performance and reliability | The system includes input validation, API error handling, persistent session storage, and confirmation dialogs for destructive actions. |
| Database for managing users, projects, and files | Azure SQL Database manages users, projects, audio file metadata, and tasks. |

## System Architecture

```txt
React + Vite Frontend
        ↓
Node.js + Express Backend API
        ↓
Azure SQL Database
        ↓
Azure Blob Storage
