import { APP_CONFIG } from '../config/appConfig';

let tokenClient = null;

export const initGoogleAuth = (onSuccess) => {
  if (typeof window === 'undefined') return;

  // すでにLocalStorageにトークンがあるか確認
  const storedToken = localStorage.getItem(`${APP_CONFIG.appKey}_token`);
  const expiresAt = localStorage.getItem(`${APP_CONFIG.appKey}_expires_at`);

  if (storedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
    onSuccess(storedToken);
    return;
  }

  // Google Identity Services の初期化
  if (window.google) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      scope: APP_CONFIG.scopes.join(' '),
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          const token = tokenResponse.access_token;
          const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
          
          localStorage.setItem(`${APP_CONFIG.appKey}_token`, token);
          localStorage.setItem(`${APP_CONFIG.appKey}_expires_at`, expiryTime.toString());
          
          onSuccess(token);
        }
      },
    });
  }
};

export const handleLogin = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    alert("Google認証の初期化がまだ完了していません。ページを再読み込みしてください。");
  }
};

export const logout = () => {
  localStorage.removeItem(`${APP_CONFIG.appKey}_token`);
  localStorage.removeItem(`${APP_CONFIG.appKey}_expires_at`);
  window.location.reload();
};
