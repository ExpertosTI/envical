#!/usr/bin/env bash
# ── envical — Renace Protocol deploy.sh ──────────────────────
#  Uso en el VPS:
#      cd /opt/envical && ./deploy.sh
#  Primera vez: clona el repo en PROJECT_DIR y despliega.

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ExpertosTI/envical.git}"
PROJECT_DIR="${PROJECT_DIR:-/opt/envical}"
STACK_NAME="${STACK_NAME:-envios}"
SERVICE_NAME="${STACK_NAME}_web"
DOMAIN="${DOMAIN:-envios.renace.tech}"

cyan()  { printf "\033[36m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }

cyan "── 1. Sincronizar fuente ───────────────────────"
if [ -d "$PROJECT_DIR/.git" ]; then
  cd "$PROJECT_DIR"
  git fetch origin main
  git reset --hard origin/main
else
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

cyan "── 2. Construir imagen local ───────────────────"
docker compose build

cyan "── 3. Asegurar red RenaceNet ───────────────────"
if ! docker network ls --format '{{.Name}}' | grep -qx "RenaceNet"; then
  docker network create --driver overlay --attachable RenaceNet
fi

cyan "── 4. Desplegar stack ($STACK_NAME → $DOMAIN) ──"
export DOMAIN
docker stack deploy -c docker-compose.yml "$STACK_NAME"

cyan "── 5. Forzar uso de la imagen nueva ────────────"
docker service update --force "$SERVICE_NAME" >/dev/null 2>&1 || true

cyan "── 6. Limpiar imagenes huerfanas ───────────────"
docker image prune -f >/dev/null

green ""
green "✅ envical desplegado."
green "   Sitio:    https://$DOMAIN"
green "   Servicio: $SERVICE_NAME"
green "   Logs:     docker service logs -f $SERVICE_NAME"
