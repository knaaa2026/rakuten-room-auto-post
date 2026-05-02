import axios from 'axios';

/**
 * 楽天市場APIを使用して商品情報を取得するモジュール
 * 最新仕様: 2026-04-01
 */
class RakutenAPI {
  constructor(appId, accessKey, affiliateId = null) {
    this.appId = appId;
    this.accessKey = accessKey;
    this.affiliateId = affiliateId;
    // 正確なエンドポイント（ichibams）
    this.baseUrl = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401';
  }

  /**
   * キーワード検索で商品を取得
   * @param {string} keyword - 検索キーワード
   * @param {object} options - 検索オプション
   * @returns {Promise<Array>} 商品情報の配列
   */
  async searchProducts(keyword, options = {}) {
    try {
      const params = {
        applicationId: this.appId,
        accessKey: this.accessKey,  // クエリパラメータとして追加
        keyword: keyword,
        hits: options.hits || 10,
        page: options.page || 1,
        sort: options.sort || '-updateTimestamp',
        ...(this.affiliateId && { affiliateId: this.affiliateId }),
        ...options
      };

      console.log('🔍 API検索パラメータ:', { keyword, hits: params.hits });
      const response = await axios.get(this.baseUrl, { params });
      
      if (response.data && response.data.Items) {
        console.log(`✓ ${response.data.Items.length}件の商品を取得しました`);
        return response.data.Items.map(item => ({
          id: item.Item.itemCode,
          name: item.Item.itemName,
          price: item.Item.itemPrice,
          url: item.Item.itemUrl,
          image: item.Item.itemImage,
          description: item.Item.itemCaption || '',
          shopName: item.Item.shopName,
          genreId: item.Item.genreId,
          genreName: item.Item.genreName
        }));
      }
      
      return [];
    } catch (error) {
      console.error('🚨 楽天API検索エラー:', error.response?.status, error.response?.data?.errors || error.message);
      throw error;
    }
  }

  /**
   * ランキング情報を取得
   * @param {object} options - ランキングオプション
   * @returns {Promise<Array>} ランキング商品情報
   */
  async getRankingProducts(options = {}) {
    try {
      const keywords = [
        '女の子 ファッション',
        'キッズ インテリア',
        'ガールズ 雑貨',
        '子供 アクセサリー',
        'キッズ コスメ'
      ];

      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      return await this.searchProducts(keyword, options);
    } catch (error) {
      console.error('ランキング取得エラー:', error.message);
      throw error;
    }
  }

  /**
   * 特定のカテゴリから商品を取得
   * @param {string} genreId - ジャンルID
   * @param {object} options - 検索オプション
   * @returns {Promise<Array>} 商品情報
   */
  async getProductsByCategory(genreId, options = {}) {
    try {
      const params = {
        applicationId: this.appId,
        accessKey: this.accessKey,
        genreId: genreId,
        hits: options.hits || 10,
        page: options.page || 1,
        sort: options.sort || '-updateTimestamp',
        ...(this.affiliateId && { affiliateId: this.affiliateId }),
        ...options
      };

      const response = await axios.get(this.baseUrl, { params });
      
      if (response.data && response.data.Items) {
        return response.data.Items.map(item => ({
          id: item.Item.itemCode,
          name: item.Item.itemName,
          price: item.Item.itemPrice,
          url: item.Item.itemUrl,
          image: item.Item.itemImage,
          description: item.Item.itemCaption || '',
          shopName: item.Item.shopName,
          genreId: item.Item.genreId,
          genreName: item.Item.genreName
        }));
      }
      
      return [];
    } catch (error) {
      console.error('カテゴリ検索エラー:', error.message);
      throw error;
    }
  }

  /**
   * 女の子向けの推奨商品を取得
   * @returns {Promise<Array>} 商品情報
   */
  async getGirlsFriendlyProducts() {
    try {
      // 女の子向けのキーワード検索
      const keywords = [
        'キッズ ファッション',
        'ガールズ インテリア',
        '女の子 雑貨',
        'キッズ アクセサリー',
        '子供 コスメ',
        'ガールズ ワンピース',
        'キッズ 靴',
        '女の子 バッグ'
      ];

      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      console.log(`📚 キーワード選択: "${keyword}"`);
      return await this.searchProducts(keyword, { hits: 15 });
    } catch (error) {
      console.error('女の子向け商品取得エラー:', error.message);
      throw error;
    }
  }
}

export default RakutenAPI;
