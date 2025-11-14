interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

// Track Google Ads signup conversion with enhanced conversion data
export const trackSignupConversion = (userData?: UserData) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const conversionParams: Record<string, any> = {
      'send_to': 'AW-17694663727/otx_CJiJpb0bEK_IvPVB',
      'value': 1.0,
      'currency': 'INR'
    };

    // Add enhanced conversion data if available
    if (userData && userData.email) {
      conversionParams['user_data'] = {
        email: userData.email.trim().toLowerCase(),
      };

      // Add optional fields if available
      if (userData.phone) {
        conversionParams['user_data'].phone = userData.phone;
      }
      if (userData.firstName) {
        conversionParams['user_data'].first_name = userData.firstName;
      }
      if (userData.lastName) {
        conversionParams['user_data'].last_name = userData.lastName;
      }

      console.log('Signup conversion tracked with enhanced data:', {
        email: userData.email,
        hasPhone: !!userData.phone,
        hasName: !!(userData.firstName || userData.lastName)
      });
    } else {
      console.warn('Conversion tracked WITHOUT enhanced data - email missing');
    }

    window.gtag('event', 'conversion', conversionParams);
  }
};

// TypeScript declaration
declare global {
  interface Window {
    gtag: (command: string, action: string, params: Record<string, any>) => void;
    dataLayer: any[];
  }
}
