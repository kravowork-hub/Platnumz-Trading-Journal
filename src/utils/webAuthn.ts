/**
 * Web Authentication API (WebAuthn) helper for biometric authentication (Fingerprint / Face ID / Android BiometricPrompt)
 */

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  isSimulatedFallback?: boolean;
}

export async function isWebAuthnSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Prompt biometric authentication using WebAuthn navigator.credentials.get()
 * Requests user verification (fingerprint or face scan)
 */
export async function authenticateWithBiometrics(
  promptMessage: string = 'Verify identity to access trading records'
): Promise<BiometricAuthResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not available' };
  }

  // Check if WebAuthn is supported
  const supported = typeof window.PublicKeyCredential !== 'undefined';

  if (!supported) {
    // Graceful fallback for environments without WebAuthn
    return { 
      success: true, 
      isSimulatedFallback: true 
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Call WebAuthn assertion request
    // This triggers Android's BiometricPrompt (Fingerprint / Face Unlock dialog)
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname,
      },
    });

    if (credential) {
      return { success: true };
    } else {
      return { success: false, error: 'Biometric verification cancelled' };
    }
  } catch (err: any) {
    console.warn('WebAuthn prompt notification:', err);

    // If the browser/iframe denies access (e.g. cross-origin iframe security or unconfigured RP),
    // or if the user clicks cancel, handle cleanly:
    if (err.name === 'NotAllowedError') {
      // User cancelled or iframe lacks publickey-credentials-get permission
      return { 
        success: false, 
        error: 'Biometric prompt was cancelled or permission denied in this view. Use your 4-digit PIN.' 
      };
    }

    if (err.name === 'SecurityError') {
      // Cross-origin iframe constraint: fallback gracefully
      return {
        success: false,
        error: 'Security origin constraint in preview. Please use PIN or open in standalone window.',
        isSimulatedFallback: true
      };
    }

    return { 
      success: false, 
      error: err.message || 'Biometric authentication failed' 
    };
  }
}

/**
 * Register a platform biometric credential (e.g. initial setup)
 */
export async function registerBiometric(
  username: string = 'trader@kravo.local'
): Promise<BiometricAuthResult> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn not supported on this device' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Kravo Trading Journal',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: username,
          displayName: 'Kravo Trader',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256 (standard for Android/iOS)
          { alg: -257, type: 'public-key' },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    });

    return { success: !!credential };
  } catch (err: any) {
    console.warn('Biometric registration info:', err);
    return { 
      success: false, 
      error: err.message || 'Registration failed' 
    };
  }
}
