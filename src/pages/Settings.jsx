import React, { useState } from 'react';
import { User, Shield, Building, Bell, Database, Download, Upload, RefreshCw, Check, AlertCircle, FileText } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('backup'); // 'profile' | 'backup'
  const [toastMessage, setToastMessage] = useState(null);
  const [restoreLog, setRestoreLog] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export all application data (Assets, Vendors, Employees, Settings) to JSON file
  const handleExportBackup = () => {
    try {
      const getStorageData = (key) => {
        const val = localStorage.getItem(key);
        if (!val) return null;
        try { return JSON.parse(val); } catch (e) { return val; }
      };

      const backupObject = {
        app: 'IT Asset Management System',
        exportDate: new Date().toISOString(),
        version: '4.0.0',
        data: {
          assets: getStorageData('itam_assets') || getStorageData('itam_assets_backup'),
          vendors: getStorageData('itam_vendors_table_v4') || getStorageData('itam_vendors'),
          employees: getStorageData('itam_employees'),
          memos: getStorageData('itam_memos')
        }
      };

      const blob = new Blob([JSON.stringify(backupObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IT_Asset_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('System Backup JSON exported and downloaded successfully!');
    } catch (err) {
      console.error('Backup export error:', err);
      alert('Failed to export backup JSON. Error: ' + err.message);
    }
  };

  // Import / Restore System Backup JSON file
  const handleRestoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const data = parsed.data || parsed;

        let restoredCount = 0;

        if (data.assets && Array.isArray(data.assets)) {
          const str = JSON.stringify(data.assets);
          localStorage.setItem('itam_assets', str);
          localStorage.setItem('itam_assets_backup', str);
          restoredCount += data.assets.length;
        }

        if (data.vendors && Array.isArray(data.vendors)) {
          const str = JSON.stringify(data.vendors);
          localStorage.setItem('itam_vendors_table_v4', str);
          localStorage.setItem('itam_vendors', str);
          localStorage.setItem('itam_vendors_backup', str);
          restoredCount += data.vendors.length;
        }

        if (data.employees && Array.isArray(data.employees)) {
          localStorage.setItem('itam_employees', JSON.stringify(data.employees));
        }

        setRestoreLog(`Successfully restored backup file! Loaded ${restoredCount} total records. Reloading view...`);
        showToast('Backup restored successfully!');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (err) {
        console.error('Restore error:', err);
        alert('Failed to parse backup JSON file. Please ensure it is a valid backup file.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Deep Scan & Recover lost records across all local keys
  const handleAutoRecoverLocalData = () => {
    try {
      const vendorKeys = [
        'itam_vendors_table_v4',
        'itam_vendors_table_v3',
        'itam_vendors_table_v2',
        'itam_vendors',
        'itam_vendors_v1',
        'itam_vendor_records'
      ];
      let recoveredVendors = [];
      for (const k of vendorKeys) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const arr = JSON.parse(item);
            if (Array.isArray(arr) && arr.length > recoveredVendors.length) {
              recoveredVendors = arr;
            }
          } catch (e) {}
        }
      }

      if (recoveredVendors.length > 0) {
        const str = JSON.stringify(recoveredVendors);
        localStorage.setItem('itam_vendors_table_v4', str);
        localStorage.setItem('itam_vendors', str);
        localStorage.setItem('itam_vendors_backup', str);
      }

      const assetKeys = ['itam_assets', 'itam_assets_v2', 'itam_assets_v1', 'itam_assets_backup'];
      let recoveredAssets = [];
      for (const k of assetKeys) {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            const arr = JSON.parse(item);
            if (Array.isArray(arr) && arr.length > recoveredAssets.length) {
              recoveredAssets = arr;
            }
          } catch (e) {}
        }
      }

      if (recoveredAssets.length > 0) {
        const str = JSON.stringify(recoveredAssets);
        localStorage.setItem('itam_assets', str);
        localStorage.setItem('itam_assets_backup', str);
      }

      setRestoreLog(`Deep scan finished! Recovered ${recoveredVendors.length} Vendor records and ${recoveredAssets.length} Asset records from browser memory.`);
      showToast('Data recovery complete!');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (e) {
      alert('Error during data recovery: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-xs">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 bg-white/20 rounded-full p-0.5" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-white/80 hover:text-white cursor-pointer">&times;</button>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings & Data Backup Center</h2>
        <p className="text-xs text-gray-500 mt-1">Manage application preferences, export system data backups, and restore historical records</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/70 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('backup')}
            className={`flex-1 min-w-[150px] py-3.5 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup' ? 'border-primary text-primary bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Database className="w-4 h-4 text-primary" /> Data Backup & 1-Click Restore
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[150px] py-3.5 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile' ? 'border-primary text-primary bg-white shadow-2xs' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> Profile & System Preferences
            </div>
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'backup' ? (
            <div className="space-y-6">
              <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 space-y-2">
                <h3 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  System Data Preservation & Recovery
                </h3>
                <p className="text-gray-600 leading-relaxed text-xs">
                  Export a complete JSON backup of all your IT Assets, Vendor directory records, invoice details, employee assignments, and hardware specifications. You can import this backup file anytime to restore your data completely!
                </p>
              </div>

              {restoreLog && (
                <div className="p-4 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold animate-in fade-in">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{restoreLog}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Export Backup Card */}
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl w-fit">
                      <Download className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Export Data Backup</h4>
                    <p className="text-gray-500 leading-normal text-xs">
                      Download full system snapshot JSON file to your computer.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Export Backup File (JSON)
                  </button>
                </div>

                {/* 2. Import / Restore Backup Card */}
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Restore From Backup</h4>
                    <p className="text-gray-500 leading-normal text-xs">
                      Upload a previously exported JSON backup file to restore records.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="restore-json-input"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />
                    <label
                      htmlFor="restore-json-input"
                      className="w-full py-2.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Upload className="w-4 h-4" /> Select & Restore JSON
                    </label>
                  </div>
                </div>

                {/* 3. Deep Scan & Auto-Recover Card */}
                <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-50 text-purple-700 rounded-xl w-fit">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Auto-Scan & Recover Data</h4>
                    <p className="text-gray-500 leading-normal text-xs">
                      Scans browser storage memory for older version records and re-syncs them.
                    </p>
                  </div>
                  <button
                    onClick={handleAutoRecoverLocalData}
                    className="w-full py-2.5 text-xs font-bold text-purple-950 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" /> Scan & Recover Data
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900">Profile & User Preferences</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                    <input type="text" className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium" defaultValue="Admin" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                    <input type="text" className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium" defaultValue="User" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input type="email" className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-gray-50 font-mono text-gray-700" defaultValue="admin@company.com" disabled />
                  <p className="mt-1 text-[11px] text-gray-500">Contact IT support to change your primary admin email address.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Role & Administrative Level</label>
                  <input type="text" className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-bold" defaultValue="System Administrator" disabled />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
