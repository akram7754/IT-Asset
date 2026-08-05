import React, { useState, useEffect } from 'react';
import { 
  Cpu, HardDrive, Battery, Plug, Monitor, Keyboard, Mouse, Search, Plus, 
  History, ArrowRightLeft, ShieldCheck, Check, X, AlertCircle, Filter, 
  Trash2, Edit2, Clock, ChevronRight, Package, User, FileText, ArrowUpRight
} from 'lucide-react';

const STORAGE_KEY = 'itam_components';
const HISTORY_KEY = 'itam_component_history';

// Sample Component Inventory Data
const initialComponents = [
  {
    id: 'CMP-RAM-001',
    type: 'RAM',
    serial: 'RAM000123',
    brand: 'Corsair',
    model: 'Vengeance DDR4',
    capacity: '8 GB',
    purchaseDate: '2026-01-01',
    vendor: 'Dell Technologies',
    cost: '₹3,600',
    warranty: '2028-01-01',
    status: 'In Stock',
    currentLocation: 'IT Inventory Room B',
    installedInAssetId: '',
    installedInAssetTag: '',
    currentEmployee: ''
  },
  {
    id: 'CMP-RAM-002',
    type: 'RAM',
    serial: 'RAM000124',
    brand: 'Kingston',
    model: 'Fury Impact DDR5',
    capacity: '16 GB',
    purchaseDate: '2026-02-10',
    vendor: 'Apple Enterprise',
    cost: '₹7,600',
    warranty: '2029-02-10',
    status: 'Installed',
    currentLocation: 'Assigned Device',
    installedInAssetId: 'AST-1003',
    installedInAssetTag: 'TGBS/B/L10',
    currentEmployee: 'Charan'
  },
  {
    id: 'CMP-SSD-001',
    type: 'SSD',
    serial: 'SSD998877',
    brand: 'Samsung',
    model: '980 PRO NVMe',
    capacity: '512 GB',
    purchaseDate: '2026-03-15',
    vendor: 'Microsoft AppSource',
    cost: '₹9,600',
    warranty: '2029-03-15',
    status: 'Installed',
    currentLocation: 'Assigned Device',
    installedInAssetId: 'AST-1001',
    installedInAssetTag: 'C02YK1234',
    currentEmployee: 'Sarah Jenkins'
  },
  {
    id: 'CMP-BAT-001',
    type: 'Battery',
    serial: 'BAT443322',
    brand: 'Dell Original',
    model: '6-Cell Lithium Ion',
    capacity: '86 Wh',
    purchaseDate: '2025-11-20',
    vendor: 'Dell Technologies',
    cost: '₹6,400',
    warranty: '2026-11-20',
    status: 'In Stock',
    currentLocation: 'IT Inventory Room B',
    installedInAssetId: '',
    installedInAssetTag: '',
    currentEmployee: ''
  }
];

// Initial Lifetime Movement History Log
const initialHistory = [
  {
    id: 'HST-101',
    componentSerial: 'RAM000123',
    componentType: 'RAM',
    capacity: '8 GB',
    date: '2026-01-01',
    event: 'Purchased from Dell Technologies',
    assetId: '',
    employee: '',
    technician: 'System Procure',
    reason: 'Initial Inventory Stocking'
  },
  {
    id: 'HST-102',
    componentSerial: 'RAM000123',
    componentType: 'RAM',
    capacity: '8 GB',
    date: '2026-01-10',
    event: 'Installed in Laptop AST-1003',
    assetId: 'AST-1003',
    employee: 'Charan',
    technician: 'John IT Engineer',
    reason: 'Initial Device Setup'
  },
  {
    id: 'HST-103',
    componentSerial: 'RAM000123',
    componentType: 'RAM',
    capacity: '8 GB',
    date: '2026-03-15',
    event: 'Removed from Laptop AST-1003 (Upgraded to 16GB)',
    assetId: 'AST-1003',
    employee: 'Charan',
    technician: 'System Admin',
    reason: 'Upgraded device to 16GB RAM'
  },
  {
    id: 'HST-104',
    componentSerial: 'RAM000123',
    componentType: 'RAM',
    capacity: '8 GB',
    date: '2026-03-15',
    event: 'Returned to Stock Inventory Room B',
    assetId: '',
    employee: '',
    technician: 'System Admin',
    reason: 'Available for re-assignment'
  }
];

