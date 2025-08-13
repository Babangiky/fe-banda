import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  streamUrl: string;
  status: "online" | "offline";
}

interface CCTVMapProps {
  cameras: CCTVCamera[];
  onCameraSelect?: (camera: CCTVCamera) => void;
  selectedCamera?: CCTVCamera | null;
  isAdmin?: boolean;
  onMapClick?: (coordinates: [number, number]) => void;
  unstyled?: boolean;
  containerClassName?: string;
  mapStyle?: "streets" | "satellite" | "google";
}

const CCTVMap: React.FC<CCTVMapProps> = ({
  cameras,
  onCameraSelect,
  selectedCamera,
  isAdmin = false,
  onMapClick,
  unstyled = false,
  containerClassName,
  mapStyle = "streets",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const tempMarker = useRef<L.Marker | null>(null);
  const baseLayer = useRef<L.TileLayer | null>(null);

  const smoothScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([5.5526, 95.3162], 12);

    const style = document.createElement("style");
    style.textContent = `
      .leaflet-popup-content-wrapper {
        background: hsl(220 13% 11%);
        color: hsl(210 40% 98%);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        border: 1px solid hsl(217 32% 17%);
        padding: 0;
        overflow: hidden;
      }
      .leaflet-popup-tip {
        background: hsl(220 13% 11%);
        border: 1px solid hsl(217 32% 17%);
      }
      .leaflet-popup-close-button {
        color: hsl(210 40% 98%) !important;
        font-size: 20px !important;
        padding: 8px !important;
      }
      .leaflet-popup-close-button:hover {
        background: hsl(217 32% 17%) !important;
      }
      .camera-popup {
        padding: 16px;
        min-width: 200px;
      }
      .status-online {
        color: hsl(142 76% 36%);
      }
      .status-offline {
        color: hsl(0 84% 60%);
      }
      .popup-button {
        background: hsl(221 83% 53%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;
        margin-top: 8px;
      }
      .popup-button:hover {
        background: hsl(221 83% 45%);
        transform: translateY(-1px);
      }
      .popup-button:disabled {
        background: hsl(215 16% 47%);
        cursor: not-allowed;
        transform: none;
      }
      .custom-marker {
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      .leaflet-container {
        font-family: inherit;
      }
    `;
    document.head.appendChild(style);

    if (isAdmin && onMapClick) {
      map.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        onMapClick([lng, lat]);

        if (tempMarker.current) {
          tempMarker.current.remove();
        }

        const tempIcon = L.divIcon({
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: hsl(47 96% 53%);
              border: 3px solid white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              animation: bounce 0.6s ease-out;
            ">
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: white;
              "></div>
            </div>
          `,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        tempMarker.current = L.marker([lat, lng], { icon: tempIcon })
          .addTo(map.current!)
          .bindPopup(
            `
            <div class="camera-popup">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; color: hsl(47 96% 53%);">📍 Lokasi Baru</h3>
              <p style="margin: 0; font-size: 12px; color: hsl(215 16% 65%);">
                Lat: ${lat.toFixed(6)}<br>
                Lng: ${lng.toFixed(6)}
              </p>
            </div>
          `
          )
          .openPopup();
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
      document.head.removeChild(style);
    };
  }, [isAdmin, onMapClick]);

  useEffect(() => {
    if (!map.current) return;
    if (baseLayer.current) {
      map.current.removeLayer(baseLayer.current);
    }

    let layer: L.TileLayer;
    if (mapStyle === "satellite") {
      layer = L.tileLayer(
        "http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      );
    } else if (mapStyle === "google") {
      layer = L.tileLayer(
        "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", 
        {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      );
    } else {
      layer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      );
    }

    baseLayer.current = layer.addTo(map.current);
  }, [mapStyle]);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
    });
    cameras.forEach((camera) => {
      const isOnline = camera.status === "online";
      const color = isOnline ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)";

      const iconHtml = `
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 3px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        " class="${isOnline ? "custom-marker" : ""}">
          <div style="
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: white;
          "></div>
          ${
            isOnline
              ? `
            <div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 8px;
              height: 8px;
              background: hsl(142 76% 36%);
              border-radius: 50%;
              border: 1px solid white;
            "></div>
          `
              : ""
          }
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -15],
      });

      const popupContent = `
        <div class="camera-popup">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${
            camera.name
          }</h3>
          <p style="margin: 0 0 8px 0; color: hsl(215 16% 65%); font-size: 12px;">
            📍 ${camera.location}
          </p>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
            <div style="
              width: 8px; 
              height: 8px; 
              border-radius: 50%; 
              background: ${isOnline ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"};
            "></div>
            <span style="
              font-size: 12px; 
              font-weight: 500;
              text-transform: capitalize;
              color: ${isOnline ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)"};
            ">
              ${camera.status}
            </span>
          </div>
          ${
            isOnline
              ? `
            <button 
              onclick="window.selectCameraAndScroll && window.selectCameraAndScroll('${camera.id}')" 
              class="popup-button"
            >
              🎥 Lihat Stream
            </button>
          `
              : `
            <button class="popup-button" disabled>
              📵 Kamera Offline
            </button>
          `
          }
        </div>
      `;

      const marker = L.marker([camera.coordinates[1], camera.coordinates[0]], {
        icon,
      })
        .bindPopup(popupContent, {
          maxWidth: 250,
          className: "custom-popup",
        });

      marker.on("click", () => {
        if (onCameraSelect) {
          onCameraSelect(camera);
          setTimeout(() => {
            smoothScrollToSection("camera-detail");
          }, 300);
        }
      });

      markers.current.push(marker);
      markerClusterGroup.addLayer(marker);
    });
    map.current.addLayer(markerClusterGroup);
    (window as any).selectCameraAndScroll = (cameraId: string) => {
      const camera = cameras.find((c) => c.id === cameraId);
      if (camera && onCameraSelect) {
        onCameraSelect(camera);
        map.current?.closePopup();
        setTimeout(() => {
          smoothScrollToSection("camera-detail");
        }, 100);
      }
    };
  }, [cameras, onCameraSelect]);

  useEffect(() => {
    if (!isAdmin && tempMarker.current) {
      tempMarker.current.remove();
      tempMarker.current = null;
    }
  }, [isAdmin]);

  return unstyled ? (
    <div
      ref={mapContainer}
      className={containerClassName ? containerClassName : "w-full h-full"}
    />
  ) : (
    <Card className="p-0 bg-surveillance-gray border-border/50 overflow-hidden">
      <div
        ref={mapContainer}
        className="w-full h-64 sm:h-80 md:h-96 rounded-lg"
        style={{ minHeight: "300px" }}
      />
      {isAdmin && (
        <div className="p-3 bg-background/50 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            💡 Klik pada peta untuk menambah lokasi kamera baru
          </p>
        </div>
      )}
    </Card>
  );
};

export default CCTVMap;
