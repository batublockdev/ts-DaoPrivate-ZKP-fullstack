INSERT INTO publicdata_table (nullfier, vote, main_table_id) VALUES (100, 200, 1);
INSERT INTO proof_table (field1, field2, field3, field4, field5, field6, field7, field8) VALUES (10, 20, 30, 40, 50, 60, 70, 80);
SELECT 
    m.id AS main_id,
    m.field1, m.field2, m.field3, m.field4,
    m.field5, m.field6, m.field7, m.field8,
    r.id AS related_id,
    r.nullfier, r.vote 
FROM 
    proof_table m
JOIN 
    publicdata_table r ON m.id = r.main_table_id;
