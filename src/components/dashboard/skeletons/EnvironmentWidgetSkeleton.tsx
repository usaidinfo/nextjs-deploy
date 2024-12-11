import { Skeleton } from '@mui/material';

export const EnvironmentWidgetSkeleton = () => (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 lg:w-2/5 w-1/2">
      <Skeleton variant="text" width={120} height={32} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
      <Skeleton variant="text" width={100} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 sm:grid-cols-2 py-5 px-8 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-[110px] rounded-xl border border-zinc-700/50">
            <Skeleton variant="rectangular" height={110} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }} />
          </div>
        ))}
      </div>
    </div>
  );