import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Monitor, Users, Building2, Wrench, X, Menu } from 'lucide-react';
import { assetsData, employeesData, vendorsData, maintenanceTasksData } from '../data/mockData';

const Header = ({ onToggleMobileMenu }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const matchedAssets = query
    ? assetsData.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.id.toLowerCase().includes(query) ||
          a.serial.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query)
      )
    : [];

  const matchedEmployees = query
    ? employeesData.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.role.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query)
      )
    : [];

  const matchedVendors = query
    ? vendorsData.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.type.toLowerCase().includes(query) ||
          v.contact.toLowerCase().includes(query)
      )
    : [];

  const matchedMaintenance = query
    ? maintenanceTasksData.filter(
        (m) =>
          m.asset.toLowerCase().includes(query) ||
          m.issue.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query)
      )
    : [];

  const totalMatches =
    matchedAssets.length + matchedEmployees.length + matchedVendors.length + matchedMaintenance.length;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    navigate(`/assets?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectResult = (path) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-white border-b border-gray-200 shadow-sm z-20 relative">
      <div className="flex items-center flex-1">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden mr-3 p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-800 uppercase font-sans">
            Trescon IT Asset Portal
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-300">
            System Online
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors">
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <Bell className="w-6 h-6" />
        </button>
        <div className="relative flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full">
            <User className="w-6 h-6" />
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-semibold text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">IT Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

