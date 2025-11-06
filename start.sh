#!/bin/bash

echo "==================================="
echo "  Lancement de Suivi Performance"
echo "==================================="
echo ""

# Vérifier Python
if command -v python3 &> /dev/null; then
    echo "✓ Python3 trouvé"
    echo ""
    echo "Démarrage du serveur sur http://localhost:8000"
    echo ""
    echo "INSTRUCTIONS:"
    echo "1. Ouvrez votre navigateur"
    echo "2. Allez sur: http://localhost:8000"
    echo "3. Sur mobile, scannez ce QR code ou entrez l'IP de votre machine"
    echo ""
    echo "Pour arrêter: Ctrl+C"
    echo ""
    echo "-----------------------------------"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✓ Python trouvé"
    echo ""
    echo "Démarrage du serveur sur http://localhost:8000"
    echo ""
    echo "Pour arrêter: Ctrl+C"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python n'est pas installé"
    echo ""
    echo "Alternatives:"
    echo "1. Installez Python: https://www.python.org/downloads/"
    echo "2. Utilisez Node.js: npx http-server -p 8000"
    echo "3. Utilisez PHP: php -S localhost:8000"
fi
