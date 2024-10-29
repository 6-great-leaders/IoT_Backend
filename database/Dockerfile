# Utilisation de l'image officielle de PostgreSQL
FROM postgres:latest

# Variables d'environnement pour initialiser le nom de la base, l'utilisateur et le mot de passe
ENV POSTGRES_DB=iot
ENV POSTGRES_USER=6gl
ENV POSTGRES_PASSWORD=6gl

# Copier le script SQL d'initialisation
COPY ./init.sql /docker-entrypoint-initdb.d/