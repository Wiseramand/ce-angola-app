import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';
import { Menu, X, LogOut, Shield, Video, User as UserIcon, Heart, UserCog, Lock } from 'lucide-react';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ page, label, icon: Icon }: { page: string; label: string; icon?: any }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
        currentPage === page 
          ? 'text-blue-900 font-bold bg-blue-50' 
          : 'text-gray-600 hover:text-blue-900 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size={18} />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
              <Logo className="h-12 w-12 drop-shadow-sm" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-blue-900 leading-none">Christ Embassy</h1>
                <p className="text-xs text-gray-500 font-medium tracking-widest">ANGOLA</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink page="home" label="Home" />
              <NavLink page="live" label="Live Stream" icon={Video} />
              <NavLink page="private-live" label="Live Programs" icon={Lock} />
              <NavLink page="partnership" label="Partnership" icon={Heart} />
              
              {/* Admin Quick Link (Icon only) */}
              {!user && (
                 <button 
                    onClick={() => onNavigate('admin-login')} 
                    className="text-gray-400 hover:text-blue-900 p-2 rounded-full hover:bg-gray-100 transition-all"
                    title="Admin Portal"
                 >
                    <Shield size={18} />
                 </button>
              )}
              
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <button 
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900">
                        <UserIcon size={16} />
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </button>

                  {user.role === UserRole.ADMIN && (
                    <Button variant="outline" onClick={() => onNavigate('admin-dashboard')} className="px-3 py-1 text-sm h-8">
                      <Shield size={14} className="mr-1" /> Dashboard
                    </Button>
                  )}
                  <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <NavLink page="login" label="Login" />
                  <Button onClick={() => onNavigate('register')} className="px-5 py-2 text-sm">Join Us</Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-blue-900"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-3 shadow-xl">
            <NavLink page="home" label="Home" />
            <NavLink page="live" label="Live Stream" icon={Video} />
            <NavLink page="private-live" label="Live Programs" icon={Lock} />
            <NavLink page="partnership" label="Partnership" icon={Heart} />
            {user ? (
              <>
                <div className="h-px bg-gray-100 my-2"></div>
                <NavLink page="profile" label="My Profile" icon={UserCog} />
                {user.role === UserRole.ADMIN && <NavLink page="admin-dashboard" label="Admin Dashboard" icon={Shield} />}
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink page="login" label="Login" />
                <NavLink page="admin-login" label="Admin Portal" icon={Shield} />
                <Button onClick={() => { onNavigate('register'); setIsMobileMenuOpen(false); }} className="w-full mt-2">
                  Join Us
                </Button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-10 w-10 brightness-0 invert opacity-90" />
              <h3 className="text-xl font-bold">Christ Embassy</h3>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Taking the divine presence of God to the nations of the world and demonstrating the character of the Holy Spirit.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => onNavigate('live')} className="hover:text-white">Live Service</button></li>
              <li><button onClick={() => onNavigate('partnership')} className="hover:text-white">Partnership</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-blue-200">Luanda, Angola</p>
            <p className="text-sm text-blue-200 mt-2">info@christembassyangola.org</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-blue-900 flex flex-col md:flex-row justify-between items-center text-xs text-blue-400">
          <p>© 2024 Christ Embassy Angola. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <button onClick={() => onNavigate('admin-login')} className="hover:text-white flex items-center gap-1 transition-colors">
               <Shield size={12} /> Admin Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};