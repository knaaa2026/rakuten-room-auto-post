import dotenv from 'dotenv';
import RakutenAPI from './rakuten-api.js';
import LLMGenerator from './llm-generator.js';

dotenv.config();

/**
 * テストスクリプト：各モジュールの動作確認
 */
async function runTests() {
  console.log('🧪 楽天ROOM自動投稿システム - テストスイート\n');

  // テスト1: 楽天API接続テスト
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('テスト1: 楽天API接続テスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const api = new RakutenAPI(
      process.env.RAKUTEN_APP_ID,
      process.env.RAKUTEN_ACCESS_KEY,
      process.env.RAKUTEN_AFFILIATE_ID
    );

    console.log('🔍 女の子向け商品を検索中...');
    const products = await api.getGirlsFriendlyProducts();

    if (products.length > 0) {
      console.log(`✓ ${products.length}件の商品を取得しました\n`);
      console.log('取得した商品サンプル:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`\n  ${index + 1}. ${product.name}`);
        console.log(`     価格: ¥${product.price}`);
        console.log(`     ジャンル: ${product.genreName}`);
        console.log(`     URL: ${product.url}`);
      });
    } else {
      console.log('⚠ 商品が見つかりません');
    }
  } catch (error) {
    console.error('✗ APIテスト失敗:', error.message);
  }

  // テスト2: LLM生成テスト
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('テスト2: LLM紹介文生成テスト');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const llm = new LLMGenerator(
      process.env.LLM_API_URL || 'http://localhost:11434/api/generate',
      process.env.LLM_MODEL || 'mistral'
    );

    const sampleProduct = {
      name: 'キュートなピンク色のリボン付きヘアクリップ',
      price: 1500,
      description: '女の子向けのかわいいヘアアクセサリー',
      genreName: 'ファッション・アクセサリー'
    };

    console.log('📝 サンプル商品の紹介文を生成中...');
    console.log(`   商品: ${sampleProduct.name}\n`);

    const description = await llm.generateProductDescription(sampleProduct);
    console.log('✓ 生成された紹介文:');
    console.log(`   ${description}`);
  } catch (error) {
    console.warn('⚠ LLMテスト失敗（フォールバック使用）:', error.message);
    
    // フォールバック動作確認
    const llm = new LLMGenerator();
    const sampleProduct = {
      name: 'キュートなピンク色のリボン付きヘアクリップ',
      price: 1500,
      description: '女の子向けのかわいいヘアアクセサリー',
      genreName: 'ファッション・アクセサリー'
    };
    
    const fallbackDescription = llm._generateFallbackDescription(sampleProduct);
    console.log('✓ フォールバック紹介文:');
    console.log(`   ${fallbackDescription}`);
  }

  // テスト3: 設定確認
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('テスト3: 設定確認');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const config = {
    appId: process.env.RAKUTEN_APP_ID ? '✓ 設定済み' : '✗ 未設定',
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID ? '✓ 設定済み' : '✗ 未設定',
    email: process.env.RAKUTEN_EMAIL ? '✓ 設定済み' : '✗ 未設定',
    password: process.env.RAKUTEN_PASSWORD ? '✓ 設定済み' : '✗ 未設定',
    llmUrl: process.env.LLM_API_URL || 'デフォルト使用',
    llmModel: process.env.LLM_MODEL || 'デフォルト使用',
  };

  Object.entries(config).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  console.log('\n✓ テスト完了\n');
}

// テストを実行
runTests().catch(error => {
  console.error('テスト実行エラー:', error);
  process.exit(1);
});
