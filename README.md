# IoT_Backend
Ce dépôt GitHub est consacré au développement du backend. Construit avec Node.js.


# Database 

## Pour initialiser la base de donnees

- `cd database`
- `docker build -t iot-db .`
- `docker run --name iot-db-container -p 5432:5432 -d iot-db`

## Pour se connecter a la base de donees

- `psql -U 6gl iot`