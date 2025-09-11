import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Waves, Database, BarChart3, Shield, Zap, Globe, Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const Landing = () => {
  const { theme, toggleTheme } = useThemeStore();

  const features = [
    {
      icon: <Database className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />,
      title: "Ocean Data Explorer",
      description: "Access vast oceanographic datasets with powerful filtering and search capabilities"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "Advanced Visualizations",
      description: "Interactive maps, charts, and 3D visualizations for comprehensive data analysis"
    },
    {
      icon: <Shield className="h-8 w-8 text-teal-600 dark:text-teal-400" />,
      title: "Smart Alerts",
      description: "Custom rule-based monitoring with real-time notifications for critical changes"
    },
    {
      icon: <Zap className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />,
      title: "AI-Powered Insights",
      description: "Chat with your data using natural language queries and get instant insights"
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: "Global Coverage",
      description: "Worldwide oceanographic data from multiple sources and research institutions"
    },
    {
      icon: <Waves className="h-8 w-8 text-teal-600 dark:text-teal-400" />,
      title: "Real-time Updates",
      description: "Live data feeds with automatic synchronization and quality validation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Waves className="h-8 w-8 text-cyan-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                FloatChat
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-700 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:hover:bg-cyan-800/50">
            🌊 Explore Ocean Data with AI
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-slate-800 via-blue-800 to-cyan-700 dark:from-slate-200 dark:via-blue-300 dark:to-cyan-400 bg-clip-text text-transparent">
            Dive Deep Into
            <br />
            <span className="bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Ocean Intelligence
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Unlock the secrets of our oceans with AI-powered data exploration, 
            real-time monitoring, and intelligent insights from global oceanographic datasets.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white px-8 py-4 text-lg">
                Start Exploring
                <Waves className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-900/20 px-8 py-4 text-lg">
                View Demo
                <BarChart3 className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Demo visualization placeholder */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/20 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-16 w-16 text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Interactive Ocean Data Visualization</p>
                <p className="text-slate-500 dark:text-slate-400">Experience the full platform after signing up</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 dark:bg-slate-800/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-200 dark:to-blue-300 bg-clip-text text-transparent">
              Powerful Features for Ocean Research
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Everything you need to explore, analyze, and monitor oceanographic data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold ml-3 text-slate-800 dark:text-slate-200">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-200 dark:to-blue-300 bg-clip-text text-transparent">
            Ready to Explore?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
            Join researchers and analysts worldwide who trust FloatChat for ocean data insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-900/20 px-8 py-4 text-lg">
                I have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Waves className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold">FloatChat</span>
          </div>
          <p className="text-slate-400 mb-4">
            Empowering ocean research through intelligent data exploration
          </p>
          <p className="text-slate-500 text-sm">
            © 2025 FloatChat. Built for ocean researchers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;