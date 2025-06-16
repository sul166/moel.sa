# Moel Legal Representation Website

## Overview

This is a Flask-based web application for Moel Legal Representation (موئل للتمثيل القانوني), a law firm based in Medina, Saudi Arabia. The website provides information about the firm's legal services and includes a contact form for potential clients. The application is built using Flask with SQLAlchemy for database operations and features a modern, RTL-enabled Arabic interface.

## System Architecture

The application follows a traditional Flask web application architecture with the following components:

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy extension
- **Database**: PostgreSQL (configured for production deployment)
- **Template Engine**: Jinja2 (built into Flask)
- **Email Service**: Flask-Mail with Gmail SMTP integration
- **Web Server**: Gunicorn for production deployment

### Frontend Architecture
- **Styling**: Bootstrap 5 RTL for responsive design
- **Icons**: Font Awesome 6.4.0
- **Typography**: Google Fonts (Tajawal for Arabic text)
- **Language**: Arabic (RTL layout)
- **JavaScript**: Vanilla JavaScript for interactive features

## Key Components

### 1. Core Application Files
- **`main.py`**: Application entry point
- **`app.py`**: Flask application factory and configuration
- **`config.py`**: Configuration management
- **`models.py`**: Database models (ContactMessage, EmailLog)

### 2. Admin Panel
- **`admin.py`**: Admin authentication and message management
- **Templates**: `admin/login.html`, `admin/dashboard.html`, `admin/messages.html`

### 3. Email System
- **`email_service.py`**: Email notification service
- **Templates**: Email templates for notifications and confirmations

### 4. Frontend Templates
- **`base.html`**: Base template with navigation and common elements
- **`index.html`**: Homepage with hero section and services overview
- **`about.html`**: About page with company information
- **`services.html`**: Detailed services page
- **`contact.html`**: Contact form page

### 5. Static Assets
- **`static/css/style.css`**: Custom CSS with Arabic/RTL styling
- **`static/js/script.js`**: JavaScript for interactive features
- **`static/images/logo.svg`**: Company logo

## Data Flow

### Contact Form Processing
1. User submits contact form on `/contact` route
2. Form data is validated and stored in `ContactMessage` model
3. Email notification is sent to admin via `EmailService`
4. Confirmation email is sent to user
5. Admin can view and manage messages through admin panel

### Admin Panel Access
1. Admin logs in via `/admin/login` with email/password
2. Session-based authentication manages admin access
3. Admin dashboard provides overview of messages and statistics
4. Message management allows reading, filtering, and responding to inquiries

## External Dependencies

### Python Packages
- **flask**: Web framework
- **flask-sqlalchemy**: Database ORM
- **flask-mail**: Email functionality
- **psycopg2-binary**: PostgreSQL adapter
- **gunicorn**: WSGI HTTP server
- **email-validator**: Email validation
- **sendgrid**: Alternative email service (configured but not actively used)
- **werkzeug**: WSGI utilities

### Frontend Libraries
- **Bootstrap 5 RTL**: CSS framework for responsive design
- **Font Awesome**: Icon library
- **Google Fonts (Tajawal)**: Arabic typography

### Email Service
- **Gmail SMTP**: Primary email service for sending notifications
- Configuration supports both Gmail and SendGrid

## Deployment Strategy

### Development Environment
- Flask development server with debugging enabled
- SQLite database for local development (fallback)
- Hot reloading enabled

### Production Environment
- **Platform**: Replit autoscale deployment
- **Web Server**: Gunicorn with multiple workers
- **Database**: PostgreSQL
- **Port Configuration**: Internal port 5000, external port 80
- **Environment Variables**: Managed through `.env` file

### Configuration Management
- Environment-based configuration using `os.environ`
- Separate development and production settings
- Secure handling of sensitive data (email credentials, session secrets)

### Database Setup
- SQLAlchemy models with automatic table creation
- PostgreSQL connection pooling and reconnection handling
- Support for database migrations (though not explicitly implemented)

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```