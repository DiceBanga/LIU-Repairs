# LIU Computer Repairs Tracker - Server Deployment Guide

This guide covers how to install and deploy the LIU Computer Repairs Tracker application (v1.2.0) on your server. The application now uses Node.js with persistent data storage and Docker containerization.

## 🚀 **Option 1: Direct Docker Compose Deployment (Recommended)**

### Step 1: Clone Repository on Server
```bash
# SSH into your server
ssh user@your-server.com

# Clone the repository
git clone https://github.com/your-username/LIU-Repairs.git
cd LIU-Repairs

# Or if using private repo
git clone https://your-token@github.com/your-username/LIU-Repairs.git
```

### Step 2: Deploy with Docker Compose
```bash
# Create data directory with proper permissions
mkdir -p data logs
chmod 755 data logs

# Deploy the application
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f liu-repairs
```

### Step 3: Access the Application
- **Local Server**: `http://your-server-ip:8080`
- **Domain**: Configure reverse proxy (nginx/traefik) for `http://repairs.liu.edu`
- **Health Check**: `http://your-server-ip:8080/health`

**Note**: The application now runs on Node.js (port 3000 internally, 8080 externally) with persistent data storage in Docker volumes.

---

## 🔄 **Option 2: CI/CD Automated Deployment**

### Typical CI/CD Development Workflow

**Development Process:**
1. **Local Development** → Create feature branch, make changes, commit
2. **Pull Request** → Create PR, code review, automated tests
3. **Merge to Main** → Triggers automated build and deployment
4. **Server Update** → Application automatically updates with latest changes

**Key Benefits:**
- No manual server access needed
- Consistent deployments
- Rollback capabilities
- Automated testing before deployment

### Build vs Deployment Triggers

**Builds are triggered on:**
- Push to `main` branch only
- Manual workflow dispatch

**Deployment options:**
```bash
# Option A: Fully Automated (Recommended)
GitHub Actions → Build → Push to Docker Hub → Deploy to Server

# Option B: Semi-Automated (Current)  
GitHub Actions → Build → Push to Docker Hub
Manual: docker compose pull && docker compose up -d

# Option C: Manual (Legacy)
Manual: git pull && docker compose up -d --build
```

### Docker Hub Workflow (Recommended)
Since GitHub Actions builds and pushes to Docker Hub, server only needs:

```bash
# No git pull needed - just update from Docker Hub
docker compose pull      # Pull latest images
docker compose up -d     # Restart with new images
```

### Create Full CI/CD Pipeline
Add this to `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]  # Only triggers on main branch
  workflow_dispatch:    # Manual trigger option

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          your-dockerhub/liu-repairs:latest
          your-dockerhub/liu-repairs:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          cd /opt/LIU-Repairs
          docker compose pull
          docker compose up -d
          docker system prune -f
```

### Alternative: Watchtower Auto-Updates
Add to your `docker-compose.yml` for automatic updates:

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=300  # Check every 5 minutes
    command: --interval 300 --cleanup
```

### Required Repository Secrets
In GitHub: **Settings → Secrets and Variables → Actions**

**For Docker Hub:**
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

**For Server Deployment:**
- `SERVER_HOST`: Your server IP/domain  
- `SERVER_USER`: SSH username (e.g., `ubuntu`, `root`)
- `SERVER_SSH_KEY`: Private SSH key content

### Development Workflow Summary
```bash
# 1. Feature Development
git checkout -b feature/new-feature
# Make changes...
git add . && git commit -m "feat: add new feature"
git push origin feature/new-feature

# 2. Pull Request & Review
# Create PR → Code review → Automated tests

# 3. Merge to Main (triggers CI/CD)
# GitHub Actions builds Docker image
# Pushes to Docker Hub
# Deploys to server automatically

# 4. Server Updates Automatically
# No manual intervention needed!
```

---

## 🌐 **Option 3: Production Server with Reverse Proxy**

### Step 1: Install on Server
```bash
# On your server
cd /opt
sudo git clone https://github.com/your-username/LIU-Repairs.git
sudo chown -R $USER:$USER LIU-Repairs
cd LIU-Repairs
```

### Step 2: Configure Domain (Optional)
Update `docker-compose.yml` traefik labels:
```yaml
labels:
  - "traefik.http.routers.liu-repairs.rule=Host(`repairs.liu.edu`)"
```

### Step 3: Deploy with SSL
```bash
# Deploy with reverse proxy and SSL
docker-compose --profile proxy up -d

