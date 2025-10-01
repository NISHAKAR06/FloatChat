import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  Settings,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Save,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemConfig = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  // Database Configuration
  const [dbConfig, setDbConfig] = useState({
    host: 'db.argo-system.local',
    port: '5432',
    database: 'argo_db',
    username: 'admin',
    password: '••••••••',
    sslMode: 'require',
    connectionPoolSize: '10',
    maxConnections: '100'
  });



  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maxFileSize: '100',
    sessionTimeout: '60',
    rateLimitRequests: '1000',
    rateLimitWindow: '60',
    cacheEnabled: true,
    compressionEnabled: true,
    debugMode: false,
    maintenanceMode: false,
    emailNotifications: true,
    backupFrequency: 'daily'
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    jwtSecret: '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••',
    apiRateLimit: true,
    corsEnabled: true,
    allowedOrigins: '*.argosystem.com\nlocalhost\n127.0.0.1',
    passwordPolicy: 'complex',
    twoFactorAuth: true,
    auditLogging: true,
    sslEnforced: true
  });

  const handleSaveConfig = (section: string) => {
    toast({
      title: "Configuration Saved",
      description: `${section} settings have been saved successfully.`,
    });
  };

  const handleTestConnection = () => {
    toast({
      title: "Database Connection",
      description: "Database connection test successful!",
      variant: "default",
    });
  };

  return (
      <div className="h-full bg-gradient-surface">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-primary">
                System Configuration
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure system settings, database, and security
              </p>
            </div>
            <Button onClick={() => handleSaveConfig('All')} size="lg" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save All Changes
            </Button>
          </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Database Configuration */}
        <TabsContent value="database" className="space-y-6">
          <Card className="bg-glass backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="db-host">Database Host</Label>
                    <Input
                      id="db-host"
                      value={dbConfig.host}
                      onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-port">Port</Label>
                    <Input
                      id="db-port"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-name">Database Name</Label>
                    <Input
                      id="db-name"
                      value={dbConfig.database}
                      onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="db-user">Username</Label>
                    <Input
                      id="db-user"
                      value={dbConfig.username}
                      onChange={(e) => setDbConfig({...dbConfig, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="db-password"
                        type={showPassword ? "text" : "password"}
                        value={dbConfig.password}
                        onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssl-mode">SSL Mode</Label>
                    <Select value={dbConfig.sslMode} onValueChange={(value) => setDbConfig({...dbConfig, sslMode: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="require">Require</SelectItem>
                        <SelectItem value="prefer">Prefer</SelectItem>
                        <SelectItem value="allow">Allow</SelectItem>
                        <SelectItem value="disable">Disable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pool-size">Connection Pool Size</Label>
                    <Input
                      id="pool-size"
                      type="number"
                      value={dbConfig.connectionPoolSize}
                      onChange={(e) => setDbConfig({...dbConfig, connectionPoolSize: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-conn">Max Connections</Label>
                    <Input
                      id="max-conn"
                      type="number"
                      value={dbConfig.maxConnections}
                      onChange={(e) => setDbConfig({...dbConfig, maxConnections: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-start space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">PostgreSQL</Badge>
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="outline" className="text-green-500">Healthy</Badge>
                  </div>
                  <Button onClick={handleTestConnection} className="flex items-center gap-2 w-fit">
                    <TestTube className="h-4 w-4" />
                    Test Connection
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSaveConfig('Database')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Database Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-glass backdrop-blur-sm border-glass">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">Max File Upload Size (MB)</Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">System Flags</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Cache Enabled</Label>
                        <p className="text-sm text-muted-foreground">Enable response caching</p>
                      </div>
                      <Switch
                        checked={systemSettings.cacheEnabled}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, cacheEnabled: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compression Enabled</Label>
                        <p className="text-sm text-muted-foreground">Compress responses</p>
                      </div>
                      <Switch
                        checked={systemSettings.compressionEnabled}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, compressionEnabled: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Debug Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable detailed logging</p>
                      </div>
                      <Switch
                        checked={systemSettings.debugMode}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, debugMode: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Put system in maintenance</p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveConfig('System')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card className="bg-glass backdrop-blur-sm border-glass">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input defaultValue="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input defaultValue="587" />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input defaultValue="noreply@argosystem.com" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send system notifications via email</p>
                  </div>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                  />
                </div>

                <div className="flex justify-end">
                  <Button>
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-glass backdrop-blur-sm border-glass">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jwt-secret">JWT Secret Key</Label>
                    <Input
                      id="jwt-secret"
                      type="password"
                      value={securitySettings.jwtSecret}
                      onChange={(e) => setSecuritySettings({...securitySettings, jwtSecret: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Select value={securitySettings.passwordPolicy} onValueChange={(value) => setSecuritySettings({...securitySettings, passwordPolicy: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple (6+ chars)</SelectItem>
                        <SelectItem value="medium">Medium (8+ chars + numbers)</SelectItem>
                        <SelectItem value="complex">Complex (12+ chars + symbols)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">Enable rate limiting for API endpoints</p>
                    </div>
                    <Switch
                      checked={securitySettings.apiRateLimit}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, apiRateLimit: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>CORS Enabled</Label>
                      <p className="text-sm text-muted-foreground">Allow cross-origin requests</p>
                    </div>
                    <Switch
                      checked={securitySettings.corsEnabled}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, corsEnabled: checked})}
                    />
                  </div>

                  {securitySettings.corsEnabled && (
                    <div className="space-y-2">
                      <Label>Allowed Origins</Label>
                      <Textarea
                        placeholder="Enter allowed origins (one per line)"
                        value={securitySettings.allowedOrigins}
                        onChange={(e) => setSecuritySettings({...securitySettings, allowedOrigins: e.target.value})}
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SSL/TLS Enforced</Label>
                      <p className="text-sm text-muted-foreground">Require HTTPS connections</p>
                    </div>
                    <Switch
                      checked={securitySettings.sslEnforced}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, sslEnforced: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all user actions</p>
                    </div>
                    <Switch
                      checked={securitySettings.auditLogging}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveConfig('Security')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>
    </div>
  );
};

export default SystemConfig;
