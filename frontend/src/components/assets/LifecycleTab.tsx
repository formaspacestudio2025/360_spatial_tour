import { Asset } from '@/types';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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

  const lifecycle = calculateLifecycle();

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
              {lifecycle.ageMonths && lifecycle.ageMonths > 0 && (
                <>
                  <span className="text-2xl font-bold text-white">
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
