import { Skeleton } from '@mui/material';

export const ChartWidgetSkeleton = () => (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 lg:w-3/5 w-1/2">
      <Skeleton variant="text" width={120} height={32} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
      <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 }} />
      <Skeleton variant="rectangular" height={260} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px', marginBottom: '1px' }} />
    </div>
  );