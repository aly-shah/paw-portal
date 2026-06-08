#!/usr/bin/env bash
#
# deploy.sh — Build & deploy PawPortal (Vite/React static SPA)
#
# What it does:
#   1. Installs npm dependencies and builds the static site (-> ./dist)
#   2. Serves ./dist on port 7070 via pm2 (SPA fallback enabled)
#   3. Configures nginx as a reverse proxy for the domain
#   4. Obtains/renews a Let's Encrypt SSL certificate via certbot
#
# Usage (on the server):
#   cd /var/www/<this-repo>
#   git pull
#   ./deploy.sh            # or: bash deploy.sh
#
# Re-running is safe (idempotent): it rebuilds and reloads everything.
#
set -euo pipefail

# ----------------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------------
APP_NAME="pawportal"
PORT=7070
DOMAIN="paw.scalamedic.com"
CERTBOT_EMAIL="hhhawkin989898@gmail.com"

# Directory this script lives in (the repo root)
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$APP_DIR/dist"

# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
log()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\n\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\n\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

# Run a command with sudo if we're not already root
SUDO=""
if [[ "$(id -u)" -ne 0 ]]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    die "Not running as root and 'sudo' is not available. Re-run as root."
  fi
fi

need() { command -v "$1" >/dev/null 2>&1; }

# ----------------------------------------------------------------------------
# 0. Pre-flight checks
# ----------------------------------------------------------------------------
log "Deploying '$APP_NAME' from: $APP_DIR"

need node || die "node is not installed. Install Node.js 18+ first."
need npm  || die "npm is not installed. Install Node.js/npm first."
log "node $(node -v) / npm $(npm -v)"

# Warn if the Gemini API key isn't present (AI features need it at BUILD time)
if [[ -f "$APP_DIR/.env.local" ]] && grep -q 'GEMINI_API_KEY=.\+' "$APP_DIR/.env.local" \
   && ! grep -q 'GEMINI_API_KEY=PLACEHOLDER_API_KEY' "$APP_DIR/.env.local"; then
  log "Found .env.local with a GEMINI_API_KEY — AI features will be enabled."
else
  warn "No real GEMINI_API_KEY found in .env.local."
  warn "The site will build and run fine, but Gemini-powered AI features will be disabled."
  warn "To enable them: create $APP_DIR/.env.local with 'GEMINI_API_KEY=your_key' and re-run."
fi

# ----------------------------------------------------------------------------
# 1. Install dependencies & build
# ----------------------------------------------------------------------------
log "Installing npm dependencies..."
cd "$APP_DIR"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

log "Building production bundle (npm run build)..."
npm run build
[[ -d "$DIST_DIR" ]] || die "Build did not produce a dist/ directory."

# ----------------------------------------------------------------------------
# 2. Serve dist/ on PORT via pm2 (SPA mode)
# ----------------------------------------------------------------------------
if ! need pm2; then
  log "Installing pm2 globally..."
  $SUDO npm install -g pm2
fi

log "Starting/reloading pm2 process '$APP_NAME' on port $PORT (SPA mode)..."
# Remove any previous instance so we can re-create it cleanly with current settings
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
# 'pm2 serve' runs a static file server; --spa rewrites unknown routes to index.html
pm2 serve "$DIST_DIR" "$PORT" --name "$APP_NAME" --spa
pm2 save

# Make pm2 resurrect on reboot (prints/runs the systemd startup hook)
log "Configuring pm2 to start on boot..."
STARTUP_CMD="$(pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null | grep '^sudo ' || true)"
if [[ -n "$STARTUP_CMD" ]]; then
  eval "$STARTUP_CMD" || warn "Could not auto-run pm2 startup; run it manually:\n  $STARTUP_CMD"
  pm2 save
fi

# ----------------------------------------------------------------------------
# 3. nginx reverse proxy
# ----------------------------------------------------------------------------
if ! need nginx; then
  log "Installing nginx..."
  $SUDO apt-get update -y
  $SUDO apt-get install -y nginx
fi

NGINX_AVAIL="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

log "Writing nginx config for $DOMAIN -> 127.0.0.1:$PORT ..."
$SUDO tee "$NGINX_AVAIL" >/dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Reverse proxy to the pm2-served static SPA
    location / {
        proxy_pass         http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
NGINX

$SUDO ln -sfn "$NGINX_AVAIL" "$NGINX_ENABLED"

# Drop the default site if it's still enabled (it can shadow our server_name)
[[ -e /etc/nginx/sites-enabled/default ]] && $SUDO rm -f /etc/nginx/sites-enabled/default || true

log "Testing & reloading nginx..."
$SUDO nginx -t
$SUDO systemctl reload nginx

# ----------------------------------------------------------------------------
# 4. SSL via certbot (Let's Encrypt)
# ----------------------------------------------------------------------------
if ! need certbot; then
  log "Installing certbot..."
  $SUDO apt-get update -y
  $SUDO apt-get install -y certbot python3-certbot-nginx
fi

log "Obtaining/renewing SSL certificate for $DOMAIN ..."
warn "This requires that $DOMAIN's DNS A/AAAA record already points to THIS server,"
warn "and that ports 80 & 443 are open. If not, this step will fail — fix DNS and re-run."
$SUDO certbot --nginx \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --redirect \
  -m "$CERTBOT_EMAIL" \
  || warn "certbot failed (likely DNS/firewall not ready). Site still serves over HTTP. Re-run after fixing."

$SUDO systemctl reload nginx || true

# ----------------------------------------------------------------------------
# Done
# ----------------------------------------------------------------------------
log "Deployment complete!"
echo "  • App:    https://$DOMAIN  (via nginx -> 127.0.0.1:$PORT)"
echo "  • pm2:    pm2 status / pm2 logs $APP_NAME"
echo "  • Rebuild & redeploy:  git pull && ./deploy.sh"
