import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, User, Settings, LogOut, Shield, Download, CheckCheck, 
  Wrench, AlertTriangle, FileText, ChevronDown, X, Menu, CheckCircle2,
  Clock, Laptop
} from 'lucide-react';

const Header = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'maintenance',
      title: 'Lenovo L14 Display Repair Logged',
      desc: 'Skyeagle Technologies submitted invoice STI/2025-26/0085 for Syed (₹8,529).',
      time: '10 mins ago',
      read: false,
      icon: Wrench,
      color: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    {
      id: 2,
      type: 'memo',
      title: 'Handover Memo Signed',
      desc: 'Signed Memo attached for MacBook Pro 16" (AST-1001) assigned to Sarah Jenkins.',
      time: '1 hour ago',
      read: false,
      icon: FileText,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      id: 3,
      type: 'stock',
      title: 'SIM Card Inventory Update',
      desc: '4 SIM cards currently available in IT Stock ready for allocation.',
      time: '3 hours ago',
      read: false,
      icon: AlertTriangle,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  ]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('itam_is_logged_in');
    } catch (e) {}
    setIsProfileMenuOpen(false);
    window.location.href = '/login';
  };

  const userEmail = (() => {
    try { return localStorage.getItem('itam_user_email') || 'admin@company.com'; } catch (e) { return 'admin@company.com'; }
  })();

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-white border-b border-gray-200 shadow-xs z-30 relative text-xs">
      
      {/* Left Portal Identity Header */}
      <div className="flex items-center flex-1">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden mr-3 p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-900 uppercase font-sans">
            Trescon IT Asset Portal
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold rounded-full border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* Right Header Navigation & Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* ========================================================================= */}
        {/* 1. NOTIFICATIONS BELL CENTER */}
        {/* ========================================================================= */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(prev => !prev);
              setIsProfileMenuOpen(false);
            }}
            className="relative p-2.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-200 cursor-pointer active:scale-95"
            title="System Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white font-mono text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-300" />
                  <span className="font-extrabold text-xs tracking-wider">System Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto bg-gray-50/40">
                {notifications.map((n) => {
                  const IconComp = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-blue-50/60 ${
                        !n.read ? 'bg-blue-50/30' : 'bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${n.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-gray-900 text-xs">{n.title}</h4>
                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Panel Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/maintenance');
                  }}
                  className="w-full py-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  View All Maintenance Tickets & Log →
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. ADMIN USER PROFILE DROPDOWN MENU */}
        {/* ========================================================================= */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen(prev => !prev);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200 cursor-pointer active:scale-95"
            title="Account Menu"
          >
            <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center font-extrabold text-sm shadow-xs border border-primary-dark">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="font-extrabold text-gray-900 leading-tight">Admin User</p>
              <p className="text-[10px] text-gray-500 font-medium">IT Administrator</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-primary' : ''}`} />
          </button>

          {/* User Account Menu Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Account Card Header */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400 text-indigo-950 font-extrabold flex items-center justify-center text-base shadow-sm">
                    A
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-extrabold text-xs text-white truncate">Admin User</h4>
                    <p className="text-[11px] text-cyan-200 font-mono truncate">{userEmail}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="px-2.5 py-0.5 bg-cyan-400/20 text-cyan-300 text-[10px] font-extrabold rounded-md border border-cyan-400/30 inline-block">
                    🛡️ System Administrator
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="p-2 space-y-1 bg-white">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:text-primary hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  Account & System Settings
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Export Data Backup (JSON)
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  Roles & System Permissions
                </button>
              </div>

              {/* Logout Button */}
              <div className="p-2 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out / Logout
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