const ComponentInventory = () => {
  const [components, setComponents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load components:', e);
    }
    return initialComponents;
  });

  const [historyLogs, setHistoryLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load component history:', e);
    }
    return initialHistory;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [viewingHistorySerial, setViewingHistorySerial] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const initialNewComponent = {
    type: 'RAM',
    serial: '',
    brand: '',
    model: '',
    capacity: '16 GB',
    purchaseDate: new Date().toISOString().split('T')[0],
    vendor: 'Dell Technologies',
    cost: '$85',
    warranty: '2028-12-31',
    status: 'In Stock',
    currentLocation: 'IT Inventory Room B'
  };

  const [newComponent, setNewComponent] = useState(initialNewComponent);

  // Install / Movement Form State
  const [installForm, setInstallForm] = useState({
    assetId: 'AST-1001',
    employeeName: 'Charan',
    technician: 'IT Support Admin',
    reason: 'Hardware Performance Upgrade',
    remarks: 'Upgraded system memory for high workload'
  });

  // Save components to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
    } catch (e) {
      console.error('Failed to save components:', e);
    }
  }, [components]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyLogs));
    } catch (e) {
      console.error('Failed to save component history:', e);
    }
  }, [historyLogs]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Component Handler
  const handleAddComponentSubmit = (e) => {
    e.preventDefault();
    if (!newComponent.serial || !newComponent.brand) return;

    const nextId = `CMP-${newComponent.type.substring(0, 3).toUpperCase()}-${String(components.length + 1).padStart(3, '0')}`;
    const compToAdd = {
      ...newComponent,
      id: nextId
    };

    // Add initial purchase history event
    const newHist = {
      id: `HST-${Date.now()}`,
      componentSerial: compToAdd.serial,
      componentType: compToAdd.type,
      capacity: compToAdd.capacity,
      date: compToAdd.purchaseDate,
      event: `Purchased from ${compToAdd.vendor}`,
      assetId: '',
      employee: '',
      technician: 'Procurement Team',
      reason: 'Initial Component Purchase'
    };

    setComponents([compToAdd, ...components]);
    setHistoryLogs([newHist, ...historyLogs]);
    setIsAddModalOpen(false);
    setNewComponent(initialNewComponent);
    showToast(`Component ${compToAdd.type} (${compToAdd.serial}) added to stock!`);
  };

  // Handle Install into Asset
  const handleInstallSubmit = (e) => {
    e.preventDefault();
    if (!selectedComponent) return;

    const updatedComp = {
      ...selectedComponent,
      status: 'Installed',
      currentLocation: 'Assigned Device',
      installedInAssetId: installForm.assetId,
      currentEmployee: installForm.employeeName
    };

    const newHist = {
      id: `HST-${Date.now()}`,
      componentSerial: selectedComponent.serial,
      componentType: selectedComponent.type,
      capacity: selectedComponent.capacity,
      date: new Date().toISOString().split('T')[0],
      event: `Installed in Asset ${installForm.assetId} (${installForm.employeeName})`,
      assetId: installForm.assetId,
      employee: installForm.employeeName,
      technician: installForm.technician,
      reason: installForm.reason
    };

    setComponents(components.map(c => c.id === selectedComponent.id ? updatedComp : c));
    setHistoryLogs([newHist, ...historyLogs]);
    setIsInstallModalOpen(false);
    setSelectedComponent(null);
    showToast(`Component (${selectedComponent.serial}) installed into ${installForm.assetId}!`);
  };

  // Handle Remove from Asset to Stock
  const handleRemoveToStock = (comp) => {
    if (window.confirm(`Remove ${comp.type} (${comp.serial}) from ${comp.installedInAssetId || 'Asset'} and return to Stock?`)) {
      const updatedComp = {
        ...comp,
        status: 'In Stock',
        currentLocation: 'IT Inventory Room B',
        installedInAssetId: '',
        currentEmployee: ''
      };

      const newHist = {
        id: `HST-${Date.now()}`,
        componentSerial: comp.serial,
        componentType: comp.type,
        capacity: comp.capacity,
        date: new Date().toISOString().split('T')[0],
        event: `Removed from ${comp.installedInAssetId || 'Asset'} -> Returned to Stock`,
        assetId: comp.installedInAssetId,
        employee: comp.currentEmployee,
        technician: 'IT Support Admin',
        reason: 'Removed / Swapped to Stock Inventory'
      };

      setComponents(components.map(c => c.id === comp.id ? updatedComp : c));
      setHistoryLogs([newHist, ...historyLogs]);
      showToast(`${comp.type} (${comp.serial}) returned to Stock Inventory!`);
    }
  };

  // Filter components
  const filteredComponents = components.filter(c => {
    const matchesSearch = 
      c.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.installedInAssetId && c.installedInAssetId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.currentEmployee && c.currentEmployee.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'All' || c.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getComponentIcon = (type) => {
    switch (type) {
      case 'RAM': return <Cpu className="w-4 h-4 text-blue-600" />;
      case 'SSD':
      case 'NVMe':
      case 'HDD': return <HardDrive className="w-4 h-4 text-purple-600" />;
      case 'Battery': return <Battery className="w-4 h-4 text-emerald-600" />;
      case 'Charger':
      case 'Adapter': return <Plug className="w-4 h-4 text-amber-600" />;
      case 'Monitor': return <Monitor className="w-4 h-4 text-indigo-600" />;
      case 'Keyboard': return <Keyboard className="w-4 h-4 text-teal-600" />;
      case 'Mouse': return <Mouse className="w-4 h-4 text-cyan-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 relative pb-12">
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
            <Cpu className="w-7 h-7 text-primary" />
            Component Inventory & Upgrades Lifetime Tracker
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Manage RAM, SSD, NVMe, Batteries, Chargers & Peripherals with 100% lifetime movement and installation history
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add New Component
        </button>
      </div>

      {/* METRICS & SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Components</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{components.length}</h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-1">
              {components.filter(c => c.status === 'In Stock').length} In Stock Ready
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-primary rounded-xl border border-blue-100">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Currently Installed</p>
            <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{components.filter(c => c.status === 'Installed').length}</h3>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
              Active Devices
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">RAM & SSD Modules</p>
            <h3 className="text-2xl font-extrabold text-purple-900 mt-1">
              {components.filter(c => c.type === 'RAM' || c.type === 'SSD' || c.type === 'NVMe').length}
            </h3>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-1">
              System Memory & Storage
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lifetime Movements</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{historyLogs.length} Events</h3>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
              100% Audit Preserved
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <History className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* COMPONENT INVENTORY TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
        {/* Filters Header */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="font-bold text-gray-800 text-sm">Component Inventory Catalog</h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200/80 px-2.5 py-0.5 rounded-full font-mono">
              {filteredComponents.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
            {/* Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-1.5 px-3 font-semibold border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-gray-700 shadow-2xs"
            >
              <option value="All">All Component Types</option>
              <option value="RAM">RAM Memory</option>
              <option value="SSD">SSD Drive</option>
              <option value="NVMe">NVMe SSD</option>
              <option value="HDD">HDD Drive</option>
              <option value="Battery">Battery</option>
              <option value="Charger">Charger / Adapter</option>
              <option value="Monitor">Monitor</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-3 font-semibold border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-gray-700 shadow-2xs"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Installed">Installed in Asset</option>
              <option value="Under Repair">Under Repair</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search serial, brand, asset ID..."
                className="w-full py-1.5 pl-9 pr-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-white shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left text-gray-600">
            <thead className="text-[11px] text-gray-700 uppercase bg-gray-100/70 border-b border-gray-200 font-bold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">Component & Serial #</th>
                <th scope="col" className="px-6 py-3.5">Brand & Capacity</th>
                <th scope="col" className="px-6 py-3.5">Vendor & Cost</th>
                <th scope="col" className="px-6 py-3.5">Current Location / Assigned Device</th>
                <th scope="col" className="px-6 py-3.5">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions & Movement History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((comp) => (
                  <tr key={comp.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Component & Serial */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                          {getComponentIcon(comp.type)}
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 flex items-center gap-1.5">
                            {comp.type}
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              S/N: {comp.serial}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono block mt-0.5">{comp.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Brand & Capacity */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{comp.brand} {comp.model}</div>
                      <div className="text-[11px] text-purple-700 font-bold font-mono">{comp.capacity}</div>
                    </td>

                    {/* Vendor & Cost */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{comp.vendor}</div>
                      <div className="text-[11px] text-emerald-700 font-mono font-bold">{comp.cost}</div>
                    </td>

                    {/* Location / Device */}
                    <td className="px-6 py-4">
                      {comp.status === 'Installed' ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900 block">
                            Asset: <strong className="text-blue-700">{comp.installedInAssetId}</strong>
                          </span>
                          <span className="text-[11px] text-gray-500 block flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            {comp.currentEmployee || 'Assigned User'}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-500 flex items-center gap-1">
                          🏢 {comp.currentLocation}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                        comp.status === 'In Stock' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        comp.status === 'Installed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {comp.status}
                      </span>
                    </td>

                    {/* Actions & Lifetime History */}
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {comp.status === 'In Stock' ? (
                        <button
                          onClick={() => {
                            setSelectedComponent(comp);
                            setIsInstallModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                        >
                          ⚡ Install in Asset
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveToStock(comp)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                        >
                          ↩ Move to Stock
                        </button>
                      )}

                      <button
                        onClick={() => setViewingHistorySerial(comp.serial)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        title="View Complete Lifetime Movement History"
                      >
                        <History className="w-3.5 h-3.5 inline mr-1" />
                        Lifetime History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No components found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIFETIME MOVEMENT HISTORY MODAL */}
      {viewingHistorySerial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200 text-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-900 to-amber-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <History className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Complete Lifetime Movement & Audit Log</h3>
                  <span className="text-[11px] text-amber-200 font-mono">Component Serial #: {viewingHistorySerial}</span>
                </div>
              </div>
              <button onClick={() => setViewingHistorySerial(null)} className="text-amber-200 hover:text-white text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-amber-900 font-medium text-[11px]">
                ℹ Preserved Lifetime History: Component movement history is 100% audit-locked. Removing or upgrading components automatically returns old items to Stock Inventory for re-assignment.
              </div>

              {/* Timeline list */}
              <div className="space-y-3 relative pl-4 border-l-2 border-amber-300 my-2">
                {historyLogs
                  .filter(h => h.componentSerial === viewingHistorySerial)
                  .map((log, idx) => (
                    <div key={log.id || idx} className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                      <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white" />
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 text-xs">{log.event}</span>
                        <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">{log.date}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-100 mt-2 font-sans">
                        <div>Technician / Admin: <strong className="text-gray-900">{log.technician || 'Admin'}</strong></div>
                        <div>Reason / Remarks: <strong className="text-gray-900">{log.reason || 'N/A'}</strong></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
              <button
                onClick={() => setViewingHistorySerial(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close History Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTALL IN ASSET MODAL */}
      {isInstallModalOpen && selectedComponent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200 text-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-emerald-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Install {selectedComponent.type} ({selectedComponent.serial}) into Asset</h3>
              </div>
              <button onClick={() => setIsInstallModalOpen(false)} className="text-emerald-200 hover:text-white text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleInstallSubmit} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-semibold">
                Installing: {selectedComponent.brand} {selectedComponent.type} ({selectedComponent.capacity}) • S/N: {selectedComponent.serial}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Asset ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AST-1003"
                  value={installForm.assetId}
                  onChange={(e) => setInstallForm({ ...installForm, assetId: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee Name"
                  value={installForm.employeeName}
                  onChange={(e) => setInstallForm({ ...installForm, employeeName: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">IT Technician / Engineer Name</label>
                <input
                  type="text"
                  value={installForm.technician}
                  onChange={(e) => setInstallForm({ ...installForm, technician: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Upgrade Reason / Remarks</label>
                <input
                  type="text"
                  value={installForm.reason}
                  onChange={(e) => setInstallForm({ ...installForm, reason: e.target.value })}
                  className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm Installation & Record History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COMPONENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200 text-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-800 text-sm">Add New Component to Stock</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleAddComponentSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[85vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Component Type *</label>
                  <select
                    value={newComponent.type}
                    onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-semibold bg-white cursor-pointer"
                  >
                    <option value="RAM">RAM Memory</option>
                    <option value="SSD">SSD Drive</option>
                    <option value="NVMe">NVMe SSD</option>
                    <option value="HDD">HDD Hard Drive</option>
                    <option value="Battery">Battery</option>
                    <option value="Charger">Charger / Adapter</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Graphics Card">Graphics Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unique Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAM000125"
                    value={newComponent.serial}
                    onChange={(e) => setNewComponent({ ...newComponent, serial: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono text-gray-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Corsair / Samsung"
                    value={newComponent.brand}
                    onChange={(e) => setNewComponent({ ...newComponent, brand: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Capacity / Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 16 GB / 1 TB NVMe"
                    value={newComponent.capacity}
                    onChange={(e) => setNewComponent({ ...newComponent, capacity: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={newComponent.vendor}
                    onChange={(e) => setNewComponent({ ...newComponent, vendor: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Purchase Cost</label>
                  <input
                    type="text"
                    value={newComponent.cost}
                    onChange={(e) => setNewComponent({ ...newComponent, cost: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono text-emerald-700 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentInventory;
