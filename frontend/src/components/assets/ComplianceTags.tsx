import { useState } from 'react';
import { ComplianceTag } from '@/types';

interface ComplianceTagsProps {
  assetId: string;
  compliance: ComplianceTag[];
  onUpdate: () => void;
}

const statusColors: Record<string, string> = {
  pass: 'bg-green-500/20 text-green-400 border-green-500/30',
  fail: 'bg-red-500/20 text-red-400 border-red-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const ComplianceTags: React.FC<ComplianceTagsProps> = ({ assetId, compliance, onUpdate }) => {
  const [newReg, setNewReg] = useState('');
  const [newStatus, setNewStatus] = useState<'pass' | 'fail' | 'pending'>('pending');
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (!newReg.trim()) return;
    const updated = [...compliance, { regulation: newReg, status: newStatus, checked_at: new Date().toISOString() }];
    // Call API to update asset compliance
    fetch(`/api/assets/${assetId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ compliance: updated }),
    }).then(() => {
      setNewReg('');
      setAdding(false);
      onUpdate();
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Compliance Tags</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="text-sm text-primary-400 hover:text-primary-300"
        >
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {adding && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Regulation name"
            value={newReg}
            onChange={e => setNewReg(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          />
          <div className="flex gap-2">
            {(['pending', 'pass', 'fail'] as const).map(s => (
              <button
                key={s}
                onClick={() => setNewStatus(s)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  newStatus === s
                    ? statusColors[s]
                    : 'border-gray-600 text-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm"
          >
            Add Tag
          </button>
        </div>
      )}

      {compliance.length === 0 ? (
        <p className="text-gray-500 text-sm">No compliance tags.</p>
      ) : (
        <div className="space-y-2">
          {compliance.map((tag, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <div>
                <p className="text-sm text-white">{tag.regulation}</p>
                {tag.note && <p className="text-xs text-gray-400">{tag.note}</p>}
                {tag.checked_at && (
                  <p className="text-xs text-gray-500">
                    Checked: {new Date(tag.checked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[tag.status]}`}>
                {tag.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceTags;
