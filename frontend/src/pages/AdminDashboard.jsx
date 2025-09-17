import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Shield,
  Users,
  Database,
  Activity,
  BarChart3
} from 'lucide-react';
import { users } from '../mock/data';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const features = [
    {
      title: "User Management",
      description: "Manage users and permissions.",
      icon: <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      onClick: () => navigate('/admin/users')
    },
    {
      title: "Dataset Management",
      description: "Upload, view, and manage datasets.",
      icon: <Database className="h-10 w-10 text-green-600 dark:text-green-400" />,
      onClick: () => navigate('/admin/datasets')
    },
    {
      title: "Usage Analytics",
      description: "View usage statistics and reports.",
      icon: <BarChart3 className="h-10 w-10 text-orange-600 dark:text-orange-400" />,
      onClick: () => navigate('/admin/usage-analytics')
    },
    {
      title: "System Metrics",
      description: "Monitor system performance.",
      icon: <Activity className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />,
      onClick: () => navigate('/admin/system-metrics')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
            <Shield className="h-9 w-9 text-orange-600 dark:text-orange-400" />
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Welcome to the admin panel. Use the cards below to navigate.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <Card
              key={feature.title}
              className={`bg-white dark:bg-slate-800 shadow-md rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer ${feature.onClick ? 'hover:ring-2 hover:ring-cyan-400' : ''}`}
              onClick={feature.onClick}
              tabIndex={feature.onClick ? 0 : undefined}
              role={feature.onClick ? 'button' : undefined}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50">{feature.icon}</div>
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
