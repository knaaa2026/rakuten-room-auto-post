# 楽天ROOM自動投稿システム

楽天市場の人気商品を自動検索し、楽天ROOMに毎日自動投稿するシステムです。

## ✨ 機能

- 🔍 **楽天市場API連携**：女の子向けの人気商品を自動検索
- 📝 **AI紹介文生成**：無料LLMで商品紹介文を自動生成
- 🤖 **自動投稿**：楽天ROOMへの自動投稿
- ⏰ **スケジューリング**：1日13回の定時投稿
- 📊 **ログ記録**：投稿履歴とエラーログを自動保存

## 🚀 クイックスタート

### 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下を入力：

```env
RAKUTEN_APP_ID=your_app_id
RAKUTEN_ACCESS_KEY=your_access_key
RAKUTEN_AFFILIATE_ID=your_affiliate_id
RAKUTEN_EMAIL=your_email
RAKUTEN_PASSWORD=your_password
```

### 依存関係のインストール

```bash
npm install
```

### テスト実行

```bash
npm test
```

### 単発投稿テスト

```bash
npm start -- --test
```

### 24時間自動投稿（ローカル）

```bash
npm start
```

## 🔧 GitHub Actionsでの自動投稿（推奨）

GitHub Actionsを使用すれば、24時間無料で自動投稿できます。

詳細は [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) をご覧ください。

### クイックセットアップ

1. GitHubにリポジトリを作成
2. GitHub Secretsに認証情報を登録
3. ワークフローが自動実行開始

```bash
# GitHubにプッシュ
git add .
git commit -m "Setup auto-posting"
git push origin main
```

## 📁 プロジェクト構成

```
rakuten-room-auto-post/
├── src/
│   ├── index.js              # メインエントリーポイント
│   ├── rakuten-api.js        # 楽天API連携
│   ├── llm-generator.js      # LLM紹介文生成
│   ├── room-poster.js        # ROOM自動投稿
│   ├── scheduler.js          # スケジューラー
│   └── test.js               # テストスイート
├── .github/
│   └── workflows/
│       └── auto-post.yml     # GitHub Actionsワークフロー
├── logs/                     # 投稿ログ
├── .env.example              # 環境変数テンプレート
├── package.json              # 依存関係定義
└── README.md                 # このファイル
```

## 🔑 認証情報の取得

### 楽天API認証情報

1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)にアクセス
2. 開発者アカウントを作成
3. 新しいアプリケーションを登録
4. 以下の情報を取得：
   - Application ID
   - Access Key
   - Affiliate ID

詳細は [楽天ウェブサービスドキュメント](https://webservice.rakuten.co.jp/documentation/ichiba-item-search) を参照

### 楽天ROOMログイン情報

- 楽天アカウントのメールアドレス
- パスワード

## 📊 投稿スケジュール

デフォルトでは1日13回投稿されます（1時間45分ごと）。

スケジュールはカスタマイズ可能です。詳細は [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) を参照。

## 🎯 商品カテゴリ

自動投稿される商品カテゴリ：

- キッズ ファッション
- ガールズ インテリア
- 女の子 雑貨
- キッズ アクセサリー
- 子供 コスメ
- ガールズ ワンピース
- キッズ 靴
- 女の子 バッグ

## 🛠️ カスタマイズ

### 投稿カテゴリの変更

`src/rakuten-api.js`の`getGirlsFriendlyProducts()`メソッドを編集：

```javascript
const keywords = [
  'あなたのキーワード1',
  'あなたのキーワード2',
  // ...
];
```

### 投稿スケジュールの変更

`.github/workflows/auto-post.yml`の`schedule`セクションを編集

### 紹介文のカスタマイズ

`src/llm-generator.js`のプロンプトを編集

## 📝 ログの確認

投稿ログは`logs/`ディレクトリに保存されます：

```bash
cat logs/auto-post.log
```

## 🐛 トラブルシューティング

### 楽天APIエラー

```
🚨 楽天API検索エラー: 400
```

**原因**：認証情報が正しくない、またはAPIキーの有効期限切れ

**解決**：
1. `.env`ファイルの認証情報を確認
2. 楽天ウェブサービスのダッシュボードで情報を再確認
3. 必要に応じて新しいアプリケーションを登録

### 楽天ROOMログインエラー

```
ログインエラー: net::ERR_NAME_NOT_RESOLVED
```

**原因**：ネットワーク接続の問題、またはパスワードが正しくない

**解決**：
1. メールアドレスとパスワードを確認
2. 2段階認証が有効になっていないか確認
3. 楽天アカウントがロックされていないか確認

### GitHub Actionsが実行されない

**原因**：Secretsが設定されていない

**解決**：
1. リポジトリの「Settings」→「Secrets」を確認
2. 必要なSecretをすべて追加

## 📞 サポート

問題が発生した場合：

1. ログを確認
2. このREADMEのトラブルシューティングセクションを参照
3. [楽天ウェブサービスドキュメント](https://webservice.rakuten.co.jp/)を確認

## 📄 ライセンス

MIT License

## ⚠️ 注意事項

- 楽天ROOMの利用規約を遵守してください
- 自動投稿の過度な使用は避けてください
- 認証情報は絶対に公開しないでください

---

**楽天ROOMでの成功をお祈りします！** 🎉
