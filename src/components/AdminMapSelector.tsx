import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Trash2 } from "lucide-react";

interface CCTVCamera {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  streamUrl: string;
  is_active: boolean;
}

interface AdminMapSelectorProps {
  cameras: CCTVCamera[];
  onCoordinateSelect: (
    coordinates: [number, number],
    locationName?: string
  ) => void;
  selectedCoordinates?: [number, number] | null;
  onCameraDelete?: (cameraId: string) => void;
  focusCamera?: CCTVCamera | null;
  className?: string;
}

const AdminMapSelector: React.FC<AdminMapSelectorProps> = ({
  cameras,
  onCoordinateSelect,
  selectedCoordinates,
  onCameraDelete,
  focusCamera,
  className = "",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const selectedMarker = useRef<L.Marker | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    5.5526, 95.3162,
  ]);

  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`
      );
      const data = await response.json();

      if (data.address) {
        const { road, suburb, village, town, city, state } = data.address;
        const parts = [road, suburb || village, town || city, state].filter(
          Boolean
        );
        return parts.length > 0
          ? parts.join(", ")
          : `Lokasi ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      return `Lokasi ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Error getting location name:", error);
      return `Lokasi ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView(mapCenter, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map.current);

    const style = document.createElement("style");
    style.textContent = `
      .admin-popup .leaflet-popup-content-wrapper {
        background: hsl(220 13% 11%);
        color: hsl(210 40% 98%);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        border: 1px solid hsl(217 32% 17%);
        min-width: 220px;
      }
      .admin-popup .leaflet-popup-tip {
        background: hsl(220 13% 11%);
        border: 1px solid hsl(217 32% 17%);
      }
      .admin-popup .leaflet-popup-close-button {
        color: hsl(210 40% 98%) !important;
        font-size: 18px !important;
        padding: 6px !important;
      }
      .crosshair-cursor {
        cursor: crosshair !important;
      }
      .selected-marker {
        animation: selectedPulse 1.5s infinite;
      }
      @keyframes selectedPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);

    map.current.on("click", async (e) => {
      const { lat, lng } = e.latlng;

      const locationName = await getLocationName(lat, lng);
      onCoordinateSelect([lng, lat], locationName);

      if (selectedMarker.current) {
        selectedMarker.current.remove();
      }

      const selectedIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: hsl(47 96% 53%);
            border: 4px solid white;
            box-shadow: 0 4px 16px rgba(251, 191, 36, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          " class="selected-marker">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: white;
            "></div>
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: hsl(47 96% 53%);
              color: hsl(220 13% 11%);
              border-radius: 50%;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border: 2px solid white;
            ">+</div>
          </div>
        `,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      selectedMarker.current = L.marker([lat, lng], { icon: selectedIcon })
        .addTo(map.current!)
        .bindPopup(
          `
          <div style="padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; color: hsl(47 96% 53%);">
              📍 Lokasi Terpilih
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: hsl(215 16% 65%);">
              <strong>Latitude:</strong> ${lat.toFixed(6)}<br>
              <strong>Longitude:</strong> ${lng.toFixed(6)}
            </p>
            <p style="margin: 0; font-size: 11px; color: hsl(215 16% 47%); font-style: italic;">
              Koordinat ini akan digunakan untuk kamera baru
            </p>
          </div>
        `,
          {
            className: "admin-popup",
          }
        )
        .openPopup();
    });

    if (map.current.getContainer()) {
      map.current.getContainer().classList.add("crosshair-cursor");
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, [onCoordinateSelect]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    cameras.forEach((camera) => {
      const isOnline = camera.is_active === true;
      const color = isOnline ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)";

      const iconHtml = `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 3px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: white;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -15],
      });

      const popupContent = `
        <div style="padding: 12px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${camera.name}</h3>
          <p style="margin: 0 0 8px 0; color: hsl(215 16% 65%); font-size: 12px;">
            📍 ${camera.location}
          </p>
          <p style="margin: 0 0 8px 0; color: hsl(215 16% 65%); font-size: 11px; font-family: monospace;">
            ${camera.latitude.toFixed(6)}, ${camera.longitude.toFixed(6)}
          </p>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
            <div style="
              width: 8px; 
              height: 8px; 
              border-radius: 50%; 
              background: ${color};
            "></div>
            <span style="
              font-size: 12px; 
              font-weight: 500;
              text-transform: capitalize;
              color: ${color};
            ">
              ${isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div style="display: flex; gap: 6px;">
            <button 
              onclick="window.centerMap && window.centerMap(${camera.latitude}, ${camera.longitude})"
              style="
                flex: 1;
                background: hsl(221 83% 53%);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
              "
            >
              📍 Pusatkan
            </button>
            <button 
              onclick="window.deleteCamera && window.deleteCamera('${camera._id}')"
              style="
                background: hsl(0 84% 60%);
                color: white;
                border: none;
                padding: 6px 8px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
              "
            >
              🗑️
            </button>
          </div>
        </div>
      `;

      const marker = L.marker([camera.latitude, camera.longitude], {
        icon,
      })
        .addTo(map.current!)
        .bindPopup(popupContent, {
          className: "admin-popup",
        });

      markers.current.push(marker);
    });

    // Setup global functions for popup buttons
    (
      window as Window &
        typeof globalThis & { centerMap?: (lat: number, lng: number) => void }
    ).centerMap = (lat: number, lng: number) => {
      if (map.current) {
        map.current.setView([lat, lng], 16, { animate: true });
      }
    };

    (
      window as Window &
        typeof globalThis & { deleteCamera?: (cameraId: string) => void }
    ).deleteCamera = (cameraId: string) => {
      if (onCameraDelete && confirm("Yakin ingin menghapus kamera ini?")) {
        onCameraDelete(cameraId);
      }
    };
  }, [cameras, onCameraDelete]);

  useEffect(() => {
    if (selectedCoordinates && map.current) {
      if (selectedMarker.current) {
        selectedMarker.current.remove();
      }

      const [lng, lat] = selectedCoordinates;
      const selectedIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: hsl(47 96% 53%);
            border: 4px solid white;
            box-shadow: 0 4px 16px rgba(251, 191, 36, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
          " class="selected-marker">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: white;
            "></div>
          </div>
        `,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      selectedMarker.current = L.marker([lat, lng], {
        icon: selectedIcon,
      }).addTo(map.current);
    }
  }, [selectedCoordinates]);

  useEffect(() => {
    if (focusCamera && map.current) {
      const { latitude, longitude } = focusCamera;
      map.current.setView([latitude, longitude], 16, {
        animate: true,
        duration: 1.5,
      });

      // Find the corresponding marker
      const cameraMarker = markers.current.find((marker) => {
        const markerLat = marker.getLatLng().lat;
        const markerLng = marker.getLatLng().lng;
        return (
          Math.abs(markerLat - latitude) < 0.0001 &&
          Math.abs(markerLng - longitude) < 0.0001
        );
      });

      if (cameraMarker) {
        setTimeout(() => {
          cameraMarker.openPopup();
        }, 1000);
      }
    }
  }, [focusCamera]);

  const handleCenterMap = () => {
    if (map.current) {
      map.current.setView(mapCenter, 12, { animate: true });
    }
  };

  const handleFitBounds = () => {
    if (map.current && cameras.length > 0) {
      const bounds = L.latLngBounds(
        cameras.map((camera) => [camera.latitude, camera.longitude])
      );
      map.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  return (
    <Card
      className={`bg-surveillance-gray border-border/50 overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Peta Admin
          </h3>
          <div className="flex gap-2">
            {cameras.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFitBounds}
                className="h-7 px-2 text-xs"
              >
                Tampilkan Semua
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCenterMap}
              className="h-7 px-2 text-xs"
            >
              <Target className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {cameras.length} Kamera
          </Badge>
          <span>•</span>
          <span>Klik peta untuk menambah lokasi</span>
        </div>
      </div>
      <div
        ref={mapContainer}
        className="w-full h-96 relative"
        style={{ minHeight: "320px" }}
      />
    </Card>
  );
};

export default AdminMapSelector;