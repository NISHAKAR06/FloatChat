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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
                    <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    System Settings
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">Configure system parameters and preferences</p>
                </div>
                <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Configuration */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                    <Key className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-800 dark:text-slate-200" htmlFor="apiKey">API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="apiKey"
                        value={settings.apiKey}
                        onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                        type="password"
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                      <Button variant="outline" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-800 dark:text-slate-200" htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      value={settings.apiRefreshInterval}
                      onChange={(e) => handleSettingChange('apiRefreshInterval', parseInt(e.target.value))}
                      className="bg-white/50 dark:bg-slate-900/50"
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
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
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
                      <Badge className={settings.maintenanceMode 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}>
                        {settings.maintenanceMode ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground" htmlFor="notifications">Enable System Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Notification Types:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">System Alerts</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">User Activity</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Performance Alerts</span>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Disabled</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Settings */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800 dark:text-slate-100">
                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Database Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground" htmlFor="autoBackup">Enable Auto Backup</Label>
                    <Switch
                      id="autoBackup"
                      checked={settings.enableAutoBackup}
                      onCheckedChange={(checked) => handleSettingChange('enableAutoBackup', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Database Status:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Connection</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <div className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse mr-2"></div>
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Storage Used</span>
                        <span className="text-sm font-medium text-foreground">45.2 TB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Backup</span>
                        <span className="text-sm font-medium text-foreground">2 hours ago</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
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
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Configuration Status</h3>
                      <p className="text-primary-foreground/80">All systems operational. Settings can be modified in real-time.</p>
                    </div>
                    <Button 
                      onClick={handleSave}
                      variant="secondary"
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