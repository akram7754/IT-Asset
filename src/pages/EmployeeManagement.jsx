import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UserPlus, Mail, Phone, Building2, X, Check, Edit2, Trash2, Eye, Briefcase, Plus, AlertCircle, Laptop } from 'lucide-react';
import { employeesData, assetsData } from '../data/mockData';

const EmployeeManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);

  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const [employees, setEmployees] = useState(() => {
    if (!localStorage.getItem('itam_clean_emp_reset_v12')) {
      localStorage.removeItem('itam_employees');
      localStorage.setItem('itam_employees', JSON.stringify([]));
      localStorage.setItem('itam_clean_emp_reset_v12', 'true');
      return [];
    }

    const saved = localStorage.getItem('itam_employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved employees:', e);
      }
    }
    return employeesData;
  });

  useEffect(() => {
    localStorage.setItem('itam_employees', JSON.stringify(employees));
  }, [employees]);

  const handleDeleteAllEmployees = () => {
    setEmployees([]);
    localStorage.setItem('itam_employees', JSON.stringify([]));
    setIsDeleteAllModalOpen(false);
    showToast('All sample employees deleted successfully. You can now add your real employees manually!');
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetEmp, setAssignTargetEmp] = useState(null);
  const [selectedAssetIdToAssign, setSelectedAssetIdToAssign] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const initialFormState = {
    id: '',
    name: '',
    role: '',
    department: 'Engineering',
    email: '',
    phone: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    setSearchTerm(queryFromUrl);
  }, [queryFromUrl]);

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) return;

    let newId = formData.id ? formData.id.trim() : '';
    if (!newId) {
      const nextNum = employees.reduce((max, emp) => {
        const num = parseInt(emp.id.replace('EMP-', ''), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 0) + 1;
      newId = `EMP-${String(nextNum).padStart(3, '0')}`;
    }

    const newEmp = {
      id: newId,
      name: formData.name,
      role: formData.role,
      department: formData.department,
      email: formData.email,
      phone: formData.phone || 'N/A',
      assetsCount: 0
    };

    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    setFormData(initialFormState);
    showToast(`Employee "${newEmp.name}" (${newId}) added successfully!`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingEmployee || !editingEmployee.name || !editingEmployee.email) return;

    const origId = editingEmployee.originalId || editingEmployee.id;
    const updated = {
      ...editingEmployee,
      id: editingEmployee.id.trim(),
      name: editingEmployee.name,
      role: editingEmployee.role,
      department: editingEmployee.department,
      email: editingEmployee.email,
      phone: editingEmployee.phone
    };

    const newEmployees = employees.map(emp => (emp.id === origId || emp.id === editingEmployee.id) ? updated : emp);
    setEmployees(newEmployees);
    localStorage.setItem('itam_employees', JSON.stringify(newEmployees));
    showToast(`Employee details for "${updated.name}" (${updated.id}) updated successfully!`);
    setEditingEmployee(null);
    if (viewingEmployee) {
      setViewingEmployee(updated);
    }
  };

  const handleDeleteEmployee = (id, name, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${name} (${id})?`)) {
      setEmployees(employees.filter(emp => emp.id !== id));
      if (viewingEmployee && viewingEmployee.id === id) {
        setViewingEmployee(null);
      }
      showToast(`Employee "${name}" removed.`);
    }
  };

  const handleUnassignAsset = (assetId, assetName, empName) => {
    if (window.confirm(`Are you sure you want to unassign / remove "${assetName}" from ${empName}?`)) {
      const saved = localStorage.getItem('itam_assets');
      let currentAssets = assetsData;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) currentAssets = parsed;
        } catch (e) {
          console.error('Failed to parse assets:', e);
        }
      }

      const updatedAssets = currentAssets.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            assignedTo: '',
            assignedToEmail: '',
            assignedToRole: '',
            assignedToDept: '',
            digitalSignature: '',
            status: 'Available'
          };
        }
        return a;
      });

      localStorage.setItem('itam_assets', JSON.stringify(updatedAssets));
      showToast(`Asset "${assetName}" unassigned from ${empName}.`);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departmentsList = [
    'Engineering',
    'Product',
    'Design',
    'Human Resources',
    'Sales',
    'Marketing',
    'Finance',
    'IT & Support',
    'Operations'
  ];

  // Helper to get assigned assets for employee details from live localStorage
  const getAssignedAssets = (employeeName) => {
    const saved = localStorage.getItem('itam_assets');
    let currentAssets = assetsData;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentAssets = parsed;
      } catch (e) {
        console.error('Failed to parse saved assets:', e);
      }
    }
    if (!employeeName) return [];
    const target = employeeName.trim().toLowerCase();
    return currentAssets.filter(a => a.assignedTo && a.assignedTo.trim().toLowerCase() === target);
  };

  return (
    <div className="space-y-6 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5 bg-white/20 rounded-full p-0.5" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage employee information and asset assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDeleteAllModalOpen(true)}
            className="flex items-center justify-center px-3.5 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all shadow-xs gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
            title="Delete all employee records"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            Delete All Employees
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm gap-2 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Search employees by name, role, department, or ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          Total Employees: <span className="text-primary font-bold text-sm ml-1">{filteredEmployees.length}</span>
        </div>
      </div>

      {/* EMPLOYEE CARDS GRID */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">No employees found</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria or add a new employee.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map(emp => {
            const assignedAssets = getAssignedAssets(emp.name);
            const actualCount = assignedAssets.length;
            
            return (
              <div 
                key={emp.id} 
                onClick={() => setViewingEmployee(emp)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-primary flex items-center justify-center text-xl font-bold group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{emp.name}</h3>
                        <p className="text-xs text-gray-500">{emp.role}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-600 border border-gray-200 font-mono">
                      {emp.id}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{emp.department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">Assigned Assets</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                      {actualCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEmployee({ ...emp, originalId: emp.id });
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteEmployee(emp.id, emp.name, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-800">Add New Employee</h3>
              </div>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData(initialFormState);
                }} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID (Manual / Custom)</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-007 or TG-104 (Auto if empty)"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DevOps Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  >
                    {departmentsList.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex.j@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormData(initialFormState);
                  }}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-800">Edit Employee - {editingEmployee.id}</h3>
              </div>
              <button 
                onClick={() => setEditingEmployee(null)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID (Manual / Custom) *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.id}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, id: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.role}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  >
                    {departmentsList.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingEmployee.phone}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EMPLOYEE DETAILS MODAL */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-lg">
                  {viewingEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{viewingEmployee.name}</h3>
                  <p className="text-xs text-gray-500">{viewingEmployee.role} • <span className="font-mono text-gray-700">{viewingEmployee.id}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setViewingEmployee(null)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Contact Information Card */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2.5 border border-gray-200/60">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact & Organization</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Building2 className="w-4 h-4 mr-2.5 text-gray-400" />
                    <span className="font-medium">{viewingEmployee.department}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-4 h-4 mr-2.5 text-gray-400" />
                    <span className="font-medium truncate">{viewingEmployee.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700 sm:col-span-2">
                    <Phone className="w-4 h-4 mr-2.5 text-gray-400" />
                    <span className="font-medium">{viewingEmployee.phone}</span>
                  </div>
                </div>
              </div>

              {/* Assigned Assets Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Assigned Assets ({getAssignedAssets(viewingEmployee.name).length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignTargetEmp(viewingEmployee);
                      setSelectedAssetIdToAssign('');
                      setIsAssignModalOpen(true);
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Assign Asset to {viewingEmployee.name.split(' ')[0]}
                  </button>
                </h4>
                {getAssignedAssets(viewingEmployee.name).length === 0 ? (
                  <div className="p-4 rounded-lg bg-gray-50 text-center text-xs text-gray-500 border border-dashed border-gray-300">
                    No hardware assets or SIM cards are currently assigned to this employee.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getAssignedAssets(viewingEmployee.name).map(asset => (
                      <div key={asset.id} className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center text-xs shadow-sm hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{asset.name}</p>
                            <p className="text-gray-400 font-mono text-[11px]">{asset.id} • {asset.category} {asset.assetCode ? `(${asset.assetCode})` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                            {asset.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUnassignAsset(asset.id, asset.name, viewingEmployee.name)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                            title="Unassign / Remove asset from this employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Unassign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => {
                  const toEdit = viewingEmployee;
                  setEditingEmployee({ ...toEdit, originalId: toEdit.id });
                }}
                className="px-4 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Employee
              </button>
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DIRECT ASSET ASSIGNMENT MODAL FOR EMPLOYEE */}
      {isAssignModalOpen && assignTargetEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Assign Asset to {assignTargetEmp.name} ({assignTargetEmp.id})</h3>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-sans">
                <span className="font-bold block">Assigning Asset To:</span>
                <p className="text-sm font-extrabold text-emerald-900 mt-0.5">{assignTargetEmp.name}</p>
                <p className="text-xs text-emerald-800 font-mono">{assignTargetEmp.role} • {assignTargetEmp.department} ({assignTargetEmp.email})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Select IT Asset to Assign *</label>
                {(() => {
                  const saved = localStorage.getItem('itam_assets');
                  let currentAssets = assetsData;
                  if (saved) {
                    try {
                      const parsed = JSON.parse(saved);
                      if (Array.isArray(parsed)) currentAssets = parsed;
                    } catch (e) {
                      console.error(e);
                    }
                  }

                  return (
                    <select
                      value={selectedAssetIdToAssign}
                      onChange={(e) => setSelectedAssetIdToAssign(e.target.value)}
                      className="w-full py-2.5 px-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white cursor-pointer"
                    >
                      <option value="">-- Choose an IT Asset / Laptop / SIM --</option>
                      {currentAssets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                          [{asset.category}] {asset.name} (Code: {asset.assetCode || 'N/A'}, S/N: {asset.serial || asset.simNumber || 'N/A'}) - {asset.status} {asset.assignedTo ? `(Currently: ${asset.assignedTo})` : ''}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedAssetIdToAssign}
                onClick={() => {
                  if (!selectedAssetIdToAssign || !assignTargetEmp) return;

                  const saved = localStorage.getItem('itam_assets');
                  let currentAssets = assetsData;
                  if (saved) {
                    try {
                      const parsed = JSON.parse(saved);
                      if (Array.isArray(parsed)) currentAssets = parsed;
                    } catch (e) {
                      console.error(e);
                    }
                  }

                  const updatedAssets = currentAssets.map(a => {
                    if (a.id === selectedAssetIdToAssign) {
                      return {
                        ...a,
                        assignedTo: assignTargetEmp.name,
                        assignedToEmail: assignTargetEmp.email,
                        assignedToRole: assignTargetEmp.role,
                        assignedToDept: assignTargetEmp.department,
                        status: 'Assigned'
                      };
                    }
                    return a;
                  });

                  localStorage.setItem('itam_assets', JSON.stringify(updatedAssets));
                  setIsAssignModalOpen(false);
                  showToast(`Asset assigned to "${assignTargetEmp.name}" successfully!`);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Confirm Asset Assignment
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE ALL EMPLOYEES CONFIRMATION MODAL */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-gray-900">Delete All Employees?</h3>
                <p className="text-xs text-gray-600">
                  Are you sure you want to permanently delete all <strong className="text-rose-700">{employees.length} employee records</strong>?
                </p>
                <p className="text-[11px] text-rose-500 font-semibold pt-1">This operation will clear your entire employee directory so you can add your real employees manually.</p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllEmployees}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Yes, Delete All ({employees.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

