import React, { useState } from 'react';
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
  Ship,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
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

            {/* Navigation Links - Desktop */}
            <div className="flex-1 flex justify-center">
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium hover-ocean-bounce ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md hover:border hover:border-primary/20'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right Side Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
              {/* User Actions only - Language and Theme moved to settings */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('navigation.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {}} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('navigation.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Show Language and Theme selectors only when not authenticated */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300">
                        <Globe className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">{language.toUpperCase()}</span>
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

                  <Button
                    onClick={() => navigate('/login')}
                    variant="default"
                    size="sm"
                  >
                    {t('navigation.login')}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-glass backdrop-blur-md border-b border-glass z-50 md:hidden">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md hover:border hover:border-primary/20'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Mobile Actions */}
              <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4 space-y-3">
                {/* Language Selector */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 px-4">Language</p>
                  <div className="grid grid-cols-3 gap-2 px-4">
                    {languages.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={language === lang.code ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setMobileMenuOpen(false);
                        }}
                        className="text-xs"
                      >
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 px-4">Theme</p>
                  <div className="flex space-x-2 px-4">
                    <Button
                      variant={theme === 'light' ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme('light');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-xs">{t('settings.light')}</span>
                    </Button>
                    <Button
                      variant={theme === 'dark' ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme('dark');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-xs">{t('settings.dark')}</span>
                    </Button>
                    <Button
                      variant={theme === 'system' ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme('system');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Monitor className="h-4 w-4" />
                      <span className="text-xs">{t('settings.system')}</span>
                    </Button>
                  </div>
                </div>

                {/* User Actions */}
                {isAuthenticated ? (
                  <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-3 space-y-2">
                    <Button
                      onClick={() => {
                        navigate('/settings');
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      {t('navigation.settings')}
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        // Handle logout
                      }}
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {t('navigation.logout')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    variant="default"
                    className="w-full"
                  >
                    {t('navigation.login')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Tab Bar - Only for authenticated users */}
      {isMobile && isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-700/50 z-50">
          <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary shadow-lg'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md'
                }`
              }
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary shadow-lg'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Dashboard</span>
            </NavLink>

            <NavLink
              to="/chatbot"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary shadow-lg'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md'
                }`
              }
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Chat</span>
            </NavLink>

            <NavLink
              to="/help"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary shadow-lg'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md'
                }`
              }
            >
              <HelpCircle className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Help</span>
            </NavLink>

            <button
              onClick={() => navigate('/settings')}
              className="flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md"
            >
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
