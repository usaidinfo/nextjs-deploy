import { Skeleton } from '@mui/material';

export const PlantSkeleton = () => (
    <div className="ml-2 space-y-1">
      {[1, 2].map((item) => (
        <div key={item} className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width={16} height={16} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
            <Skeleton variant="text" width={60} height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.5)' }} />
          </div>
        </div>
      ))}
    </div>
  );