# LIU Computer Repairs Tracker

A modern, responsive web application for tracking and managing computer repairs at Long Island University. Built with vanilla JavaScript and featuring a dark theme with LIU's signature light blue accents.

## Features

### ✨ Core Functionality
- **Repair Ticket Management**: Create, view, edit, and delete repair tickets
- **Personnel Tracking**: Track end users who submitted requests and assigned technicians
- **Computer Information Tracking**: Brand, model, serial number, and specifications
- **Problem & Diagnosis Documentation**: Detailed problem descriptions and technical diagnoses
- **Status Tracking**: Received → Diagnosing → Waiting for Parts → On Hold → Completed
- **Search & Filter**: Real-time search and filtering by status, brand, date, personnel, and more

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
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with horizontal scrolling
- **Mobile-Friendly Table**: Horizontal scroll access to all columns including Actions on mobile devices
- **Keyboard Shortcuts**: Ctrl+N for new repairs, Esc to close modals
- **Accessibility**: WCAG compliant with proper focus management

## Quick Start

### Installation
1. Clone or download the project files
2. Place all files in your web server directory
3. Open `index.html` in a web browser

### Local Development
For local development, you can use any static file server:

```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js http-server (if installed)
npx http-server -c-1

# Using PHP (if installed)
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Usage Guide

### Creating a New Repair
1. Click the **"New Repair"** button
2. Fill in the required fields:
   - **Ticket Number**: BMC Footprints ticket reference (e.g., "FP-2024-001234")
   - **End User**: Name of person who submitted the repair request
   - **Brand**: DELL or Apple
   - **Model**: Computer model (e.g., "Latitude 5520", "MacBook Pro 13")
   - **Serial Number**: Computer's serial number
   - **Problem Description**: Detailed issue description
3. Optionally add:
   - **Technician**: Assigned technician name
   - **Specifications**: RAM, storage, processor details
   - **Diagnosis**: Technical findings
   - **Status**: Current repair status
   - **Notes**: Additional information
4. Click **"Save Repair"**

### Managing Repairs
- **Edit**: Click the edit (pencil) icon next to any repair
- **Delete**: Click the delete (trash) icon to remove a repair
- **Search**: Use the search box to find specific repairs
- **Filter**: Use status and brand dropdowns to filter the list
- **Mobile Access**: On mobile devices, scroll horizontally within the table to access all columns and actions

### Exporting Data
1. Click **"Export CSV"** to download all visible repairs
2. The CSV file can be opened in Excel, Google Sheets, or any spreadsheet application
3. Filename format: `LIU_Repairs_YYYY-MM-DD.csv`

### Importing Data
1. Click **"Import CSV"** to upload repair data
2. Select a CSV file with the proper format (use exported CSV as template)
3. Review the import summary and confirm
4. Invalid rows will be logged and skipped

### Viewing Reports
1. Click **"Reports"** to open the analytics dashboard
2. View statistics including:
   - Repair volume and completion rates
   - Status and brand breakdowns
   - Average turnaround times
   - Common issue analysis

## Data Structure

### Repair Ticket Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Ticket Number | String | Yes | BMC Footprints ticket reference |
| End User | String | Yes | Name of person who submitted request |
| Technician | String | No | Assigned technician name |
| Brand | String | Yes | DELL or Apple |
| Model | String | Yes | Computer model |
| Serial Number | String | Yes | Unique identifier |
| Specifications | Text | No | Hardware details |
| Problem Description | Text | Yes | Issue description |
| Diagnosis | Text | No | Technical findings |
| Status | Enum | Yes | Current repair status |
| Notes | Text | No | Additional information |
| Date Created | Date | Auto | Creation timestamp |
| Date Modified | Date | Auto | Last update timestamp |

### Status Values
- **Received**: Initial intake
- **Diagnosing**: Problem analysis in progress
- **Waiting for Parts**: Awaiting replacement components
- **On Hold**: Repair paused (user decision, etc.)
- **Completed**: Repair finished

## File Structure

```
LIU-Repairs/
├── index.html          # Main application page
├── styles.css          # LIU-themed CSS styles
├── app.js             # Application logic
├── server.js          # Node.js server for data persistence
├── Dockerfile         # Docker container configuration
├── docker-compose.yml # Docker deployment configuration
├── README.md          # This documentation
├── CHANGELOG.md       # Version history and changes
├── DEPLOYMENT.md      # Server deployment guide
└── resources/
    └── Set up and Change Form.pdf
