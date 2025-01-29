#!/bin/bash

sleep 10

sudo apt update

# Define repertory of project and move in
REPO_DIR="/home/debian/IoT_Backend/"

# Configure Git to explicitly mark the directory as safe
git config --global --add safe.directory /home/debian/IoT_Backend

# Pulling github backend repository
cd ~
sudo rm -rf ~/IoT_Backend
git clone https://github.com/6-great-leaders/IoT_Backend.git
cd IoT_Backend

# Clean up old containers
sudo docker compose -f "$REPO_DIR/docker-compose.yaml" down

# Make sure container doesn't block ports
sudo docker container prune --force

# Build and start the services in detached mode
sudo docker compose -f "$REPO_DIR/docker-compose.yaml" up --build -d
