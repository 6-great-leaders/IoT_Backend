#!/bin/bash

sleep 10

# Définir $HOME pour éviter les erreurs avec Git
export HOME=/home/debian

sudo apt update

# Définir le répertoire du projet
REPO_DIR="/home/debian/IoT_Backend"

# Vérifier si le dépôt existe déjà
if [ -d "$REPO_DIR/.git" ]; then
    echo "Repository already exists. Pulling latest changes..."
    cd "$REPO_DIR"

    # Changer le propriétaire du dépôt pour éviter les erreurs de permission
    sudo chown -R debian:debian "$REPO_DIR"
    sudo chmod -R u+rw "$REPO_DIR"

    # Corriger le problème "detected dubious ownership"
    sudo -u debian git config --global --add safe.directory "$REPO_DIR"

    # Réinitialiser proprement et récupérer les dernières modifications
    sudo -u debian git reset --hard
    sudo -u debian git clean -fd
    sudo -u debian git pull origin main
else
    echo "Repository does not exist. Cloning..."
    sudo -u debian git clone https://github.com/6-great-leaders/IoT_Backend.git "$REPO_DIR"
fi

cd "$REPO_DIR"

# Nettoyer les anciens conteneurs
sudo docker compose -f "$REPO_DIR/docker-compose.yaml" down

# Nettoyer les conteneurs bloquants
sudo docker container prune --force

# Construire et lancer les services en arrière-plan
sudo docker compose -f "$REPO_DIR/docker-compose.yaml" up --build -d
