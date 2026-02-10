import { GraduationCap, LayoutDashboard, Calculator, TrendingUp, Target, FileText, Menu, X, Settings, ShieldCheck, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calculator', label: 'Calculator', icon: Calculator },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'prediction', label: 'Prediction', icon: Target },
  { id: 'transcript', label: 'Transcript', icon: FileText },
];

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
  isAdmin?: boolean;
  onSignOut?: () => void;
}

export const TopNavigation = ({ activeTab, onTabChange, userName, isAdmin, onSignOut }: TopNavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      {/* University Banner */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight font-serif text-primary-foreground">
                Reverend Father Moses Orshio Adasu University
              </h1>
              <p className="text-sm text-primary-foreground/80">CGPA Calculator & Academic Records</p>
            </div>
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                      {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">{userName || 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-md transition-colors text-primary-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-primary/95 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 py-2 px-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'nav-link flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10',
                  activeTab === item.id && 'nav-link-active text-accent bg-white/5'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div
            className={cn(
              'md:hidden overflow-hidden transition-all duration-300',
              mobileMenuOpen ? 'max-h-[500px] py-3' : 'max-h-0'
            )}
          >
            <div className="flex flex-col gap-1 px-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                    activeTab === item.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Mobile User Menu */}
              <div className="border-t border-white/10 mt-2 pt-2">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
                      {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-primary-foreground">{userName || 'Account'}</span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
                >
                  <Settings className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    onSignOut?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-destructive-foreground hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
