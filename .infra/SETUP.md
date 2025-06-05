# EC2 Setup Guide for Resume Scanner

This document outlines the standard setup for launching and configuring an EC2 instance to run the Resume Scanner backend using Docker and NGINX on Amazon Linux 2023.

---

## ⚙️ Instance Specs

### Memory Requirements

**A `t3a.medium` or `t3.medium` is recommended for this backend deployment.**
AI models in general require large amounts of RAM in order to execute inference and NER operations. In this project, it is recommended to have at least 4 GiB of memory in order to give sufficient space for the AI models to run. Any less memory than that risks crashing the EC2 instance.

Both of these instance types have the following specifications:

- 2 vCPUs
- 4 GiB memory
- Moderate baseline CPU performance with burst capability

> ⚠️ Any smaller instance type risks crashing the instance due to insufficient memory for AI models to run.

### Disk Space Requirements

**A minimum of 10 GB EBS volume is recommended for this backend deployment.**

Space is primarily used by:

- Docker image and container layers
- Python packages (including ML models from `transformers`)
- Temporary storage for uploaded PDFs

> ⚠️ Any less disk space risks running out of space while installing dependencies or running the app.

---

## 🔧 1. Initial EC2 Setup

### System Update and Basic Tools

```bash
sudo dnf update -y
sudo dnf install -y git nginx docker python3-pip
```

### Docker Configuration

```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

Log out and back in to apply Docker group permissions.

---

## 🐳 2. Clone and Build the Project

```bash
git clone https://github.com/jakubstetz/resume-scanner.git
```

Once the project is cloned onto the EC2 instance, running the "Deploy Backend to EC2" workflow (`backend.yaml`) in GitHub Actions will deploy the backend.

---

## 🌐 3. NGINX Reverse Proxy (Optional)

If you want to connect to the backend through a domain, execute the following steps.

1. Save the config file `.infra/nginx_resume_scanner.conf` to:

```bash
/etc/nginx/conf.d/resume-scanner.conf
```

> Note:
> To confirm that the above location is correct for the NGINX config file, run the command `sudo nginx -t`, which should output something like:
> `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok`
> Then, run the command `cat /etc/nginx/nginx.conf | grep include`. If the output contains a line like the following, then the above location is correct:
> `include /etc/nginx/conf.d/*.conf;`

2. Restart NGINX:

```bash
sudo systemctl restart nginx
```

You will also need to configure your DNS records to point your desired domain to your EC2 instance private IP address.

---

## 🔐 4. SSL with Certbot (Optional)

Execute the following commands if you want to allow an HTTPS connections to your backend.

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.resume-scanner.jakubstetz.dev
```

> Note:
> First-time use of Certbot requires manual input of your email for notifications, as well as acceptance of terms of service and agreement/disagreement to share address with the Electronic Frontier Foundation.

---

## 📂 `.infra` Folder Structure Overview

- `.infra/SETUP.md` — this setup guide.
- `.infra/nginx_resume_scanner.conf` — template for NGINX reverse proxy (uses domain `api.resume-scanner.jakubstetz.dev`).
- `.infra/user_data.sh` — optional EC2 user-data script to automate instance setup.
