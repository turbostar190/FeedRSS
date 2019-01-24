--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: lastCheck
DROP TABLE IF EXISTS lastCheck;
CREATE TABLE lastCheck (timestamp VARCHAR NOT NULL DEFAULT (1516034700000));

-- Table: user
DROP TABLE IF EXISTS user;
CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, uid VARCHAR (15) NOT NULL);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