```

## Technical Details

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Technologies Used
- **HTML5**: Semantic markup and modern features
- **CSS3**: Grid, Flexbox, Custom Properties, Media Queries
- **JavaScript ES6+**: Modules, Classes, Arrow Functions, Template Literals
- **Web APIs**: Local Storage, File Reader, Blob, URL

### Data Storage
- **Dual Storage System**: Browser localStorage + server-side file storage
- **Primary**: Server-side JSON files with persistent Docker volumes
- **Fallback**: Browser localStorage for offline functionality
- **Storage key**: `liu-repairs`
- **Data persistence**: Survives container rebuilds and updates

### Security Considerations
- All data remains local to user's browser
- No external API calls or data transmission
- XSS protection through HTML escaping
- CSV injection prevention

## Customization

### Theming
The application uses CSS custom properties for easy theming:

```css
:root {
    --primary-blue: #60a5fa;
    --primary-dark: #1e293b;
    --surface-dark: #2d3748;
    /* ... more variables */
}
```

### Adding Computer Brands
To add support for additional computer brands:

1. Update the brand dropdown in `index.html`:
```html
<select id="brand" name="brand" required>
    <option value="">Select Brand</option>
    <option value="DELL">DELL</option>
    <option value="Apple">Apple</option>
    <option value="HP">HP</option> <!-- Add new brand -->
</select>
```

2. Update the filter dropdown similarly
3. No JavaScript changes needed

### Adding Status Types
To add new repair statuses:

1. Update status dropdowns in HTML
2. Update `formatStatus()` method in `app.js`
3. Add corresponding CSS classes for status badges

## Deployment

### 🐳 Docker Deployment (Recommended)

#### Quick Start with Docker

**Linux/macOS/WSL:**
```bash
# Clone or download the repository
cd LIU-Repairs

# Make script executable and run
chmod +x deploy.sh
./deploy.sh

# Or manually with docker-compose
docker-compose up -d

# Access the application at http://localhost:8080
```

**Windows (PowerShell):**
```powershell
# Navigate to the project directory
cd LIU-Repairs

# Run PowerShell deployment script
.\deploy.ps1

# Or use the batch file wrapper
.\deploy.bat

# Or manually with docker-compose
docker-compose up -d
```

**Windows (Command Prompt):**
```cmd
cd LIU-Repairs
deploy.bat
```

#### Production Deployment
```bash
# Build the Docker image
docker build -t liu-repairs:latest .

# Run in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Access at http://localhost (port 80)
```

#### Cross-Platform Deployment Commands

**Linux/macOS/WSL (bash):**
```bash
./deploy.sh dev          # Development mode
./deploy.sh prod         # Production mode
./deploy.sh ssl          # With SSL proxy
./deploy.sh logs         # View logs
./deploy.sh status       # Show status
./deploy.sh stop         # Stop services
./deploy.sh cleanup      # Full cleanup
```

**Windows (PowerShell):**
```powershell
.\deploy.ps1 dev         # Development mode
.\deploy.ps1 prod        # Production mode
.\deploy.ps1 ssl         # With SSL proxy
.\deploy.ps1 logs        # View logs
.\deploy.ps1 status      # Show status
.\deploy.ps1 stop        # Stop services
.\deploy.ps1 cleanup     # Full cleanup
```

**Windows (Batch):**
```cmd
deploy.bat               # Uses PowerShell script internally
```

**Manual Docker Compose Commands (All Platforms):**
```bash
# Development with live reload
docker-compose up -d                    # Access at http://localhost:3000

# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With SSL proxy (requires domain configuration)
docker-compose --profile proxy up -d

# With monitoring (Prometheus + Grafana)
docker-compose --profile monitoring up -d

# View logs
docker-compose logs -f liu-repairs

# Stop services
docker-compose down

