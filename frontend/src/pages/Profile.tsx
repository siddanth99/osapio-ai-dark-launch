import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Navigation } from '@/components/Navigation';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile } from 'firebase/auth';

const ProfileContent = () => {
  const { user, getIdToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      if (profileData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName
        });
      }

      // Update backend user profile
      const token = await getIdToken();
      if (token) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        await fetch(`${backendUrl}/api/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            display_name: profileData.displayName
          })
        });
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getJoinDate = () => {
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).toLocaleDateString();
    }
    return 'N/A';
  };

  const getLastSignIn = () => {
    if (user?.metadata?.lastSignInTime) {
      return new Date(user.metadata.lastSignInTime).toLocaleDateString();
    }
    return 'N/A';
  };

  const getProviderBadge = () => {
    if (!user?.providerData || user.providerData.length === 0) return null;
    
    const provider = user.providerData[0];
    if (provider.providerId === 'google.com') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Google</Badge>;
    } else if (provider.providerId === 'password') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Email</Badge>;
    } else if (provider.providerId === 'phone') {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Phone</Badge>;
    }
    return <Badge variant="secondary">{provider.providerId}</Badge>;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account and profile information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and profile information
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.photoURL || undefined} alt="Profile picture" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Profile Picture</p>
                      <p className="text-xs text-muted-foreground">
                        {user.photoURL ? 'Synced from authentication provider' : 'No profile picture set'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Enter your display name"
                          className="pl-10"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm">{user.displayName || 'Not set'}</p>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <div className="pl-10 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.emailVerified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed here. Use your provider's settings.
                    </p>
                  </div>

                  {/* Phone Number */}
                  {user.phoneNumber && (
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <div className="pl-10 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm">{user.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Information Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Type</span>
                    {getProviderBadge()}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Member since</p>
                        <p className="text-sm font-medium">{getJoinDate()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Last sign in</p>
                        <p className="text-sm font-medium">{getLastSignIn()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Verified</span>
                    {user.emailVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Two-Factor Auth</span>
                    <span className="text-xs text-muted-foreground">Via Provider</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    Security settings are managed by your authentication provider.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
};

export default Profile;