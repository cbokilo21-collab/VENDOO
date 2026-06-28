#!/bin/bash
cd "$(dirname "$0")"
echo "Démarrage du serveur Vendoo..."
npx serve dist --listen 3000
