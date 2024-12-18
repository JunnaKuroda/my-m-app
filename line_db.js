const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./line_users.db');

// テーブル作成
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS line_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            line_user_id TEXT NOT NULL UNIQUE,
            orderer_name TEXT NOT NULL
        )
    `);
});

module.exports = db;