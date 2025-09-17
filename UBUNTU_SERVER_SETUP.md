# Ubuntu Server Setup for LIU Repairs Tracker

Complete guide to set up your Ubuntu server for automated deployment with SSH key authentication.

## 🚀 **Quick Ubuntu Server Setup**

### **Step 1: Initial Ubuntu Server Configuration**

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git ufw

# Create application directory
sudo mkdir -p /opt/LIU-Repairs
sudo chown $USER:$USER /opt/LIU-Repairs
```

### **Step 2: Install Docker & Docker Compose**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Log out and back in for group changes to take effect
# Or run: newgrp docker
```

### **Step 3: Configure SSH for GitHub Actions**

#### **From your Windows PC:**

**Generate SSH Key Pair (PowerShell):**
```powershell
# Open PowerShell and generate SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions-liu-repairs"

# When prompted:
# File: Press Enter (default location)
# Passphrase: Leave empty (press Enter twice)

# Copy public key content
type $env:USERPROFILE\.ssh\id_rsa.pub
```

**Add Public Key to Ubuntu Server:**
```bash
# On Ubuntu server, create SSH directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key (paste the content from above)
echo "ssh-rsa AAAAB3NzaC1yc2E... github-actions-liu-repairs" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Get Private Key for GitHub Secrets:**
```powershell
# Copy this entire content to GitHub SERVER_SSH_KEY secret
type $env:USERPROFILE\.ssh\id_rsa
```

### **Step 4: Clone Repository on Server**

```bash
# Navigate to application directory
cd /opt/LIU-Repairs

# Clone repository (initial setup)
git clone https://github.com/DiceBanga/LIU-Repairs.git .

# Create required directories
mkdir -p data logs
chmod 755 data logs

# Create environment file
cp .env.example .env
nano .env  # Edit with your Docker Hub username
```

### **Step 5: Configure Firewall**

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow ssh
sudo ufw allow 22

# Allow application port
sudo ufw allow 8080

# Optional: Allow HTTP/HTTPS for production
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### **Step 6: Test Initial Deployment**

```bash
# Test Docker installation
docker --version
docker-compose --version

# Initial deployment
cd /opt/LIU-Repairs
docker compose pull
docker compose up -d

# Check if running
docker compose ps
curl http://localhost:8080/health

# View logs if needed
docker compose logs -f
```

## 🔐 **GitHub Secrets Configuration**

Add these to **GitHub → Settings → Secrets and Variables → Actions:**

```bash
# Docker Hub (you likely have these)
DOCKER_USERNAME=dicebanga
DOCKER_PASSWORD=your-docker-hub-access-token

# Ubuntu Server SSH
SERVER_HOST=your-ubuntu-server-ip         # e.g., 192.168.1.100 or ubuntu-server.local
SERVER_USER=ubuntu                        # or your Ubuntu username
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
[paste entire private key content here]
-----END OPENSSH PRIVATE KEY-----

# Optional
SERVER_PORT=22                            # Default SSH port
```

## 🧪 **Test SSH Connection**

**From your Windows PC:**
```powershell
# Test SSH connection
ssh ubuntu@your-server-ip

# Test with key file specifically
ssh -i $env:USERPROFILE\.ssh\id_rsa ubuntu@your-server-ip

# Test deployment commands
ssh ubuntu@your-server-ip "cd /opt/LIU-Repairs && docker compose ps"
```

## 📋 **Common Ubuntu Server Scenarios**

### **AWS EC2 Instance**
```bash
# Default username: ubuntu
SERVER_USER=ubuntu
# Use the .pem key you downloaded from AWS
# Convert .pem to OpenSSH format if needed:
ssh-keygen -p -m PEM -f your-key.pem
```

### **DigitalOcean Droplet**
```bash
# Default username: root (or ubuntu for newer images)
SERVER_USER=ubuntu
# Use SSH key you added during droplet creation
```

### **Local Ubuntu VM/Server**
```bash
# Use the username you created during Ubuntu installation
SERVER_USER=your-username
# Generate SSH key as shown above
```

### **Ubuntu on Raspberry Pi**
```bash
# Default username: ubuntu (Ubuntu Server) or pi (Raspberry Pi OS)
SERVER_USER=ubuntu
# Enable SSH: sudo systemctl enable ssh
```

## 🔧 **Server Optimization (Optional)**

### **Performance Tuning:**
```bash
# Increase file limits for Docker
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize Docker logging
sudo mkdir -p /etc/docker
echo '{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}' | sudo tee /etc/docker/daemon.json

sudo systemctl restart docker
```

### **Automatic Security Updates:**
```bash
# Install unattended upgrades
sudo apt install unattended-upgrades

# Configure automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

### **Monitoring Setup:**
```bash
# Install htop for system monitoring
sudo apt install htop

# Check system resources
htop
df -h          # Disk usage
free -h        # Memory usage
```

## 📁 **Directory Structure**

After setup, your server should have:
```
/opt/LIU-Repairs/
├── data/              # Application data (persistent)
├── logs/              # Application logs
├── docker-compose.yml # Container configuration
├── .env              # Environment variables
├── app.js            # Application files
├── server.js
├── index.html
└── package.json
```

## 🚨 **Troubleshooting**

### **SSH Issues:**
```bash
# Check SSH service status
sudo systemctl status ssh

# View SSH logs
sudo tail -f /var/log/auth.log

# Test SSH key permissions
ls -la ~/.ssh/
# Should show: authorized_keys (600), .ssh directory (700)
```

### **Docker Issues:**
```bash
# Check Docker service
sudo systemctl status docker

# Check if user is in docker group
groups $USER

# Restart Docker
sudo systemctl restart docker
```

### **Application Issues:**
```bash
# Check application logs
docker compose logs liu-repairs

# Check if port is available
sudo netstat -tulpn | grep :8080

# Restart application
docker compose down
docker compose pull
docker compose up -d
```

## ✅ **Ready to Deploy!**

Once you've completed this setup:

1. ✅ Ubuntu server configured with Docker
2. ✅ SSH key authentication working
3. ✅ GitHub secrets configured
4. ✅ Firewall configured
5. ✅ Application directory ready

**Now you can:**
- Push to `main` branch → Automatic deployment! 🚀
- No more manual server access needed
- Monitor deployments in GitHub Actions

## 🔗 **Quick Commands Reference**

```bash
# Check deployment status
cd /opt/LIU-Repairs && docker compose ps

# View application logs
cd /opt/LIU-Repairs && docker compose logs -f

# Manual update (if needed)
cd /opt/LIU-Repairs && docker compose pull && docker compose up -d

# Health check
curl http://localhost:8080/health

# System status
htop                  # System resources
docker system df      # Docker disk usage
sudo ufw status       # Firewall status
```

---

*This setup provides a secure, automated deployment pipeline for your LIU Repairs Tracker application.*