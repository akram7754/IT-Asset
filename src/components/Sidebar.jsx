import React from 'react';
import { NavLink } from 'react-router-dom';
import tresconLogo from '../assets/trescon-logo.png';
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
    { name: 'Vendors', path: '/vendors', icon: ShoppingBag },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-64 bg-[#00A3A6] text-white shadow-xl">
      <div className="flex items-center justify-between h-20 border-b border-[#008689] px-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-white p-1.5 rounded-xl shadow-md border border-white/30 flex items-center justify-center">
            <img src={tresconLogo} alt="Trescon 10 Years Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-white leading-tight">Trescon</h1>
            <span className="text-[10px] text-teal-100 font-extrabold block">10 Years Excellence</span>
          </div>
        </div>
        {onCloseMobileMenu && (
          <button
            onClick={onCloseMobileMenu}
            className="lg:hidden text-teal-100 hover:text-white p-1 rounded-md cursor-pointer"
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
                    'flex items-center px-6 py-3 text-xs font-bold transition-all duration-150',
                    isActive 
                      ? 'bg-[#007578] text-white border-l-4 border-lime-300 shadow-inner font-extrabold' 
                      : 'text-teal-50 hover:bg-[#00878a] hover:text-white border-l-4 border-transparent'
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
      <div className="p-4 border-t border-[#008689]">
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem('itam_is_logged_in');
            } catch (e) {}
            if (onCloseMobileMenu) onCloseMobileMenu();
            window.location.href = '/login';
          }}
          className="w-full flex items-center px-6 py-2.5 text-xs font-extrabold text-teal-50 hover:bg-[#007578] hover:text-white transition-colors rounded-xl cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3 text-teal-200" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-64 bg-[#00A3A6] text-white transition-all duration-300 flex-shrink-0 shadow-lg">
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
