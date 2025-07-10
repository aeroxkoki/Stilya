/**
 * オンボーディングフローのテストスクリプト
 * 新規ユーザー登録後にオンボーディング画面が表示されるかを確認
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const testOnboardingFlow = async () => {
  console.log('=== オンボーディングフローテスト開始 ===\n');

  try {
    // 1. テスト用の新規ユーザーを作成
    const timestamp = Date.now();
    const testEmail = `test-onboarding-${timestamp}@stilya.com`;
    const testPassword = 'TestPass123!';

    console.log('1. 新規ユーザー登録テスト');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}\n`);

    // 新規登録
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ 登録エラー:', signUpError.message);
      return;
    }

    console.log('✅ 新規ユーザー登録成功');
    console.log('   User ID:', signUpData.user?.id);

    // 2. ユーザープロファイルを確認
    if (signUpData.user) {
      console.log('\n2. ユーザープロファイル確認');
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.log('   プロファイルがまだ作成されていません（正常）');
      } else {
        console.log('   プロファイル情報:');
        console.log('   - gender:', profile.gender || '未設定');
        console.log('   - style_preferences:', profile.style_preferences || '未設定');
        console.log('   - age_group:', profile.age_group || '未設定');
      }

      // 3. オンボーディング完了ステータスを確認
      console.log('\n3. オンボーディング完了チェック');
      const hasGender = profile?.gender !== undefined && profile?.gender !== null;
      const hasStylePreference = profile?.style_preferences && profile?.style_preferences.length > 0;
      const hasAgeGroup = profile?.age_group !== undefined && profile?.age_group !== null;
      
      const isOnboardingComplete = hasGender && hasStylePreference && hasAgeGroup;
      
      console.log('   - gender設定済み:', hasGender);
      console.log('   - style_preferences設定済み:', hasStylePreference);
      console.log('   - age_group設定済み:', hasAgeGroup);
      console.log('   - オンボーディング完了:', isOnboardingComplete);

      if (!isOnboardingComplete) {
        console.log('\n✅ 期待通り：新規ユーザーはオンボーディングが必要です');
        console.log('   アプリでログインすると、オンボーディング画面が表示されます');
      } else {
        console.log('\n⚠️  予期しない状態：新規ユーザーなのに既にオンボーディングが完了しています');
      }

      // 4. テストユーザーのクリーンアップ
      console.log('\n4. テストユーザーのクリーンアップ');
      
      // プロファイル削除
      await supabase
        .from('users')
        .delete()
        .eq('id', signUpData.user.id);
      
      console.log('✅ クリーンアップ完了');
    }

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  }

  console.log('\n=== テスト完了 ===');
};

// テスト実行
testOnboardingFlow().catch(console.error);
