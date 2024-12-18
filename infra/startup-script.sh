#!/bin/bash

sleep 10

sudo apt update

# Define repertory of project and move in
REPO_DIR="/home/debian/IoT_Backend/"
cd "$REPO_DIR"

# Configure Git to explicitly mark the directory as safe
git config --global --add safe.directory /home/debian/IoT_Backend

# Pulling github backend repository
git pull

# Clean up old containers
sudo docker compose -f "$REPO_DIR/docker-compose.yaml" down

# Make sure container doesn't block ports
sudo docker container prune --force

# Build and start the services in detached mode
sudo docker compose -f "$REPO_DIR/docker-compose.yaml" up --build -d
