import { useState } from 'react';
import { CheckCircle, Circle, FileText, Camera, Send } from 'lucide-react';

interface InspectionItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
  photo?: string;
}

interface InspectionSidebarProps {
  items: InspectionItem[];
  onToggle: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
  onAddPhoto: (id: string, photoUrl: string) => void;
  onSignOff: () => void;
  readOnly?: boolean;
}

const InspectionSidebar: React.FC<InspectionSidebarProps> = ({
  items,
  onToggle,
  onAddNote,
  onAddPhoto,
  onSignOff,
  readOnly = false,
}) => {
  const [noteText, setNoteText] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const completed = items.filter(i => i.checked).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">Inspection Checklist</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{completed}/{total} completed</span>
          <div className="flex-1 bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-green-500 h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {items.map(item => (
          <div
            key={item.id}
            className="p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => !readOnly && onToggle(item.id)}
                className="mt-0.5 text-gray-400 hover:text-green-400 transition-colors"
                disabled={readOnly}
              >
                {item.checked ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <Circle size={16} />
                )}
              </button>
              <div className="flex-1">
                <p className={`text-sm ${item.checked ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {item.label}
                </p>
                {item.notes && (
                  <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                )}
                {item.photo && (
                  <img src={item.photo} alt="Evidence" className="mt-2 rounded-lg max-h-20 object-cover" />
                )}
              </div>
            </div>

            {!readOnly && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Add note"
                >
                  <FileText size={14} />
                </button>
                <button
                  onClick={() => {
                    // Simulate photo capture
                    const fakeUrl = `https://picsum.photos/seed/${item.id}/100/60`;
                    onAddPhoto(item.id, fakeUrl);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  title="Add photo"
                >
                  <Camera size={14} />
                </button>
              </div>
            )}
          </div>

          {selectedItem === item.id && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add note..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (noteText.trim()) {
                    onAddNote(item.id, noteText);
                    setNoteText('');
                    setSelectedItem(null);
                  }
                }}
                className="px-2 py-1 bg-primary-600 text-white rounded text-xs"
              >
                Save
              </button>
            </div>
          )}
        ))}
      </div>

      {/* Sign-off */}
      {!readOnly && (
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onSignOff}
            disabled={completed < total}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Sign Off Inspection ({completed}/{total})
          </button>
          {completed < total && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Complete all items to sign off
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionSidebar;
