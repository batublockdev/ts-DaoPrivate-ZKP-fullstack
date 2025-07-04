-- Table 1: proof_table with large numeric fields
CREATE TABLE proof_table (
    id SERIAL PRIMARY KEY,
    proposal_id NUMERIC NOT NULL,
    field1 NUMERIC NOT NULL,
    field2 NUMERIC NOT NULL,
    field3 NUMERIC NOT NULL,
    field4 NUMERIC NOT NULL,
    field5 NUMERIC NOT NULL,
    field6 NUMERIC NOT NULL,
    field7 NUMERIC NOT NULL,
    field8 NUMERIC NOT NULL,
    Transation_hash TEXT NOT NULL,
    sended BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table 2: publicdata_table with large numeric fields
CREATE TABLE publicdata_table (
    id SERIAL PRIMARY KEY,
    nullfier NUMERIC NOT NULL,
    vote INTEGER NOT NULL CHECK (vote IN (0, 1, 2)),
    proof_table_id INTEGER NOT NULL REFERENCES proof_table(id) ON DELETE CASCADE
);

-- Table 2: publicdata_table with large numeric fields
CREATE TABLE makletree_commitments_table (
    id SERIAL PRIMARY KEY,
    commitment NUMERIC NOT NULL,
    proof_table_id INTEGER NOT NULL REFERENCES proof_table(proposal_id) ON DELETE CASCADE
);
/**
WE NEED TI CHANGE NUMBERIC DATAS BY TEXT
*/
CREATE TABLE makletree_leaves_table (
    id SERIAL PRIMARY KEY,
    tree_id INTEGER NOT NULL,
    leaf_index INTEGER NOT NULL,    
    leaf_value TEXT NOT NULL       

    UNIQUE (tree_id, leaf_index)
);

INSERT INTO makletree_leaves_table (tree_id, leaf_index, leaf_value)
VALUES (1, 0, '9544268642844573704226647894835027779097887973385979818262426097926729903982'),
  (1, 1, '5581525453447415493315491882928005573898416079263491592050413242111209948978'),
  (1, 2, '21879835473289089405366633954264833758077734612338952786509573456282948697519');

SELECT leaf_index, leaf_value
FROM makletree_leaves_table
WHERE tree_id = 1
ORDER BY leaf_index ASC;


INSERT INTO publicdata_table (nullfier, vote, proof_table_id) VALUES (100, 200, 1);
INSERT INTO proof_table (proposal_id, field1, field2, field3, field4, field5, field6, field7, field8, Transation_hash, sended) VALUES (10, 20, 30, 40, 50, 60, 70, 80, 11, 'sds2', FALSE);
SELECT 
    m.id AS main_id,
    m.proposal_id, m.field1, m.field2, m.field3, m.field4,
    m.field5, m.field6, m.field7, m.field8, m.Transation_hash, m.sended,
    r.id AS related_id,
    r.nullfier, r.vote 
FROM 
    proof_table m
JOIN 
    publicdata_table r ON m.id = r.proof_table_id;

TRUNCATE TABLE proof_table CASCADE;
TRUNCATE TABLE publicdata_table;
ALTER SEQUENCE proof_table_id_seq RESTART WITH 1;
ALTER SEQUENCE publicdata_table_id_seq RESTART WITH 1;

DROP TABLE publicdata_table;
DROP TABLE proof_table;

UPDATE proof_table
SET sended = TRUE
WHERE id IN (1, 2, 3, 4);



DELETE FROM proof_table
WHERE proposal_id = 123 RETURNING *;

DELETE FROM publicdata_table
WHERE proposal_id = 123;