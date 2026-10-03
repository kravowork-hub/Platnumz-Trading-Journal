// Utility for running Kravo on Microsoft PWABuilder for Android APK/AAB packaging

export const PUBLIC_PWA_URL = 'https://ais-pre-tw2jhwwibpkz5x3nrgkvk3-703565137561.europe-west2.run.app';

export const getPublicPwaUrl = (): string => {
  // Always use the public shared URL (ais-pre) so external tools never attempt to access private ais-dev
  return PUBLIC_PWA_URL;
};

// PWABuilder's official automatic report card URL format:
// https://www.pwabuilder.com/reportcard?site=<ENCODED_URL>
export const getPwaBuilderUrl = (): string => {
  const targetUrl = getPublicPwaUrl();
  return `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(targetUrl)}`;
};

export const openPwaBuilder = (): void => {
  if (typeof window !== 'undefined') {
    const url = getPwaBuilderUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
