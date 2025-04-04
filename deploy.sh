#!/bin/bash

echo "Déploiement en cours..."

# Installation des dépendances
npm install

# Génération du build
npm run build

# Génération et migration Prisma
npx prisma generate
npx prisma migrate deploy

# Démarrage du worker PM2
cd workers
pm2 restart queue-worker.js || pm2 start queue-worker.js

# Retour au dossier principal et lancement du serveur
cd ..
npm start

echo "Déploiement terminé avec succès !"
