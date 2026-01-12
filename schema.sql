DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    level INTEGER DEFAULT 0,
    money INTEGER DEFAULT 200000,
    wins INTEGER DEFAULT 0,
    last_daily TEXT,
    weapon_name TEXT
);