import { useState, useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { assetsApi } from '@/api/assetsApi';

interface QRModalProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ assetId, assetName, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(200);

  useEffect(() => {
    loadQRCode();
    return () => {
      if (qrUrl) URL.revokeObjectURL(qrUrl);
    };
  }, [assetId, size]);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      const url = await assetsApi.qr(assetId, size);
      setQrUrl(url);
    } catch (error) {
      console.error('Failed to load QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `asset_${assetId}_qr.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const file = new File([blob], `asset_${assetId}_qr.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `QR Code for ${assetName}`,
          files: [file],
        });
      } else {
        alert('Sharing not supported on this browser');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">QR Code</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">{assetName}</p>
          <div className="bg-white rounded-lg p-4 flex items-center justify-center min-h-[200px]">
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : qrUrl ? (
              <img src={qrUrl} alt="QR Code" className="max-w-full" />
            ) : (
              <div className="text-red-400">Failed to load QR code</div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Size</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSize(200)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm ${size === 200 ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Small
            </button>
            <button
              onClick={() => setSize(300)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm ${size === 300 ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Medium
            </button>
            <button
              onClick={() => setSize(400)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm ${size === 400 ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              Large
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!qrUrl}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={handleShare}
            disabled={!qrUrl}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
