import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Waves, User, Shield, ArrowLeft, Check, Sun, Moon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock registration
    setTimeout(() => {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };

      // Store auth data using Zustand store
      login(userData);

      // Also store in localStorage for compatibility
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: userData
      }));

      toast({
        title: "Account created successfully!",
        description: `Welcome to FloatChat, ${formData.name}!`,
      });

      // Redirect based on role
      if (formData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Waves className="h-8 w-8 text-cyan-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              FloatChat
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Get started</h1>
          <p className="text-slate-600 dark:text-slate-400">Create your account to explore ocean data</p>
        </div>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-slate-800 dark:text-slate-200">Choose Your Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                type="button"
                variant={formData.role === 'user' ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  formData.role === 'user' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white' 
                    : 'border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300'
                }`}
                onClick={() => handleRoleChange('user')}
              >
                <User className="h-6 w-6" />
                <span className="font-medium">User</span>
                <div className="text-xs opacity-80 text-center">
                  <div className="flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>AI Chat Assistant</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Data Explorer</span>
                  </div>
                </div>
              </Button>
              <Button
                type="button"
                variant={formData.role === 'admin' ? 'default' : 'outline'}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  formData.role === 'admin' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white' 
                    : 'border-cyan-200 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20 dark:text-slate-300'
                }`}
                onClick={() => handleRoleChange('admin')}
              >
                <Shield className="h-6 w-6" />
                <span className="font-medium">Admin</span>
                <div className="text-xs opacity-80 text-center">
                  <div className="flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>User Management</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>System Analytics</span>
                  </div>
                </div>
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                {formData.role === 'user' ? '🌊 Full access to data exploration tools' : '⚙️ Complete administrative control'}
              </Badge>
            </div>

            <Separator className="dark:bg-slate-700" />

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. Jane Smith"
                  required
                  className="border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jane.smith@university.edu"
                  required
                  className="border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  required
                  className="border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Features preview */}
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700/50">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">What you'll get:</p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                  <span>Access to global oceanographic datasets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                  <span>Interactive visualizations and maps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                  <span>Real-time alerts and monitoring</span>
                </div>
                {formData.role === 'user' && (
                  <div className="flex items-center space-x-2">
                    <Check className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                    <span>AI-powered chat assistant</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;