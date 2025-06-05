#!/bin/bash
# This script runs automatically when EC2 instance boots if provided as User Data
# It sets up the EC2 instance with everything needed to deploy the backend with domain and HTTPS routing

# System prep
dnf update -y
dnf install -y git nginx docker python3-pip

# Docker setup
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Pull project
cd /home/ec2-user
git clone https://github.com/jakubstetz/resume-scanner.git

# NGINX reverse proxy setup
cd resume-scanner/.infra
cp nginx_resume-scanner.conf /etc/nginx/conf.d/resume-scanner.conf
sudo systemctl restart nginx

# Certbot setup information message
echo ""
echo "Because first-time use of Certbot requires user interaction, SSL setup with Certbot is not included as a part of this script. See SETUP.md for how to set up SSL using Certbot."

# Completion message
echo ""
echo "✅ EC2 setup complete. Run backend.yaml workflow in GitHub Actions to deploy backend, and then visit https://api.resume-scanner.jakubstetz.dev/health to check system health."
echo ""