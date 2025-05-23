/*
Stilya アプリ用の閲覧履歴テーブル作成SQL
実行：Supabase ダッシュボードの SQL エディタにて実行
*/

-- 閲覧履歴テーブル作成
CREATE TABLE public.view_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users NOT NULL,
    product_id uuid REFERENCES public.products NOT NULL, 
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- インデックス作成（検索効率化）
CREATE INDEX idx_view_logs_user_id ON public.view_logs(user_id);
CREATE INDEX idx_view_logs_product_id ON public.view_logs(product_id);
CREATE INDEX idx_view_logs_created_at ON public.view_logs(created_at);

-- Row Level Security（セキュリティポリシー）設定
ALTER TABLE public.view_logs ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分の閲覧履歴を見られるポリシー
CREATE POLICY view_logs_select_policy ON public.view_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーが自分の閲覧履歴を追加できるポリシー
CREATE POLICY view_logs_insert_policy ON public.view_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理者用（将来的にダッシュボード実装時に使用）
-- CREATE POLICY view_logs_admin_policy ON public.view_logs
--    USING (auth.jwt() ? 'admin');

-- コメント追加（テーブル説明）
COMMENT ON TABLE public.view_logs IS 'ユーザーの商品閲覧履歴を保存するテーブル';
COMMENT ON COLUMN public.view_logs.user_id IS 'ユーザーID';
COMMENT ON COLUMN public.view_logs.product_id IS '閲覧した商品ID';
COMMENT ON COLUMN public.view_logs.created_at IS '閲覧日時';
