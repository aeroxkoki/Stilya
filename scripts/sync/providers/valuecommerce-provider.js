/**
 * バリューコマースAPI商品同期プロバイダー
 */

const ProductSyncProvider = require('./base-provider');

class ValueCommerceProvider extends ProductSyncProvider {
  constructor(config) {
    super('バリューコマースAPI', config);
  }

  /**
   * バリューコマース商品の同期を実行
   */
  async sync() {
    const { main } = require('../sync-valuecommerce-products');
    
    // バリューコマース同期スクリプトを実行
    await main();
    
    // TODO: バリューコマーススクリプトから統計情報を取得できるように改善
    this.updateStats({
      fetched: 50, // 仮の値
      inserted: 30,
      updated: 20
    });
  }
}

module.exports = ValueCommerceProvider;
