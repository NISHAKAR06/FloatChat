import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Waves, User, Shield, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const Login = () => {
  const [formData, setFormData] = useState({
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

    // Mock authentication
    setTimeout(() => {
      const userData = {
        email: formData.email,
        role: formData.role,
        name: formData.email.split('@')[0]
      };

      // Store auth data using Zustand store
      login(userData);

      // Also store in localStorage for compatibility
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: userData
      }));

      toast({
        title: "Login successful!",
        description: `Welcome back, ${formData.role}!`,
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Welcome back</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to continue your ocean exploration</p>
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
                <span className="text-xs opacity-80">Explore & Analyze</span>
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
                <span className="text-xs opacity-80">Manage & Monitor</span>
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                {formData.role === 'user' ? '🌊 User Dashboard + AI Chat' : '⚙️ Admin Panel + Analytics'}
              </Badge>
            </div>

            <Separator className="dark:bg-slate-700" />

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
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
                  placeholder="Enter your password"
                  required
                  className="border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Demo Credentials:</p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p><strong>User:</strong> user@demo.com / password123</p>
                <p><strong>Admin:</strong> admin@demo.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;