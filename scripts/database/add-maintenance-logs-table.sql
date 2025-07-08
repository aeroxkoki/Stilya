-- メンテナンスログテーブルの作成
-- 日次パッチやその他のメンテナンスタスクの実行履歴を記録

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'running')),
  details JSONB,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_task_name ON maintenance_logs(task_name);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_executed_at ON maintenance_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON maintenance_logs(status);

-- RLSの有効化（管理者のみアクセス可能）
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー
CREATE POLICY "Admin only access" ON maintenance_logs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 過去のログを定期的に削除するための関数
CREATE OR REPLACE FUNCTION cleanup_old_maintenance_logs()
RETURNS void AS $$
BEGIN
  -- 30日以上前のログを削除
  DELETE FROM maintenance_logs
  WHERE executed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 確認クエリ
SELECT 
    'maintenance_logs table created' as status,
    COUNT(*) as existing_logs
FROM maintenance_logs;
