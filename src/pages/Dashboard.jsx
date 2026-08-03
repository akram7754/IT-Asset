import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Monitor, CheckCircle, Clock, Wrench, CreditCard, Laptop, 
  Smartphone, ExternalLink, ArrowRight, Download, FileText, 
  CheckCircle2, X, Eye, Phone, Signal, User, TrendingUp, AlertCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { assetsData, employeesData, maintenanceTasksData } from '../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic assets from localStorage or default mock data
  const currentAssets = (() => {
    if (!localStorage.getItem('itam_excel_imported_v11')) {
      localStorage.removeItem('itam_assets');
      localStorage.removeItem('itam_assets_v4');
      localStorage.removeItem('itam_assets_backup');
      localStorage.removeItem('itam_deleted_asset_ids');
      localStorage.setItem('itam_assets', JSON.stringify(assetsData));
      localStorage.setItem('itam_excel_imported_v11', 'true');
      return assetsData;
    }

    const saved = localStorage.getItem('itam_assets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return assetsData;
  })();

  // Dynamic statistics calculation
  const totalAssetsCount = currentAssets.length;
  const assignedCount = currentAssets.filter(a => (a.assignedTo && a.assignedTo.trim() !== '') || a.status === 'Assigned').length;
  const availableCount = currentAssets.filter(a => a.status !== 'Retired' && a.status !== 'Under Maintenance' && (!a.assignedTo || a.assignedTo.trim() === '' || a.status === 'IT Stock' || a.status === 'In IT Stock' || a.status === 'Available')).length;
  const maintenanceCount = currentAssets.filter(a => a.status === 'Under Maintenance' || a.status === 'In Maintenance').length;
  const simCardsCount = currentAssets.filter(a => a.category === 'SIM Card' || a.simNumber).length;

  const summaryCards = [
    { 
      title: 'Total Assets', 
      value: totalAssetsCount, 
      subtext: `${simCardsCount} Cellular/SIM Cards`,
      icon: Monitor, 
      color: 'bg-blue-500 text-white',
      badge: 'Active Inventory',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      statusFilter: 'All'
    },
    { 
      title: 'Assigned Assets', 
      value: assignedCount, 
      subtext: `${Math.round((assignedCount / (totalAssetsCount || 1)) * 100)}% utilization`,
      icon: CheckCircle, 
      color: 'bg-emerald-500 text-white',
      badge: 'In Use',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusFilter: 'Assigned'
    },
    { 
      title: 'IT Stock / Available', 
      value: availableCount, 
      subtext: 'Click to view available stock →',
      icon: Clock, 
      color: 'bg-purple-500 text-white',
      badge: 'In Stock',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      statusFilter: 'IT Stock'
    },
    { 
      title: 'In Maintenance', 
      value: maintenanceCount, 
      subtext: `${maintenanceTasksData.length} pending tickets`,
      icon: Wrench, 
      color: 'bg-amber-500 text-white',
      badge: 'Under Service',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      statusFilter: 'Under Maintenance'
    },
  ];

  // Dynamic Pie Chart Data
  const pieData = [
    { name: 'Assigned', value: assignedCount || 4, color: '#10b981' },
    { name: 'IT Stock', value: availableCount || 3, color: '#a855f7' },
    { name: 'Maintenance', value: maintenanceCount || 1, color: '#f59e0b' },
    { name: 'SIM Cards', value: simCardsCount || 2, color: '#06b6d4' },
  ];

  // Category breakdown for bar chart
  const categoryCounts = currentAssets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    Count: categoryCounts[cat]
  }));

  const handleGenerateReport = () => {
    setIsExporting(true);
    setToastMessage('Generating IT Asset Summary Report...');
    
    setTimeout(() => {
      setIsExporting(false);
      // Trigger instant CSV download
      const headers = ['Asset ID,Name,Category,Serial,Assigned To,Status,Location\n'];
      const rows = currentAssets.map(a => 
        `"${a.id}","${a.name}","${a.category}","${a.serial || a.simNumber}","${a.assignedTo || 'Unassigned'}","${a.status}","${a.location}"`
      ).join('\n');
      
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `ITAM_Asset_Report_${new Date().toISOString().split('T')[0]}.csv`);
      a.click();

      setToastMessage('Report downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 flex flex-col relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time breakdown of IT equipment, assignments, and SIM cards</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={isExporting}
          className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-sm gap-2 active:scale-95 disabled:opacity-75 cursor-pointer"
        >
          {isExporting ? <Clock className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => card.statusFilter && navigate(`/assets?status=${encodeURIComponent(card.statusFilter)}`)}
            className={`p-5 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-purple-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{card.value}</h3>
              <p className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1 group-hover:underline">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-bold text-gray-800">Asset Status Distribution</h3>
            <span className="text-xs text-gray-400 font-medium">Real-time status</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val, name) => [`${val} Assets`, name]}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-bold text-gray-800">Asset Inventory by Category</h3>
            <span className="text-xs text-gray-400 font-medium">Hardware & SIM breakdown</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="Count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLES SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recently Added Assets Table */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Recent IT Assets</h3>
              <p className="text-xs text-gray-400">Click any row to inspect specifications</p>
            </div>
            <button 
              onClick={() => navigate('/assets')}
              className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
            >
              View All Assets
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Asset ID</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentAssets.slice(0, 5).map((asset) => (
                  <tr 
                    key={asset.id} 
                    onClick={() => setSelectedAsset(asset)}
                    className="bg-white border-b border-gray-50 hover:bg-blue-50/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900 group-hover:text-primary">{asset.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[180px]">{asset.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{asset.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                        asset.status === 'Available' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        asset.status === 'Assigned' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Employee Assignments Table */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Recent Employee Assignments</h3>
              <p className="text-xs text-gray-400">Current asset assignments and locations</p>
            </div>
            <button 
              onClick={() => navigate('/employees')}
              className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
            >
              View Directory
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Assignee</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Assigned Asset</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Location</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentAssets.filter(a => a.assignedTo).slice(0, 5).map((asset) => (
                  <tr 
                    key={asset.id} 
                    onClick={() => setSelectedAsset(asset)}
                    className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-primary flex items-center justify-center text-xs font-bold">
                          {asset.assignedTo.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{asset.assignedTo}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{asset.assignedToEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs truncate max-w-[150px]">
                      {asset.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{asset.location}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                        }}
                        className="text-xs font-medium text-primary hover:text-primary-dark bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QUICK ASSET PREVIEW MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2.5">
                <Monitor className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-bold text-gray-900">{selectedAsset.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedAsset.id} • {selectedAsset.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1">&times;</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50/60 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                <div>
                  <span className="text-blue-900 font-semibold block">Assigned Employee</span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedAsset.assignedTo || 'Unassigned'}</p>
                  <p className="text-gray-500 font-mono">{selectedAsset.assignedToEmail || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedAsset.status === 'Assigned' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-purple-100 text-purple-800 border-purple-300'
                }`}>
                  {selectedAsset.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 font-medium block">Serial Number / ICCID</span>
                  <p className="font-mono font-bold text-gray-800 mt-0.5">{selectedAsset.serial || selectedAsset.simNumber || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 font-medium block">Location</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{selectedAsset.location}</p>
                </div>
              </div>

              {selectedAsset.simPhoneNumber && (
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-emerald-800 font-medium block">SIM Mobile Number</span>
                    <p className="font-bold text-emerald-950 mt-0.5">{selectedAsset.simPhoneNumber}</p>
                  </div>
                  <span className="text-emerald-700 font-semibold">{selectedAsset.simCarrier}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedAsset(null);
                  navigate('/assets');
                }}
                className="px-4 py-2 text-xs font-medium text-primary bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                Go to Asset Management <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

