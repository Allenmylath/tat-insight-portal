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
  const [local, domain] = normalized.split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    normalized = local.replace(/\./g, "") + "@" + domain;
  }

  return normalized;
};

// Normalize name (trim and lowercase)
const normalizeName = (name: string): string => {
  return name.trim().toLowerCase();
};

// Normalize phone to E.164 format if needed
const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, "");

  // Ensure it starts with +
  if (!normalized.startsWith("+")) {
    // Assuming India (+91) if no country code - adjust based on your needs
    normalized = "+91" + normalized;
  }

  return normalized;
};

// Track Google Ads signup conversion with enhanced conversion data
export const trackSignupConversion = (userData?: UserData) => {
  console.log("🔍 trackSignupConversion called with:", userData);
  if (typeof window === "undefined" || !window.gtag) {
    console.warn("gtag not available - conversion not tracked");
    return;
  }

  // STEP 1: Set user_data FIRST (according to Google's documentation)
  if (userData && userData.email) {
    const userDataObj: Record<string, any> = {
      email: normalizeEmail(userData.email),
    };

    // Add first name if available
    if (userData.firstName) {
      userDataObj.first_name = normalizeName(userData.firstName);
    }

    // Add last name if available
    if (userData.lastName) {
      userDataObj.last_name = normalizeName(userData.lastName);
    }

    // Add phone if available (must be E.164 format)
    if (userData.phone) {
      userDataObj.phone_number = normalizePhone(userData.phone);
    }

    // Set user data BEFORE conversion event
    window.gtag("set", "user_data", userDataObj);

    console.log("✅ Enhanced conversion data set:", {
      email: userData.email,
      hasFirstName: !!userData.firstName,
      hasLastName: !!userData.lastName,
      hasPhone: !!userData.phone,
    });
  } else {
    console.warn("⚠️ Conversion tracked WITHOUT enhanced data - email missing");
  }

  // STEP 2: Fire the conversion event SEPARATELY
  window.gtag("event", "conversion", {
    send_to: "AW-17694663727/otx_CJiJpb0bEK_IvPVB",
    value: 1.0,
    currency: "INR",
  });

  console.log("🎯 Conversion event fired");
};

// TypeScript declaration
declare global {
  interface Window {
    gtag: (command: string, action: string, params: Record<string, any>) => void;
    dataLayer: any[];
  }
}
