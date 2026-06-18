#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
#  LuggageTrack — AWS EC2 Ubuntu Bootstrap Script
#  Run once on a fresh Ubuntu 22.04 LTS EC2 instance
#  Usage:  bash setup-ec2.sh
# ══════════════════════════════════════════════════════════════
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── 1. System update ──────────────────────────────────────────
info "Updating Ubuntu packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git unzip ufw

# ── 2. Install Docker ─────────────────────────────────────────
info "Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sudo bash
  sudo usermod -aG docker "$USER"
  info "Docker installed. You may need to log out and back in."
else
  warn "Docker already installed, skipping."
fi

# ── 3. Install Docker Compose v2 ─────────────────────────────
info "Installing Docker Compose..."
if ! docker compose version &>/dev/null; then
  COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest \
    | grep '"tag_name"' | sed 's/.*"v\([^"]*\)".*/\1/')
  sudo curl -SL \
    "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
fi
docker compose version

# ── 4. Configure UFW firewall ─────────────────────────────────
info "Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status

# ── 5. Clone / upload project ─────────────────────────────────
APP_DIR="$HOME/luggagetrack"

if [ ! -d "$APP_DIR" ]; then
  info "Cloning repository..."
  # Replace with your actual GitHub repo URL:
  git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git "$APP_DIR"
else
  info "Repo already exists, pulling latest changes..."
  git -C "$APP_DIR" pull
fi

# ── 6. Set up .env ────────────────────────────────────────────
info "Setting up environment variables..."
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  warn "⚠  Please edit $APP_DIR/.env and set strong passwords!"
  warn "   Run: nano $APP_DIR/.env"
  warn "   Then re-run: cd $APP_DIR && docker compose up -d --build"
  exit 0
fi

# ── 7. Create certbot directories ─────────────────────────────
mkdir -p "$APP_DIR/certbot/conf" "$APP_DIR/certbot/www"

# ── 8. Build & launch ─────────────────────────────────────────
info "Building Docker images and starting containers..."
cd "$APP_DIR"
docker compose up -d --build

# ── 9. Status check ───────────────────────────────────────────
sleep 10
info "Container status:"
docker compose ps

info "API health check:"
curl -sf http://localhost/api/health || warn "API not yet ready — wait ~30 seconds and retry."

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  LuggageTrack is live!                           ${NC}"
echo -e "${GREEN}  App URL:  http://$(curl -sf https://checkip.amazonaws.com)${NC}"
echo -e "${GREEN}  Login:    admin / admin123                      ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
