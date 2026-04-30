import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi, ChecklistTemplate } from '@/api/checklistsApi';
import { inspectionsApi } from '@/api/inspectionsApi';
import { X, CheckCircle2, ListChecks, ChevronLeft, Save, AlertCircle } from 'lucide-react';

interface ChecklistPerformerProps {
  asset: any;
  templateId?: string;
  onClose: () => void;
}

const ChecklistPerformer: React.FC<ChecklistPerformerProps> = ({ asset, templateId, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [checklistItems, setChecklistItems] = useState<{ label: string; checked: boolean }[]>([]);
  const [comments, setComments] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['checklists', asset?.type],
    queryFn: () => checklistsApi.getTemplates(asset?.type),
  });

  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: ['checklist-template', templateId],
    queryFn: () => checklistsApi.getById(templateId!),
    enabled: !!templateId,
  });

  React.useEffect(() => {
    if (templateData) {
      setSelectedTemplate(templateData);
      setChecklistItems(templateData.items.map((i: any) => ({ label: i.label, checked: false })));
    }
  }, [templateData]);

  const performMutation = useMutation({
    mutationFn: (data: any) => inspectionsApi.scheduleForAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['assetContext', asset.id] });
      onClose();
    },
  });

  const handleSelectTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setChecklistItems(template.items.map(i => ({ label: i.label, checked: false })));
  };

  const toggleItem = (idx: number) => {
    const newItems = [...checklistItems];
    newItems[idx].checked = !newItems[idx].checked;
    setChecklistItems(newItems);
  };

  const handleSubmit = () => {
    if (!selectedTemplate) return;

    performMutation.mutate({
      asset_id: asset.id,
      walkthrough_id: asset.walkthrough_id,
      title: `Inspection: ${asset.name} - ${selectedTemplate.name}`,
      status: 'completed',
      due_date: new Date().toISOString(),
      checklist: checklistItems.map(i => i.label),
      // In a real app, we would also store the checked status per item
      results: checklistItems,
      comments,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3">
            {selectedTemplate && (
              <button onClick={() => setSelectedTemplate(null)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ListChecks className="text-primary-500" size={20} />
                {selectedTemplate ? selectedTemplate.name : 'Select Checklist Template'}
              </h2>
              <p className="text-xs text-gray-400">Asset: {asset.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : !selectedTemplate ? (
            <div className="grid grid-cols-1 gap-3">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle size={32} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No templates found for this asset type.</p>
                  <p className="text-xs text-gray-500 mt-1">Add templates in the Asset Management panel.</p>
                </div>
              ) : (
                templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-primary-500/50 rounded-xl transition-all text-left group"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-primary-400 transition-colors">{t.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{t.items.length} items</div>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-primary-500 transition-colors" />
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {checklistItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleItem(idx)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      item.checked 
                        ? 'bg-primary-600/10 border-primary-500/50 text-white' 
                        : 'bg-gray-800/30 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      item.checked ? 'bg-primary-500 border-primary-500' : 'border-gray-600'
                    }`}>
                      {item.checked && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Additional Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:border-primary-500 outline-none transition-all min-h-[100px]"
                  placeholder="Notes on the condition, findings, etc..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedTemplate && (
          <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={performMutation.isPending || checklistItems.length === 0}
              className="flex-[2] py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {performMutation.isPending ? 'Saving...' : 'Submit Inspection'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistPerformer;

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
