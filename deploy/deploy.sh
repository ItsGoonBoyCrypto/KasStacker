#!/usr/bin/env bash
# KasStacker — build and push the static site to the server from this machine.
# (CI does the same on every push to main; this is the manual/backup path.)
#
#     deploy/deploy.sh
#
# Uses the restricted `kasstacker` user, which owns only /var/www/kasstacker.
set -euo pipefail
cd "$(dirname "$0")/.."

KEY="${KASSTACKER_DEPLOY_KEY_FILE:-$HOME/.ssh/kasstacker_deploy}"
DEST="kasstacker@178.105.167.184"

pnpm build
scp -i "$KEY" -o BatchMode=yes -r dist/* "$DEST:/var/www/kasstacker/"
# scp preserves Windows-side modes, which nginx can't read — normalise.
ssh -i "$KEY" -o BatchMode=yes "$DEST" "chmod -R a+rX /var/www/kasstacker"
echo "==> live: check https://kasstacker.org (or curl -H 'Host: kasstacker.org' http://178.105.167.184/)"
