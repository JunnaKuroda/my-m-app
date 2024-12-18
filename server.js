const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // メインデータベースモジュール
const lineDb = require('./line_db'); // LINE用データベースモジュール

const app = express();

app.use(cors());
app.use(bodyParser.json());

// --- 注文関連のエンドポイント ---

// 注文を保存
app.post('/submit-order', (req, res) => {
    const { sender, quantity_a, quantity_b } = req.body;

    const safeSender = sender || 'Anonymous';
    const safeQuantityA = quantity_a || 0;
    const safeQuantityB = quantity_b || 0;
    const timestamp = new Date().toISOString();
    const productA = 'Extra Bar Mild';
    const productB = 'Golden Sack';

    const query = `
        INSERT INTO orders (timestamp, sender, product_a, quantity_a, product_b, quantity_b)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [timestamp, safeSender, productA, safeQuantityA, productB, safeQuantityB], function (err) {
        if (err) {
            console.error('データ保存エラー:', err);
            return res.status(500).json({ message: 'データ保存に失敗しました。' });
        }
        console.log('データ保存成功:', {
            id: this.lastID,
            timestamp,
            sender: safeSender,
            quantity_a: safeQuantityA,
            quantity_b: safeQuantityB,
        });
        res.json({ message: '注文が保存されました！', orderId: this.lastID });
    });
});

// 注文一覧を取得
app.get('/orders', (req, res) => {
    const query = `SELECT * FROM orders ORDER BY timestamp DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('データ取得エラー:', err);
            return res.status(500).json({ message: 'データ取得に失敗しました。' });
        }
        res.json(rows);
    });
});

// 注文データをクリア
app.delete('/clear-orders', (req, res) => {
    const query = 'DELETE FROM orders';
    db.run(query, function (err) {
        if (err) {
            console.error('データ削除エラー:', err);
            return res.status(500).json({ message: 'データ削除に失敗しました。' });
        }
        console.log('すべてのデータが削除されました');
        res.json({ message: 'すべての結果がクリアされました。' });
    });
});

// --- LINEユーザー関連のエンドポイント ---

// LINEユーザーを登録
app.post('/register-line-user', (req, res) => {
    const { line_user_id, orderer_name } = req.body;

    if (!line_user_id || !orderer_name) {
        return res.status(400).json({ message: 'LINEユーザーIDと注文者名が必要です。' });
    }

    const query = `
        INSERT INTO line_users (line_user_id, orderer_name)
        VALUES (?, ?)
    `;
    lineDb.run(query, [line_user_id, orderer_name], function (err) {
        if (err) {
            console.error('データ登録エラー:', err);
            return res.status(500).json({ message: '登録に失敗しました。' });
        }
        res.json({ message: '登録に成功しました！', userId: this.lastID });
    });
});

// LINEユーザーIDから注文者名を取得
app.get('/get-orderer-name/:line_user_id', (req, res) => {
    const { line_user_id } = req.params;

    const query = `
        SELECT orderer_name FROM line_users WHERE line_user_id = ?
    `;
    lineDb.get(query, [line_user_id], (err, row) => {
        if (err) {
            console.error('データ照合エラー:', err);
            return res.status(500).json({ message: 'データ取得に失敗しました。' });
        }
        if (!row) {
            return res.status(404).json({ message: 'ユーザーが見つかりません。' });
        }
        res.json({ orderer_name: row.orderer_name });
    });
});

// --- サーバー起動 ---
const PORT = process.env.PORT || 3000;
// トップページの設定
app.get('/', (req, res) => {
  res.send('Hello, this is the homepage of your app!');
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});