# Or manually configure nginx
sudo apt install nginx
sudo nano /etc/nginx/sites-available/liu-repairs
```

Example nginx config:
```nginx
server {
    listen 80;
    server_name repairs.liu.edu;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📋 **Server Requirements**

### Minimum Requirements
- **OS**: Linux (Ubuntu 20.04+, CentOS 7+, or similar)
- **RAM**: 1GB minimum, 2GB recommended  
- **Storage**: 5GB minimum, 20GB recommended
- **Network**: Open port 8080 (or 80/443 for production)

### Required Software
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt update && sudo apt install git -y  # Ubuntu/Debian
sudo yum install git -y                      # CentOS/RHEL
```

---

## 🔧 **Quick Start Commands**

### One-Line Deployment
```bash
# Clone and deploy in one command
curl -sSL https://raw.githubusercontent.com/your-username/LIU-Repairs/main/install.sh | bash
```

Create `install.sh` script:
```bash
#!/bin/bash
echo "🚀 Installing LIU Repairs Tracker..."

# Clone repository
git clone https://github.com/your-username/LIU-Repairs.git
cd LIU-Repairs

# Create directories
mkdir -p data logs
chmod 755 data logs

# Deploy
docker-compose up -d --build

echo "✅ Installation complete!"
echo "📱 Access at: http://$(hostname -I | awk '{print $1}'):8080"
```

### Production Deployment
```bash
# For production servers
./deploy.sh prod

# Check status
docker-compose ps
curl http://localhost:8080/health
```

---

## 🔍 **Troubleshooting**

### Check Installation
```bash
# Verify services are running
docker-compose ps

# Check logs
docker-compose logs liu-repairs

# Test health endpoint
curl http://localhost:8080/health
```

### Common Issues
```bash
# Port already in use
sudo netstat -tulpn | grep :8080

# Permission issues
sudo chown -R $USER:$USER .
sudo chmod -R 755 data

# Firewall issues
sudo ufw allow 8080
sudo firewall-cmd --add-port=8080/tcp --permanent
```

### Data Backup
```bash
# Backup data
tar -czf liu-repairs-backup-$(date +%Y%m%d).tar.gz data/

# Restore data
tar -xzf liu-repairs-backup-20241201.tar.gz
```

---

## 🎯 **Post-Installation Configuration**

### 1. Test the Application
```bash
# Check if application is running
curl http://localhost:8080/health

# Test the web interface
curl http://localhost:8080
```

### 2. Configure Domain (Production)
```bash
# Update your DNS records to point to server IP
# A Record: repairs.liu.edu -> your-server-ip

# Test domain resolution
nslookup repairs.liu.edu
```

### 3. Set Up SSL Certificate
```bash
# Using Let's Encrypt with Traefik (automated)
docker-compose --profile proxy up -d

# Or using certbot manually
sudo apt install certbot
sudo certbot --nginx -d repairs.liu.edu
```

### 4. Configure Firewall
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow ssh
sudo ufw allow 8080
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 5. Set Up Monitoring
```bash
# Deploy with monitoring stack
docker-compose --profile monitoring up -d

# Access monitoring dashboards
# Prometheus: http://your-server:9090
# Grafana: http://your-server:3001 (admin/liu-repairs-2024)
```

---

## 🔄 **Automated Backups**

### Create Backup Script
Create `/home/user/backup-liu-repairs.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/LIU-Repairs"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup data and logs
cd $APP_DIR
tar -czf $BACKUP_DIR/liu-repairs-$DATE.tar.gz data/ logs/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "liu-repairs-*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/liu-repairs-$DATE.tar.gz"
```

### Set Up Cron Job
```bash
# Make script executable
chmod +x /home/user/backup-liu-repairs.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/user/backup-liu-repairs.sh >> /home/user/backup.log 2>&1
```

---

## 🚨 **Security Considerations**

### 1. Server Hardening
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure SSH security
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 2. Docker Security
```bash
# Run Docker as non-root user
sudo usermod -aG docker $USER
newgrp docker

# Use specific image tags (avoid :latest in production)
# Update docker-compose.yml to use specific versions
```

### 3. Application Security
```bash
# Regular updates
cd /opt/LIU-Repairs
git pull origin main
docker-compose up -d --build

# Monitor logs for suspicious activity
docker-compose logs liu-repairs | grep -i error
```

---

## 📞 **Support and Maintenance**

### Regular Maintenance Tasks
```bash
# Weekly: Update and restart
cd /opt/LIU-Repairs
git pull origin main
docker-compose up -d --build

# Monthly: Clean up old Docker images
docker system prune -a

# Quarterly: Review and update dependencies
docker-compose pull
```

### Log Management
```bash
# View application logs
docker-compose logs -f liu-repairs

# Rotate logs to prevent disk space issues
sudo nano /etc/logrotate.d/liu-repairs
```

### Performance Monitoring
```bash
# Check resource usage
docker stats liu-repairs-app

# Monitor disk space
df -h
du -sh /opt/LIU-Repairs/data
```

---

## 🎉 **Quick Reference**

### Essential Commands
```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Update application
git pull && docker-compose up -d --build

# Backup data
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Check health
curl http://localhost:8080/health
```

### Important Paths
- **Application**: `/opt/LIU-Repairs/`
- **Data**: `/opt/LIU-Repairs/data/`
- **Logs**: `/opt/LIU-Repairs/logs/`
- **Backups**: `/home/user/backups/`

### Default Ports
- **Application**: `8080` (external), `3000` (internal Node.js)
- **Health Endpoint**: `8080/health`
- **Prometheus**: `9090` (if monitoring enabled)
- **Grafana**: `3001` (if monitoring enabled)
- **Traefik Dashboard**: `8081` (if proxy enabled)

### New Features (v1.2.0)
- **End User Tracking**: Required field for who submitted the repair
- **Technician Assignment**: Optional field for technician assignment
- **Enhanced Table**: Two additional columns between Ticket # and Brand
- **Node.js Server**: Persistent data storage with automatic fallback to localStorage

---

*For additional support or questions, contact the LIU IT Department.*