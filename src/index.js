import dotenv from 'dotenv';
import AutoPostScheduler from './scheduler.js';

// 環境変数を読み込む
dotenv.config();

/**
 * メインエントリーポイント
 */
async function main() {
  try {
    // 設定を取得
    const config = {
      appId: process.env.RAKUTEN_APP_ID,
      accessKey: process.env.RAKUTEN_ACCESS_KEY,
      affiliateId: process.env.RAKUTEN_AFFILIATE_ID,
      email: process.env.RAKUTEN_EMAIL,
      password: process.env.RAKUTEN_PASSWORD,
      llmUrl: process.env.LLM_API_URL || 'http://localhost:11434/api/generate',
      llmModel: process.env.LLM_MODEL || 'mistral',
    };

    // 必須項目をチェック
    const requiredFields = ['appId', 'accessKey', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ エラー: 必須環境変数が設定されていません');
      console.error(`   不足している項目: ${missingFields.join(', ')}`);
      console.error('   .env ファイルを確認してください');
      process.exit(1);
    }

    console.log('🚀 楽天ROOM自動投稿システムを起動します...\n');

    // スケジューラーを初期化
    const scheduler = new AutoPostScheduler(config);

    // テストモードかスケジュール実行かを判定
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
      console.log('🧪 テストモードで実行します\n');
      await scheduler.runOnce();
    } else if (args.includes('--once')) {
      console.log('⏱️  1回だけ実行します\n');
      await scheduler.runOnce();
    } else {
      // 通常モード：24時間スケジュール実行
      scheduler.start();
      
      // プロセスを継続
      process.on('SIGINT', () => {
        console.log('\n\n🛑 スケジューラーを停止します...');
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('❌ 致命的なエラー:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// メイン関数を実行
main();
