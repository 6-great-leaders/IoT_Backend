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

INSERT INTO shop_articles VALUES (1, 'jambon HERTA 6 tranches', 'HERTA', 300, 3.50, 1, 1);
INSERT INTO shop_articles VALUES (2, 'jambon AUCHAN 6 tranches', 'AUCHAN', 300, 3.00, 1, 1);
INSERT INTO shop_articles VALUES (3, 'jambon AUCHAN 6 tranches BIO', 'AUCHAN', 300, 3.50, 1, 1);

