import NetInfo from '@react-native-community/netinfo';

/**
 * ネットワークがオフラインかどうかを確認する
 * @returns オフラインならtrue、オンラインならfalse
 */
export const isOffline = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    return \!netInfo.isConnected;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false; // エラーの場合はオンラインとして扱う
  }
};

/**
 * ネットワーク接続の種類を取得する
 * @returns ネットワーク接続の種類（'wifi'、'cellular'、'none'など）
 */
export const getConnectionType = async (): Promise<string> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.type;
};

/**
 * 安定したネットワーク接続があるかどうかを確認する
 * @returns 安定した接続があればtrue
 */
export const hasStableConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  
  // WiFiまたは強力なモバイル接続があれば安定していると見なす
  if (netInfo.type === 'wifi') {
    return true;
  } else if (netInfo.type === 'cellular') {
    const cellularGen = netInfo.details?.cellularGeneration;
    // 4G以上を安定した接続と見なす
    return cellularGen === '4g' || cellularGen === '5g';
  }
  
  return false;
};
