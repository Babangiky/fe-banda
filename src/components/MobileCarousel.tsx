import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Heart,
  Monitor,
  MapPin
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

interface MobileCarouselProps {
  cameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  onToggleFavorite: (cameraId: string) => void;
  selectedCamera?: Camera | null;
  className?: string;
}

const MobileCarousel: React.FC<MobileCarouselProps> = ({
  cameras,
  onCameraSelect,
  onToggleFavorite,
  selectedCamera,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected camera
  useEffect(() => {
    if (selectedCamera) {
      const index = cameras.findIndex(c => c.id === selectedCamera.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedCamera, cameras]);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < cameras.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(cameras.length - 1, prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (cameras.length === 0) {
    return (
      <Card className={`bg-surveillance-gray border-border/50 p-4 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Monitor className="w-12 h-12 mx-auto mb-3" />
          <p>Tidak ada kamera tersedia</p>
        </div>
      </Card>
    );
  }

  const currentCamera = cameras[currentIndex];

  return (
    <Card className={`bg-surveillance-gray border-border/50 overflow-hidden ${className}`}>
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Camera Carousel
          </h3>
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1} / {cameras.length}
          </Badge>
        </div>
      </div>

      <div className="relative">
        {/* Main carousel */}
        <div
          ref={carouselRef}
          className="relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {cameras.map((camera, index) => (
              <div key={camera.id} className="w-full flex-shrink-0">
                <CameraSlide
                  camera={camera}
                  isActive={index === currentIndex}
                  onSelect={() => onCameraSelect(camera)}
                  onToggleFavorite={() => onToggleFavorite(camera.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {cameras.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex === cameras.length - 1}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Dot indicators */}
        {cameras.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {cameras.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Camera info */}
      <div className="p-3 bg-background/30">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{currentCamera.name}</h4>
              <Badge 
                variant={currentCamera.status === 'online' ? 'default' : 'destructive'}
                className="text-xs shrink-0"
              >
                {currentCamera.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {currentCamera.location}
            </p>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(currentCamera.id)}
              className={`h-7 w-7 p-0 ${
                currentCamera.isFavorite 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`w-3 h-3 ${currentCamera.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            
            {currentCamera.status === 'online' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onCameraSelect(currentCamera)}
                className="h-7 px-2 text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Watch
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

interface CameraSlideProps {
  camera: Camera;
  isActive: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

const CameraSlide: React.FC<CameraSlideProps> = ({
  camera,
  isActive,
  onSelect,
  onToggleFavorite
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative aspect-video bg-black cursor-pointer" onClick={onSelect}>
      {/* Thumbnail or placeholder */}
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
            <Monitor className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">
              {camera.status === 'offline' ? 'Camera Offline' : 'No Preview'}
            </p>
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="absolute top-3 left-3">
        <Badge 
          variant={camera.status === 'online' ? 'default' : 'destructive'}
          className="text-xs"
        >
          {camera.status}
        </Badge>
        {camera.status === 'online' && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse absolute -top-1 -right-1" />
        )}
      </div>

      {/* Favorite indicator */}
      {camera.isFavorite && (
        <div className="absolute top-3 right-3">
          <Heart className="w-4 h-4 text-red-500 fill-current" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
};

export default MobileCarousel;