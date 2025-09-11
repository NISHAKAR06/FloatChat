import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { 
  Settings, 
  Key, 
  Bell, 
  Database,
  Shield,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const AdminSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    apiRefreshInterval: 300,
    maxConcurrentUsers: 1000,
    dataRetentionDays: 365,
    enableNotifications: true,
    enableAutoBackup: true,
    enableRateLimiting: true,
    apiKey: '••••••••••••••••••••••••••••••••',
    maintenanceMode: false
  });

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "System configuration has been updated successfully.",
    });
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
                    <Settings className="h-8 w-8 text-slate-600 mr-3" />
                    System Settings
                  </h1>
                  <p className="text-slate-600">Configure system parameters and preferences</p>
                </div>
                <Button onClick={handleSave} className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Configuration */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 text-cyan-600 mr-2" />
                    API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="apiKey"
                        value={settings.apiKey}
                        onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                        className="border-cyan-200 focus:border-cyan-400"
                        type="password"
                      />
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      value={settings.apiRefreshInterval}
                      onChange={(e) => handleSettingChange('apiRefreshInterval', parseInt(e.target.value))}
                      className="border-cyan-200 focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="rateLimiting">Enable Rate Limiting</Label>
                    <Switch
                      id="rateLimiting"
                      checked={settings.enableRateLimiting}
                      onCheckedChange={(checked) => handleSettingChange('enableRateLimiting', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Limits */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 text-orange-600 mr-2" />
                    System Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="maxUsers">Max Concurrent Users</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={settings.maxConcurrentUsers}
                      onChange={(e) => handleSettingChange('maxConcurrentUsers', parseInt(e.target.value))}
                      className="border-cyan-200 focus:border-cyan-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="retentionDays">Data Retention (days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      value={settings.dataRetentionDays}
                      onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                      className="border-cyan-200 focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                      />
                      <Badge className={settings.maintenanceMode ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                        {settings.maintenanceMode ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 text-blue-600 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Enable System Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Notification Types:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">System Alerts</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">User Activity</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Performance Alerts</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Disabled</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Settings */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 text-green-600 mr-2" />
                    Database Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoBackup">Enable Auto Backup</Label>
                    <Switch
                      id="autoBackup"
                      checked={settings.enableAutoBackup}
                      onCheckedChange={(checked) => handleSettingChange('enableAutoBackup', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Database Status:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Connection</span>
                        <Badge className="bg-green-100 text-green-800">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Storage Used</span>
                        <span className="text-sm font-medium">45.2 TB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Last Backup</span>
                        <span className="text-sm font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Save Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Configuration Status</h3>
                      <p className="text-cyan-100">All systems operational. Settings can be modified in real-time.</p>
                    </div>
                    <Button 
                      onClick={handleSave}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Apply Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;