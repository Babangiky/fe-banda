import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Card } from '@/components/ui/card';

interface VideoPlayerProps {
  src: string;
  title: string;
  location: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, location, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Auto play when ready
        video.play().catch(console.warn);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Error:', data);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src;
      video.play().catch(console.warn);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  return (
    <Card className={`bg-surveillance-gray border-border/50 overflow-hidden group transition-all duration-300 ${className}`}>
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls={false}
          muted
          playsInline
          autoPlay
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-medium text-sm mb-1">{title}</h3>
          <p className="text-xs text-white/80">{location}</p>
        </div>
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg" />
        </div>
      </div>
    </Card>
  );
};

export default VideoPlayer;