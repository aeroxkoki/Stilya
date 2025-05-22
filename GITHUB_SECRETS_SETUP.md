# GitHub Secrets Setup Guide

GitHub ActionsgEAS��ɒ��Y�_�k�n�����ȒGitHub�ݸ��k-�Y�ŁLB�~Y

## �������

### 1. EXPO_TOKEN
- **�**: Expo EAS CLIg�<k(Y�����
- **֗��**: 
  1. [Expo.dev](https://expo.dev)k��
  2. Settings � Access Tokens � Create Token
- **$**: `expo_***` bn����

### 2. SUPABASE_URL
- **�**: Supabase����nURL
- **֗��**: 
  1. [Supabase Dashboard](https://supabase.com/dashboard)
  2. ����-� � API � Project URL
- **$**: `https://[project-id].supabase.co`

### 3. SUPABASE_ANON_KEY
- **�**: Supabasen?��
- **֗��**: 
  1. Supabase Dashboard � ����-� � API � anon public
- **$**: `eyJ***` bnJWT

## �׷��������գꨤ�#:(	

### 4. LINKSHARE_API_TOKEN
- **�**: LinkShare API�<����
- **֗��**: LinkShare����������g֗

### 5. LINKSHARE_MERCHANT_ID
- **�**: LinkShare������ID

### 6. RAKUTEN_APP_ID
- **�**: })�գꨤ�API(���ID

### 7. RAKUTEN_AFFILIATE_ID
- **�**: })�գꨤ�ID

## ������-�K

1. GitHub�ݸ�������O
2. `Settings` �֒��ï
3. 浤���n `Secrets and variables` � `Actions` �x�
4. `New repository secret` ���ï
5. ������h$�e�Wf `Add secret` ���ï

## -���

������LcWO-�U�fD�KoGitHub Actionsn�������L�g��gM~Y

## ����ƣ��

- ������ov�k���k���WjD
- `.env`ա��o`.gitignore`k+�f�ݸ��k����WjD
- ,j(h�z(g�����ȒQ�4o�����w���-�Y�

## ������ƣ�

### EXPO_TOKEN���
- ����n	�P���
- Expo�����n)P���

### Supabase���
- URLh��LcWD����n�nK��
- RLS���Lik-�U�fD�K��

### ��ɨ��
- EAS-�ա��eas.json	nˇ���
- Node.js�����n��'���
