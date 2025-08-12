import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  PictureInPicture2,
  Settings
} from 'lucide-react';

interface EnhancedVideoPlayerProps {
  src: string;
  title: string;
  location: string;
  status: 'online' | 'offline';
  className?: string;
  autoPlay?: boolean;
  thumbnail?: string;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({ 
  src, 
  title, 
  location, 
  status,
  className = '',
  autoPlay = true,
  thumbnail
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(true);
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  useEffect(() => {
    setIsPiPSupported('pictureInPictureEnabled' in document);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || status === 'offline') return;

    setIsLoading(true);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().then(() => setIsPlaying(true)).catch(console.warn);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Error:', data);
        setIsLoading(false);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().then(() => setIsPlaying(true)).catch(console.warn);
        }
      });
    }

    // Video event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [src, autoPlay, status]);

  // Fullscreen handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && video.muted) {
      video.muted = false;
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen error:', error);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video || !isPiPSupported) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.warn('PiP error:', error);
    }
  };

  if (status === 'offline') {
    return (
      <Card className={`bg-surveillance-gray border-border/50 overflow-hidden ${className}`}>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {thumbnail && (
            <img 
              src={thumbnail} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="text-center text-white/60 z-10">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <p className="text-sm font-medium">Kamera Offline</p>
            <p className="text-xs mt-1">{title}</p>
          </div>
          <Badge variant="destructive" className="absolute top-3 right-3">
            Offline
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-surveillance-gray border-border/50 overflow-hidden group ${className}`}>
      <div 
        ref={containerRef}
        className={`relative aspect-video bg-black ${isFullscreen ? 'h-screen' : ''}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="text-white/60">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        )}

        {/* Thumbnail fallback */}
        {thumbnail && !isPlaying && (
          <img 
            src={thumbnail} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls={false}
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />

        {/* Status indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant={status === 'online' ? 'default' : 'destructive'}>
            {status}
          </Badge>
          {status === 'online' && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-white/80 text-sm">{location}</p>
        </div>

        {/* Controls overlay */}
        {showControls && status === 'online' && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 accent-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPiPSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePiP}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      title="Picture in Picture"
                    >
                      <PictureInPicture2 className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EnhancedVideoPlayer;