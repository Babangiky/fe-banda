import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Camera, MapPin } from "lucide-react";
import CCTVHeader from "@/components/CCTVHeader";
import AdminMapSelector from "@/components/AdminMapSelector";
import CameraForm from "@/components/CameraForm";

interface AdminDashboardProps {
  onBackClick: () => void;
  onLogout: () => void;
}

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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [editingCamera, setEditingCamera] = useState<CCTVCamera | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    [number, number] | null
  >(null);
  const [focusCamera, setFocusCamera] = useState<CCTVCamera | null>(null);
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onlineCount = cameras.filter((c) => c.is_active === true).length;
  const offlineCount = cameras.length - onlineCount;
  const formRef = useRef<HTMLDivElement | null>(null);
  const token = localStorage.getItem("token");

  const [hasScrolled, setHasScrolled] = useState(false);
  const baseUrl = "https://be-cctv-production.up.railway.app";
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/cameras`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setCameras(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Gagal ambil data kamera:", err);
        setError("Gagal memuat data kamera");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddCamera = () => {
    const newCamera: CCTVCamera = {
      _id: "",
      name: "",
      description: "",
      location: "",
      latitude: selectedCoordinates ? selectedCoordinates[1] : 5.5526,
      longitude: selectedCoordinates ? selectedCoordinates[0] : 95.3162,
      streamUrl: "",
      is_active: true,
    };
    setEditingCamera(newCamera);
    setShowForm(true);
  };

  const handleEditCamera = (camera: CCTVCamera) => {
    setEditingCamera({ ...camera });
    setSelectedCoordinates([camera.longitude, camera.latitude]);
    setFocusCamera(camera);
    setShowForm(true);
  };

  useEffect(() => {
    if (showForm && !hasScrolled && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current!.scrollIntoView({ behavior: "smooth", block: "start" });
        setHasScrolled(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showForm, hasScrolled]);

  const handleDeleteCamera = async (id: string) => {
    if (confirm("Yakin ingin menghapus kamera ini?")) {
      try {
        const response = await fetch(
          `${baseUrl}/api/cameras/camera/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete camera");
        }
        setCameras(cameras.filter((c) => c._id !== id));
      } catch (err) {
        console.error("Gagal menghapus kamera:", err);
        setError("Gagal menghapus kamera");
      }
    }
  };

  const handleSaveCamera = async () => {
    if (!editingCamera) return;

    if (
      !editingCamera.name ||
      !editingCamera.location ||
      !editingCamera.streamUrl
    ) {
      alert("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);
      console.log("Token:", token);
      console.log("Editing Camera:", editingCamera);
      if (editingCamera._id) {
        try {
          const response = await fetch(
            `${baseUrl}/api/cameras/camera/${editingCamera._id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(editingCamera),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update camera");
          }

          const updatedCamera = await response.json();

          setCameras(
            cameras.map((c) =>
              c._id === updatedCamera._id ? updatedCamera : c
            )
          );
        } catch (error) {
          console.error(error);
          alert("Gagal update kamera");
        }
      } else {
        try {
          console.log(token);

          const response = await fetch(`${baseUrl}/api/cameras`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(editingCamera),
          });

          if (!response.ok) {
            throw new Error("Failed to create camera");
          }

          const newCamera = await response.json();

          setCameras([...cameras, newCamera]); 
        } catch (error) {
          console.error(error);
          alert("Gagal menambah kamera");
        }
      }

      setShowForm(false);
      setEditingCamera(null);
      setSelectedCoordinates(null);
      setHasScrolled(false);
      setError(null);
    } catch (err) {
      console.error("Gagal menyimpan kamera:", err);
      setError("Gagal menyimpan kamera");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCamera(null);
    setSelectedCoordinates(null);
    setHasScrolled(false);
  };

  const handleMapCoordinateSelect = (
    coordinates: [number, number],
    locationName?: string
  ) => {
    setSelectedCoordinates(coordinates);
    setFocusCamera(null);

    if (editingCamera) {
      const updatedCamera = {
        ...editingCamera,
        longitude: coordinates[0],
        latitude: coordinates[1],
        ...(locationName &&
          !editingCamera._id && {
            location: locationName,
          }),
      };
      setEditingCamera(updatedCamera);
    }
  };

  if (loading && cameras.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <CCTVHeader showAdmin={false} isAdmin={true} onLogoutClick={onLogout} />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CCTVHeader showAdmin={false} isAdmin={true} onLogoutClick={onLogout} />

      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Tutup
            </Button>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-surveillance-gray border-border/50">
            <div className="flex items-center gap-3 justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Kamera</p>
                <p className="text-2xl font-bold text-primary">
                  {cameras.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-surveillance-gray border-border/50">
            <div className="flex items-center gap-3 justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-500">
                  {onlineCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-surveillance-gray border-border/50">
            <div className="flex items-center gap-3 justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-500">
                  {offlineCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AdminMapSelector
              cameras={cameras}
              onCoordinateSelect={handleMapCoordinateSelect}
              selectedCoordinates={selectedCoordinates}
              onCameraDelete={handleDeleteCamera}
              focusCamera={focusCamera}
            />

            {showForm && editingCamera && (
              <CameraForm
                ref={formRef}
                camera={editingCamera}
                onCameraChange={setEditingCamera}
                onSave={handleSaveCamera}
                onCancel={handleCancelForm}
                isEditing={!!editingCamera._id}
              />
            )}
          </div>

          <div>
            <Card className="p-4 bg-surveillance-gray border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Daftar Kamera
                </h2>
                <Button
                  onClick={handleAddCamera}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cameras.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Belum ada kamera
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddCamera}
                      className="mt-3"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kamera Pertama
                    </Button>
                  </div>
                ) : (
                  cameras.map((camera) => (
                    <div
                      key={camera._id}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {camera.name}
                          </h3>
                          <Badge
                            variant={
                              camera.is_active === true
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs shrink-0"
                          >
                            {camera.is_active ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate sm:w-72 w-52  ">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {camera.location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {camera.latitude.toFixed(4)},{" "}
                          {camera.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCamera(camera)}
                          className="h-8 w-8 p-0"
                          disabled={loading}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCamera(camera._id)}
                          className="h-8 w-8 p-0 border-destructive/20 text-destructive hover:bg-destructive/10"
                          disabled={loading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
