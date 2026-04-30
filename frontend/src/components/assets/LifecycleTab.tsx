import { Asset } from '@/types';
import { Calendar, AlertTriangle, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

interface LifecycleTabProps {
  asset: Asset;
}

const LifecycleTab: React.FC<LifecycleTabProps> = ({ asset }) => {
  const calculateLifecycle = () => {
    const now = new Date();
    let ageYears: number | null = null;
    let ageMonths: number | null = null;
    let warrantyExpired = false;
    let warrantyDaysRemaining: number | null = null;
    let warrantyStatus: 'active' | 'expiring_soon' | 'expired' | 'not_set' = 'not_set';

    if (asset.purchase_date) {
      const purchase = new Date(asset.purchase_date);
      const diffTime = now.getTime() - purchase.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      ageYears = Math.floor(diffDays / 365);
      ageMonths = Math.floor((diffDays % 365) / 30);
    }

    if (asset.warranty_date) {
      const warranty = new Date(asset.warranty_date);
      const diffTime = warranty.getTime() - now.getTime();
      warrantyDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      warrantyExpired = warrantyDaysRemaining < 0;

      if (warrantyExpired) {
        warrantyStatus = 'expired';
      } else if (warrantyDaysRemaining <= 30) {
        warrantyStatus = 'expiring_soon';
      } else {
        warrantyStatus = 'active';
      }
    }

    return {
      ageYears,
      ageMonths,
      warrantyExpired,
      warrantyDaysRemaining,
      warrantyStatus,
    };
  };

  const calculateDepreciationData = () => {
    if (!asset.purchase_date || !asset.purchase_price) return null;

    const purchasePrice = asset.purchase_price;
    const usefulLife = asset.useful_life_years || 10;
    const salvageValue = asset.salvage_value || 0;
    const purchaseDate = new Date(asset.purchase_date);
    
    const data = [];
    for (let i = 0; i <= usefulLife; i++) {
      const year = purchaseDate.getFullYear() + i;
      const value = Math.max(salvageValue, purchasePrice - (i * (purchasePrice - salvageValue) / usefulLife));
      data.push({ year, value: Math.round(value) });
    }
    return data;
  };

  const lifecycle = calculateLifecycle();
  const depData = calculateDepreciationData();
  const currentYear = new Date().getFullYear();

  const warrantyStatusConfig = {
    active: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      label: 'Active',
    },
    expiring_soon: {
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      label: 'Expiring Soon',
    },
    expired: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      label: 'Expired',
    },
    not_set: {
      icon: Clock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      label: 'Not Set',
    },
  };

  const warrantyConfig = warrantyStatusConfig[lifecycle.warrantyStatus];
  const WarrantyIcon = warrantyConfig.icon;

  return (
    <div className="space-y-6">
      {/* Age Section */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Calendar size={16} />
          Asset Age
        </h3>
        {asset.purchase_date ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {lifecycle.ageYears}
              </span>
              <span className="text-gray-400">years</span>
              {lifecycle.ageMonths !== null && lifecycle.ageMonths > 0 && (
                <>
                  <span className="text-2xl font-bold text-white ml-2">
                    {lifecycle.ageMonths}
                  </span>
                  <span className="text-gray-400">months</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Purchased: {new Date(asset.purchase_date).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Purchase date not set</div>
        )}
      </div>

      {/* Depreciation Section */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <TrendingDown size={16} />
          Value Depreciation (Straight-Line)
        </h3>
        {depData ? (
          <div className="space-y-4">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={depData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', fontSize: '12px' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <ReferenceLine x={currentYear} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Now', fill: '#ef4444', fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#3b82f6' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Original Value</p>
                <p className="text-white font-medium">${asset.purchase_price?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Current Est. Value</p>
                <p className="text-primary-400 font-bold">
                  ${depData.find(d => d.year === currentYear)?.value.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Purchase price and date required for depreciation chart.
          </div>
        )}
      </div>

      {/* Warranty Section */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <Clock size={16} />
          Warranty Status
        </h3>
        {asset.warranty_date ? (
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${warrantyConfig.bgColor} ${warrantyConfig.color}`}>
              <WarrantyIcon size={16} />
              <span className="text-sm font-medium">{warrantyConfig.label}</span>
            </div>
            {lifecycle.warrantyDaysRemaining !== null && (
              <div className="text-sm text-gray-500">
                {lifecycle.warrantyExpired ? (
                  <span className="text-red-400">
                    Expired {Math.abs(lifecycle.warrantyDaysRemaining)} days ago
                  </span>
                ) : (
                  <span>
                    Expires in {lifecycle.warrantyDaysRemaining} days
                    {lifecycle.warrantyDaysRemaining <= 30 && (
                      <span className="ml-2 text-yellow-400">(⚠️ Soon)</span>
                    )}
                  </span>
                )}
              </div>
            )}
            <div className="text-sm text-gray-500">
              Warranty until: {new Date(asset.warranty_date).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Warranty date not set</div>
        )}
      </div>

      {/* Alerts */}
      {lifecycle.warrantyStatus === 'expiring_soon' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Warranty Expiring Soon</p>
              <p className="text-sm text-gray-400 mt-1">
                This asset's warranty will expire in {lifecycle.warrantyDaysRemaining} days.
                Consider scheduling maintenance or renewal.
              </p>
            </div>
          </div>
        </div>
      )}

      {lifecycle.warrantyStatus === 'expired' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Warranty Expired</p>
              <p className="text-sm text-gray-400 mt-1">
                This asset's warranty expired {Math.abs(lifecycle.warrantyDaysRemaining || 0)} days ago.
                Repairs may not be covered.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LifecycleTab;
