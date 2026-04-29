import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, MaintenanceSchedule } from '@/api/maintenanceApi';

interface PMScheduleProps {
  assetId: string;
}

const PMSchedule: React.FC<PMScheduleProps> = ({ assetId }) => {
  const queryClient = useQueryClient();
  const { data: schedules, isLoading } = useQuery({ queryKey: ['maintenance', assetId], queryFn: () => maintenanceApi.getByAsset(assetId) });

  const createMutation = useMutation({
    mutationFn: (data: { assetId: string; frequencyDays: number; nextDueDate?: string }) =>
      maintenanceApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance', assetId] }),
  });

  const [frequency, setFrequency] = useState(90);
  const [nextDue, setNextDue] = useState('');

  const handleCreate = () => {
    createMutation.mutate({ assetId, frequencyDays: frequency, nextDueDate: nextDue || undefined });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Preventive Maintenance</h3>
      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <ul className="space-y-2 mb-4">
          {schedules && schedules.length > 0 ? (
            schedules.map((s: MaintenanceSchedule) => (
              <li key={s.id} className="flex justify-between text-sm text-gray-200">
                <span>Every {s.frequency_days} days – Next due {new Date(s.next_due_date).toLocaleDateString()}</span>
                <span className={s.status === 'active' ? 'text-green-400' : s.status === 'paused' ? 'text-yellow-400' : 'text-gray-500'}>{s.status}</span>
              </li>
            ))
          ) : (
            <div className="text-gray-500">No schedules defined.</div>
          )}
        </ul>
      )}
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={1}
          value={frequency}
          onChange={e => setFrequency(Number(e.target.value))}
          className="w-20 p-1 bg-gray-800 text-white border border-gray-700 rounded"
          placeholder="Days"
        />
        <input
          type="date"
          value={nextDue}
          onChange={e => setNextDue(e.target.value)}
          className="p-1 bg-gray-800 text-white border border-gray-700 rounded"
        />
        <button
          onClick={handleCreate}
          className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded"
        >
          Add Schedule
        </button>
      </div>
    </div>
  );
};

export default PMSchedule;
