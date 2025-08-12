import React, { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, MapPin, Globe, Settings } from "lucide-react";

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

interface CameraFormProps {
  camera: CCTVCamera;
  onCameraChange: (camera: CCTVCamera) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const CameraForm = forwardRef<HTMLDivElement, CameraFormProps>(
  ({ camera, onCameraChange, onSave, onCancel, isEditing }, ref) => {
    const handleInputChange = (field: keyof CCTVCamera, value: any) => {
      onCameraChange({ ...camera, [field]: value });
    };

    const handleLatitudeChange = (value: string) => {
      const latitude = parseFloat(value) || 0;
      handleInputChange("latitude", latitude);
    };

    const handleLongitudeChange = (value: string) => {
      const longitude = parseFloat(value) || 0;
      handleInputChange("longitude", longitude);
    };

    const handleStatusChange = (value: "online" | "offline") => {
      handleInputChange("is_active", value === "online");
    };

    return (
      <Card className="p-6 bg-surveillance-gray border-border/50" ref={ref}>
        <div className="flex items-center gap-2 mb-6">
          <Camera className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Kamera" : "Tambah Kamera Baru"}
          </h2>
          <Badge
            variant={camera.is_active === true ? "default" : "destructive"}
            className="ml-2"
          >
            {camera.is_active ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Basic Information */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Informasi Dasar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama Kamera *
                </Label>
                <Input
                  id="name"
                  value={camera.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="contoh: Simpang Lima"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={camera.is_active ? "online" : "offline"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                <MapPin className="w-3 h-3 inline mr-1" />
                Lokasi *
              </Label>
              <Input
                id="location"
                value={camera.location}
                onChange={(e) =>
                  handleInputChange("location", e.target.value)
                }
                placeholder="contoh: Jl. Teuku Nyak Arif, Banda Aceh"
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={camera.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="contoh: Kamera pengawas di persimpangan utama"
                rows={2}
                className="bg-background/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Deskripsi opsional untuk kamera ini
              </p>
            </div>
          </div>

          {/* Coordinates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Koordinat
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lng" className="text-sm font-medium">
                  Longitude (Bujur)
                </Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={camera.longitude || ""}
                  onChange={(e) => handleLongitudeChange(e.target.value)}
                  placeholder="95.3162"
                  className="bg-background/50 border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  Koordinat horizontal (bujur)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lat" className="text-sm font-medium">
                  Latitude (Lintang)
                </Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={camera.latitude || ""}
                  onChange={(e) => handleLatitudeChange(e.target.value)}
                  placeholder="5.5526"
                  className="bg-background/50 border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  Koordinat vertikal (lintang)
                </p>
              </div>
            </div>

            {camera.longitude && camera.latitude && (
              <div className="p-3 bg-background/30 rounded-lg border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">
                  Pratinjau Koordinat:
                </p>
                <p className="text-sm font-mono">
                  {camera.latitude.toFixed(6)}, {camera.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Latitude, Longitude
                </p>
              </div>
            )}
          </div>

          {/* Stream Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Konfigurasi Stream
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streamUrl" className="text-sm font-medium">
                Stream URL (HLS/m3u8) *
              </Label>
              <Textarea
                id="streamUrl"
                value={camera.streamUrl}
                onChange={(e) =>
                  handleInputChange("streamUrl", e.target.value)
                }
                placeholder="https://example.com/stream.m3u8"
                rows={3}
                className="bg-background/50 border-border/50 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                URL stream video dalam format HLS (.m3u8). Pastikan URL dapat
                diakses publik.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              onClick={onSave}
              className="flex-1"
              disabled={!camera.name || !camera.location || !camera.streamUrl}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isEditing ? "Update Kamera" : "Simpan Kamera"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-primary/20"
            >
              Batal
            </Button>
          </div>
        </div>
      </Card>
    );
  }
);

CameraForm.displayName = "CameraForm";
export default CameraForm;