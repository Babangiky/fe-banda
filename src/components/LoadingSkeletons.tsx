import React from 'react';
import { Card } from '@/components/ui/card';

export const CameraCardSkeleton: React.FC = () => (
  <Card className="p-3 sm:p-4 bg-surveillance-gray border-border/50">
    <div className="animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  </Card>
);

export const VideoPlayerSkeleton: React.FC = () => (
  <Card className="bg-surveillance-gray border-border/50 overflow-hidden">
    <div className="relative aspect-video bg-muted animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="absolute top-3 right-3">
        <div className="w-12 h-5 bg-muted-foreground/50 rounded"></div>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="h-4 bg-muted-foreground/50 rounded mb-2"></div>
        <div className="h-3 bg-muted-foreground/50 rounded w-2/3"></div>
      </div>
    </div>
  </Card>
);

export const MapSkeleton: React.FC = () => (
  <Card className="p-4 bg-surveillance-gray border-border/50">
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-7 bg-muted rounded"></div>
          <div className="w-20 h-7 bg-muted rounded"></div>
        </div>
      </div>
      <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    </div>
  </Card>
);

export const StatsCardSkeleton: React.FC = () => (
  <Card className="p-3 sm:p-4 bg-surveillance-gray border-border/50">
    <div className="animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded"></div>
        <div>
          <div className="h-3 bg-muted rounded w-16 mb-2"></div>
          <div className="h-6 bg-muted rounded w-8"></div>
        </div>
      </div>
    </div>
  </Card>
);

export const CameraListSkeleton: React.FC = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-3 rounded-lg border border-border/30 bg-background/50 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="w-12 h-4 bg-muted rounded"></div>
          </div>
          <div className="w-6 h-6 bg-muted rounded"></div>
        </div>
        <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

export const GridSkeleton: React.FC<{ columns?: number }> = ({ columns = 2 }) => (
  <div className={`grid grid-cols-${columns} gap-3`}>
    {Array.from({ length: columns * 2 }).map((_, i) => (
      <div key={i} className="relative">
        <div className="aspect-video bg-muted animate-pulse rounded-lg">
          <div className="absolute top-2 left-2">
            <div className="w-12 h-4 bg-muted-foreground/50 rounded"></div>
          </div>
          <div className="absolute top-2 right-2">
            <div className="w-5 h-5 bg-muted-foreground/50 rounded"></div>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="h-3 bg-muted-foreground/50 rounded mb-1"></div>
            <div className="h-2 bg-muted-foreground/50 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);