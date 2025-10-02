import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import {
  Settings as SettingsIcon,
  Palette,
  Globe,
  Mic,
  Download,
  Save
} from 'lucide-react';

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [localSettings, setLocalSettings] = React.useState({
    voiceInput: true,
    textToSpeech: false,
    exportFormat: 'csv',
    autoSave: true,
    notifications: true,
  });

  const handleSaveSettings = () => {
    toast({
      title: t('common.success'),
      description: t('settings.subtitle'),
    });
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
  ];

  const themes = [
    { value: 'light', label: t('settings.light') },
    { value: 'dark', label: t('settings.dark') },
    { value: 'system', label: t('settings.system') },
  ];

  const exportFormats = [
    { value: 'csv', label: 'CSV' },
    { value: 'netcdf', label: 'NetCDF' },
    { value: 'ascii', label: 'ASCII' },
    { value: 'json', label: 'JSON' },
  ];

  return (
    <div className="h-full bg-gradient-surface">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('settings.title')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Appearance Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                {t('settings.appearance.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">{t('settings.theme')}</Label>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t('settings.languageRegion.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.languageRegion.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Voice & Audio Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                {t('settings.voiceAudio.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.voiceAudio.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-input">{t('settings.voice')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.enableVoiceInput')}
                  </p>
                </div>
                <Switch
                  id="voice-input"
                  checked={localSettings.voiceInput}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({ ...prev, voiceInput: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="text-to-speech">{t('settings.textToSpeech')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.enableTextToSpeech')}
                  </p>
                </div>
                <Switch
                  id="text-to-speech"
                  checked={localSettings.textToSpeech}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({ ...prev, textToSpeech: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Export Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                {t('settings.dataExport.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.dataExport.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="export-format">{t('settings.defaultExportFormat')}</Label>
                <Select
                  value={localSettings.exportFormat}
                  onValueChange={(value) =>
                    setLocalSettings(prev => ({ ...prev, exportFormat: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">{t('settings.autoSaveQueries')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.autoSaveDescription')}
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={localSettings.autoSave}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({ ...prev, autoSave: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                {t('settings.notifications.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">{t('settings.enableNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.notificationsDescription')}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={localSettings.notifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} size="lg" className="hover:shadow-lg transition-all duration-300 hover-ocean-glow ocean-ripple">
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')} {t('settings.title')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
