/**
 * �<�h:(kթ����Y��: �1,200	
 * @param price �<p$	
 * @returns թ����U�_�<�W
 */
export const formatPrice = (price: number | string): string => {
  if (price === null || price === undefined) return '�0';
  
  // �Wn4op$k	�
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // p��o�hf
  const roundedPrice = Math.floor(numPrice);
  
  // 3A:�gh:
  return `�${roundedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

/**
 * �ؒh:(kթ����Y��: 2023t51�	
 * @param dateString �؇W
 * @returns թ����U�_��
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}t${month}${day}�`;
};

/**
 * ƭ�Ȓ�W_wUk�p��
 * @param text Cnƭ��
 * @param maxLength  'w
 * @returns �p���_ƭ��
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};
