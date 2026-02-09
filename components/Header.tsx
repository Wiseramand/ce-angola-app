
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Menu, X, LogOut, LayoutDashboard, Radio, Lock, Tv } from 'lucide-react';
import Logo from './Logo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ to, children, icon: Icon, className = "" }: any) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-ministry-gold transition font-medium ${className}`}
    >
      {Icon && <Icon size={18} />}
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3 group">
              <Logo className="h-16 w-auto transition-transform group-hover:scale-105" />
              <div className="border-l border-gray-200 pl-3">
                <span className="font-display font-bold text-lg text-ministry-blue block leading-none">CHRIST EMBASSY</span>
                <span className="text-xs tracking-widest text-ministry-gold font-bold uppercase">Angola</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Início</NavLink>
            <NavLink to="/live-tv" icon={Tv} className="text-ministry-blue">Live TV</NavLink>
            <NavLink to="/founder">Fundador</NavLink>
            <NavLink to="/partnerships">Parcerias</NavLink>
            <NavLink to="/donations">Doações</NavLink>
            
            {/* Exclusive Menu Item */}
            <NavLink 
              to="/live" 
              icon={Lock} 
              className="bg-ministry-gold/10 text-ministry-gold rounded-xl mx-2 hover:bg-ministry-gold/20"
            >
              Acesso Exclusivo
            </NavLink>
            
            {user?.role === 'admin' && (
              <NavLink to="/admin" icon={LayoutDashboard}>Admin</NavLink>
            )}

            {user ? (
              <div className="flex items-center ml-4 space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-xl transition group">
                  <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-ministry-gold group-hover:scale-105 transition">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-ministry-blue text-white text-xs font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-ministry-gold">{user.fullName.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 transition"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link to="/login" className="px-5 py-2 text-ministry-blue font-semibold hover:text-ministry-gold transition">
                  Entrar
                </Link>
                <Link to="/register" className="px-5 py-2 bg-ministry-blue text-white rounded-lg font-semibold hover:bg-opacity-90 transition shadow-md shadow-blue-900/10">
                  Registar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-ministry-blue hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/">Início</NavLink>
            <NavLink to="/live-tv" icon={Tv}>Live TV</NavLink>
            <NavLink to="/founder">Fundador</NavLink>
            <NavLink to="/partnerships">Parcerias</NavLink>
            <NavLink to="/donations">Doações</NavLink>
            <NavLink to="/live" icon={Lock} className="text-ministry-gold font-bold">Acesso Exclusivo</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin">Dashboard Admin</NavLink>}
            {user && <NavLink to="/profile">Meu Perfil</NavLink>}
          </div>
          <div className="px-4 pt-4 border-t border-gray-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-ministry-blue flex items-center justify-center text-white font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-700">{user.fullName}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-500 flex items-center space-x-1">
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" className="px-4 py-2 text-center text-ministry-blue font-bold border border-gray-100 rounded-lg">Entrar</Link>
                <Link to="/register" className="px-4 py-2 text-center bg-ministry-blue text-white rounded-lg font-bold">Registar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
