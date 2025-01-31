require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const shoppingListRoutes = require('./routes/shoppingList');
const monitoring = require('./routes/monitoring');
const scanner = require('./routes/scanner');

app.use(express.json());
app.use('/shopping-list', shoppingListRoutes);
app.use('/monitoring', monitoring);
app.use('/scanner', scanner);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const WebSocket = require('ws');
const http = require('http');
const { Client } = require('pg');

// Crée un serveur HTTP
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Gestion des connexions WebSocket
wss.on('connection', (ws) => {
    console.log('Client connecté');

    // Événement lorsque le client envoie un message
    ws.on('message', (message) => {
        console.log('Message reçu:', message);
    });

    // Envoie un message de test au client
    ws.send(JSON.stringify({ message: 'Connexion établie' }));
});

const dbClient = new Client({
  user: '6gl',
  host: 'localhost', // Use the service name defined in docker-compose, to test in local, use localhost
  database: 'iot',
  password: '6gl',
  port: 5432,
});

dbClient.connect()
    .then(() => console.log('Connecté à PostgreSQL'))
    .catch(err => console.error('Erreur de connexion PostgreSQL:', err));

dbClient.query('LISTEN active_scanners_change');
dbClient.query('LISTEN scanner_state_change');
dbClient.query('LISTEN global_turnover_change');
dbClient.query('LISTEN global_articles_change');
dbClient.query('LISTEN global_articles_ai_change');

dbClient.on('notification', (msg) => {
    const channel = msg.channel;
    const payload = JSON.parse(msg.payload);

    if (channel === 'global_turnover_change') {
        console.log('Turnover Change:', payload);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event: 'global_turnover_change', data: payload }));
            }
        });
    } else if (channel === 'active_scanners_change') {
        console.log('Active Scanners Change:', payload);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event: 'active_scanners_change', data: payload }));
            }
        });
    } else if (channel === 'scanner_state_change') {
        console.log('Scanner State Change:', payload);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event: 'scanner_state_change', data: payload }));
            }
        });
    } else if (channel === 'global_articles_change') {
        console.log('Number of Articles Change:', payload);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event: 'global_articles_change', data: payload }));
            }
        });
    } else if (channel === 'global_articles_ai_change') {
        console.log('Number of AI Articles Change:', payload);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event: 'nb_articles_ai_change', data: payload }));
            }
        });
    }
});

// Démarrer le serveur
server.listen(3001, () => {
    console.log('Serveur WebSocket en écoute sur le port 3001');
});
