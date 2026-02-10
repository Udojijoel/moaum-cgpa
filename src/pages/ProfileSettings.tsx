import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L'];

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  
  const [matricNumber, setMatricNumber] = useState('');
  const [level, setLevel] = useState('');
  const [admissionYear, setAdmissionYear] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setMatricNumber(profile.matric_number || '');
      setLevel(profile.level || '');
      setAdmissionYear(profile.admission_year || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          matric_number: matricNumber || null,
          level: level || null,
          admission_year: admissionYear || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/10 border-2 border-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif">Profile Settings</h1>
              <p className="text-sm text-primary-foreground/80">Manage your academic profile</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Personal Info - Read Only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                This information was set during registration
              </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Full Name</Label>
                <div className="p-3 bg-muted/50 rounded-md text-foreground">
                  {profile?.full_name || '—'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="p-3 bg-muted/50 rounded-md text-foreground">
                  {user?.email || '—'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Gender</Label>
                <div className="p-3 bg-muted/50 rounded-md text-foreground capitalize">
                  {profile?.gender || '—'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Faculty</Label>
                <div className="p-3 bg-muted/50 rounded-md text-foreground">
                  {profile?.faculty || '—'}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-muted-foreground">Department</Label>
                <div className="p-3 bg-muted/50 rounded-md text-foreground">
                  {profile?.department || '—'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable Academic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <GraduationCap className="w-5 h-5 text-primary" />
                Academic Information
              </CardTitle>
              <CardDescription>
                Update your academic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricNumber">Matric Number</Label>
                  <Input
                    id="matricNumber"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., RFMOAU/SCI/CS/19/001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Current Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admissionYear">Admission Year</Label>
                <Input
                  id="admissionYear"
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(e.target.value)}
                  placeholder="e.g., 2019/2020"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;
