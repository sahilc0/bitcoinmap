// Apple Sign In with Apple JS SDK
interface AppleIDAuth {
  init(config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    usePopup: boolean;
  }): void;
  signIn(): Promise<{
    authorization: {
      id_token: string;
      code: string;
    };
    user?: {
      email?: string;
      name?: {
        firstName?: string;
        lastName?: string;
      };
    };
  }>;
}

interface AppleID {
  auth: AppleIDAuth;
}

declare global {
  interface Window {
    AppleID?: AppleID;
  }
}

// Google Identity Services
interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  prompt(callback?: (notification: {
    isNotDisplayed(): boolean;
    isSkippedMoment(): boolean;
    isDismissedMoment(): boolean;
    getNotDisplayedReason(): string;
    getSkippedReason(): string;
    getDismissedReason(): string;
  }) => void): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
      type?: "standard" | "icon";
    }
  ): void;
  disableAutoSelect(): void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface Google {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    google?: Google;
  }
}

export {};
