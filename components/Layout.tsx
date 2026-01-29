import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Lock, Package } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { getAppConfig } from '../services/db';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Check for custom logo on mount and location change (to catch updates from admin panel)
  useEffect(() => {
    const fetchLogo = async () => {
      const config = await getAppConfig();
      if (config?.logoUrl) setCustomLogo(config.logoUrl);
    };
    fetchLogo();
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const navClass = (path: string) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive(path)
      ? 'bg-blue-100 text-blue-900 font-medium'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const mobileNavClass = (path: string) =>
    `flex items-center space-x-3 px-4 py-3 text-lg font-medium border-l-4 ${isActive(path)
      ? 'border-blue-600 bg-blue-50 text-blue-900'
      : 'border-transparent text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/menu" className="flex items-center space-x-2" onClick={closeMenu}>
              {customLogo ? (
                <img src={customLogo} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <svg
                  viewBox="0 0 100 100"
                  className="h-10 w-10 text-blue-700"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Silhouette approximation of a fluffy terrier/schnauzer */}
                  <path d="M35,25 C30,22 25,25 22,30 C20,33 18,38 20,42 C18,45 15,45 12,48 C10,50 10,55 12,58 C14,60 18,60 18,60 L20,80 C20,85 25,88 30,88 C35,88 38,85 38,80 L40,65 C45,68 55,68 60,65 C65,75 70,80 75,80 C80,80 82,75 80,70 C78,65 72,55 65,50 C68,45 68,35 60,30 C55,27 45,27 40,28 C42,22 40,18 35,25 Z M70,25 C72,22 75,22 78,25 C80,27 80,30 78,32 C75,35 72,35 70,32 C68,30 68,27 70,25 Z" />
                  <path d="M25,30 C28,28 32,28 35,30 C34,35 30,35 25,30 Z" opacity="0.3" />
                </svg>
              )}
              <span className="text-xl font-bold text-gray-900 tracking-tight">DINAMO</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-4">
              <Link to="/menu" className={navClass('/menu')}>
                <span>Menú</span>
              </Link>
              <Link to="/my-orders" className={navClass('/my-orders')}>
                <span>Mis Pedidos</span>
              </Link>
              <Link to="/tracking" className={navClass('/tracking')}>
                <span>Tracking</span>
              </Link>
            </nav>

            {/* Cart & Mobile Toggle */}
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-700 transition-colors">
                <ShoppingBag className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button onClick={toggleMenu} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 fixed w-full z-30 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col py-2">
            <Link to="/menu" className={mobileNavClass('/menu')} onClick={closeMenu}>
              <div className="w-5 h-5 bg-blue-700 rounded-full" />
              <span>Menú</span>
            </Link>
            <Link to="/my-orders" className={mobileNavClass('/my-orders')} onClick={closeMenu}>
              <Package className="w-5 h-5" />
              <span>Mis Pedidos</span>
            </Link>
            <Link to="/tracking" className={mobileNavClass('/tracking')} onClick={closeMenu}>
              <Search className="w-5 h-5" />
              <span>Tracking</span>
            </Link>
            <Link to="/cart" className={mobileNavClass('/cart')} onClick={closeMenu}>
              <ShoppingBag className="w-5 h-5" />
              <span>Carrito ({totalItems})</span>
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} DINAMO. Todos los derechos reservados.</p>

          {/* Discreet Admin Link */}
          <Link to="/admin/login" className="flex items-center gap-1 hover:text-blue-600 transition-colors opacity-60 hover:opacity-100">
            <Lock className="w-3 h-3" />
            <span>Acceso Administrativo</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Layout;