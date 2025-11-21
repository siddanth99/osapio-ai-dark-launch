import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles } from 'lucide-react';
import { UserMenu } from './Auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    // If logged in, go to home. If not logged in, go to landing page
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <div className="relative">
              <Brain className="w-8 h-8 text-primary" />
              <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              osapio
            </h1>
          </div>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};