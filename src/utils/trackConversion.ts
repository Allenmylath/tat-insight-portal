// Track Google Ads signup conversion
export const trackSignupConversion = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17694663727/otx_CJiJpb0bEK_IvPVB',
      'value': 1.0,
      'currency': 'INR'
    });
    console.log('Signup conversion tracked to Google Ads');
  }
};

// TypeScript declaration
declare global {
  interface Window {
    gtag: (command: string, action: string, params: Record<string, any>) => void;
    dataLayer: any[];
  }
}
