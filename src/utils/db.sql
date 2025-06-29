-- Table 1: main_table with 8 required integer fields and an id
CREATE TABLE proof_table (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER NOT NULL,
    field1 INTEGER NOT NULL,
    field2 INTEGER NOT NULL,
    field3 INTEGER NOT NULL,
    field4 INTEGER NOT NULL,
    field5 INTEGER NOT NULL,
    field6 INTEGER NOT NULL,
    field7 INTEGER NOT NULL,
    field8 INTEGER NOT NULL,
    sended BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table 2: related_table with 2 required integer fields and a foreign key to main_table.id
CREATE TABLE publicdata_table (
    id SERIAL PRIMARY KEY,
    nullfier INTEGER NOT NULL,
    vote INTEGER NOT NULL CHECK (vote IN (0, 1, 2)),
    proof_table_id INTEGER NOT NULL REFERENCES proof_table(id) ON DELETE CASCADE
);


INSERT INTO publicdata_table (nullfier, vote, proof_table_id) VALUES (100, 200, 1);
INSERT INTO proof_table (proposal_id, field1, field2, field3, field4, field5, field6, field7, field8, sended) VALUES (10, 20, 30, 40, 50, 60, 70, 80, 11, FALSE);
SELECT 
    m.id AS main_id,
    m.proposal_id, m.field1, m.field2, m.field3, m.field4,
    m.field5, m.field6, m.field7, m.field8, m.sended,
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