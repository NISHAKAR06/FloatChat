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
    username: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast({
          title: "Account created successfully!",
          description: `Welcome to FloatChat, ${formData.username}!`,
        });
        navigate('/login');
      } else {
        const errorData = await response.json();
        toast({
          title: "Registration failed",
          description: errorData.detail || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-center text-slate-800 dark:text-slate-200">Create an Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="jane_smith"
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
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                  <span>AI-powered chat assistant</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
