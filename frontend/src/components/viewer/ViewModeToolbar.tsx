import { useState } from 'react';
import { Eye, Edit3, Share2, Download, QrCode, Link as LinkIcon, Copy, Check } from 'lucide-react';

export type ViewMode = 'view' | 'edit' | 'share';

interface ViewModeToolbarProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  walkthroughId: string;
  walkthroughName: string;
  canEdit: boolean;
}

export function ViewModeToolbar({ currentMode, onModeChange, walkthroughId, canEdit }: ViewModeToolbarProps) {
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/walkthrough/${walkthroughId}`;
  const embedUrl = `${window.location.origin}/embed/walkthrough/${walkthroughId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyEmbed = async () => {
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleModeChange = (mode: ViewMode) => {
    onModeChange(mode);
    if (mode === 'share') {
      setShowSharePanel(true);
    } else {
      setShowSharePanel(false);
    }
  };

  return (
    <>
      {/* Mode Toggle Buttons */}
      <div className="bg-gray-800 rounded-lg p-1 flex items-center gap-1">
        {/* View Mode */}
        <button
          onClick={() => handleModeChange('view')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            currentMode === 'view'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Eye size={12} />
          <span>View</span>
        </button>

        {/* Edit Mode - Only for authorized users */}
        {canEdit && (
          <button
            onClick={() => handleModeChange('edit')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentMode === 'edit'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Edit3 size={12} />
            <span>Edit</span>
          </button>
        )}

        {/* Share Mode */}
        <button
          onClick={() => handleModeChange('share')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            currentMode === 'share'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Share2 size={12} />
          <span>Share</span>
        </button>
      </div>

      {/* Share Panel */}
      {currentMode === 'share' && showSharePanel && (
        <div className="absolute top-16 right-4 z-50 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Share2 size={14} />
              Share Walkthrough
            </h3>
            <button
              onClick={() => setShowSharePanel(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Share Link */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                <LinkIcon size={10} />
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-white text-xs"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs transition-colors flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                <Download size={10} />
                Embed Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`<iframe src="${embedUrl}" width="100%" height="600"></iframe>`}
                  readOnly
                  className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-white text-xs"
                />
                <button
                  onClick={handleCopyEmbed}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs transition-colors flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="text-center py-3 bg-gray-800 rounded-lg">
              <QrCode size={48} className="mx-auto text-gray-600 mb-2" />
              <p className="text-xs text-gray-500">QR Code</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
