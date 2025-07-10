/**
 * 商品同期プロバイダーの基底クラス
 * 新しいプロバイダーを追加する際はこのクラスを継承する
 */

class ProductSyncProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.enabled = config.enabled !== false;
    this.startTime = null;
    this.endTime = null;
    this.stats = {
      fetched: 0,
      inserted: 0,
      updated: 0,
      errors: 0
    };
  }

  /**
   * プロバイダーが有効かチェック
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 同期処理を実行（サブクラスで実装）
   */
  async sync() {
    throw new Error(`sync() must be implemented by ${this.name} provider`);
  }

  /**
   * 同期処理のラッパー（共通処理）
   */
  async execute() {
    if (!this.isEnabled()) {
      this.log('info', `⏭️ ${this.name}同期はスキップされました（無効）`);
      return {
        success: false,
        skipped: true,
        stats: this.stats
      };
    }

    this.log('info', `📦 ${this.name}商品の同期を開始...`);
    this.startTime = Date.now();

    try {
      await this.sync();
      this.endTime = Date.now();
      this.log('success', `✅ ${this.name}商品の同期完了`);
      return {
        success: true,
        skipped: false,
        stats: this.stats,
        duration: this.endTime - this.startTime
      };
    } catch (error) {
      this.endTime = Date.now();
      this.log('error', `❌ ${this.name}商品の同期エラー:`, error);
      this.stats.errors++;
      return {
        success: false,
        skipped: false,
        stats: this.stats,
        duration: this.endTime - this.startTime,
        error: error.message
      };
    }
  }

  /**
   * ログ出力（統一フォーマット）
   */
  log(level, message, error = null) {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warn: '⚠️'
    }[level] || '📝';

    console.log(`[${timestamp}] ${prefix} [${this.name}] ${message}`);
    if (error) {
      console.error(error);
    }
  }

  /**
   * 統計情報を更新
   */
  updateStats(stats) {
    Object.keys(stats).forEach(key => {
      if (this.stats.hasOwnProperty(key)) {
        this.stats[key] += stats[key];
      }
    });
  }
}

module.exports = ProductSyncProvider;
