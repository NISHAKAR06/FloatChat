import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  User,
  Globe,
  Monitor,
  Moon,
  Sun,
  Waves
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
  ];

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-screen bg-gradient-surface flex overflow-hidden">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex flex-col h-full">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 border-b bg-glass backdrop-blur-md">
            {/* Left section: Sidebar trigger (now in sidebar header) */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Waves className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg bg-gradient-ocean bg-clip-text text-transparent">
                  ARGO Admin
                </span>
              </div>
            </div>

            {/* Right section: Action buttons */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                    <Globe className="h-4 w-4" />
                    <span className="ml-2 hidden md:inline">{language.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`${language === lang.code ? 'bg-primary/20 text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300'}`}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                    {getThemeIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTheme('light')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <Sun className="h-4 w-4 mr-2" />
                    {t('settings.light')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <Moon className="h-4 w-4 mr-2" />
                    {t('settings.dark')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <Monitor className="h-4 w-4 mr-2" />
                    {t('settings.system')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    // Clear any stored authentication data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.clear();

                    // Redirect to login page
                    navigate('/login');
                  }} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('navigation.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="h-full p-4">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
