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
  scanned BOOLEAN, -- was this article counted ?
  suggested BOOLEAN -- was this article suggested by the AI ?
  -- CONSTRAINT fk_list
  --    FOREIGN KEY(list_id) 
  --      REFERENCES groceries_list(id)
);

CREATE TABLE IF NOT EXISTS scanner (
  id SERIAL PRIMARY KEY,
  state VARCHAR(50), -- "ACTIVE", "IDLE", "ERROR", "OFF"
  list_id INTEGER, -- id of the groceries_list currently processed by the scanner
  turnover FLOAT, -- the added price of all bought items
  nbArticles INT, -- number of articles scanned
  nbArticlesAI INT -- number of suggested articles scanned
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

-- calcul du turnover pour chaque scanner
CREATE OR REPLACE FUNCTION notify_turnover_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.turnover IS DISTINCT FROM NEW.turnover THEN
        PERFORM pg_notify(
            'turnover_change', 
            json_build_object('scanner_id', NEW.id, 'old_turnover', OLD.turnover, 'new_turnover', NEW.turnover)::text
        );
    END IF;
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

CREATE OR REPLACE FUNCTION notify_nb_articles_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.nbArticles IS DISTINCT FROM NEW.nbArticles THEN
        PERFORM pg_notify(
            'nb_articles_change',
            json_build_object(
                'scanner_id', NEW.id,
                'old_value', OLD.nbArticles,
                'new_value', NEW.nbArticles
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_articles_change
AFTER UPDATE OF nbArticles ON scanner
FOR EACH ROW
EXECUTE FUNCTION notify_nb_articles_change();

CREATE OR REPLACE FUNCTION notify_nb_articles_ai_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.nbArticlesAI IS DISTINCT FROM NEW.nbArticlesAI THEN
        PERFORM pg_notify(
            'nb_articles_ai_change',
            json_build_object(
                'scanner_id', NEW.id,
                'old_value', OLD.nbArticlesAI,
                'new_value', NEW.nbArticlesAI
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_articles_ai_change
AFTER UPDATE OF nbArticlesAI ON scanner
FOR EACH ROW
EXECUTE FUNCTION notify_nb_articles_ai_change();

INSERT INTO shop_articles VALUES (1, 'jambon HERTA 6 tranches', 'HERTA', 300, 3.50, 1, 1);
INSERT INTO shop_articles VALUES (2, 'jambon AUCHAN 6 tranches', 'AUCHAN', 300, 3.00, 1, 1);
INSERT INTO shop_articles VALUES (3, 'jambon AUCHAN 6 tranches BIO', 'AUCHAN', 300, 3.50, 1, 1);