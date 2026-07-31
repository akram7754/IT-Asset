import React from 'react';
import { Download, FileText, FileBarChart2, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { assetsData, maintenanceTasksData } from '../data/mockData';
import * as XLSX from 'xlsx';

const Reports = () => {
  const depreciationData = [
    { year: '2021', value: 120000 },
    { year: '2022', value: 95000 },
    { year: '2023', value: 82000 },
    { year: '2024', value: 65000 },
  ];

  const getAssetsList = () => {
    try {
      const saved = localStorage.getItem('itam_assets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return assetsData;
  };

  const handleExportAssetInventoryExcel = () => {
    const assets = getAssetsList();
    const rows = assets.map((a, idx) => ({
      'S.No': idx + 1,
      'Asset ID': a.id || '',
      'Asset Code': a.assetCode || '',
      'Asset Name': a.name || '',
      'Category': a.category || '',
      'Serial Number': a.serial ? String(a.serial) : '',
      'Status': a.status || '',
      'Assigned User': a.assignedTo || '',
      'Assigned Email': a.assignedToEmail || '',
      'Location': a.location || '',
      'Processor': a.processor || '',
      'RAM': a.ram || '',
      'Storage': a.storage || '',
      'SIM Phone Number': a.simPhoneNumber ? String(a.simPhoneNumber) : '',
      'SIM Carrier': a.simCarrier || '',
      'Purchase Date': a.purchaseDate || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Inventory');
    XLSX.writeFile(workbook, `IT_Asset_Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportMaintenanceExcel = () => {
    const rows = maintenanceTasksData.map((m, idx) => ({
      'S.No': idx + 1,
      'Maintenance ID': m.id || '',
      'Asset Name': m.assetName || '',
      'Asset ID': m.assetId || '',
      'Issue Description': m.issue || '',
      'Priority': m.priority || '',
      'Status': m.status || '',
      'Technician': m.technician || '',
      'Cost (₹)': m.cost || 0,
      'Start Date': m.startDate || '',
      'Completion Date': m.completionDate || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Log');
    XLSX.writeFile(workbook, `IT_Maintenance_History_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and export insights on your IT assets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Inventory Report</h3>
          <p className="text-sm text-gray-500 mb-6">Complete list of all assets with their current status, location, and assignee.</p>
          <div className="flex gap-3 w-full mt-auto">
            <button 
              onClick={handleExportAssetInventoryExcel}
              className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" /> Excel (.xlsx)
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Warranty Expiry Report</h3>
          <p className="text-sm text-gray-500 mb-6">List of assets whose warranty is expiring within the next 90 days.</p>
          <div className="flex gap-3 w-full mt-auto">
            <button 
              onClick={handleExportAssetInventoryExcel}
              className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" /> Excel (.xlsx)
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <FileBarChart2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance History</h3>
          <p className="text-sm text-gray-500 mb-6">Historical record of all maintenance and repair activities.</p>
          <div className="flex gap-3 w-full mt-auto">
            <button 
              onClick={handleExportMaintenanceExcel}
              className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" /> Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Value Depreciation</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depreciationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Value']}
              />
              <Bar dataKey="value" fill="#00A3A6" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
