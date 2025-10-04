import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  MessageCircle,
  BarChart3,
  Search,
  Download,
  Star,
  Waves,
  Settings
} from 'lucide-react';

const UserSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const mainNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Chatbot', url: '/chatbot', icon: MessageCircle },
  ];

  const analysisItems = [
    { title: 'Data Visualization', url: '/data-visualization', icon: BarChart3 },
    { title: 'Search & Filters', url: '/filters-search', icon: Search },
    { title: 'Export Data', url: '/export-options', icon: Download },
    { title: 'Saved Favorites', url: '/saved-favorites', icon: Star },
    { title: 'Settings', url: '/settings', icon: Settings },
  ];

  const getNavLinkClass = (isActive: boolean) => {
    const baseClasses = 'flex items-center gap-3 px-3 py-2 rounded-l-md text-sm w-full transition-all duration-300 hover-ocean-wave';
    if (isActive) {
      return `${baseClasses} bg-primary/30 border-l-4 border-primary shadow-lg`;
    }
    return `${baseClasses} text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-md hover:border hover:border-primary/20 font-medium`;
  };

  // Explicit color helper to ensure icon and label use consistent color
  const getItemColor = (isActive: boolean) => (isActive ? 'text-foreground' : 'text-blue-600');

  return (
    <Sidebar className={`border-r ${collapsed ? 'w-14' : 'w-64'}`} collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Waves className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">FloatChat</h2>
              <p className="text-xs text-muted-foreground">User Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Waves className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => getNavLinkClass(isActive)}
                    >
                      <item.icon className={`h-4 w-4 ${getItemColor(currentPath === item.url)}`} />
                      {!collapsed && <span className={getItemColor(currentPath === item.url)}>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analysis Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => getNavLinkClass(isActive)}
                    >
                      <item.icon className={`h-4 w-4 ${getItemColor(currentPath === item.url)}`} />
                      {!collapsed && <span className={getItemColor(currentPath === item.url)}>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default UserSidebar;