# Rebuild after changes
docker-compose build --no-cache
```

#### Docker Configuration Files
- **`Dockerfile`**: Multi-stage build with nginx
- **`docker-compose.yml`**: Base configuration
- **`docker-compose.override.yml`**: Development settings
- **`docker-compose.prod.yml`**: Production optimizations
- **`nginx.conf`**: Production-ready nginx configuration
- **`deploy.sh`**: Cross-platform deployment script (Linux/macOS/WSL)
- **`deploy.ps1`**: PowerShell deployment script (Windows)
- **`deploy.bat`**: Windows batch wrapper script
- **`.dockerignore`**: Docker build context optimization

### 🌐 Manual Deployment Options

#### Local Network Deployment
1. Place files on a local web server
2. Configure server to serve static files
3. Access via IP address on LAN: `http://192.168.1.xxx`

#### Standalone Installation
The app works as a single-page application without server requirements:
1. Copy files to any computer
2. Open `index.html` directly in a web browser
3. All functionality works offline

### ☸️ Kubernetes Deployment

For enterprise Kubernetes deployment, convert Docker Compose to Kubernetes manifests:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/latest/download/kompose-linux-amd64 -o kompose
chmod +x kompose && sudo mv kompose /usr/local/bin

# Convert docker-compose to Kubernetes
kompose convert -f docker-compose.yml

# Deploy to Kubernetes
kubectl apply -f .
```

## Troubleshooting

### Docker Issues

**Container Won't Start**
```bash
# Check container logs
docker-compose logs liu-repairs

# Check container status
docker-compose ps

# Rebuild without cache
docker-compose build --no-cache
```

**Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :8080

# Use different port in docker-compose.yml
ports:
  - "8081:80"  # Change 8080 to 8081
```

**Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .

# On SELinux systems
sudo setsebool -P httpd_exec_mod=1
```

**SSL/HTTPS Setup**
```bash
# For custom domain with SSL
# 1. Update domain in docker-compose.prod.yml
# 2. Ensure DNS points to your server
# 3. Run with proxy profile
docker-compose --profile proxy -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Common Issues

**CSV Import Not Working**
- Ensure CSV file has proper headers
- Check for special characters in data
- Verify file encoding is UTF-8

**Data Not Saving**
- Check browser's localStorage quota
- Ensure JavaScript is enabled
- Try clearing browser cache

**Mobile Display Issues**
- Update to latest browser version
- Check viewport meta tag is present
- Verify responsive CSS is loading

### Browser Storage Limits
- Chrome: ~10MB per origin
- Firefox: ~10MB per origin
- Safari: ~5MB per origin

To check storage usage:
```javascript
// In browser console
console.log(JSON.stringify(localStorage.getItem('liu-repairs')).length + ' characters');
```

### Responsive Table Layout
The repairs table uses a fixed column layout optimized for both desktop and mobile viewing:

**Column Layout** (Left to Right):
1. **Ticket #** (120px) - Repair ticket identifier
2. **End User** (140px) - Person who submitted the request
3. **Technician** (120px) - Assigned technician
4. **Brand** (80px) - Computer manufacturer
5. **Model** (150px) - Computer model
6. **Serial #** (120px) - Device serial number
7. **Problem** (200px) - Issue description
8. **Status** (100px) - Current repair status
9. **Notes** (80px) - Additional notes button
10. **Date Created** (100px) - Creation timestamp
11. **Actions** (120px) - Edit/Delete buttons

**Mobile Experience**:
- Table container supports horizontal scrolling
- Minimum table width ensures all columns remain accessible
- Users can swipe horizontally to access Actions column on mobile devices
- Maintains full functionality across all screen sizes

## Contributing

This is a standalone application for Long Island University. For modifications:

1. Test changes thoroughly
2. Maintain responsive design
3. Follow existing code style
4. Update documentation as needed

## License

Internal use only - Long Island University

## Support

For technical support or feature requests, contact the LIU IT department.

---

**Version**: 1.2.1  
**Last Updated**: September 2025  
**Compatible Browsers**: Chrome, Firefox, Safari, Edge  
**Platform**: Web (Cross-platform)  
**Deployment**: Docker with persistent data storage  
**Mobile Support**: Horizontal scrolling for full table access on small screens