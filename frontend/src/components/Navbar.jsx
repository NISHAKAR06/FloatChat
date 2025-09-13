import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { 
  Waves, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Shield,
  Database,
  Users,
  Bell,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import useSearchStore from '../store/searchStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { query, setQuery, results, isLoading } = useSearchStore();
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (results.length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSearchResults(false);
    }
  };



  const getResultIcon = (type) => {
    switch (type) {
      case 'dataset': return <Database className="h-4 w-4 text-cyan-600" />;
      case 'user': return <Users className="h-4 w-4 text-blue-600" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const [notifications] = useState([
    { 
      id: 1, 
      type: 'access', 
      title: 'Dataset Access Granted', 
      message: 'You now have access to the Gulf Stream dataset',
      time: '2h ago',
      sender: 'System Admin',
      icon: <UserCheck className="h-4 w-4 text-green-500" />
    },
    { 
      id: 2, 
      type: 'message', 
      title: 'New Message from Admin',
      message: 'Please review the updated data usage guidelines',
      time: '4h ago',
      sender: 'Admin',
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />
    }
  ]);

  const navigateToResult = (result) => {
    setShowSearchResults(false);
    setQuery('');
    
    switch (result.type) {
      case 'dataset':
        navigate('/explorer');
        break;
      case 'user':
        if (user?.role === 'admin') {
          navigate('/admin/users');
        }
        break;
      default:
        break;
    }
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 select-none shadow-sm">
      <div className="max-w-full mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <Waves className="h-8 w-8 text-cyan-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              FloatChat
            </span>
            {user?.role === 'admin' && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search datasets, locations, parameters..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="pl-10 border-slate-200/60 focus:border-cyan-500 bg-white/50 dark:bg-slate-800/50 dark:border-slate-700/50 dark:focus:border-cyan-400 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                  </div>
                )}
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 border border-slate-200/60 dark:border-slate-700/60 rounded-lg shadow-lg backdrop-blur-sm max-h-96 overflow-y-auto z-50 select-none">
                {results.slice(0, 8).map((result, index) => (
                  <div
                    key={`${result.type}-${result.id || index}`}
                    onClick={() => navigateToResult(result)}
                    className="flex items-center space-x-3 p-3 hover:bg-slate-50/90 dark:hover:bg-slate-700/90 cursor-pointer border-b border-slate-200/60 dark:border-slate-700/60 last:border-0 transition-colors"
                  >
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                        {result.name || result.title || result.type}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {result.location || result.email || result.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {result.type}
                    </Badge>
                  </div>
                ))}
                {results.length > 8 && (
                  <div className="p-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                        setShowSearchResults(false);
                      }}
                    >
                      View all {results.length} results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-600 text-white text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 select-none bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
                <div className="p-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</p>
                    {notifications.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {notifications.length} new
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-700/90 transition-colors">
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {notification.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{notification.title}</p>
                              <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{notification.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-slate-500 mt-1">From: {notification.sender}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="p-2 text-center text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      Mark all as read
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block font-medium">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 select-none bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
                <div className="p-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <Badge className="mt-1 text-xs bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300" variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                    {user?.role || 'user'}
                  </Badge>
                </div>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;