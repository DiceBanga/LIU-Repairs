# Changelog

All notable changes to this project will be documented in this file.

## [1.2.1] - 2025-09-16

### Fixed
- Resolved Action column being cut off on mobile devices with proper horizontal scrolling
- Fixed table responsiveness issues with improved overflow handling
- Enhanced mobile user experience with horizontal scroll capability for full table access

### Changed
- Extended End User column width to accommodate 16+ characters (140px)
- Improved table layout with fixed column widths for consistent display
- Enhanced CSS table container with `overflow-x: auto` for better mobile scrolling
- Updated table minimum width to 1200px to ensure all columns are accessible

## [1.2.0] - 2025-09-16

### Added
- End User and Technician columns in the repairs table for better tracking
- End User field (required) in repair ticket form to capture who submitted the request
- Technician field (optional) in repair ticket form for assignment tracking
- Enhanced table layout with proper column positioning between Ticket # and Brand
- Improved data structure to support personnel tracking in repair workflow

### Changed  
- Updated table rendering to display End User and Technician information
- Enhanced form validation to require End User field for new tickets
- Modified data export/import to include new fields
- Updated responsive table design to accommodate additional columns

### Fixed
- Corrected Docker configuration inconsistency between Dockerfile (nginx) and server.js (Node.js)
- Recreated missing docker-compose.yml file for proper containerized deployment
- Updated Dockerfile to use Node.js server with persistent data storage
- Fixed data persistence through Docker volume mounting

## [1.1.0] - 2025-09-15

### Added
- CI/CD pipeline with GitHub Actions and Docker Hub integration
- Automated Docker image builds and deployments on push to main branch
- Docker Hub repository with latest and commit-specific image tags
- CI/CD setup cheatsheet and documentation
- CI/CD workflow documentation with Mermaid diagram
- Nginx configuration for optimized static file serving with security headers

### Fixed
- Resolved GitHub authentication issues preventing push operations
- Fixed missing Docker Hub credentials configuration in GitHub secrets
- Corrected Dockerfile references to missing resources and nginx.conf files
- Successfully deployed CI/CD pipeline with automated Docker builds

## [1.0.0] - 2025-09-12

### Added
- Initial release of the LIU Computer Repairs Tracker.
- View, add, edit, and delete repair tickets.
- Search and filter by ticket number, brand, model, serial, end user, technician, problem, and diagnosis.
- Status badges for repairs (Received, Diagnosing, Waiting for Parts, On Hold, Completed).
- CSV import and export functionality.
- Reports and analytics modal with repair volume, status breakdown, brand breakdown, and average turnaround time.
- "Setup and Change Form" generation and printing for completed repairs.
- Notes history for each repair, with timestamps.
- Add device from form functionality with file upload and mock data extraction.
- Technician field to assign a technician to a repair.

### Fixed
- CSV import issues with ticket numbers, technicians, and notes.
- UI issue where the "Actions" column in the repairs table would get cut off.