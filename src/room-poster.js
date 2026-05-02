import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * Puppeteerを使用して楽天ROOMに自動投稿するモジュール
 */
class RoomPoster {
  constructor(email, password, options = {}) {
    this.email = email;
    this.password = password;
    this.browser = null;
    this.page = null;
    this.options = {
      headless: options.headless !== false, // デフォルトはheadless
      timeout: options.timeout || 30000,
      ...options
    };
    this.cookiePath = path.join(process.cwd(), 'cookies.json');
  }

  /**
   * ブラウザを初期化
   */
  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });
      
      console.log('✓ ブラウザ初期化完了');
    } catch (error) {
      console.error('ブラウザ初期化エラー:', error.message);
      throw error;
    }
  }

  /**
   * 楽天にログイン
   */
  async login() {
    try {
      // クッキーが存在する場合は読み込む
      if (fs.existsSync(this.cookiePath)) {
        const cookies = JSON.parse(fs.readFileSync(this.cookiePath, 'utf8'));
        await this.page.setCookie(...cookies);
        console.log('✓ 保存されたクッキーを読み込みました');
        
        // クッキーが有効か確認
        await this.page.goto('https://room.rakuten.co.jp/', { waitUntil: 'networkidle2' });
        const isLoggedIn = await this.page.evaluate(() => {
          return document.body.innerText.includes('マイルーム') || 
                 document.querySelector('[data-testid="user-menu"]') !== null;
        });
        
        if (isLoggedIn) {
          console.log('✓ クッキーで自動ログイン成功');
          return;
        }
      }

      // ログインページにアクセス
      console.log('🔐 楽天にログイン中...');
      await this.page.goto('https://login.rakuten.co.jp/login', { waitUntil: 'networkidle2' });
      
      // メールアドレスを入力
      await this.page.type('input[name="u"]', this.email, { delay: 50 });
      await this.page.click('button[type="submit"]');
      
      // パスワード入力画面を待つ
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: this.options.timeout });
      
      // パスワードを入力
      await this.page.type('input[name="p"]', this.password, { delay: 50 });
      await this.page.click('button[type="submit"]');
      
      // ログイン完了を待つ
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: this.options.timeout });
      
      // クッキーを保存
      const cookies = await this.page.cookies();
      fs.writeFileSync(this.cookiePath, JSON.stringify(cookies, null, 2));
      
      console.log('✓ ログイン成功');
    } catch (error) {
      console.error('ログインエラー:', error.message);
      throw error;
    }
  }

  /**
   * 商品をROOMに投稿
   * @param {object} product - 商品情報（postContent含む）
   */
  async postProduct(product) {
    try {
      console.log(`📝 投稿中: ${product.name}`);
      
      // ROOMの投稿ページにアクセス
      await this.page.goto('https://room.rakuten.co.jp/add', { waitUntil: 'networkidle2' });
      
      // 商品URLを検索欄に入力
      await this.page.type('input[placeholder*="商品URL"]', product.url, { delay: 50 });
      await this.page.keyboard.press('Enter');
      
      // 商品が自動検出されるまで待つ
      await this.page.waitForSelector('[data-testid="product-preview"]', { timeout: 10000 });
      
      // コメント欄に紹介文を入力
      const commentSelector = 'textarea[placeholder*="コメント"]';
      await this.page.waitForSelector(commentSelector, { timeout: 5000 });
      await this.page.type(commentSelector, product.postContent, { delay: 30 });
      
      // 投稿ボタンをクリック
      const postButton = await this.page.$('button:has-text("投稿")');
      if (postButton) {
        await postButton.click();
        
        // 投稿完了を待つ
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: this.options.timeout });
        
        console.log(`✓ 投稿成功: ${product.name}`);
        return true;
      } else {
        console.warn(`⚠ 投稿ボタンが見つかりません: ${product.name}`);
        return false;
      }
    } catch (error) {
      console.error(`✗ 投稿失敗 (${product.name}):`, error.message);
      return false;
    }
  }

  /**
   * 複数の商品を投稿
   * @param {Array} products - 商品情報の配列
   */
  async postMultiple(products) {
    const results = [];
    
    for (const product of products) {
      try {
        const success = await this.postProduct(product);
        results.push({
          product: product.name,
          success,
          timestamp: new Date().toISOString()
        });
        
        // 投稿間隔を設ける（サーバー負荷軽減）
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`投稿処理エラー (${product.name}):`, error.message);
        results.push({
          product: product.name,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  /**
   * ブラウザを閉じる
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('✓ ブラウザを閉じました');
      }
    } catch (error) {
      console.error('ブラウザクローズエラー:', error.message);
    }
  }

  /**
   * スクリーンショットを取得（デバッグ用）
   * @param {string} filename - ファイル名
   */
  async takeScreenshot(filename = 'screenshot.png') {
    try {
      await this.page.screenshot({ path: filename });
      console.log(`📸 スクリーンショット保存: ${filename}`);
    } catch (error) {
      console.error('スクリーンショット取得エラー:', error.message);
    }
  }
}

export default RoomPoster;
