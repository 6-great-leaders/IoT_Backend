﻿CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  login VARCHAR(50),
  password VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS list_article (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  article_id INTEGER,
  name VARCHAR(50),
  active BOOLEAN, -- did the user remove this article from his list ?
  scanned BOOLEAN, -- was this article counted ?
  suggested BOOLEAN -- was this article suggested by the AI ?
  -- CONSTRAINT fk_list
  --    FOREIGN KEY(list_id) 
  --      REFERENCES groceries_list(id)
);

CREATE TABLE IF NOT EXISTS scanner (
  id SERIAL PRIMARY KEY,
  state VARCHAR(50) NOT NULL, -- "ACTIVE", "IDLE", "ERROR", "OFF"
  list_id INTEGER DEFAULT NULL, -- id of the groceries_list currently processed by the scanner
  turnover FLOAT DEFAULT 0, -- the added price of all bought items
  nbArticles INT DEFAULT 0, -- number of articles scanned
  nbArticlesAI INT DEFAULT 0, -- number of suggested articles scanned
  last_healthcheck TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_scanner (
  id SERIAL PRIMARY KEY,
  scanner_id INT,
  produced_at TIMESTAMP,
  action VARCHAR(50), -- picked up, dropped, scanned QR, scanned article, cancel scan
  article_id INT -- corresponds to the id in shop_article table, not null if the action was "scanned article" or "cancel scan"
  -- CONSTRAINT fk_scanner
  --   FOREIGN KEY(scanner_id)
  --     REFERENCES scanner(id)
);

CREATE TABLE IF NOT EXISTS shop_articles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  brand VARCHAR(50),
  weight INT, -- poids en grammes
  price FLOAT, -- in euros
  x FLOAT, -- coordinates of the article in the store
  y FLOAT,
  image VARCHAR(255) DEFAULT 'https://storage.googleapis.com/iot-images-genial/carton.png'
);

-- calcul du turnover pour chaque scanner
CREATE OR REPLACE FUNCTION notify_turnover_change()
RETURNS TRIGGER AS $$
DECLARE
    global_turnover INT;
