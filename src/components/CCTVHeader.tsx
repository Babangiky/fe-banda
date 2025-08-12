import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Settings, Monitor, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
interface CCTVHeaderProps {
  onAdminClick?: () => void;
  onLogoutClick?: () => void;
  showAdmin?: boolean;
  isAdmin?: boolean;
}
const CCTVHeader: React.FC<CCTVHeaderProps> = ({
  onAdminClick,
  onLogoutClick,
  showAdmin = true,
  isAdmin = false
}) => {
  return <header className="bg-background border-b border-border/50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              <div>
                <h1 className="text-base sm:text-xl font-bold text-foreground leading-tight">
                  CCTV Banda Aceh
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                  Sistem Pemantauan
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              
              
            </div>
            
            <ThemeToggle />
            
            {isAdmin ? <Button variant="outline" size="sm" onClick={onLogoutClick} className="border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-xs sm:text-sm px-2 sm:px-3">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Keluar</span>
              </Button> : showAdmin && <Button variant="outline" size="sm" onClick={onAdminClick} className="border-primary/20 hover:border-primary hover:bg-primary/90  text-xs sm:text-sm px-2 sm:px-3">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>}
          </div>
        </div>
      </div>
    </header>;
};
export default CCTVHeader;