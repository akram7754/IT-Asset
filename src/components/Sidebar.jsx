import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  Users,
  Briefcase,
  Wrench,
  FileBarChart,
  Settings,
  LogOut,
  X,
  ShoppingBag,
  Cpu
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isMobileMenuOpen, onCloseMobileMenu }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Assets', path: '/assets', icon: Monitor },
    { name: 'Vendors', path: '/vendors', icon: Briefcase },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-64 bg-primary text-white">
      <div className="flex items-center justify-between h-20 border-b border-primary-dark px-4">
        <div className="flex items-center">
          <Monitor className="w-6 h-6 mr-2 text-cyan-300 flex-shrink-0" />
          <h1 className="text-xl font-extrabold tracking-wider text-white">Trescon</h1>
        </div>
        {onCloseMobileMenu && (
          <button
            onClick={onCloseMobileMenu}
            className="lg:hidden text-blue-200 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={() => onCloseMobileMenu && onCloseMobileMenu()}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-6 py-3 text-sm font-medium transition-colors hover:bg-primary-dark hover:text-white',
                    isActive ? 'bg-primary-dark text-white border-l-4 border-white' : 'text-blue-100 border-l-4 border-transparent'
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-primary-dark">
        <NavLink
          to="/login"
          onClick={() => onCloseMobileMenu && onCloseMobileMenu()}
          className="flex items-center px-6 py-3 text-sm font-medium text-blue-100 transition-colors hover:bg-primary-dark hover:text-white rounded-md"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-64 bg-primary text-white transition-all duration-300 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Slide-Over Drawer with Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileMenu}
          />
          <div className="relative z-10 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
