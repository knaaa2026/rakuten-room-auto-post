# GitHub Actions 自動投稿セットアップガイド

このガイドでは、GitHub Actionsを使用して楽天ROOMへの自動投稿を設定します。

## 📋 前提条件

- GitHubアカウント（無料でOK）
- このプロジェクトをGitHubにプッシュ

## 🚀 セットアップ手順

### ステップ1：GitHubにリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名：`rakuten-room-auto-post`
4. 説明：`楽天ROOM自動投稿システム`
5. 「Create repository」をクリック

### ステップ2：ローカルからGitHubにプッシュ

```bash
cd /home/ubuntu/rakuten-room-auto-post

# Gitを初期化（初回のみ）
git init
git add .
git commit -m "Initial commit: Rakuten ROOM auto-posting system"

# GitHubのリモートを追加
git remote add origin https://github.com/YOUR_USERNAME/rakuten-room-auto-post.git

# GitHubにプッシュ
git branch -M main
git push -u origin main
```

### ステップ3：GitHub Secretsを設定

1. GitHubのリポジトリページを開く
2. 「Settings」→「Secrets and variables」→「Actions」をクリック
3. 「New repository secret」をクリック
4. 以下の5つのシークレットを追加：

| 名前 | 値 |
| --- | --- |
| `RAKUTEN_APP_ID` | `e70f2cbb-eecf-4ba9-a47a-812a8d3e798c` |
| `RAKUTEN_ACCESS_KEY` | `pk_oAtlGpVNqSQWd4cMg4yZ0aT24qW3Ck6KVs535bUvryP` |
| `RAKUTEN_AFFILIATE_ID` | `536326d2.5450bcdc.536326d3.dae4a61e` |
| `RAKUTEN_EMAIL` | `qa3rn_l@icloud.com` |
| `RAKUTEN_PASSWORD` | `yknaa2727` |

⚠️ **セキュリティ注意**：
- パスワードなどの機密情報は絶対にコミットしないでください
- Secretsに保存することで、安全に管理されます

### ステップ4：ワークフローを確認

1. リポジトリの「Actions」タブをクリック
2. 「楽天ROOM自動投稿」ワークフローが表示されることを確認
3. 「Run workflow」→「Run workflow」をクリックしてテスト実行

## 📅 投稿スケジュール

デフォルトでは以下のスケジュールで投稿されます：

```
毎日 13回投稿（1時間45分ごと）
- 00:00, 01:45, 02:00, 03:45, 04:00, 05:45, 06:00, 07:45, 08:00, 09:45, 10:00, 11:45, 12:00...
```

### スケジュールをカスタマイズ

`.github/workflows/auto-post.yml`の`schedule`セクションを編集：

```yaml
on:
  schedule:
    - cron: '0 9 * * *'  # 毎日9:00に投稿
    - cron: '0 15 * * *' # 毎日15:00に投稿
```

**Cron形式**：`分 時 日 月 曜日`

例：
- `0 9 * * *` → 毎日9:00
- `0 9,15,21 * * *` → 毎日9:00, 15:00, 21:00
- `0 9 * * 1-5` → 平日の9:00（月〜金）

## 🔍 実行状況の確認

1. リポジトリの「Actions」タブをクリック
2. ワークフロー実行履歴が表示されます
3. 各実行をクリックして詳細ログを確認

## 🐛 トラブルシューティング

### ワークフローが実行されない
- Secretsが正しく設定されているか確認
- `.github/workflows/auto-post.yml`が正しくコミットされているか確認

### 投稿に失敗する
- ログを確認：「Actions」→ワークフロー実行 → ログを表示
- 楽天APIキーが正しいか確認
- 楽天ROOMのログイン情報が正しいか確認

### 楽天ROOMにログインできない
- パスワードが正しいか確認
- 2段階認証が有効になっていないか確認
- 楽天アカウントがロックされていないか確認

## 📝 ログの確認

各実行のログは7日間保存されます。
「Actions」→ワークフロー実行 → 「Artifacts」から`logs-*`をダウンロード可能です。

## 🔐 セキュリティのベストプラクティス

1. **パスワードをコミットしない**
   - 必ずGitHub Secretsを使用

2. **定期的にパスワードを変更**
   - 楽天アカウントのパスワード変更後、Secretsも更新

3. **アクセス権限を制限**
   - リポジトリを「Private」に設定

4. **ログの確認**
   - 不正な投稿がないか定期的に確認

## 📞 サポート

問題が発生した場合：
1. ログを確認
2. 楽天APIドキュメントを参照
3. GitHubのIssuesで報告

---

**セットアップ完了後、自動投稿が開始されます！** 🎉
