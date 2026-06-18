# AWS EC2 Ubuntu & Docker Deployment Guide

This guide walks you through deploying **LuggageTrack** to a fresh **AWS EC2 Ubuntu** instance using **Docker** and **Docker Compose**.

---

## 1. Provision AWS EC2 Instance

1. Log in to the **AWS Console**.
2. Navigate to **EC2** and click **Launch Instance**.
3. Configure the instance details:
   - **Name**: `luggagetrack-server`
   - **AMI**: `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`
   - **Architecture**: `64-bit (x86)`
   - **Instance Type**: `t2.micro` (eligible for Free Tier) or `t2.medium` (recommended for smooth Docker builds)
   - **Key Pair**: Select or create a new key pair (`.pem` file) to SSH into the machine.
4. **Network Settings**:
   - Create a Security Group.
   - Add the following inbound security rules:
     - **SSH** (Port 22) from your IP.
     - **HTTP** (Port 80) from Anywhere (`0.0.0.0/0`).
     - **HTTPS** (Port 443) from Anywhere (`0.0.0.0/0`).
5. Keep other settings default and click **Launch Instance**.

---

## 2. Connect to the EC2 Instance

Once the EC2 instance is in the `Running` state, grab its **Public IPv4 Address**.
From your local terminal, navigate to the folder with your `.pem` key and run:

```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@<EC2-PUBLIC-IP-ADDRESS>
```

---

## 3. Upload or Clone the Code base

### Option A: Clone from Git (Recommended)
Make sure you push this project to a private/public GitHub repository.
SSH into your EC2 instance and run:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git luggagetrack
cd luggagetrack
```

### Option B: Upload via SCP
If you want to copy files directly from your local system:
```bash
# From your local workspace root directory
scp -i "/path/to/your-key.pem" -r ./* ubuntu@<EC2-PUBLIC-IP-ADDRESS>:~/luggagetrack
```

---

## 4. Run the Bootstrap Setup Script

Our one-shot bootstrap script installs Docker, Docker Compose, sets up the firewall, creates folders, and runs the application containers.

On the EC2 instance:
```bash
cd ~/luggagetrack
chmod +x deploy/setup-ec2.sh
./deploy/setup-ec2.sh
```

---

## 5. Configure Environment Variables

The setup script will copy `.env.example` to `.env` and exit to let you set passwords.
Open the `.env` file using `nano`:

```bash
nano .env
```

Change the default secrets to secure passwords:
- `POSTGRES_PASSWORD` (use a strong random string)
- `JWT_SECRET` (use a long random alphanumeric string)
- Make sure `CORS_ORIGIN` is configured if needed (defaults to `*`).

Save and close the editor (Press `Ctrl+O`, `Enter`, then `Ctrl+X`).

---

## 6. Launch the Application

Build and run the Docker containers in detached mode:

```bash
docker compose up -d --build
```

Verify that all three containers are active:
```bash
docker compose ps
```
You should see:
- `luggagetrack_postgres` (Up, healthy, port 5432)
- `luggagetrack_backend` (Up, healthy, port 3001)
- `luggagetrack_frontend` (Up, port 80/443)

---

## 7. Verification

1. Access the web app in your browser at `http://<EC2-PUBLIC-IP>`.
2. Ensure you can log in using:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Check the **System Telemetry** (Monitoring) dashboard to verify real-time Docker and database status.
4. Try creating or updating a baggage record and filing a **Lost Baggage Report** to confirm persistence in the PostgreSQL database.
