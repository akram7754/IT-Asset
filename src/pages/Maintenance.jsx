import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Wrench, Calendar, AlertCircle, Clock, CheckCircle2, 
  Trash2, Edit2, Plus, X, Check, Laptop, ShieldCheck, Filter 
} from 'lucide-react';
import { maintenanceTasksData } from '../data/mockData';

const Maintenance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);

  const [toastMessage, setToastMessage] = useState(null);

  // Persistent Maintenance Tasks State
  const [tasks, setTasks] = useState(() => {
    const deletedIds = new Set((() => {
      try { return JSON.parse(localStorage.getItem('itam_deleted_maintenance_ids') || '[]'); } catch (e) { return []; }
    })());

    const isInitialized = localStorage.getItem('itam_maintenance_initialized') === 'true';
    let loadedArr = null;

    try {
      const saved = localStorage.getItem('itam_maintenance_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loadedArr = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved maintenance tasks:', e);
    }

    if (loadedArr === null) {
      if (isInitialized) {
        loadedArr = [];
      } else {
        loadedArr = maintenanceTasksData;
      }
    }

    return loadedArr.filter(t => t && typeof t === 'object' && !deletedIds.has(t.id));
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Form Initial State for New Ticket
  const initialTicketForm = {
    id: '',
    asset: '',
    issue: '',
    assignedTo: 'Skyeagle Technologies',
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date().toISOString().split('T')[0]
  };
  const [newTicket, setNewTicket] = useState(initialTicketForm);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('itam_maintenance_tasks', JSON.stringify(tasks));
      localStorage.setItem('itam_maintenance_initialized', 'true');
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [tasks]);

  useEffect(() => {
    setSearchTerm(queryFromUrl);
  }, [queryFromUrl]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) =>
    (t.asset || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.issue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic KPI Metrics Math
  const scheduledCount = tasks.filter(t => t.status === 'Scheduled').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const overdueCount = tasks.filter(t => t.status === 'Overdue' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed')).length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  // Handler: Add New Ticket
  const handleAddTicketSubmit = (e) => {
    e.preventDefault();
    if (!newTicket.asset || !newTicket.issue) return;

    const nextId = `MNT-${200 + tasks.length + 1}`;
    const created = {
      ...newTicket,
      id: nextId
    };

    setTasks([created, ...tasks]);
    setIsAddModalOpen(false);
    setNewTicket(initialTicketForm);
    showToast(`Maintenance Ticket ${nextId} created successfully!`);
  };

  // Handler: Save Edited Ticket
  const handleSaveEditSubmit = (e) => {
    e.preventDefault();
    if (!editingTask) return;

    setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    showToast(`Ticket ${editingTask.id} updated successfully!`);
    setEditingTask(null);
  };

  // Handler: Permanently Delete Ticket
  const confirmDeleteTask = (id) => {
    if (!id) return;

    // 1. Store deleted ID in persistent deleted registry
    try {
      const deletedList = JSON.parse(localStorage.getItem('itam_deleted_maintenance_ids') || '[]');
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        localStorage.setItem('itam_deleted_maintenance_ids', JSON.stringify(deletedList));
      }
    } catch (e) {}

    // 2. Filter tasks state
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);

    // 3. Save to localStorage
    try {
      localStorage.setItem('itam_maintenance_tasks', JSON.stringify(updated));
      localStorage.setItem('itam_maintenance_initialized', 'true');
    } catch (e) {}

    if (editingTask && editingTask.id === id) setEditingTask(null);
    setTaskToDelete(null);
    showToast(`Maintenance Ticket (${id}) deleted permanently.`);
  };

  return (
    <div className="space-y-6 relative pb-12 text-xs">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 bg-white/20 rounded-full p-0.5" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-white/80 hover:text-white cursor-pointer">&times;</button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-primary" />
            Maintenance & Repairs
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Track asset maintenance schedules, laptop repair logs, vendor tickets, and problem history
          </p>
        </div>
        <button
          onClick={() => {
            setNewTicket({
              ...initialTicketForm,
              id: `MNT-${200 + tasks.length + 1}`
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled</p>
            <h3 className="text-2xl font-extrabold text-blue-900 mt-1">{scheduledCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{inProgressCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overdue</p>
            <h3 className="text-2xl font-extrabold text-red-600 mt-1">{overdueCount}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="font-extrabold text-gray-900 text-sm">Active Maintenance Tasks & Repairs</h3>
            <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2.5 py-0.5 rounded-full font-mono">
              {filteredTasks.length}
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-2 pl-9 pr-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium bg-white"
              placeholder="Search by asset, issue, vendor, or Task ID..."
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-600">
            <thead className="text-[11px] text-gray-700 uppercase bg-gray-100/70 border-b border-gray-200 font-bold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 whitespace-nowrap">Task ID</th>
                <th scope="col" className="px-6 py-4 whitespace-nowrap">Asset & Issue</th>
                <th scope="col" className="px-6 py-4 whitespace-nowrap">Assigned Technician / Vendor</th>
                <th scope="col" className="px-6 py-4 whitespace-nowrap">Priority</th>
                <th scope="col" className="px-6 py-4 whitespace-nowrap">Status</th>
                <th scope="col" className="px-6 py-4 whitespace-nowrap">Due Date</th>
                <th scope="col" className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* 1. Task ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {task.id}
                      </span>
                    </td>

                    {/* 2. Asset & Issue */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                        {task.asset}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 font-medium">{task.issue}</div>
                    </td>

                    {/* 3. Assigned To / Vendor */}
                    <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                      {task.assignedTo || 'Skyeagle Technologies'}
                    </td>

                    {/* 4. Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {task.priority}
                      </span>
                    </td>

                    {/* 5. Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        task.status === 'In Progress' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        task.status === 'Scheduled' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {task.status}
                      </span>
                    </td>

                    {/* 6. Due Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center font-mono text-gray-700 font-bold">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {task.dueDate}
                      </div>
                    </td>

                    {/* 7. ACTIONS COLUMN (Edit & Delete Buttons) */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingTask({ ...task })}
                          className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                          title="Edit Maintenance Ticket"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer"
                          title="Delete Maintenance Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 font-medium">
                    No maintenance tasks or repair tickets match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CREATE NEW MAINTENANCE TICKET MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-300" />
                <h3 className="font-extrabold text-sm">Create Maintenance Ticket ({newTicket.id})</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-blue-200 hover:text-white text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleAddTicketSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Asset Name & Serial Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lenovo ThinkPad L14 (PF2VCP3D)"
                  value={newTicket.asset}
                  onChange={(e) => setNewTicket({ ...newTicket, asset: e.target.value })}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Problem / Repair Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Display Screen Change & Panel Repair"
                  value={newTicket.issue}
                  onChange={(e) => setNewTicket({ ...newTicket, issue: e.target.value })}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Vendor / Tech</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyeagle Technologies"
                    value={newTicket.assignedTo}
                    onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={newTicket.status}
                    onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTicket.dueDate}
                    onChange={(e) => setNewTicket({ ...newTicket, dueDate: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md cursor-pointer"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT MAINTENANCE TICKET MODAL */}
      {/* ========================================================================= */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Edit Maintenance Ticket ({editingTask.id})</h3>
              <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Asset Name & Serial Number</label>
                <input
                  type="text"
                  required
                  value={editingTask.asset || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, asset: e.target.value })}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Problem / Repair Description</label>
                <input
                  type="text"
                  required
                  value={editingTask.issue || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, issue: e.target.value })}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Vendor / Tech</label>
                  <input
                    type="text"
                    required
                    value={editingTask.assignedTo || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={editingTask.priority || 'High'}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingTask.status || 'In Progress'}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DELETE TICKET CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-inner">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-gray-900">Delete Maintenance Ticket?</h3>
                <p className="text-xs text-gray-600">
                  Are you sure you want to permanently delete ticket <strong className="text-red-700">{taskToDelete.id}</strong> for <span className="font-bold">{taskToDelete.asset}</span>?
                </p>
                <p className="text-[11px] text-red-500 font-semibold pt-1">
                  Issue: "{taskToDelete.issue}"
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteTask(taskToDelete.id)}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Yes, Delete Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Maintenance;
