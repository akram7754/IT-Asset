import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Plus, ExternalLink, Mail, Phone, MapPin, X, Check, Trash2, Edit2, 
  Building2, DollarSign, Star, Award, Package, ShieldCheck, 
  ChevronLeft, ChevronRight, Filter, AlertCircle, Calendar, User, FileText, Download, Upload,
  Wrench, Laptop, History, AlertTriangle, Hash
} from 'lucide-react';
import { vendorsData as initialVendorsData } from '../data/mockData';

const VENDORS_KEY = 'itam_vendors_table_v4';

// Default Vendors Data with Laptop Name & Serial Number
const defaultVendors = [
  {
    id: 'VND-001',
    date: '2026-02-05',
    user: 'Syed',
    laptopName: 'Lenovo ThinkPad X1',
    laptopSerial: 'LNV-SYD-9981',
    category: 'Lenovo Laptop Display Change',
    name: 'Skyeagle Technologies',
    price: '8,529',
    invoice: 'STI/2025-26/0085',
    invoiceFileName: 'STI_2025_26_0085_Display_Invoice.pdf',
    contact: 'Syed',
    email: 'syed@skyeagle.com',
    phone: '+91 9876543210',
    address: 'Bangalore, India',
    status: 'Active'
  },
  {
    id: 'VND-002',
    date: '2025-11-12',
    user: 'Syed',
    laptopName: 'Lenovo ThinkPad X1',
    laptopSerial: 'LNV-SYD-9981',
    category: 'Battery Replacement & Power IC Repair',
    name: 'Skyeagle Technologies',
    price: '3,921',
    invoice: 'STI/2025-26/0012',
    invoiceFileName: 'Syed_Battery_Repair_Bill.pdf',
    contact: 'Syed',
    email: 'syed@skyeagle.com',
    phone: '+91 9876543210',
    address: 'Bangalore, India',
    status: 'Active'
  },
  {
    id: 'VND-003',
    date: '2026-01-15',
    user: 'Charan',
    laptopName: 'Dell Latitude 3480',
    laptopSerial: 'DEL-CHR-1092',
    category: 'Hardware Supplier',
    name: 'Dell Technologies',
    price: '1,250',
    invoice: 'INV-DELL-8821',
    invoiceFileName: 'Dell_Tax_Invoice_2026.pdf',
    contact: 'Alex Rivera',
    email: 'alex@dell-partners.com',
    phone: '+1 (800) 123-4567',
    address: 'Bangalore, India',
    status: 'Active'
  },
  {
    id: 'VND-004',
    date: '2026-02-01',
    user: 'Sam Chen',
    laptopName: 'MacBook Pro 16"',
    laptopSerial: 'C02YK1234',
    category: 'Laptop Supplier',
    name: 'Apple Enterprise',
    price: '2,400',
    invoice: 'INV-APP-7712',
    invoiceFileName: 'Apple_Corporate_Invoice.pdf',
    contact: 'Sam Chen',
    email: 'sam.c@apple-ent.com',
    phone: '+1 (800) 234-5678',
    address: 'Cupertino, CA, USA',
    status: 'Active'
  }
];

const VendorManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(queryFromUrl);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Comprehensive Vendor Data Load (Checks all legacy & current keys)
  const [vendors, setVendors] = useState(() => {
    try {
      const keysToScan = [
        'itam_vendors_table_v4',
        'itam_vendors_table_v3',
        'itam_vendors_table_v2',
        'itam_vendors',
        'itam_vendors_v1',
        'itam_vendor_records'
      ];
      for (const k of keysToScan) {
        const saved = localStorage.getItem(k);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter(v => v && typeof v === 'object' && (v.name || v.vendorName));
            if (valid.length > 0) return valid;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load vendors:', e);
    }
    return defaultVendors;
  });

  // UI Modal States
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [viewingUserHistory, setViewingUserHistory] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('10');

  // Form Initial State
  const initialVendorState = {
    date: new Date().toISOString().split('T')[0],
    user: 'Syed',
    laptopName: 'Lenovo ThinkPad X1',
    laptopSerial: 'LNV-SYD-9981',
    category: 'Lenovo Laptop Display Change',
    name: 'Skyeagle Technologies',
    price: '8,529',
    invoice: `STI/2025-26/${Math.floor(1000 + Math.random() * 9000)}`,
    invoiceFile: '',
    invoiceFileName: '',
    contact: '',
    email: '',
    phone: '',
    address: 'Bangalore, India',
    status: 'Active'
  };

  const [newVendor, setNewVendor] = useState(initialVendorState);

  // LocalStorage Persist Effect across primary and backup keys
  useEffect(() => { 
    try { 
      const dataStr = JSON.stringify(vendors);
      localStorage.setItem(VENDORS_KEY, dataStr);
      localStorage.setItem('itam_vendors', dataStr);
      localStorage.setItem('itam_vendors_backup', dataStr);
    } catch (e) {
      console.error('Failed to save vendors:', e);
    } 
  }, [vendors]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Vendor Add Handler
  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!newVendor.name) return;
    const vendorToAdd = { 
      ...newVendor, 
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      contact: newVendor.contact || newVendor.user
    };
    setVendors([vendorToAdd, ...vendors]);
    setIsAddVendorModalOpen(false);
    setNewVendor(initialVendorState);
    showToast(`Vendor Record for "${vendorToAdd.user}" added successfully!`);
  };

  // Vendor Edit Handler
  const handleSaveEditVendor = (e) => {
    e.preventDefault();
    if (!editingVendor) return;
    setVendors(vendors.map(v => v.id === editingVendor.id ? editingVendor : v));
    setEditingVendor(null);
    showToast(`Vendor Record "${editingVendor.name}" updated successfully!`);
  };

  // Vendor Delete Handler
  const handleDeleteVendor = (id, name) => {
    if (window.confirm(`Are you sure you want to delete record for "${name}" (${id})?`)) {
      setVendors(vendors.filter(v => v.id !== id));
      showToast(`Record deleted.`);
    }
  };

  // Filtering Logic
  const filteredVendors = vendors.filter(v => {
    if (!v) return false;
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (v.name || '').toLowerCase().includes(search) ||
      (v.laptopName || '').toLowerCase().includes(search) ||
      (v.laptopSerial || '').toLowerCase().includes(search) ||
      (v.category || v.type || '').toLowerCase().includes(search) ||
      (v.user || '').toLowerCase().includes(search) ||
      (v.invoice || '').toLowerCase().includes(search) ||
      (v.contact || '').toLowerCase().includes(search) ||
      (v.id || '').toLowerCase().includes(search);

    const matchesCategory = selectedCategory === 'All' || (v.category || v.type) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate Metrics
  const totalSpend = vendors.reduce((acc, v) => {
    const p = parseFloat((v.price || '0').replace(/[^0-9.]/g, '')) || 0;
    return acc + p;
  }, 0);

  // Get User's Laptop History Math
  const getUserLaptopHistory = (username) => {
    const targetUser = (username || 'Syed').trim().toLowerCase();
    const userRecords = vendors.filter(v => 
      (v.user || v.contact || '').trim().toLowerCase() === targetUser
    );

    const totalProblems = userRecords.length;
    const totalSpent = userRecords.reduce((acc, v) => {
      const val = parseFloat((v.price || '0').replace(/[^0-9.]/g, '')) || 0;
      return acc + val;
    }, 0);

    const laptopName = userRecords[0]?.laptopName || 'Lenovo ThinkPad X1';
    const laptopSerial = userRecords[0]?.laptopSerial || 'LNV-SYD-9981';

    return {
      username: username || 'Syed',
      laptopName,
      laptopSerial,
      totalProblems,
      totalSpent,
      records: userRecords
    };
  };

  // Pagination Math
  const totalPages = itemsPerPage === 'All' ? 1 : Math.ceil(filteredVendors.length / parseInt(itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const indexOfLastItem = itemsPerPage === 'All' ? filteredVendors.length : safeCurrentPage * parseInt(itemsPerPage);
  const indexOfFirstItem = itemsPerPage === 'All' ? 0 : indexOfLastItem - parseInt(itemsPerPage);
  const currentVendors = itemsPerPage === 'All' ? filteredVendors : filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  const getCategoryBadge = (type) => {
    switch (type) {
      case 'Hardware Supplier': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Software Provider': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Network Equipment': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Telecom & Cellular': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
    }
  };

  const activeUserHistoryData = viewingUserHistory ? getUserLaptopHistory(viewingUserHistory) : null;

  return (
    <div className="space-y-6 relative pb-12 text-xs">
      {/* TOAST BANNER */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 bg-white/20 rounded-full p-0.5" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-white/80 hover:text-white cursor-pointer">&times;</button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Vendor & Supplier Directory
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Track vendor invoices, laptop model names, serial numbers, repair costs, and problem history
          </p>
        </div>
        <button 
          onClick={() => setIsAddVendorModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add New Vendor Record
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Vendors</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{vendors.length}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
              Active Records
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-primary rounded-xl border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Invoiced Value</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">${totalSpend.toLocaleString()}</h3>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
              Procurement & Maintenance Spend
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor Bills Logged</p>
            <h3 className="text-2xl font-extrabold text-purple-900 mt-1">{vendors.length} Bills</h3>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-1">
              Tax Invoices & Uploads
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* CLICKABLE SYED LAPTOP HISTORY CARD */}
        <div 
          onClick={() => setViewingUserHistory('Syed')}
          className="p-5 bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-2xl shadow-md border border-indigo-700 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all"
          title="Click to view Syed's Laptop Problem & Repair Financial History"
        >
          <div>
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-cyan-300" />
              Syed's Laptop History
            </p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              ₹{getUserLaptopHistory('Syed').totalSpent.toLocaleString()}
            </h3>
            <span className="text-[11px] font-extrabold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30 inline-block mt-1">
              ⚠️ {getUserLaptopHistory('Syed').totalProblems} Times Got Problem
            </span>
          </div>
          <div className="p-3 bg-white/10 text-cyan-300 rounded-xl border border-white/20">
            <History className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABLE CARD - DATE | USER | LAPTOP NAME / SERIAL NUMBER | CATEGORY / TYPE | VENDOR NAME | VENDOR INVOICE | PRICE | ACTIONS */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="font-bold text-gray-800 text-sm">Vendor Records & Bill Catalog</h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200/80 px-2.5 py-0.5 rounded-full font-mono">
              {filteredVendors.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search date, user, laptop name, serial number, vendor..."
                className="w-full py-1.5 pl-9 pr-3 text-xs border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600">
            <thead className="text-[11px] text-gray-700 uppercase bg-gray-100/70 border-b border-gray-200 font-bold tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Date</th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">User</th>
                <th scope="col" className="px-5 py-3.5 whitespace-nowrap">Laptop Name / Serial Number</th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Category / Type</th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Vendor Name</th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Vendor Invoice</th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Price</th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currentVendors.length > 0 ? (
                currentVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* 1. Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-gray-800 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {vendor.date || '2026-02-05'}
                      </div>
                    </td>

                    {/* 2. User */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => setViewingUserHistory(vendor.user || vendor.contact || 'Syed')}
                        className="flex items-center gap-2 font-bold text-blue-900 hover:text-blue-600 transition-colors cursor-pointer group"
                        title={`Click to view ${vendor.user || 'User'}'s complete Laptop History & Problem Log`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="underline decoration-blue-300 underline-offset-2">
                          {vendor.user || vendor.contact || 'Syed'}
                        </span>
                      </button>
                    </td>

                    {/* 3. Laptop Name / Serial Number */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{vendor.laptopName || 'Lenovo ThinkPad X1'}</div>
                          <span className="font-mono text-[10px] text-indigo-700 font-bold bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                            S/N: {vendor.laptopSerial || 'LNV-SYD-9981'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 4. Category / Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md border ${getCategoryBadge(vendor.category || vendor.type)}`}>
                        {vendor.category || vendor.type || 'Hardware Supplier'}
                      </span>
                    </td>

                    {/* 5. Vendor Name */}
                    <td className="px-4 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shadow-2xs flex-shrink-0">
                          {vendor.name ? vendor.name.substring(0, 2).toUpperCase() : 'SK'}
                        </div>
                        <div>
                          <div>{vendor.name}</div>
                          <span className="font-mono text-[10px] text-gray-400 font-normal">({vendor.id})</span>
                        </div>
                      </div>
                    </td>

                    {/* 6. Vendor Invoice */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 font-mono text-[11px] font-bold rounded border border-gray-200">
                          {vendor.invoice || 'STI/2025-26/0085'}
                        </span>
                        <button
                          onClick={() => setViewingInvoice(vendor)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                          title="View / Download Attached Vendor Bill PDF"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          View Bill
                        </button>
                      </div>
                    </td>

                    {/* 7. Price */}
                    <td className="px-4 py-3.5 font-mono font-extrabold text-emerald-700 whitespace-nowrap text-sm">
                      {vendor.price || '8,529'}
                    </td>

                    {/* 8. Actions (Contains Laptop History, Edit, and Delete) */}
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setViewingUserHistory(vendor.user || vendor.contact || 'Syed')}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer"
                        title="View Syed's Laptop Problem & Financial History"
                      >
                        <History className="w-3.5 h-3.5 inline mr-1" /> Laptop History
                      </button>
                      <button
                        onClick={() => setEditingVendor({ ...vendor })}
                        className="px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                        className="px-2 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 space-y-2">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="font-bold text-sm text-gray-700">No vendor records found matching search filters</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      Clear Search Filter
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredVendors.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600">
            <div>
              Showing <strong className="text-gray-900">{itemsPerPage === 'All' ? 1 : Math.min(indexOfFirstItem + 1, filteredVendors.length)}</strong> to{' '}
              <strong className="text-gray-900">{Math.min(indexOfLastItem, filteredVendors.length)}</strong> of{' '}
              <strong className="text-gray-900">{filteredVendors.length}</strong> vendor records
            </div>

            {itemsPerPage !== 'All' && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer font-medium"
                >
                  Previous
                </button>
                <span className="px-2 font-semibold text-gray-700">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 100% PERFECT FIT ULTRA-WIDE LAPTOP HISTORY MODAL */}
      {/* ========================================================================= */}
      {viewingUserHistory && activeUserHistoryData && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-[90] p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] lg:max-w-[92vw] xl:max-w-7xl overflow-hidden flex flex-col border border-gray-100 max-h-[95vh]">
            {/* Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md text-cyan-300 border border-white/20">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg sm:text-xl leading-tight">
                    {activeUserHistoryData.username}'s Laptop History & Financial Spend Log
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5 font-mono">
                    Device: <strong className="text-white">{activeUserHistoryData.laptopName}</strong> • S/N: <strong className="text-cyan-300">{activeUserHistoryData.laptopSerial}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingUserHistory(null)} 
                className="p-1 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-gray-50/50">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-2xs border border-amber-200 space-y-1">
                  <span className="text-amber-800 font-bold text-[11px] block uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Total Times Got Problem
                  </span>
                  <p className="text-2xl font-extrabold text-amber-950 font-mono">
                    {activeUserHistoryData.totalProblems} Times
                  </p>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                    Repairs & Hardware Serviced
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-2xs border border-emerald-200 space-y-1">
                  <span className="text-emerald-800 font-bold text-[11px] block uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Amount Spent
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-700 font-mono">
                    ₹{activeUserHistoryData.totalSpent.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    Cumulative Laptop Repair Bills
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-2xs border border-blue-200 space-y-1">
                  <span className="text-blue-800 font-bold text-[11px] block uppercase tracking-wider flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-blue-600" /> Laptop Serial Number
                  </span>
                  <p className="text-base font-extrabold text-blue-950 font-mono">
                    {activeUserHistoryData.laptopSerial}
                  </p>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                    {activeUserHistoryData.laptopName}
                  </span>
                </div>
              </div>

              {/* Problem & Repair Chronological Log Table */}
              <div className="bg-white rounded-xl shadow-2xs border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-100/70 border-b border-gray-200 flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    Itemized Repair Bills Timeline ({activeUserHistoryData.records.length} Events)
                  </h4>
                </div>

                <div className="w-full">
                  <table className="w-full text-left text-xs table-auto">
                    <thead className="text-[11px] text-gray-700 uppercase bg-gray-50 border-b border-gray-200 font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-bold">Date</th>
                        <th className="px-4 py-3 font-bold">Laptop Name / Serial Number</th>
                        <th className="px-4 py-3 font-bold">Problem / Service Category</th>
                        <th className="px-4 py-3 font-bold">Vendor Partner</th>
                        <th className="px-4 py-3 font-bold">Vendor Invoice #</th>
                        <th className="px-4 py-3 text-right font-bold">Repair Cost</th>
                        <th className="px-4 py-3 text-center font-bold">Bill Copy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeUserHistoryData.records.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors font-medium">
                          <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                            📅 {rec.date || '2026-02-05'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-bold text-gray-900">{rec.laptopName || 'Lenovo ThinkPad X1'}</div>
                            <span className="font-mono text-[10px] text-indigo-700 font-bold">S/N: {rec.laptopSerial || 'LNV-SYD-9981'}</span>
                          </td>
                          <td className="px-4 py-3 text-blue-950 font-bold">
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-md inline-block text-xs">
                              🔧 {rec.category || rec.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                            {rec.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-700 font-bold whitespace-nowrap">
                            {rec.invoice || 'STI/2025-26/0085'}
                          </td>
                          <td className="px-4 py-3 font-mono font-extrabold text-emerald-700 text-right whitespace-nowrap text-sm">
                            ₹{rec.price || '8,529'}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => setViewingInvoice(rec)}
                              className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md cursor-pointer inline-flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" /> View Bill
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
              <button
                onClick={() => {
                  setViewingUserHistory(null);
                  setIsAddVendorModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Repair Record for {activeUserHistoryData.username}
              </button>
              <button
                onClick={() => setViewingUserHistory(null)}
                className="px-6 py-2 text-xs font-extrabold text-white bg-indigo-900 hover:bg-indigo-950 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR INVOICE & BILL PREVIEW MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-300" />
                <div>
                  <h3 className="font-extrabold text-base">Vendor Bill & Tax Invoice Details</h3>
                  <span className="text-[11px] text-blue-200 font-mono">Invoice #{viewingInvoice.invoice || 'STI/2025-26/0085'}</span>
                </div>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="text-blue-200 hover:text-white text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>
            <div className="p-6 space-y-4 bg-gray-50/50">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-400 block text-[11px]">Vendor Name:</span><strong className="text-gray-900 font-bold">{viewingInvoice.name}</strong></div>
                  <div><span className="text-gray-400 block text-[11px]">Date:</span><strong className="text-gray-900 font-mono">{viewingInvoice.date || '2026-02-05'}</strong></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div><span className="text-gray-400 block text-[11px]">Laptop Name / Serial Number:</span><strong className="text-gray-900">{viewingInvoice.laptopName || 'Lenovo ThinkPad X1'} ({viewingInvoice.laptopSerial || 'LNV-SYD-9981'})</strong></div>
                  <div><span className="text-gray-400 block text-[11px]">Primary User:</span><strong className="text-gray-900">{viewingInvoice.user || viewingInvoice.contact || 'Syed'}</strong></div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-400 block text-[11px]">Total Price / Bill Value:</span>
                  <strong className="text-lg font-extrabold text-emerald-700 font-mono">₹{viewingInvoice.price || '8,529'}</strong>
                </div>
              </div>

              {/* Uploaded Bill Attachment Card */}
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <span className="font-mono text-xs text-blue-950 font-bold">
                      {viewingInvoice.invoiceFileName || `${viewingInvoice.invoice || 'Vendor'}_Bill_Copy.pdf`}
                    </span>
                  </div>
                  {viewingInvoice.invoiceFile ? (
                    <a
                      href={viewingInvoice.invoiceFile}
                      download={viewingInvoice.invoiceFileName || 'Vendor_Bill.pdf'}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Bill
                    </a>
                  ) : (
                    <button
                      onClick={() => alert(`Downloading vendor bill record for ${viewingInvoice.invoice}...`)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
              <button onClick={() => setViewingInvoice(null)} className="px-5 py-2 font-bold text-white bg-blue-900 rounded-xl cursor-pointer">Close Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL WITH LAPTOP NAME & SERIAL NUMBER */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Add New Vendor Record</h3>
              <button onClick={() => setIsAddVendorModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleAddVendor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={newVendor.date} 
                    onChange={e => setNewVendor({ ...newVendor, date: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">User *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Syed" 
                    value={newVendor.user} 
                    onChange={e => setNewVendor({ ...newVendor, user: e.target.value, contact: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              {/* LAPTOP NAME & LAPTOP SERIAL NUMBER */}
              <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-indigo-600" /> Laptop Name *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Lenovo ThinkPad X1" 
                    value={newVendor.laptopName} 
                    onChange={e => setNewVendor({ ...newVendor, laptopName: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" /> Serial Number (S/N) *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. LNV-SYD-9981" 
                    value={newVendor.laptopSerial} 
                    onChange={e => setNewVendor({ ...newVendor, laptopSerial: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono font-bold text-xs bg-white text-indigo-950 focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category / Problem Description *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Lenovo Laptop Display Change"
                    value={newVendor.category} 
                    onChange={e => setNewVendor({ ...newVendor, category: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs text-blue-900 focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vendor Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Skyeagle Technologies" 
                    value={newVendor.name} 
                    onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vendor Invoice # *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. STI/2025-26/0085" 
                    value={newVendor.invoice} 
                    onChange={e => setNewVendor({ ...newVendor, invoice: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹ / $) *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 8,529" 
                    value={newVendor.price} 
                    onChange={e => setNewVendor({ ...newVendor, price: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono font-bold text-emerald-700 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              {/* VENDOR BILL UPLOAD FIELD */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-2">
                <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  UPLOAD VENDOR BILL / TAX INVOICE COPY (PDF / IMAGE)
                </label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-blue-200">
                  <input
                    type="file"
                    id="add-vendor-bill-file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewVendor(prev => ({
                          ...prev,
                          invoiceFile: event.target.result,
                          invoiceFileName: file.name
                        }));
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />
                  <label 
                    htmlFor="add-vendor-bill-file" 
                    className="px-3.5 py-1.5 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Attach Vendor Bill / PDF
                  </label>
                  <span className="text-xs text-gray-700 font-mono truncate flex-1 font-semibold">
                    {newVendor.invoiceFileName ? newVendor.invoiceFileName : 'No bill file selected'}
                  </span>
                  {newVendor.invoiceFileName && (
                    <button
                      type="button"
                      onClick={() => setNewVendor(prev => ({ ...prev, invoiceFile: '', invoiceFileName: '' }))}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-1 cursor-pointer"
                    >
                      &times; Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddVendorModalOpen(false)} className="px-4 py-2 font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md cursor-pointer">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL WITH LAPTOP NAME & SERIAL NUMBER */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Edit Vendor Record ({editingVendor.id})</h3>
              <button onClick={() => setEditingVendor(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSaveEditVendor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editingVendor.date || '2026-02-05'} 
                    onChange={e => setEditingVendor({ ...editingVendor, date: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">User</label>
                  <input 
                    type="text" 
                    value={editingVendor.user || editingVendor.contact || ''} 
                    onChange={e => setEditingVendor({ ...editingVendor, user: e.target.value, contact: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              {/* LAPTOP NAME & LAPTOP SERIAL NUMBER */}
              <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-indigo-600" /> Laptop Name
                  </label>
                  <input 
                    type="text" 
                    value={editingVendor.laptopName || 'Lenovo ThinkPad X1'} 
                    onChange={e => setEditingVendor({ ...editingVendor, laptopName: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" /> Serial Number (S/N)
                  </label>
                  <input 
                    type="text" 
                    value={editingVendor.laptopSerial || 'LNV-SYD-9981'} 
                    onChange={e => setEditingVendor({ ...editingVendor, laptopSerial: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono font-bold text-xs bg-white text-indigo-950 focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category / Problem Description</label>
                  <input 
                    type="text"
                    required
                    value={editingVendor.category || editingVendor.type || ''} 
                    onChange={e => setEditingVendor({ ...editingVendor, category: e.target.value, type: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs text-blue-900 focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vendor Name</label>
                  <input 
                    type="text" 
                    value={editingVendor.name || ''} 
                    onChange={e => setEditingVendor({ ...editingVendor, name: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vendor Invoice #</label>
                  <input 
                    type="text" 
                    value={editingVendor.invoice || ''} 
                    onChange={e => setEditingVendor({ ...editingVendor, invoice: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price</label>
                  <input 
                    type="text" 
                    value={editingVendor.price || ''} 
                    onChange={e => setEditingVendor({ ...editingVendor, price: e.target.value })} 
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg font-mono font-bold text-emerald-700 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                  />
                </div>
              </div>

              {/* VENDOR BILL UPLOAD FIELD */}
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-2">
                <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  UPLOAD VENDOR BILL / TAX INVOICE COPY (PDF / IMAGE)
                </label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-blue-200">
                  <input
                    type="file"
                    id="edit-vendor-bill-file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setEditingVendor(prev => ({
                          ...prev,
                          invoiceFile: event.target.result,
                          invoiceFileName: file.name
                        }));
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />
                  <label 
                    htmlFor="edit-vendor-bill-file" 
                    className="px-3.5 py-1.5 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Attach Vendor Bill / PDF
                  </label>
                  <span className="text-xs text-gray-700 font-mono truncate flex-1 font-semibold">
                    {editingVendor.invoiceFileName ? editingVendor.invoiceFileName : 'No bill file selected'}
                  </span>
                  {editingVendor.invoiceFileName && (
                    <button
                      type="button"
                      onClick={() => setEditingVendor(prev => ({ ...prev, invoiceFile: '', invoiceFileName: '' }))}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-1 cursor-pointer"
                    >
                      &times; Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingVendor(null)} className="px-4 py-2 font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
