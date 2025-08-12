import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // SEO basics
    document.title = "404 - Halaman tidak ditemukan | CCTV Live";
    const desc = "Halaman tidak ditemukan. URL yang Anda akses tidak tersedia.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <main className="text-center px-6">
        <p className="text-sm text-muted-foreground mb-2">Error 404</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground mb-6">URL <span className="font-mono">{location.pathname}</span> tidak tersedia atau telah dipindahkan.</p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/AdminDashboard">Buka Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
