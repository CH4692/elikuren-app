#!/usr/bin/env bash
# Fügt die lokalen Elikuren-Hosts in /etc/hosts ein (einmal ausführen).

set -e
HOSTS_LINE="127.0.0.1 elikuren.local api.elikuren.local traefik.elikuren.local"

if grep -q "elikuren.local" /etc/hosts 2>/dev/null; then
  echo "Eintrag für elikuren.local ist bereits in /etc/hosts vorhanden."
  grep "elikuren" /etc/hosts
  exit 0
fi

echo "Folgende Zeile wird an /etc/hosts angehängt:"
echo "  $HOSTS_LINE"
echo ""
echo "Du wirst nach deinem Passwort gefragt (für sudo)."
sudo sh -c "echo '$HOSTS_LINE' >> /etc/hosts"
echo "Fertig. Du kannst jetzt z. B. http://elikuren.local:8081 im Browser öffnen."
