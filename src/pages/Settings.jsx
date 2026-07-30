import React from 'react';
import { User, Shield, Building, Bell } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage application preferences and user access</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button className="flex-1 min-w-[120px] py-4 px-6 text-sm font-medium text-primary border-b-2 border-primary bg-blue-50/50">
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> Profile
            </div>
          </button>
          <button className="flex-1 min-w-[120px] py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
            <div className="flex items-center justify-center gap-2">
              <Building className="w-4 h-4" /> Company
            </div>
          </button>
          <button className="flex-1 min-w-[120px] py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> Roles & Access
            </div>
          </button>
          <button className="flex-1 min-w-[120px] py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </div>
          </button>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
          
          <form className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" defaultValue="Admin" />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" defaultValue="User" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-gray-50" defaultValue="admin@company.com" disabled />
              <p className="mt-1 text-xs text-gray-500">Contact IT support to change your email address.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input type="text" className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500" defaultValue="Administrator" disabled />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark shadow-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
