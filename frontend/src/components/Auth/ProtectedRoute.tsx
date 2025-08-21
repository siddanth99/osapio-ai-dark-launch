import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDialog } from './AuthDialog';
import { Shield, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access this feature and upload files securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowAuthDialog(true)}
              variant="glow" 
              size="lg"
              className="w-full"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Sign In to Continue
            </Button>
            <AuthDialog 
              isOpen={showAuthDialog} 
              onClose={() => setShowAuthDialog(false)} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};