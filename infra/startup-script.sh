#!/bin/bash

sleep 10

echo "Startup script is running..." > /var/log/startup-script.log

# Mettre à jour les paquets et installer Docker
sudo apt update

# Définir le répertoire du projet et se déplacer dedans
REPO_DIR="/home/debian/IoT_Backend/"
cd "$REPO_DIR"

# To remove before merging into main !!
git switch feature-512-deploy-backend

# Pulling github backend repository
git pull

# Make sure container doesn't block ports
sudo docker container prune --force

cd "$REPO_DIR/database"
# Construire l'image Docker
sudo docker build -t my-postgres-db .

# Lancer le conteneur Docker
sudo docker run -d -p 5432:5432 my-postgres-db

cd "$REPO_DIR/backend"

# Construire l'image Docker
sudo docker build -t node-backend .

# Lancer le conteneur Docker
sudo docker run -d -p 3000:3000 node-backend