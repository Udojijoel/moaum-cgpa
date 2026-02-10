import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in and is admin
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user is admin
        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          // Not an admin, sign them out from admin context
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validation = signInSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) {
        toast.error('Invalid admin credentials');
        setIsSubmitting(false);
        return;
      }

      // Check if user has admin role
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: data.user.id,
        _role: 'admin'
      });

      if (!isAdmin) {
        // Sign out if not admin
        await supabase.auth.signOut();
        toast.error('Access denied. Admin privileges required.');
        setIsSubmitting(false);
        return;
      }

      toast.success('Welcome, Admin!');
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription className="mt-2">
              Restricted access - administrators only
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Student Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
