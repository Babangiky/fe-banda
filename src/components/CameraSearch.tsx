import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  MapPin,
  Monitor,
  Heart,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Camera {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  streamUrl: string;
  status: 'online' | 'offline';
  isFavorite?: boolean;
  zone?: string;
}

interface CameraSearchProps {
  cameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  onToggleFavorite: (cameraId: string) => void;
  className?: string;
}

type FilterType = 'all' | 'online' | 'offline' | 'favorites';

const CameraSearch: React.FC<CameraSearchProps> = ({
  cameras,
  onCameraSelect,
  onToggleFavorite,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter cameras based on search and filters
  const filteredCameras = cameras.filter(camera => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camera.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Status/type filter
    let matchesFilter = true;
    switch (activeFilter) {
      case 'online':
        matchesFilter = camera.status === 'online';
        break;
      case 'offline':
        matchesFilter = camera.status === 'offline';
        break;
      case 'favorites':
        matchesFilter = camera.isFavorite === true;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { type: 'all' as FilterType, label: 'Semua', icon: Monitor, count: cameras.length },
    { type: 'online' as FilterType, label: 'Online', icon: Wifi, count: cameras.filter(c => c.status === 'online').length },
    { type: 'offline' as FilterType, label: 'Offline', icon: WifiOff, count: cameras.filter(c => c.status === 'offline').length },
    { type: 'favorites' as FilterType, label: 'Favorit', icon: Heart, count: cameras.filter(c => c.isFavorite).length },
  ];

  const clearSearch = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  return (
    <Card className={`bg-surveillance-gray border-border/50 ${className}`}>
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari kamera atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background/50 border-border/50"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-border/50"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter buttons */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.type}
                variant={activeFilter === option.type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(option.type)}
                className="h-8 text-xs"
              >
                <option.icon className="w-3 h-3 mr-1" />
                {option.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>
        )}

        {/* Search results info */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>
            {filteredCameras.length} dari {cameras.length} kamera
          </span>
          {(searchQuery || activeFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Camera list */}
      <div className="max-h-80 overflow-y-auto">
        {filteredCameras.length === 0 ? (
          <div className="p-6 text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? `Tidak ada kamera yang cocok dengan "${searchQuery}"` 
                : 'Tidak ada kamera dalam filter ini'
              }
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredCameras.map((camera) => (
              <div
                key={camera.id}
                className="p-3 rounded-lg border border-border/30 bg-background/50 hover:border-primary/30 cursor-pointer transition-all group"
                onClick={() => onCameraSelect(camera)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{camera.name}</h4>
                      <Badge 
                        variant={camera.status === 'online' ? 'default' : 'destructive'}
                        className="text-xs shrink-0"
                      >
                        {camera.status}
                      </Badge>
                      {camera.isFavorite && (
                        <Heart className="w-3 h-3 text-red-500 fill-current shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {camera.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {camera.coordinates[1].toFixed(4)}, {camera.coordinates[0].toFixed(4)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(camera.id);
                      }}
                      className={`h-7 w-7 p-0 ${
                        camera.isFavorite 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${camera.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CameraSearch;