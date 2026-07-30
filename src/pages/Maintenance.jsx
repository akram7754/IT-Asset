import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Wrench, Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { maintenanceTasksData } from '../data/mockData';

const Maintenance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);

  useEffect(() => {
    setSearchTerm(queryFromUrl);
  }, [queryFromUrl]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const maintenanceTasks = maintenanceTasksData;

  const filteredTasks = maintenanceTasks.filter((t) =>
    t.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Maintenance & Repairs</h2>
          <p className="text-sm text-gray-500 mt-1">Track asset maintenance schedules and repair tickets</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm gap-2">
          <Wrench className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Scheduled</p>
            <p className="text-2xl font-bold text-gray-900">14</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Wrench className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed (Month)</p>
            <p className="text-2xl font-bold text-gray-900">25</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800">Active Maintenance Tasks</h3>
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-2 pl-9 pr-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Search tasks..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4">Task ID</th>
                <th scope="col" className="px-6 py-4">Asset & Issue</th>
                <th scope="col" className="px-6 py-4">Assigned To</th>
                <th scope="col" className="px-6 py-4">Priority</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{task.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{task.asset}</div>
                    <div className="text-xs text-gray-500">{task.issue}</div>
                  </td>
                  <td className="px-6 py-4">{task.assignedTo}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                      task.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {task.dueDate}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
