import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import RakutenAPI from './rakuten-api.js';
import LLMGenerator from './llm-generator.js';
import RoomPoster from './room-poster.js';

/**
 * 24時間自動投稿スケジューラー
 */
class AutoPostScheduler {
  constructor(config) {
    this.config = config;
    this.api = new RakutenAPI(config.appId, config.accessKey, config.affiliateId);
    this.llm = new LLMGenerator(config.llmUrl, config.llmModel);
    this.poster = new RoomPoster(config.email, config.password);
    this.logDir = path.join(process.cwd(), 'logs');
    this.postedItems = new Set(); // 投稿済み商品を記録
    this.initializeLogDir();
  }

  /**
   * ログディレクトリを初期化
   */
  initializeLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * ログを記録
   * @param {string} message - ログメッセージ
   * @param {string} level - ログレベル (info, warn, error)
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    console.log(logMessage);
    
    // ファイルに記録
    const logFile = path.join(this.logDir, `auto-post-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logMessage + '\n');
  }

  /**
   * 投稿スケジュールを設定
   */
  setupSchedule() {
    // 1日13回の投稿スケジュール
    const schedules = [
      { time: '0 7 * * *', theme: '朝の時短ファッション' },      // 07:00
      { time: '30 8 * * *', theme: '朝のコーディネート' },        // 08:30
      { time: '0 12 * * *', theme: 'ランチタイムコスメ' },        // 12:00
      { time: '30 12 * * *', theme: 'ランチ後の雑貨' },           // 12:30
      { time: '0 15 * * *', theme: '午後のインテリア' },          // 15:00
      { time: '30 15 * * *', theme: '午後のアクセサリー' },       // 15:30
      { time: '0 19 * * *', theme: '夜の準備アイテム' },          // 19:00
      { time: '30 19 * * *', theme: '夜のファッション' },         // 19:30
      { time: '0 21 * * *', theme: 'ゴールデンタイム①' },        // 21:00
      { time: '20 21 * * *', theme: 'ゴールデンタイム②' },       // 21:20
      { time: '40 21 * * *', theme: 'ゴールデンタイム③' },       // 21:40
      { time: '0 23 * * *', theme: '夜間トレンド商品①' },        // 23:00
      { time: '30 23 * * *', theme: '夜間トレンド商品②' },       // 23:30
    ];

    schedules.forEach((schedule, index) => {
      cron.schedule(schedule.time, () => {
        this.log(`📅 スケジュール実行 #${index + 1}: ${schedule.theme}`);
        this.executePosting(schedule.theme).catch(error => {
          this.log(`スケジュール実行エラー: ${error.message}`, 'error');
        });
      });

      this.log(`✓ スケジュール登録: ${schedule.time} - ${schedule.theme}`);
    });
  }

  /**
   * 投稿処理を実行
   * @param {string} theme - 投稿テーマ
   */
  async executePosting(theme) {
    try {
      this.log(`🚀 投稿処理開始: ${theme}`);

      // ブラウザを初期化
      await this.poster.initialize();

      // ログイン
      await this.poster.login();

      // 商品を取得
      this.log('🔍 商品検索中...');
      const products = await this.api.getGirlsFriendlyProducts();
      
      if (products.length === 0) {
        this.log('⚠ 商品が見つかりません', 'warn');
        await this.poster.close();
        return;
      }

      // 投稿済みでない商品をフィルタ
      const newProducts = products.filter(p => !this.postedItems.has(p.id)).slice(0, 3);
      
      if (newProducts.length === 0) {
        this.log('⚠ 新しい商品がありません', 'warn');
        await this.poster.close();
        return;
      }

      // LLMで紹介文を生成
      this.log('🤖 紹介文を生成中...');
      const productsWithContent = await this.llm.generateBatch(newProducts);

      // ROOMに投稿
      this.log('📤 ROOMに投稿中...');
      const results = await this.poster.postMultiple(productsWithContent);

      // 投稿済み商品を記録
      productsWithContent.forEach(p => {
        this.postedItems.add(p.id);
      });

      // 結果をログ
      const successCount = results.filter(r => r.success).length;
      this.log(`✓ 投稿完了: ${successCount}/${results.length} 件成功`);

      // ブラウザを閉じる
      await this.poster.close();
    } catch (error) {
      this.log(`✗ 投稿処理エラー: ${error.message}`, 'error');
      try {
        await this.poster.close();
      } catch (closeError) {
        this.log(`ブラウザクローズエラー: ${closeError.message}`, 'error');
      }
    }
  }

  /**
   * スケジューラーを開始
   */
  start() {
    this.log('🎯 楽天ROOM自動投稿スケジューラーを開始します');
    this.log(`📊 設定: ${JSON.stringify(this.config)}`);
    
    this.setupSchedule();
    
    this.log('✓ スケジューラーが起動しました。24時間稼働中...');
  }

  /**
   * テスト実行（1回だけ投稿）
   */
  async runOnce() {
    this.log('🧪 テスト実行モード');
    await this.executePosting('テスト投稿');
  }
}

export default AutoPostScheduler;
