import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import CCTVMap from "@/components/CCTVMap";
import CCTVHeader from "@/components/CCTVHeader";
import EnhancedVideoPlayer from "@/components/EnhancedVideoPlayer";
import AdminDashboard from "./AdminDashboard";
import Login from "./Login";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";

interface Camera {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  streamUrl: string;
  status: "online" | "offline";
  thumbnail?: string;
  isFavorite?: boolean;
  zone?: string;
}

const EnhancedIndex = () => {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [mapStyle, setMapStyle] = useState<"satellite" | "google" | "streets">(
    "streets"
  );

  const navigate = useNavigate();

  const [cameras, setCameras] = useState<Camera[]>([]);
  const baseUrl = "https://be-cctv-production.up.railway.app";
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/cameras`);
        if (!response.ok) throw new Error("Failed to fetch cameras");
        const data = await response.json();
        const mappedCameras = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          location: item.location,
          coordinates: [item.longitude, item.latitude],
          streamUrl: item.streamUrl,
          status: item.is_active ? "online" : "offline",
          thumbnail: item.thumbnail || "/api/placeholder/400/225",
          isFavorite: false,
          zone: item.zone || "",
        }));

        setCameras(mappedCameras);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data kamera");
      }
    };

    fetchCameras();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdminLoggedIn");
    setIsAdminLoggedIn(adminStatus === "true");
  }, []);

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAdminLoggedIn(true);
      setShowLogin(false);
      setShowAdmin(true);
      toast.success("Login berhasil", {
        description: "Selamat datang di admin dashboard",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    setIsAdminLoggedIn(false);
    setShowAdmin(false);
    toast.success("Logout berhasil", {
      description: "Anda telah keluar dari sistem",
    });
  };

  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
    setIsFocus(true);

    setTimeout(() => {
      const section = document.getElementById("camera-detail");
      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    toast("Camera dipilih", {
      description: `Menampilkan stream dari ${camera.name}`,
    });
  };

  const handleToggleFavorite = (cameraId: string) => {
    setCameras((prev) =>
      prev.map((camera) =>
        camera.id === cameraId
          ? { ...camera, isFavorite: !camera.isFavorite }
          : camera
      )
    );

    const camera = cameras.find((c) => c.id === cameraId);
    const isFavorite = camera?.isFavorite;

    toast(isFavorite ? "Dihapus dari favorit" : "Ditambah ke favorit", {
      description: `${camera?.name} ${
        isFavorite ? "dihapus dari" : "ditambahkan ke"
      } daftar favorit`,
    });
  };

  const onlineCount = cameras.filter((c) => c.status === "online").length;
  const favoriteCount = cameras.filter((c) => c.isFavorite).length;
  const filteredCameras = cameras.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  if (showLogin) {
    return <Login onLogin={handleLogin} />;
  }

  if (showAdmin) {
    return (
      <AdminDashboard
        onBackClick={() => setShowAdmin(false)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CCTVHeader
        onAdminClick={handleAdminClick}
        onLogoutClick={handleLogout}
        isAdmin={isAdminLoggedIn}
      />

      <div className="relative w-full" style={{ height: "calc(100vh - 56px)" }}>
        <CCTVMap
          cameras={filteredCameras}
          onCameraSelect={handleCameraSelect}
          mapStyle={mapStyle}
          unstyled
          containerClassName="absolute inset-0 z-0"
        />

        <aside className="hidden md:block absolute top-4 left-4 z-50 w-80">
          <div className="rounded-xl border border-border/50 bg-card/90 backdrop-blur p-3 shadow-none">
            <div className="text-center font-semibold uppercase rounded-md bg-secondary/60 text-foreground py-2 mb-3">
              {onlineCount} CCTV ONLINE
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari CCTV"
                  className="w-full h-9 pl-8 pr-3 rounded-md bg-background/80 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-3">
              <label className="text-[10px] text-muted-foreground uppercase mb-1 block">
                Mode Peta
              </label>
              <Select
                value={mapStyle}
                onValueChange={(v) => setMapStyle(v as "streets" | "satellite" | "google")}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih mode peta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streets">Jalan (Default)</SelectItem>
                  <SelectItem value="satellite">Google Satelit</SelectItem>
                  <SelectItem value="google">Google Street</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border/50 bg-background/60 max-h-[55vh] overflow-y-auto">
              <ul className="divide-y divide-border/50">
                {filteredCameras.map((camera) => (
                  <li key={camera.id}>
                    <button
                      className="w-full text-left flex items-start gap-2 p-3 hover:bg-muted/50"
                      onClick={() => handleCameraSelect(camera)}
                    >
                      <span
                        className={`mt-1 inline-block w-4 h-4 rounded-full border-2 ${
                          camera.status === "online"
                            ? "bg-green-500 border-green-600"
                            : "bg-destructive border-destructive"
                        }`}
                      />
                      <span className="flex-1">
                        <div className="text-xs font-semibold uppercase text-foreground">
                          {camera.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {camera.location}{" "}
                          {camera.status === "online" && (
                            <span className="text-green-500">(ONLINE)</span>
                          )}
                        </div>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="md:hidden absolute top-3 left-3 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="secondary" className="h-9">
                Daftar CCTV
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="p-3 space-y-3">
                <div className="text-center font-semibold uppercase rounded-md bg-secondary/60 text-foreground py-2">
                  {onlineCount} CCTV ONLINE
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari CCTV"
                    className="w-full h-9 pl-8 pr-3 rounded-md bg-background/80 border border-border/50 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-[10px] text-muted-foreground uppercase mb-1 block">
                    Mode Peta
                  </label>
                  <Select
                    value={mapStyle}
                    onValueChange={(v) =>
                      setMapStyle(v as "streets" | "satellite" | "google" )
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Pilih mode peta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streets">Jalan (Default)</SelectItem>
                      <SelectItem value="satellite">Google Satelit</SelectItem>
                      <SelectItem value="google">Google Street</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border border-border/50 bg-background/60 max-h-[70vh] overflow-y-auto">
                  <ul className="divide-y divide-border/50">
                    {filteredCameras.map((camera) => (
                      <li key={camera.id}>
                        <button
                          className="w-full text-left flex items-start gap-2 p-3 hover:bg-muted/50"
                          onClick={() => handleCameraSelect(camera)}
                        >
                          <span
                            className={`mt-1 inline-block w-4 h-4 rounded-full border-2 ${
                              camera.status === "online"
                                ? "bg-green-500 border-green-600"
                                : "bg-destructive border-destructive"
                            }`}
                          />
                          <span className="flex-1">
                            <div className="text-xs font-semibold uppercase text-foreground">
                              {camera.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {camera.location}{" "}
                              {camera.status === "online" && (
                                <span className="text-green-500">(ONLINE)</span>
                              )}
                            </div>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {selectedCamera && isFocus && (
        <div className="fixed inset-0 z-[60] bg-background/60 dark:bg-background/70 backdrop-blur-md">
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFocus(false)}
            >
              Tutup
            </Button>
          </div>
          <div className="h-full w-full flex items-center justify-center p-3 sm:p-6">
            <div className="w-full max-w-5xl">
              <EnhancedVideoPlayer
                src={selectedCamera.streamUrl}
                title={selectedCamera.name}
                location={selectedCamera.location}
                status={selectedCamera.status}
                thumbnail={selectedCamera.thumbnail}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedIndex;
