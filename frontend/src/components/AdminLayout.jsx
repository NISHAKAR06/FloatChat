import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useSidebarStore from '../store/sidebarStore';
import useAuthStore from '../store/authStore';

const AdminLayout = ({ children }) => {
  const { collapsed } = useSidebarStore();
  const { user } = useAuthStore();
  
  console.log('AdminLayout rendering:', {
    collapsed,
    user,
    hasChildren: !!children
  });

  if (!user || user.role !== 'admin') {
    console.log('Invalid user access to admin layout');
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 dark:bg-slate-900 transition-all duration-300" style={{ marginLeft: collapsed ? 64 : 256 }}>
        <Sidebar />
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
