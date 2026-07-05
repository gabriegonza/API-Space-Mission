#!/bin/sh
set -eu

cat > /usr/share/nginx/html/env.js <<EOF
window.__SPACE_MISSIONS_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:3001}",
  VITE_N8N_URL: "${VITE_N8N_URL:-http://localhost:5678}"
};
EOF

exec nginx -g "daemon off;"
