import { GOOGLE_CLIENT_ID } from '../config';

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/analytics.readonly'
];

interface SignInOptions {
  prompt?: 'none' | 'consent' | 'select_account';
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
            hosted_domain?: string;
            hint?: string;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

class GoogleAuth {
  private scriptLoaded: boolean = false;
  private scriptLoadPromise: Promise<void> | null = null;

  private async loadGoogleScript(): Promise<void> {
    if (this.scriptLoadPromise) {
      return this.scriptLoadPromise;
    }

    this.scriptLoadPromise = new Promise((resolve, reject) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        this.scriptLoaded = false;
        this.scriptLoadPromise = null;
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }

  async signIn(options: SignInOptions = {}): Promise<string> {
    try {
      await this.loadGoogleScript();

      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not loaded');
      }

      return new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES.join(' '),
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            localStorage.setItem('google_access_token', response.access_token);
            resolve(response.access_token);
          },
          prompt: options.prompt || 'select_account'
        });

        client.requestAccessToken();
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('google_access_token');
  }

  clearToken(): void {
    localStorage.removeItem('google_access_token');
  }
}

export const googleAuth = new GoogleAuth();
