/**
 * 楽天API商品同期プロバイダー
 */

const ProductSyncProvider = require('./base-provider');

class RakutenProvider extends ProductSyncProvider {
  constructor(config) {
    super('楽天API', config);
  }

  /**
   * 楽天商品の同期を実行
   */
  async sync() {
    const { main } = require('../sync-rakuten-products');
    
    // 楽天同期スクリプトを実行
    await main();
    
    // TODO: 楽天スクリプトから統計情報を取得できるように改善
    this.updateStats({
      fetched: 100, // 仮の値
      inserted: 50,
      updated: 50
    });
  }
}

module.exports = RakutenProvider;
