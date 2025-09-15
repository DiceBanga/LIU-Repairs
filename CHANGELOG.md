# Changelog

All notable changes to this project will be documented in this file.

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