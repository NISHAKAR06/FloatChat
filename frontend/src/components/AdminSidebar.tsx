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
  Users,
  Database,
  Activity,
  Shield,
  BarChart3,
  Settings
} from 'lucide-react';

const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const mainNavItems = [
    { title: 'Admin Dashboard', url: '/admin', icon: LayoutDashboard },
  ];

  const managementItems = [
    { title: 'User Management', url: '/user-management', icon: Users },
    { title: 'Data Management', url: '/data-management', icon: Database },
    { title: 'Query Monitoring', url: '/query-monitoring', icon: Activity },
    { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    { title: 'System Config', url: '/system-config', icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? '!text-primary !font-semibold' : '!text-muted-foreground hover:!text-primary hover:bg-primary/10 hover:shadow-md transition-all duration-300 hover-ocean-wave !font-semibold';

  const getItemColor = (active: boolean) => (active ? 'text-primary' : 'text-muted-foreground');

  return (
    <Sidebar className={`border-r ${collapsed ? 'w-14' : 'w-64'}`} collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">ARGO System</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
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
                    <NavLink to={item.url} className={getNavCls}>
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
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
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

export default AdminSidebar;
