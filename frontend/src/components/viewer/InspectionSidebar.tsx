import { useState, useCallback } from 'react';
import { CheckCircle2, Circle, AlertTriangle, ClipboardList, Shield, Eye, X, Save, Download } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  description: string;
  required: boolean;
  completed: boolean;
  notes?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface InspectionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (results: InspectionResult) => void;
  checklistItems?: ChecklistItem[];
  inspectorName?: string;
  inspectionDate?: string;
}

interface InspectionResult {
  inspectorName: string;
  inspectionDate: string;
  items: ChecklistItem[];
  overallStatus: 'pass' | 'fail' | 'partial';
  notes: string;
}

function InspectionSidebar({
  isOpen,
  onClose,
  onComplete,
  checklistItems,
  inspectorName = '',
  inspectionDate = new Date().toISOString().split('T')[0],
}: InspectionSidebarProps) {
  const [items, setItems] = useState<ChecklistItem[]>(
    checklistItems || [
      {
        id: '1',
        category: 'Safety',
        description: 'Check for safety hazards',
        required: true,
        completed: false,
        severity: 'critical'
      },
      {
        id: '2',
        category: 'Structural',
        description: 'Inspect structural integrity',
        required: true,
        completed: false,
        severity: 'high'
      },
      {
        id: '3',
        category: 'Electrical',
        description: 'Verify electrical systems',
        required: true,
        completed: false,
        severity: 'high'
      },
      {
        id: '4',
        category: 'Plumbing',
        description: 'Check plumbing fixtures',
        required: false,
        completed: false,
        severity: 'medium'
      },
      {
        id: '5',
        category: 'HVAC',
        description: 'Inspect HVAC systems',
        required: false,
        completed: false,
        severity: 'medium'
      },
      {
        id: '6',
        category: 'Fire Safety',
        description: 'Check fire safety equipment',
        required: true,
        completed: false,
        severity: 'critical'
      },
      {
        id: '7',
        category: 'Accessibility',
        description: 'Verify accessibility compliance',
        required: true,
        completed: false,
        severity: 'medium'
      },
      {
        id: '8',
        category: 'Cleanliness',
        description: 'Assess cleanliness standards',
        required: false,
        completed: false,
        severity: 'low'
      }
    ]
  );

  const [notes, setNotes] = useState('');
  const [inspector, setInspector] = useState(inspectorName);
  const [date, setDate] = useState(inspectionDate);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Safety');

  // Group items by category
  const groupedItems = useCallback(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    items.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  // Calculate completion status
  const completionStatus = useCallback(() => {
    const requiredItems = items.filter(item => item.required);
    const completedRequired = requiredItems.filter(item => item.completed);
    const totalRequired = requiredItems.length;

    if (completedRequired.length === totalRequired) {
      return 'pass';
    } else if (completedRequired.length === 0) {
      return 'fail';
    } else {
      return 'partial';
    }
  }, [items]);

  // Handle item completion toggle
  const handleToggleItem = useCallback((itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  // Handle item notes update
  const handleItemNotes = useCallback((itemId: string, notes: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  }, []);

  // Handle complete inspection
  const handleComplete = useCallback(() => {
    const result: InspectionResult = {
      inspectorName: inspector,
      inspectionDate: date,
      items,
      overallStatus: completionStatus() as 'pass' | 'fail' | 'partial',
      notes
    };
    onComplete(result);
  }, [inspector, date, items, notes, completionStatus, onComplete]);

  // Handle export
  const handleExport = useCallback(() => {
    const result: InspectionResult = {
      inspectorName: inspector,
      inspectionDate: date,
      items,
      overallStatus: completionStatus() as 'pass' | 'fail' | 'partial',
      notes
    };

    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportName = `inspection_${date}_${inspector.replace(/\s+/g, '_')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  }, [inspector, date, items, notes, completionStatus]);

  const groups = groupedItems();
  const status = completionStatus();

  if (!isOpen) return null;

  return (
    <>
      {/* Red Overlay */}
      <div className="fixed inset-0 bg-red-900/20 pointer-events-none z-40" />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-red-500/30 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-red-900/20 border-b border-red-500/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-red-500" />
            <div>
              <h2 className="text-white font-semibold">Inspection Mode</h2>
              <p className="text-xs text-gray-400">Complete safety checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Inspector Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Inspector Name</label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Inspection Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`px-4 py-3 border-b border-gray-800 ${
          status === 'pass' ? 'bg-green-900/20 border-green-500/30' :
          status === 'fail' ? 'bg-red-900/20 border-red-500/30' :
          'bg-yellow-900/20 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {status === 'pass' ? (
              <CheckCircle2 size={18} className="text-green-500" />
            ) : status === 'fail' ? (
              <AlertTriangle size={18} className="text-red-500" />
            ) : (
              <Eye size={18} className="text-yellow-500" />
            )}
            <div>
              <p className="text-white text-sm font-medium capitalize">
                {status === 'pass' ? 'All Required Items Completed' :
                 status === 'fail' ? 'Required Items Pending' :
                 'Partially Completed'}
              </p>
              <p className="text-xs text-gray-400">
                {items.filter(i => i.completed).length} of {items.length} items checked
              </p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {Object.entries(groups).map(([category, categoryItems]) => (
              <div key={category} className="bg-gray-800/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(
                    expandedCategory === category ? null : category
                  )}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-gray-400" />
                    <span className="text-white text-sm font-medium">{category}</span>
                    <span className="text-xs text-gray-500">
                      ({categoryItems.filter(i => i.completed).length}/{categoryItems.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoryItems.some(i => !i.completed && i.required) && (
                      <AlertTriangle size={14} className="text-red-500" />
                    )}
                  </div>
                </button>

                {expandedCategory === category && (
                  <div className="p-3 space-y-2">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          item.completed
                            ? 'bg-green-900/10 border-green-500/20'
                            : item.required
                            ? 'bg-red-900/10 border-red-500/20'
                            : 'bg-gray-700/30 border-gray-600/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleItem(item.id)}
                            className={`mt-0.5 flex-shrink-0 ${
                              item.completed ? 'text-green-500' : 'text-gray-500'
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <Circle size={18} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm">{item.description}</span>
                              {item.required && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                                  Required
                                </span>
                              )}
                              {item.severity && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  item.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                  item.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  item.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {item.severity}
                                </span>
                              )}
                            </div>
                            <textarea
                              value={item.notes || ''}
                              onChange={(e) => handleItemNotes(item.id, e.target.value)}
                              placeholder="Add notes..."
                              className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-300 focus:border-gray-600 focus:outline-none resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="p-4 border-t border-gray-800">
          <label className="text-xs text-gray-400 block mb-2">Overall Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add overall inspection notes..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:border-gray-600 focus:outline-none resize-none"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-800 flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleComplete}
            disabled={status === 'fail'}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
              status === 'pass'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : status === 'partial'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            Complete
          </button>
        </div>
      </div>
    </>
  );
}

export default InspectionSidebar;