import axios from 'axios';

/**
 * 無料LLMを使用して商品紹介文を生成するモジュール
 */
class LLMGenerator {
  constructor(apiUrl = 'http://localhost:11434/api/generate', model = 'mistral') {
    this.apiUrl = apiUrl;
    this.model = model;
  }

  /**
   * 商品情報から紹介文を生成
   * @param {object} product - 商品情報
   * @returns {Promise<string>} 生成された紹介文
   */
  async generateProductDescription(product) {
    try {
      const prompt = this._buildPrompt(product);
      
      // オンラインLLMサービスを使用（Hugging Face Inference API等）
      // または、ローカルOllamaを使用
      const description = await this._callLLM(prompt);
      
      return description;
    } catch (error) {
      console.error('LLM生成エラー:', error.message);
      // フォールバック：シンプルな紹介文を返す
      return this._generateFallbackDescription(product);
    }
  }

  /**
   * LLMプロンプトを構築
   * @param {object} product - 商品情報
   * @returns {string} プロンプト
   */
  _buildPrompt(product) {
    return `
以下の商品について、楽天ROOMでの投稿用に、女の子向けで魅力的な紹介文を日本語で生成してください。
絵文字を含め、150文字以内で、ハッシュタグも3-5個含めてください。

商品名: ${product.name}
価格: ¥${product.price}
説明: ${product.description || ''}
ジャンル: ${product.genreName || ''}

出力形式:
[紹介文]
絵文字を含めた紹介文をここに記入
#ハッシュタグ1 #ハッシュタグ2 #ハッシュタグ3
`;
  }

  /**
   * LLMを呼び出し
   * @param {string} prompt - プロンプト
   * @returns {Promise<string>} 生成テキスト
   */
  async _callLLM(prompt) {
    try {
      // Ollama（ローカル実行）を使用する場合
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
      }, {
        timeout: 30000
      });

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      return '';
    } catch (error) {
      console.warn('LLMサービス利用不可、フォールバック使用:', error.message);
      throw error;
    }
  }

  /**
   * フォールバック：テンプレートベースの紹介文生成
   * @param {object} product - 商品情報
   * @returns {string} 生成された紹介文
   */
  _generateFallbackDescription(product) {
    const emojis = ['💕', '✨', '🌸', '👧', '💎', '🎀', '🌟', '💫'];
    const templates = [
      `${emojis[Math.floor(Math.random() * emojis.length)]} ${product.name} ¥${product.price} #楽天ROOM #女の子 #推し活`,
      `${emojis[Math.floor(Math.random() * emojis.length)]} 可愛い！${product.name} #推し活グッズ #女の子向け #楽天`,
      `${emojis[Math.floor(Math.random() * emojis.length)]} これ欲しい！${product.name} #楽天ROOM #推し活 #女の子`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 複数の商品から紹介文を一括生成
   * @param {Array} products - 商品情報の配列
   * @returns {Promise<Array>} 紹介文付き商品情報
   */
  async generateBatch(products) {
    const results = [];
    
    for (const product of products) {
      try {
        const description = await this.generateProductDescription(product);
        results.push({
          ...product,
          postContent: description
        });
        
        // API呼び出しの間隔を設ける（レート制限対策）
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`商品 ${product.name} の生成に失敗:`, error.message);
        results.push({
          ...product,
          postContent: this._generateFallbackDescription(product)
        });
      }
    }
    
    return results;
  }
}

export default LLMGenerator;
