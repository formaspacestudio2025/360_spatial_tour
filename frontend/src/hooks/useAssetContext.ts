import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';
import { Asset } from '@/types';

interface AssetContextData {
  asset: Asset;
  issues: any[];
  inspections: any[];
  workOrders: any[];
}

export function useAssetContext(assetId: string | undefined) {
  return useQuery({
    queryKey: ['asset-context', assetId],
    queryFn: async () => {
      if (!assetId) throw new Error('Asset ID is required');
      const data = await assetsApi.getContext(assetId);
      return data as AssetContextData;
    },
    enabled: !!assetId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export default useAssetContext;
