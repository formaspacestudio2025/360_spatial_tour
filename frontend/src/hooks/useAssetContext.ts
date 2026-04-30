import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';

interface AssetContext {
  asset: any;
  issues: any[];
  inspections: any[];
}

export function useAssetContext(assetId: string | undefined) {
  return useQuery({
    queryKey: ['assetContext', assetId],
    queryFn: async () => {
      if (!assetId) throw new Error('Asset ID is required');
      const data = await assetsApi.getContext(assetId);
      return data as AssetContext;
    },
    enabled: !!assetId,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
