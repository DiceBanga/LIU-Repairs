# LIU Computer Repairs Tracker

A modern, responsive web application for tracking and managing computer repairs at Long Island University. Built with vanilla JavaScript and featuring a dark theme with LIU's signature light blue accents.

## Features

### ✨ Core Functionality
- **Repair Ticket Management**: Create, view, edit, and delete repair tickets
- **Computer Information Tracking**: Brand, model, serial number, and specifications
- **Problem & Diagnosis Documentation**: Detailed problem descriptions and technical diagnoses
- **Status Tracking**: Received → Diagnosing → Waiting for Parts → On Hold → Completed
- **Search & Filter**: Real-time search and filtering by status, brand, date, and more

### 📊 Analytics & Reporting
- **Dashboard Statistics**: Total repairs, pending count, completion rates
- **Detailed Reports**: Repair volume, turnaround times, common issues analysis
- **Status Breakdown**: Visual breakdown of repairs by current status
- **Brand Analytics**: Track repairs by computer manufacturer

### 💾 Data Management
- **CSV Export**: Export data to Excel/Google Sheets compatible format
- **CSV Import**: Import existing repair data from CSV files
- **Local Storage**: All data stored locally in browser (no server required)
- **Auto-generated Ticket Numbers**: LIU-YYYY-### format

### 🎨 User Experience
- **Dark Theme**: Professional dark interface with light blue accents
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Ctrl+N for new repairs, Esc to close modals
- **Accessibility**: WCAG compliant with proper focus management

## Quick Start

### Installation
1. Clone or download the project files
2. Place all files in your web server directory
3. Open `index.html` in a web browser

## Usage Guide

### Creating a New Repair
1. Click the **"New Repair"** button
2. Fill in the required fields
3. Click **"Save Repair"**

### Managing Repairs
- **Edit**: Click the edit (pencil) icon next to any repair
- **Delete**: Click the delete (trash) icon to remove a repair
- **Search**: Use the search box to find specific repairs
- **Filter**: Use status and brand dropdowns to filter the list

## Deployment

### 🐳 Docker Deployment (Recommended)

```bash
# Clone or download the repository
cd LIU-Repairs

# Run with Docker Compose
docker-compose up -d

# Access the application at http://localhost:8080
```

## License

Internal use only - Long Island University

---

**Version**: 1.0  
**Last Updated**: August 2025  
**Compatible Browsers**: Chrome, Firefox, Safari, Edge  
**Platform**: Web (Cross-platform)