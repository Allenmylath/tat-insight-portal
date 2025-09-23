// PhonePe checkout type declarations
declare global {
  interface Window {
    PhonePeCheckout?: {
      transact: (options: {
        tokenUrl: string;
        type?: "IFRAME" | "REDIRECT";
        callback?: (response: "USER_CANCEL" | "CONCLUDED") => void;
      }) => void;
      closePage: () => void;
    };
  }
}

export {};