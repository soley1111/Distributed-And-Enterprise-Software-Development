# Full-Stack Social Media Web Application

This project is a full-stack web application that functions as an all-in-one university community hub, developed using React for the frontend and a Django REST Framework for the backend. The platform provides students with a centralised space to join communities, share posts, coordinate events, and connect with peers, demonstrating a comprehensive application of modern web technologies.

## Table of Contents
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Usage](#usage)

## Features

### Community & Social Networking
- **Community Hubs**: Create, discover, and join communities based on academic subjects, clubs, sports, and social interests.
- **Role-Based Access**: Communities have `Admin`, `Moderator`, and `Member` roles, granting different levels of permissions for post and member management.
- **Friend System**: Send, accept, or decline friend requests to build a personal network within the platform.
- **Rich User Profiles**: Customizable user profiles with profile pictures, course information, bios, and interests.

### Content & Engagement
- **Dynamic Post Feed**: A centralized home page displays posts from all joined communities, with options to filter by category or sort by date.
- **Community-Specific Feeds**: Each community page has its own dedicated feed for targeted discussions.
- **Event Management**: Create and manage community-specific events, whether in-person or virtual. Users can sign up, and creators can set maximum capacity and list required materials.

### API & User Management
- **RESTful API**: A secure and well-structured API built with Django REST Framework.
- **JWT Authentication**: Secure user authentication and session management using JSON Web Tokens.
- **Profile & Post Control**: Users have full control to create, update, and delete their profiles, posts, and events, subject to their permissions.

## Technical Stack

- **Backend**: Django, Django REST Framework
- **Frontend**: React.js
- **Routing**: React Router
- **Database**: SQL-based (e.g., PostgreSQL, SQLite)
- **API & Authentication**: RESTful API with JSON Web Token (JWT) Authentication
- **Styling**: Used Tailwind CSS for a responsive user interface
- **Showcase & Testing**: Used Docker containers to run the backend and frontend for testing

## Usage

1.  **Register & Log In**:
    - Create a new user account.
    - Log in to receive a JWT for session authentication.

2.  **Set Up Your Profile**:
    - Navigate to your profile page.
    - Add a profile picture, your course details, interests, and a short bio.

3.  **Discover Communities**:
    - Go to the Communities page to browse or search for groups.
    - Filter by category (e.g., "Academic", "Sports") or membership status.
    - Join any community to see its posts and events.

4.  **Engage and Post**:
    - Create new posts in communities you've joined.
    - Browse the main feed to see what's happening across campus.

5.  **Create & Join Events**:
    - Check the Events page for upcoming activities.
    - As a community admin or moderator, create new events for your members.

6.  **Connect with Friends**:
    - Find other students and send them friend requests.
    - Manage your friend requests and view your friends list on your profile.

### Made by Harvie Sole
