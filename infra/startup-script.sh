#!/bin/bash

sleep 10

echo "Startup script is running..." > /var/log/startup-script.log

sudo apt update

# Define repertory of project and move in
REPO_DIR="/home/debian/IoT_Backend/"
cd "$REPO_DIR"

# Configure Git to explicitly mark the directory as safe
git config --global --add safe.directory /home/debian/IoT_Backend

# Pulling github backend repository
git pull

# Make sure container doesn't block ports
sudo docker container prune --force

cd "$REPO_DIR/database"
sudo docker build -t my-postgres-db .

sudo docker run -d -p 5432:5432 my-postgres-db

cd "$REPO_DIR/backend"

sudo docker build -t node-backend .

sudo docker run -d -p 4000:4000 node-backend