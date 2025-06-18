-- click_logsテーブルにactionカラムを追加するマイグレーション
-- 実行前に必ずバックアップを取得してください

-- 1. 現在のテーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'click_logs'
ORDER BY ordinal_position;

-- 2. actionカラムが存在しない場合は追加
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'click_logs'
        AND column_name = 'action'
    ) THEN
        -- actionカラムを追加（デフォルト値は'click'）
        ALTER TABLE click_logs
        ADD COLUMN action TEXT NOT NULL DEFAULT 'click'
        CHECK (action IN ('view', 'click', 'purchase'));
        
        RAISE NOTICE 'Added action column to click_logs table';
    ELSE
        RAISE NOTICE 'action column already exists';
    END IF;
END $$;

-- 3. 既存のデータをすべて'click'として扱う（過去のデータは購入ボタンクリックと仮定）
UPDATE click_logs
SET action = 'click'
WHERE action IS NULL;

-- 4. インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_click_logs_action ON click_logs(action);
CREATE INDEX IF NOT EXISTS idx_click_logs_created_at ON click_logs(created_at);

-- 5. 更新後のテーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'click_logs'
ORDER BY ordinal_position;

-- 6. サンプルデータでテスト
-- 注意：これは実際のユーザーIDとプロダクトIDが必要です
-- INSERT INTO click_logs (user_id, product_id, action)
-- VALUES 
--   ('実際のユーザーID', '実際のプロダクトID', 'view'),
--   ('実際のユーザーID', '実際のプロダクトID', 'click');

-- 7. 統計情報の確認
SELECT 
    action,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM click_logs
GROUP BY action
ORDER BY count DESC;

-- 実行完了メッセージ
SELECT 'Migration completed successfully!' as message;
