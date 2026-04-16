import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, LayoutDashboard, Home } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Report Lost', path: '/report/lost', icon: PlusCircle },
    { name: 'Report Found', path: '/report/found', icon: PlusCircle },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Search className="h-6 w-6 text-green-500" />
              <span className="font-bold text-xl tracking-tight text-white">FindIt</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "border-green-500 text-white" 
                        : "border-transparent text-slate-300 hover:border-slate-300 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu (simplified for now) */}
      <div className="md:hidden border-t border-slate-800 bg-slate-900 overflow-x-auto">
        <div className="flex space-x-4 px-4 py-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[72px] text-xs font-medium transition-colors",
                  isActive ? "text-green-500" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
