const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // データベースモジュールをインポート

const app = express();

app.use(cors());
app.use(bodyParser.json());

// POSTエンドポイント: データを保存
app.post('/submit-order', (req, res) => {
  const { sender, quantity_a, quantity_b } = req.body;

  // リクエストボディを明示的にログに出力
  console.log('リクエストボディを受信:', req.body);

  const safeSender = sender || '匿名ユーザー';
  const safeQuantityA = quantity_a || 0;
  const safeQuantityB = quantity_b || 0;
  const timestamp = new Date().toISOString();
  const product_a = 'Extra Bar Mild';
  const product_b = 'Golden Sack';

  const query = `
      INSERT INTO orders (timestamp, sender, product_a, quantity_a, product_b, quantity_b)
      VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [timestamp, safeSender, product_a, safeQuantityA, product_b, safeQuantityB];

  db.run(query, params, function (err) {
      if (err) {
          console.error('データ保存エラー:', err);
          res.status(500).json({ message: 'データ保存に失敗しました。' });
      } else {
          console.log('データ保存成功:', {
              id: this.lastID,
              timestamp,
              sender: safeSender,
              quantity_a: safeQuantityA,
              quantity_b: safeQuantityB,
          });
          res.json({ message: '注文が保存されました！', orderId: this.lastID });
      }
  });
});


// 動作確認用
app.get('/', (req, res) => {
    res.send('Node.js with SQLite is working!');
});

// サーバー起動
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

app.get('/orders', (req, res) => {
  const query = `SELECT * FROM orders ORDER BY timestamp DESC`;
  db.all(query, [], (err, rows) => {
      if (err) {
          console.error('データ取得エラー:', err);
          res.status(500).json({ message: 'データ取得に失敗しました。' });
      } else {
          res.json(rows);
      }
  });
});