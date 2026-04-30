import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionsApi, Inspection } from '@/api/inspectionsApi';
import { useSearchParams } from 'react-router-dom';

// Predefined checklist templates by asset type
const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  HVAC: [
    'Check thermostat operation',
    'Inspect air filters',
    'Check refrigerant levels',
    'Inspect condenser coils',
    'Check electrical connections',
    'Test system cycle',
  ],
  Elevator: [
    'Check door operation',
    'Test emergency stop',
    'Inspect cables and pulleys',
    'Check safety sensors',
    'Test alarm system',
    'Inspect lighting',
  ],
  'Fire Extinguisher': [
    'Check pressure gauge',
    'Inspect physical condition',
    'Check seal and tamper indicator',
    'Verify inspection tag date',
    'Check accessibility',
  ],
  Lighting: [
    'Check all fixtures operation',
    'Inspect for flickering',
    'Check emergency lighting',
    'Test switches',
    'Inspect for overheating',
  ],
  Plumbing: [
    'Check for leaks',
    'Inspect water pressure',
    'Check drainage',
    'Inspect visible pipes',
    'Test shut-off valves',
  ],
  Other: [
    'Visual inspection',
    'Check operational status',
    'Inspect for damage',
    'Verify safety compliance',
  ],
};

import Header from '@/components/layout/Header';

const Inspections: React.FC = () => {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || '';
  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => inspectionsApi.getAll(),
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: { asset_id: string; walkthrough_id: string; due_date: string; checklist: string[] }) =>
      inspectionsApi.scheduleForAsset(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspections'] }),
  });

  const [form, setForm] = useState({
    asset_id: assetId,
    walkthrough_id: '',
    due_date: '',
    asset_type: 'Other',
  });

  const handleSchedule = () => {
    const checklist = CHECKLIST_TEMPLATES[form.asset_type] || CHECKLIST_TEMPLATES.Other;
    scheduleMutation.mutate({
      asset_id: form.asset_id,
      walkthrough_id: form.walkthrough_id,
      due_date: form.due_date,
      checklist,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Inspections</h1>

        {/* Schedule Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Schedule Inspection for Asset</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Asset ID"
              value={form.asset_id}
              onChange={e => setForm({ ...form, asset_id: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
            <input
              type="text"
              placeholder="Walkthrough ID"
              value={form.walkthrough_id}
              onChange={e => setForm({ ...form, walkthrough_id: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
            <select
              value={form.asset_type}
              onChange={e => setForm({ ...form, asset_type: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              {Object.keys(CHECKLIST_TEMPLATES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          <button
            onClick={handleSchedule}
            disabled={scheduleMutation.isPending}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50"
          >
            {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Inspection'}
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-xl">Loading inspections...</div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">All Inspections</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="p-2">Title</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Due Date</th>
                    <th className="p-2">Auto?</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((insp: Inspection) => (
                    <tr key={insp.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-2">{insp.title}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insp.status === 'signed_off' ? 'bg-green-500/20 text-green-400' :
                          insp.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{insp.status}</span>
                      </td>
                      <td className="p-2">{insp.due_date ? new Date(insp.due_date).toLocaleDateString() : '-'}</td>
                      <td className="p-2">{insp.auto_generated ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                  {inspections.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">No inspections scheduled.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inspections;
