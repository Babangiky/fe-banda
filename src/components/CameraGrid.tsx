import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  Grid2X2, 
  Heart,
  Monitor,
  MapPin,
  Play,
  Expand
} from 'lucide-react';

interface Camera {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  streamUrl: string;
  status: 'online' | 'offline';
  thumbnail?: string;
  isFavorite?: boolean;
}

interface CameraGridProps {
  cameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  onToggleFavorite: (cameraId: string) => void;
  selectedCamera?: Camera | null;
  className?: string;
}

const CameraGrid: React.FC<CameraGridProps> = ({
  cameras,
  onCameraSelect,
  onToggleFavorite,
  selectedCamera,
  className = ''
}) => {
  const [gridSize, setGridSize] = useState<'2x2' | '3x3'>('2x2');

  const gridCols = gridSize === '2x2' ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <Card className={`bg-surveillance-gray border-border/50 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Camera Preview Grid
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant={gridSize === '2x2' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGridSize('2x2')}
            className="h-8 w-8 p-0"
          >
            <Grid2X2 className="w-4 h-4" />
          </Button>
          <Button
            variant={gridSize === '3x3' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGridSize('3x3')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className={`grid ${gridCols} gap-3 max-h-96 overflow-y-auto`}>
        {cameras.map((camera) => (
          <CameraThumbnail
            key={camera.id}
            camera={camera}
            isSelected={selectedCamera?.id === camera.id}
            onSelect={() => onCameraSelect(camera)}
            onToggleFavorite={() => onToggleFavorite(camera.id)}
            compact={gridSize === '3x3'}
          />
        ))}
      </div>
    </Card>
  );
};

interface CameraThumbnailProps {
  camera: Camera;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  compact?: boolean;
}

const CameraThumbnail: React.FC<CameraThumbnailProps> = ({
  camera,
  isSelected,
  onSelect,
  onToggleFavorite,
  compact = false
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
        isSelected 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : 'border-border/50 hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className={`relative bg-black ${compact ? 'aspect-video' : 'aspect-square'}`}>
        {/* Thumbnail image */}
        {camera.thumbnail && !imageError ? (
          <img
            src={camera.thumbnail}
            alt={camera.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Monitor className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">No Preview</p>
            </div>
          </div>
        )}

        {/* Status overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <Badge 
            variant={camera.status === 'online' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {camera.status}
          </Badge>
          {camera.status === 'online' && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2 right-2 h-7 w-7 p-0 transition-all ${
            camera.isFavorite 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Heart 
            className={`w-4 h-4 ${camera.isFavorite ? 'fill-current' : ''}`} 
          />
        </Button>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-3"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              {compact ? 'Play' : 'Watch'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Expand className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <h4 className={`text-white font-medium ${compact ? 'text-xs' : 'text-sm'} truncate`}>
            {camera.name}
          </h4>
          {!compact && (
            <p className="text-white/80 text-xs flex items-center gap-1 truncate">
              <MapPin className="w-2 h-2" />
              {camera.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraGrid;