CREATE TABLE IF NOT EXISTS "user" (
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
  scanned BOOLEAN -- was this article counted ?
  -- CONSTRAINT fk_list
  --    FOREIGN KEY(list_id) 
  --      REFERENCES groceries_list(id)
);

CREATE TABLE IF NOT EXISTS scanner (
  id SERIAL PRIMARY KEY,
  state VARCHAR(50), -- "ACTIVE", "IDLE", "ERROR", "OFF"
  list_id INTEGER -- id of the groceries_list currently processed by the scanner
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
  y FLOAT
);


-- Réinitialiser la séquence (au cas où les valeurs sont déjà présentes)
SELECT setval('shop_articles_id_seq', (SELECT MAX(id) FROM shop_articles));

-- Articles pour Pizza Bio Végétarienne
INSERT INTO shop_articles (name, brand, weight, price, x, y) VALUES
('Pâte à Pizza BIO', 'BIO VILLAGE', 400, 1.50, 2, 3),
('Sauce Tomate BIO', 'BIO VILLAGE', 200, 1.20, 3, 3),
('Fromage Râpé BIO', 'BIO VILLAGE', 150, 2.50, 3, 4),
('Champignons BIO', 'BIO VILLAGE', 250, 3.00, 4, 3);

-- Articles pour Pizza Reine non Bio
INSERT INTO shop_articles (name, brand, weight, price, x, y) VALUES
('Pâte à Pizza', 'HERTA', 400, 1.20, 2, 3),
('Sauce Tomate', 'HEINZ', 200, 1.00, 3, 3),
('Fromage Râpé', 'ENTREMONT', 150, 2.00, 3, 4),
('Jambon', 'HERTA', 300, 3.50, 1, 1);

-- Articles pour Mojito avec alcool
INSERT INTO shop_articles (name, brand, weight, price, x, y) VALUES
('Rhum Blanc', 'HAVANA CLUB', 700, 15.00, 5, 2),
('Feuilles de Menthe', 'BIO VILLAGE', 50, 1.50, 5, 1),
('Citrons Vert BIO', 'BIO VILLAGE', 300, 2.50, 6, 1),
('Sucre', 'BEGHIN SAY', 1000, 1.00, 4, 4),
('Eau Pétillante', 'PERRIER', 1500, 1.20, 6, 2);