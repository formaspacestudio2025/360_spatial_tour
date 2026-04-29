import { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface PinPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => boolean;
  title?: string;
  description?: string;
  error?: string;
}

function PinPrompt({
  isOpen,
  onClose,
  onVerify,
  title = 'Restricted Access',
  description = 'This hotspot requires authentication',
  error,
}: PinPromptProps) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onVerify(pin);
    if (isValid) {
      setPin('');
      setIsError(false);
    } else {
      setIsError(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    setPin(value);
    setIsError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Lock size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{title}</h3>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PIN Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Enter PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handleChange}
                placeholder="••••"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 ${
                  isError
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-700 focus:ring-primary-500/20'
                }`}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {(isError || error) && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle size={16} />
                <span>{error || 'Invalid PIN. Please try again.'}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pin.length !== 4}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Contact your administrator if you don't have the PIN.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PinPrompt;