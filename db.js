const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./orders.db');

// テーブル作成
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            sender TEXT NOT NULL,
            product_a TEXT NOT NULL,
            quantity_a INTEGER NOT NULL,
            product_b TEXT NOT NULL,
            quantity_b INTEGER NOT NULL
        )
    `);
});

module.exports = db;