import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, Delete, KeyRound, Unlock, AlertCircle, ScanFace, CheckCircle2 } from 'lucide-react';
import { authenticateWithBiometrics, isWebAuthnSupported } from '../utils/webAuthn';

interface SecurityLockModalProps {
  isLocked: boolean;
  pinCode: string;
  biometricEnabled: boolean;
  appName: string;
  onUnlock: () => void;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  isLocked,
  pinCode,
  biometricEnabled,
  appName,
  onUnlock,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [biometricSupported, setBiometricSupported] = useState(true);

  useEffect(() => {
    isWebAuthnSupported().then(supported => {
      setBiometricSupported(supported);
    });

    // Auto-prompt biometric authentication if enabled
    if (biometricEnabled && isLocked) {
      triggerBiometricAuth();
    }
  }, [biometricEnabled, isLocked]);

  if (!isLocked) return null;

  const triggerBiometricAuth = async () => {
    setBiometricScanning(true);
    setBiometricError(null);

    try {
      const result = await authenticateWithBiometrics('Verify your fingerprint or face scan to open Kravo');
      
      if (result.success) {
        setBiometricScanning(false);
        onUnlock();
      } else {
        setBiometricScanning(false);
        if (result.error) {
          setBiometricError(result.error);
        }
      }
    } catch (e: any) {
      setBiometricScanning(false);
      setBiometricError('Biometric verification failed. Please enter your 4-digit PIN.');
    }
  };

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);

    if (next.length === 4) {
      if (next === pinCode) {
        onUnlock();
      } else {
        setErrorShake(true);
        setTimeout(() => {
          setErrorShake(false);
          setEnteredPin('');
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#090B10] px-6 py-10 text-white select-none">
      
      {/* Top Branding */}
      <div className="flex flex-col items-center mt-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-3">
          <div className="w-full h-full bg-[#0C0F17] rounded-[14px] flex items-center justify-center font-mono font-bold text-2xl text-emerald-400">
            K
          </div>
        </div>
        <h1 className="text-lg font-bold text-gray-100">{appName}</h1>
        <span className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Encrypted Trading Vault
        </span>
      </div>

      {/* Biometric Status / Scanner Area */}
      <div className="flex flex-col items-center my-4 w-full max-w-xs">
        {biometricEnabled && (
          <div className="mb-4 flex flex-col items-center">
            <button
              onClick={triggerBiometricAuth}
              disabled={biometricScanning}
              className={`p-4 rounded-3xl bg-[#141824] border transition flex flex-col items-center gap-2 group ${
                biometricScanning
                  ? 'border-emerald-400 shadow-lg shadow-emerald-500/30 text-emerald-300'
                  : 'border-[#222B3E] hover:border-emerald-500/60 text-emerald-400'
              }`}
            >
              <div className="relative">
                <Fingerprint className={`w-10 h-10 ${biometricScanning ? 'animate-pulse scale-110' : ''}`} />
                {biometricScanning && (
                  <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-60 pointer-events-none" />
                )}
              </div>
              <span className="text-xs font-semibold text-gray-200">
                {biometricScanning ? 'Scanning Fingerprint / Face...' : 'Tap for Biometric Unlock'}
              </span>
            </button>
            <span className="text-[10px] text-gray-500 mt-1 font-mono">
              Web Authentication API (Android BiometricPrompt)
            </span>
          </div>
        )}

        {/* PIN Dots Indicator */}
        <span className="text-xs font-mono text-gray-400 mb-3">
          Or Enter 4-Digit Security PIN
        </span>
        <div className={`flex items-center gap-4 ${errorShake ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < enteredPin.length
                  ? errorShake
                    ? 'bg-rose-500 scale-110'
                    : 'bg-emerald-400 scale-110 shadow-sm shadow-emerald-400/50'
                  : 'bg-[#1C2336] border border-[#2D3854]'
              }`}
            />
          ))}
        </div>

        {errorShake && (
          <span className="text-xs text-rose-400 font-medium mt-2">
            Incorrect PIN. Try again.
          </span>
        )}

        {biometricError && (
          <div className="mt-2 p-2 bg-rose-950/40 border border-rose-800/60 rounded-xl text-[11px] text-rose-300 text-center flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{biometricError}</span>
          </div>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-14 sm:h-16 rounded-2xl bg-[#141824] hover:bg-[#1C2234] active:scale-95 text-xl font-bold font-mono text-white transition flex items-center justify-center shadow-md border border-[#1F263A]"
            >
              {d}
            </button>
          ))}

          {/* Biometric Button */}
          <button
            onClick={triggerBiometricAuth}
            className={`h-14 sm:h-16 rounded-2xl bg-[#141824] hover:bg-[#1C2234] active:scale-95 text-emerald-400 transition flex items-center justify-center border border-[#1F263A] ${
              biometricScanning ? 'animate-pulse text-emerald-300' : ''
            }`}
            title="Biometric Fingerprint / Face Unlock"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          {/* Zero */}
          <button
            onClick={() => handleDigit('0')}
            className="h-14 sm:h-16 rounded-2xl bg-[#141824] hover:bg-[#1C2234] active:scale-95 text-xl font-bold font-mono text-white transition flex items-center justify-center shadow-md border border-[#1F263A]"
          >
            0
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="h-14 sm:h-16 rounded-2xl bg-[#141824] hover:bg-[#1C2234] active:scale-95 text-gray-400 hover:text-white transition flex items-center justify-center border border-[#1F263A]"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Bypass Demo hint */}
        <div className="text-center pt-1">
          <button
            onClick={onUnlock}
            className="text-[11px] text-gray-400 hover:text-emerald-400 font-mono transition"
          >
            Emergency Unlock (Demo Bypass)
          </button>
        </div>
      </div>

    </div>
  );
};
