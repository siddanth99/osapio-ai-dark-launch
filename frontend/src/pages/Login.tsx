import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Eye, EyeOff, User, Brain, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const { user, signInWithGoogle, signUpWithEmail, signInWithEmail, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in (handled by PublicRoute wrapper)

  // Form states
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      navigate('/home', { replace: true });
      toast.success('Welcome! Signed in successfully.');
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await signInWithEmail(signInData.email, signInData.password);
      navigate('/home', { replace: true });
      toast.success('Welcome back!');
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await signUpWithEmail(signUpData.email, signUpData.password, signUpData.displayName);
      navigate('/home', { replace: true });
      toast.success('Account created successfully!');
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Brain className="w-10 h-10 text-primary" />
              <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              osapio
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            {activeTab === 'signin' 
              ? 'Sign in to your account to continue' 
              : 'Create a new account to get started'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Sign-in Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            variant="outline"
            className="w-full h-12 text-base"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 border-b">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'signin'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pr-10"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name (Optional)</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    className="pl-10"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min. 6 characters)"
                    className="pr-10"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Back to Home */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