BEGIN
    SELECT SUM(turnover) INTO global_turnover FROM scanner;

    -- Envoyer une notification avec le turnover global
    PERFORM pg_notify(
        'global_turnover_change',
        json_build_object('global_turnover', global_turnover)::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_turnover_change
AFTER UPDATE OF turnover ON scanner
FOR EACH ROW
EXECUTE FUNCTION notify_turnover_change();

-- calcul du nombre de scanner avec le state "ACTIVE"
CREATE OR REPLACE FUNCTION notify_active_scanners()
RETURNS TRIGGER AS $$
DECLARE
    active_count INT;
BEGIN
    -- Calculer le nombre de scanners avec state = 'ACTIVE'
    SELECT COUNT(*) INTO active_count FROM scanner WHERE state = 'ACTIVE';

    -- Envoyer la notification avec le nombre de scanners actifs
    PERFORM pg_notify(
        'active_scanners_change', 
        json_build_object('active_count', active_count)::text
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_active_scanners
AFTER UPDATE OF state ON scanner
FOR EACH ROW
EXECUTE FUNCTION notify_active_scanners();


-- Fonction pour notifier les changements d'état des scanettes
CREATE OR REPLACE FUNCTION notify_scanner_state_change()
RETURNS TRIGGER AS $$
DECLARE
    state_change JSON;
BEGIN
    -- Construire un objet JSON avec les détails de la scanette modifiée
    state_change := json_build_object(
        'scanner_id', NEW.id,
        'new_state', NEW.state,
        'old_state', OLD.state
    );

    -- Envoyer une notification via pg_notify
    PERFORM pg_notify(
        'scanner_state_change',
        state_change::text
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur les changements du champ `state`
CREATE TRIGGER trigger_scanner_state_change
AFTER UPDATE OF state ON scanner
FOR EACH ROW
WHEN (OLD.state IS DISTINCT FROM NEW.state) -- Se déclenche uniquement si `state` change
EXECUTE FUNCTION notify_scanner_state_change();

CREATE OR REPLACE FUNCTION notify_nb_articles_change()
RETURNS TRIGGER AS $$
DECLARE
    total_articles INT;
BEGIN
    SELECT SUM(nbArticles) INTO total_articles FROM scanner;
    PERFORM pg_notify(
        'global_articles_change',
        json_build_object(
            'total_articles', total_articles
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_articles_change
AFTER UPDATE OF nbArticles ON scanner
FOR EACH ROW
EXECUTE FUNCTION notify_nb_articles_change();

CREATE OR REPLACE FUNCTION notify_nb_articles_ai_change()
RETURNS TRIGGER AS $$
DECLARE
    total_ai_articles INT;
BEGIN
    SELECT SUM(nbArticlesAI) INTO total_ai_articles FROM scanner;

    PERFORM pg_notify(
        'global_articles_ai_change',
        json_build_object(
            'total_ai_articles', total_ai_articles
        )::text
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_articles_ai_change
AFTER UPDATE OF nbArticlesAI ON scanner
FOR EACH ROW
EXECUTE FUNCTION notify_nb_articles_ai_change();


-- Réinitialiser la séquence (au cas où les valeurs sont déjà présentes)
SELECT setval('shop_articles_id_seq', (SELECT MAX(id) FROM shop_articles));

-- Articles pour Pizza Bio Végétarienne
INSERT INTO shop_articles (name, brand, weight, price, x, y, image) VALUES
('Pate a Pizza BIO', 'BIO VILLAGE', 400, 1.50, 2, 3, 'https://storage.googleapis.com/iot-images-genial/pate%20pizza%20BIO.png'),
('Sauce Tomate BIO', 'BIO VILLAGE', 200, 1.20, 3, 3, 'https://storage.googleapis.com/iot-images-genial/sauce%20tomate%20BIO.png'),
('Fromage Rape BIO', 'BIO VILLAGE', 150, 2.50, 3, 4, 'https://storage.googleapis.com/iot-images-genial/fromage%20rape%20BIO.png'),
('Champignons BIO', 'BIO VILLAGE', 250, 3.00, 4, 3, 'https://storage.googleapis.com/iot-images-genial/champignons%20BIO.png');

-- Articles pour Pizza Reine non Bio
INSERT INTO shop_articles (name, brand, weight, price, x, y, image) VALUES
('Pate a Pizza', 'HERTA', 400, 1.20, 2, 3, 'https://storage.googleapis.com/iot-images-genial/pate%20pizza.jpg'),
('Sauce Tomate', 'HEINZ', 200, 1.00, 3, 3, 'https://storage.googleapis.com/iot-images-genial/sauce%20tomate.jpg'),
('Fromage Rape', 'ENTREMONT', 150, 2.00, 3, 4, 'https://storage.googleapis.com/iot-images-genial/fromage%20rape.jpg'),
('Jambon', 'HERTA', 300, 3.50, 1, 1, 'https://storage.googleapis.com/iot-images-genial/jambon.jpg');

-- Articles pour Mojito avec alcool
INSERT INTO shop_articles (name, brand, weight, price, x, y, image) VALUES
('Rhum Blanc', 'HAVANA CLUB', 700, 15.00, 5, 2, 'https://storage.googleapis.com/iot-images-genial/rhum.png'),
('Feuilles de Menthe', 'BIO VILLAGE', 50, 1.50, 5, 1, 'https://storage.googleapis.com/iot-images-genial/menthe.jpg'),
('Citrons Vert BIO', 'BIO VILLAGE', 300, 2.50, 6, 1, 'https://storage.googleapis.com/iot-images-genial/citron%20vert.jpg'),
('Sucre', 'BEGHIN SAY', 1000, 1.00, 4, 4, 'https://storage.googleapis.com/iot-images-genial/sucre.jpg'),
('Eau Petillante', 'PERRIER', 1500, 1.20, 6, 2, 'https://storage.googleapis.com/iot-images-genial/perrier.jpg');


INSERT INTO scanner (id, state) VALUES (1, 'OFF');
INSERT INTO scanner (id, state) VALUES (2, 'OFF');
INSERT INTO scanner (id, state) VALUES (3, 'OFF');
INSERT INTO scanner (id, state) VALUES (4, 'OFF');
INSERT INTO scanner (id, state) VALUES (5, 'OFF');
INSERT INTO scanner (id, state) VALUES (6, 'OFF');
INSERT INTO scanner (id, state) VALUES (7, 'OFF');
INSERT INTO scanner (id, state) VALUES (8, 'OFF');
INSERT INTO scanner (id, state) VALUES (9, 'OFF');
INSERT INTO scanner (id, state) VALUES (10, 'OFF');
