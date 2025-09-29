import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Waves,
  Globe,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  Ship
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Navigation = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Mock auth state - replace with real auth later
  const isAuthenticated = true;
  const userRole = 'user'; // or 'admin'

  const navItems = [
    { to: '/', label: t('navigation.home'), icon: Home },
    { to: '/dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard },
    { to: '/help', label: t('navigation.help'), icon: HelpCircle },
  ];

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
    <nav className="bg-glass backdrop-blur-md border-b border-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 w-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-primary">
                {/* Float/Buoy */}
                <circle cx="16" cy="8" r="4" fill="currentColor" />
                <rect x="15" y="4" width="2" height="8" fill="currentColor" />

                {/* Ocean waves */}
                <path d="M4 20 Q8 16 12 20 T20 20 Q24 16 28 20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M2 24 Q6 20 10 24 T18 24 Q22 20 26 24 T30 24" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />

                {/* Argo Ship - combining ocean and argo elements */}
                {/* Ship hull */}
                <ellipse cx="16" cy="26" rx="10" ry="3" fill="currentColor" opacity="0.7" />
                {/* Ship mast */}
                <rect x="15.5" y="18" width="1" height="8" fill="currentColor" opacity="0.8" />
                {/* Ship sail */}
                <path d="M16.5 18 L20 18 L18 22 L16.5 26 Z" fill="currentColor" opacity="0.6" />
                {/* Ship bow */}
                <path d="M6 26 L12 22 L12 26 Z" fill="currentColor" opacity="0.5" />
                {/* Ship stern */}
                <path d="M26 26 L20 22 L20 26 Z" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-ocean bg-clip-text text-transparent">
              FloatChat
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Globe className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`${language === lang.code ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  {getThemeIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTheme('light')} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Sun className="h-4 w-4 mr-2" />
                  {t('settings.light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Moon className="h-4 w-4 mr-2" />
                  {t('settings.dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Monitor className="h-4 w-4 mr-2" />
                  {t('settings.system')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Actions */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('navigation.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {}} className="text-muted-foreground hover:text-foreground hover:bg-muted">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('navigation.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                variant="default"
                size="sm"
              >
                {t('navigation.login')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
