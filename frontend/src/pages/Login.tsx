import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Waves, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Use the API client for login
        const result = await api.login(formData.email, formData.password);

        if (result.status === 200 && result.data) {
          // Check if user is admin from the response
          const userRole = result.data.user?.role || "user";
          const isAdmin = userRole === "admin";

          toast({
            title: "Success",
            description: `Logged in successfully${isAdmin ? " as Admin" : ""}`,
          });

          // Navigate based on user role
          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        } else {
          toast({
            title: "Error",
            description: result.error || "Login failed",
            variant: "destructive",
          });
        }
      } else {
        // Registration API call
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }

        const result = await api.register(formData.email, formData.password);

        if (result.status === 201 || result.status === 200) {
          toast({
            title: "Success",
            description: "Account created successfully",
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Error",
            description: result.error || "Registration failed",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="bg-glass backdrop-blur-md border-glass shadow-glass">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Waves className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? t("auth.login") : t("auth.signup")}
            </CardTitle>
            <CardDescription>
              {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("auth.emailPlaceholder")}
                  required
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 backdrop-blur-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("auth.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-ocean hover:opacity-90 transition-opacity"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Logging in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  t("auth.login")
                ) : (
                  t("auth.signup")
                )}
              </Button>
            </form>

            {isLogin && (
              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
            )}

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="mt-1"
              >
                {isLogin ? t("auth.signup") : t("auth.login")}
              </Button>
            </div>

            {/* Demo credentials hint */}
            {isLogin && (
              <div className="mt-6 p-3 bg-muted/50 rounded-lg border space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Demo Accounts:
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    👤 <strong>Admin:</strong> admin@oceanic.ai / admin123
                  </p>
                  <p>
                    👤 <strong>User:</strong> user@oceanic.ai / user123
                  </p>
                  <p className="text-yellow-600 mt-2">
                    ⚠️ Email migration in progress - use @oceanic.ai for now
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
