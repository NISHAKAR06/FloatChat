import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import heroImage from '@/assets/hero-ocean.jpg';
import {
  Activity,
  Bot,
  BarChart3,
  Download,
  ArrowRight,
  Waves,
  Globe,
  TrendingUp,
  Moon,
  Sun,
  Monitor,
  Ship
} from 'lucide-react';

const Landing = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

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

  const features = [
    {
      icon: Activity,
      title: t('landing.features.realTime.title'),
      description: t('landing.features.realTime.description'),
    },
    {
      icon: Bot,
      title: t('landing.features.aiQuery.title'),
      description: t('landing.features.aiQuery.description'),
    },
    {
      icon: BarChart3,
      title: t('landing.features.visualization.title'),
      description: t('landing.features.visualization.description'),
    },
    {
      icon: Download,
      title: t('landing.features.export.title'),
      description: t('landing.features.export.description'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 right-0 z-50 p-4 flex items-center space-x-2 bg-transparent">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/login')}
          className="text-white hover:bg-primary/20 hover:text-primary backdrop-blur-sm font-semibold transition-all duration-300"
        >
          {t('landing.common.login')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/signup')}
          className="text-white hover:bg-primary/20 hover:text-primary backdrop-blur-sm font-semibold transition-all duration-300"
        >
          {t('landing.common.signUp')}
        </Button>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-primary/20 hover:text-primary backdrop-blur-sm transition-all duration-300">
              <Globe className="h-4 w-4" />
              <span className="ml-2">{language.toUpperCase()}</span>
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

        {/* Theme Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-primary/20 hover:text-primary backdrop-blur-sm transition-all duration-300">
              {getThemeIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTheme('light')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
              <Sun className="h-4 w-4 mr-2" />
              {t('landing.common.light')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
              <Moon className="h-4 w-4 mr-2" />
              {t('landing.common.dark')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
              <Monitor className="h-4 w-4 mr-2" />
              {t('landing.common.system')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 px-4 overflow-hidden min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-hero/80"></div>
        
        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="mb-8">
            <Waves className="h-16 w-16 text-primary-glow mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              {t('landing.hero.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/login')}
              className="text-white hover:bg-primary/20 hover:text-primary backdrop-blur-sm font-semibold transition-all duration-300"
            >
              {t('landing.hero.getStarted')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-primary/20 hover:text-primary backdrop-blur-sm font-semibold transition-all duration-300"
            >
              {t('landing.hero.learnMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            {t('landing.background.title')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('landing.background.description')}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('landing.features.title')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-glass backdrop-blur-sm border-glass shadow-glass hover:shadow-ocean transition-all duration-300 hover:-translate-y-1 hover-ocean">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-ocean rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expected Solution Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              {t('landing.solution.title')}
            </h2>
          </div>
          
          <Card className="bg-glass backdrop-blur-sm border-glass shadow-glass">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{t('landing.solution.cards.globalCoverage.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('landing.solution.cards.globalCoverage.description')}</p>
                </div>
                <div className="text-center">
                  <Bot className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{t('landing.solution.cards.aiIntegration.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('landing.solution.cards.aiIntegration.description')}</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-primary-glow mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{t('landing.solution.cards.realTimeInsights.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('landing.solution.cards.realTimeInsights.description')}</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-surface rounded-lg">
                <p className="text-muted-foreground text-center leading-relaxed">
                  {t('landing.solution.description')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center space-x-1">
              <Ship className="h-6 w-6 text-primary" />
              <Waves className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg">FloatChat</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
