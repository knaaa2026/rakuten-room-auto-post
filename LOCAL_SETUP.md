# ローカルマシンでの自動投稿セットアップガイド

GitHub Actionsの環境制限を回避するため、ローカルマシンで定期実行する方法を使用します。

---

## 📋 前提条件

- Node.js 22以上がインストールされていること
- ローカルマシンが24時間稼働していること（または定期的に起動していること）

---

## 🚀 セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/knaaa2026/rakuten-room-auto-post.git
cd rakuten-room-auto-post
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env`ファイルを作成して、以下の情報を入力してください：

```env
RAKUTEN_APP_ID=your_app_id
RAKUTEN_ACCESS_KEY=your_access_key
RAKUTEN_AFFILIATE_ID=your_affiliate_id
RAKUTEN_EMAIL=your_email@example.com
RAKUTEN_PASSWORD=your_password
```

### 4. テスト実行

```bash
npm start -- --once
```

投稿が成功したら、次のステップに進みます。

---

## ⏰ 定期実行の設定

### Windows の場合

**タスクスケジューラを使用：**

1. タスクスケジューラを開く（`taskschd.msc`）
2. 「基本タスクの作成」をクリック
3. 以下の設定を入力：
   - **名前**: 楽天ROOM自動投稿
   - **トリガー**: 毎日 08:00（または希望の時間）
   - **アクション**: プログラムの開始
     - **プログラム**: `C:\Program Files\nodejs\node.exe`
     - **引数**: `C:\path\to\rakuten-room-auto-post\src\index.js --once`
     - **開始位置**: `C:\path\to\rakuten-room-auto-post`

4. 以下の設定を繰り返して、13回の投稿スケジュールを作成：
   - 08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00, 23:00, 23:30

### macOS / Linux の場合

**cronジョブを使用：**

```bash
crontab -e
```

以下の行を追加：

```cron
# 毎日08:00に投稿
0 8 * * * cd /path/to/rakuten-room-auto-post && npm start -- --once >> /tmp/rakuten-post.log 2>&1

# 毎日09:00に投稿
0 9 * * * cd /path/to/rakuten-room-auto-post && npm start -- --once >> /tmp/rakuten-post.log 2>&1

# 毎日10:00に投稿
0 10 * * * cd /path/to/rakuten-room-auto-post && npm start -- --once >> /tmp/rakuten-post.log 2>&1

# ... 以下、13回分を設定
```

---

## 📊 ログ確認

### Windows の場合

タスクスケジューラで実行履歴を確認できます。

### macOS / Linux の場合

```bash
tail -f /tmp/rakuten-post.log
```

---

## ⚠️ 注意事項

1. **マシンの電源**: ローカルマシンは投稿時刻に起動している必要があります
2. **インターネット接続**: 安定したインターネット接続が必須です
3. **ファイアウォール**: Puppeteerが楽天サイトにアクセスできるようにしてください

---

## 🆘 トラブルシューティング

### 投稿されない場合

1. テスト実行で確認：`npm start -- --once`
2. ログを確認：投稿成功/失敗の詳細が記録されます
3. 環境変数を確認：`.env`ファイルが正しく設定されているか確認

### Puppeteerエラー

```
Could not find Chrome
```

以下を実行してブラウザをインストール：

```bash
npx puppeteer browsers install chrome
```

---

## 📞 サポート

問題が発生した場合は、ログを確認して、エラーメッセージを記録してください。
