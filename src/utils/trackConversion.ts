interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

// Normalize email according to Google's requirements
const normalizeEmail = (email: string): string => {
  // Remove whitespace and convert to lowercase
  let normalized = email.trim().toLowerCase();
  
  // Remove dots before @ for gmail/googlemail addresses
  const [local, domain] = normalized.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    normalized = local.replace(/\./g, '') + '@' + domain;
  }
  
  return normalized;
};

// Normalize name (trim and lowercase)
const normalizeName = (name: string): string => {
  return name.trim().toLowerCase();
};

// Track Google Ads signup conversion with enhanced conversion data
export const trackSignupConversion = (userData?: UserData) => {
  if (typeof window !== 'undefined' && window.gtag) {
    
    // STEP 1: Set user_data FIRST (according to Google's documentation)
    if (userData && userData.email) {
      const userDataObj: Record<string, any> = {
        email: normalizeEmail(userData.email)
      };

      // Add names under 'address' object if available (per Google's structure)
      if (userData.firstName || userData.lastName) {
        userDataObj.address = {};
        if (userData.firstName) {
          userDataObj.address.first_name = normalizeName(userData.firstName);
        }
        if (userData.lastName) {
          userDataObj.address.last_name = normalizeName(userData.lastName);
        }
      }

      // Set user data BEFORE conversion event
      window.gtag('set', 'user_data', userDataObj);

      console.log('Enhanced conversion data set:', {
        email: userData.email,
        hasName: !!(userData.firstName || userData.lastName)
      });
    } else {
      console.warn('Conversion tracked WITHOUT enhanced data - email missing');
    }

    // STEP 2: Fire the conversion event SEPARATELY
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17694663727/otx_CJiJpb0bEK_IvPVB',
      'value': 1.0,
      'currency': 'INR'
    });
  }
};

// TypeScript declaration
declare global {
  interface Window {
    gtag: (command: string, action: string, params: Record<string, any>) => void;
    dataLayer: any[];
  }
}
