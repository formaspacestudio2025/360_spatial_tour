import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface DepreciationInfo {
  purchasePrice: number;
  salvageValue: number;
  usefulLifeYears: number;
  currentAgeYears: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  depreciationRate: number;
}

interface AssetReportItem {
  asset: any;
  depreciation: DepreciationInfo | null;
}

interface InventoryReport {
  reportDate: string;
  totalAssets: number;
  totalOriginalValue: number;
  totalCurrentValue: number;
  totalAccumulatedDepreciation: number;
  assets: AssetReportItem[];
}

const AssetInventoryReport: React.FC = () => {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/assets/inventory-report`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      return data.data as InventoryReport;
    },
  });

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-500">Failed to load report.</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Asset Inventory Report</h1>
            <p className="text-sm text-gray-400">
              Report Date: {new Date(report.reportDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <button onClick={handlePrint} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm">
              Print Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Assets</p>
            <p className="text-2xl font-bold text-white">{report.totalAssets}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Original Value</p>
            <p className="text-2xl font-bold text-white">¥{report.totalOriginalValue?.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Current Value</p>
            <p className="text-2xl font-bold text-green-400">¥{report.totalCurrentValue?.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Total Depreciation</p>
            <p className="text-2xl font-bold text-red-400">¥{report.totalAccumulatedDepreciation?.toLocaleString()}</p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Asset List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left">Asset Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Brand/Model</th>
                  <th className="px-4 py-3 text-right">Original Value</th>
                  <th className="px-4 py-3 text-right">Depr. Rate</th>
                  <th className="px-4 py-3 text-right">Accum. Depr.</th>
                  <th className="px-4 py-3 text-right">Current Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {report.assets.map((item) => (
                  <tr key={item.asset.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.asset.name}</div>
                      {item.asset.serial_number && (
                        <div className="text-xs text-gray-500">{item.asset.serial_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {item.asset.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {item.asset.brand || '-'} {item.asset.model || ''}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {item.depreciation ? `¥${item.depreciation.purchasePrice?.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-yellow-400">
                      {item.depreciation ? `${item.depreciation.depreciationRate.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-red-400">
                      {item.depreciation ? `¥${item.depreciation.accumulatedDepreciation?.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-green-400 font-medium">
                      {item.depreciation ? `¥${item.depreciation.currentBookValue?.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-800/30 font-medium">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm text-gray-400">Totals:</td>
                  <td className="px-4 py-3 text-right text-sm text-white">¥{report.totalOriginalValue?.toLocaleString()}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right text-sm text-red-400">¥{report.totalAccumulatedDepreciation?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-green-400 font-medium">¥{report.totalCurrentValue?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetInventoryReport;
