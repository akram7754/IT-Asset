import React from 'react';
import { Download, FileText, FileBarChart2, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Reports = () => {
  const depreciationData = [
    { year: '2021', value: 120000 },
    { year: '2022', value: 95000 },
    { year: '2023', value: 82000 },
    { year: '2024', value: 65000 },
  ];

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
            <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
              <Download className="w-4 h-4 mr-2" /> Excel
            </button>
            <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4 mr-2" /> PDF
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
            <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
              <Download className="w-4 h-4 mr-2" /> Excel
            </button>
            <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4 mr-2" /> PDF
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
            <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
              <Download className="w-4 h-4 mr-2" /> Excel
            </button>
            <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Download className="w-4 h-4 mr-2" /> PDF
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
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Total Value']}
              />
              <Bar dataKey="value" fill="#1e40af" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
