
/**
 * Platform Zero SMS Utility
 * Handles triggering native messaging apps on iOS and Android
 */

export const triggerNativeSms = (phoneNumber: string, message: string) => {
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const ua = navigator.userAgent.toLowerCase();
  const isIos = /ipad|iphone|ipod/.test(ua);
  const separator = isIos ? '&' : '?';
  
  const smsUrl = `sms:${cleanNumber}${separator}body=${encodeURIComponent(message)}`;
  window.location.href = smsUrl;
};

/**
 * Generates a deep link for external users.
 */
export const generateProductDeepLink = (type: 'product' | 'portal' | 'quote', id: string, senderName?: string) => {
  const baseUrl = window.location.origin + window.location.pathname;
  const encodedName = senderName ? encodeURIComponent(senderName) : '';
  
  switch(type) {
    case 'product': 
      return `${baseUrl}#/marketplace?item=${id}${encodedName ? `&from=${encodedName}` : ''}`;
    case 'portal': 
      return `${baseUrl}#/join/${id}`;
    case 'quote': 
      return `${baseUrl}#/order/confirm/${id}`;
    default: 
      return baseUrl;
  }
};
