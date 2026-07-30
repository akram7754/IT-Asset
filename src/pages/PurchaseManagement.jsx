import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, FileText, Download, Upload, Check, X, 
  Filter, Calendar, DollarSign, Tag, Building2, Eye, ExternalLink, ShieldCheck
} from 'lucide-react';

const STORAGE_KEY = 'itam_purchases';

const initialPurchases = [
  {
    id: 'PO-2026-001',
    poNumber: 'PO-99011',
    invoiceNumber: 'INV-DELL-8821',
    purchaseDate: '2026-01-15',
    vendor: 'Dell Technologies',
    assetType: 'Laptop',
    brand: 'Dell',
    model: 'Latitude 3480',
    serial: 'CPU-DEL-7090-X1',
    assetTag: 'TGBS/B/L10',
    cost: '$1,250',
    quantity: 5,
    tax: '$125',
    totalCost: '$1,375',
    currency: 'USD',
    warrantyStart: '2026-01-15',
    warrantyEnd: '2029-01-15',
    remarks: 'Approved under Q1 hardware upgrade allocation',
    invoiceFile: null,
    invoiceFileName: 'Dell_Tax_Invoice_2026.pdf'
  },
  {
    id: 'PO-2026-002',
    poNumber: 'PO-99012',
    invoiceNumber: 'INV-APP-7712',
    purchaseDate: '2026-02-01',
    vendor: 'Apple Enterprise',
    assetType: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 16"',
    serial: 'C02YK1234',
    assetTag: 'AST-1001',
    cost: '$2,400',
    quantity: 2,
    tax: '$240',
    totalCost: '$2,640',
    currency: 'USD',
    warrantyStart: '2026-02-01',
    warrantyEnd: '2028-02-01',
    remarks: 'Assigned to Engineering Lead',
    invoiceFile: null,
    invoiceFileName: 'Apple_Corporate_Invoice.pdf'
  },
  {
    id: 'PO-2026-003',
    poNumber: 'PO-99013',
    invoiceNumber: 'INV-MS-3310',
    purchaseDate: '2026-03-10',
    vendor: 'Microsoft AppSource',
    assetType: 'Software License',
    brand: 'Microsoft',
    model: 'Office 365 E5',
    serial: 'LIC-MS365-992',
    assetTag: 'LIC-001',
    cost: '$4,800',
    quantity: 50,
    tax: '$480',
    totalCost: '$5,280',
    currency: 'USD',
    warrantyStart: '2026-03-10',
    warrantyEnd: '2027-03-10',
    remarks: 'Annual enterprise subscription renewal',
    invoiceFile: null,
    invoiceFileName: 'MS_Office365_Renewal_Invoice.pdf'
  }
];

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load purchases:', e);
    }
    return initialPurchases;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const initialNewPO = {
    poNumber: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    purchaseDate: new Date().toISOString().split('T')[0],
    vendor: 'Dell Technologies',
    assetType: 'Laptop',
    brand: 'Dell',
    model: '',
    serial: '',
    assetTag: '',
    cost: '$1,200',
    quantity: 1,
    tax: '$120',
    currency: 'USD',
    warrantyStart: new Date().toISOString().split('T')[0],
    warrantyEnd: '2029-12-31',
    remarks: ''
  };

  const [newPO, setNewPO] = useState(initialNewPO);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
    } catch (e) {
      console.error('Failed to save purchases:', e);
    }
  }, [purchases]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddPOSubmit = (e) => {
    e.preventDefault();
    if (!newPO.poNumber || !newPO.invoiceNumber) return;

    const nextId = `PO-2026-${String(purchases.length + 1).padStart(3, '0')}`;
    const poToAdd = {
      ...newPO,
      id: nextId,
      totalCost: newPO.cost
    };

    setPurchases([poToAdd, ...purchases]);
    setIsAddModalOpen(false);
    setNewPO(initialNewPO);
    showToast(`Purchase Order "${poToAdd.poNumber}" created successfully!`);
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = 
      p.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assetTag.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVendor = selectedVendor === 'All' || p.vendor === selectedVendor;

    return matchesSearch && matchesVendor;
  });

  return (
    <div className="space-y-6 relative pb-12">
      {/* TOAST NOTIFICATION */}
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
            <ShoppingBag className="w-7 h-7 text-primary" />
            Purchase Orders & Procurement Logs
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Track hardware purchases, tax invoices, purchase order numbers, costs, and warranty documentation
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create New Purchase Order
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Purchase Orders</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{purchases.length} POs</h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-1">
              Procurement Audit Locked
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-primary rounded-xl border border-blue-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Purchase Value</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">$9,295</h3>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
              Invoiced Capital Expenditure
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-xs border border-gray-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suppliers Engaged</p>
            <h3 className="text-2xl font-extrabold text-purple-900 mt-1">3 Vendors</h3>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-1">
              Hardware & Software
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="font-bold text-gray-800 text-sm">Purchase Orders Directory</h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200/80 px-2.5 py-0.5 rounded-full font-mono">
              {filteredPurchases.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="py-1.5 px-3 font-semibold border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-gray-700 shadow-2xs"
            >
              <option value="All">All Vendors</option>
              <option value="Dell Technologies">Dell Technologies</option>
              <option value="Apple Enterprise">Apple Enterprise</option>
              <option value="Microsoft AppSource">Microsoft AppSource</option>
            </select>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PO #, invoice #, serial..."
                className="w-full py-1.5 pl-9 pr-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary bg-white shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left text-gray-600">
            <thead className="text-[11px] text-gray-700 uppercase bg-gray-100/70 border-b border-gray-200 font-bold tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">PO & Invoice #</th>
                <th scope="col" className="px-6 py-3.5">Vendor & Date</th>
                <th scope="col" className="px-6 py-3.5">Asset / Model</th>
                <th scope="col" className="px-6 py-3.5">Serial / Tag</th>
                <th scope="col" className="px-6 py-3.5">Cost & Qty</th>
                <th scope="col" className="px-6 py-3.5">Warranty End</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredPurchases.map((po) => (
                <tr key={po.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      {po.poNumber}
                    </div>
                    <span className="font-mono text-[10px] text-gray-400 block mt-0.5">Inv: {po.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{po.vendor}</div>
                    <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {po.purchaseDate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{po.brand} {po.model}</div>
                    <span className="text-[11px] text-purple-700 font-semibold">{po.assetType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-gray-900">{po.serial || 'N/A'}</div>
                    <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                      Tag: {po.assetTag || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-emerald-700 font-mono text-sm">{po.cost}</div>
                    <span className="text-[11px] text-gray-500 font-medium">Qty: {po.quantity} unit(s)</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-gray-800">
                    {po.warrantyEnd}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setViewingPurchase(po)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW PURCHASE MODAL */}
      {viewingPurchase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200 text-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-300" />
                <div>
                  <h3 className="font-extrabold text-base">Purchase Order & Tax Invoice Details</h3>
                  <span className="text-[11px] text-blue-200 font-mono">{viewingPurchase.poNumber} • Invoice #{viewingPurchase.invoiceNumber}</span>
                </div>
              </div>
              <button onClick={() => setViewingPurchase(null)} className="text-blue-200 hover:text-white text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[85vh] bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <div>
                  <span className="text-gray-400 font-medium block">Vendor / Supplier</span>
                  <strong className="text-sm font-extrabold text-gray-900">{viewingPurchase.vendor}</strong>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Purchase Date</span>
                  <strong className="text-sm font-bold text-gray-900 font-mono">{viewingPurchase.purchaseDate}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <div>
                  <span className="text-gray-400 font-medium block">Asset Model & Brand</span>
                  <strong className="text-sm font-bold text-gray-900">{viewingPurchase.brand} {viewingPurchase.model}</strong>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Serial & Asset Tag</span>
                  <strong className="text-sm font-bold text-blue-800 font-mono">{viewingPurchase.serial} ({viewingPurchase.assetTag})</strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs font-mono">
                <div>
                  <span className="text-gray-400 font-medium block text-sans text-[11px]">Purchase Price</span>
                  <strong className="text-sm font-bold text-emerald-700">{viewingPurchase.cost}</strong>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block text-sans text-[11px]">Tax / VAT</span>
                  <strong className="text-sm font-bold text-gray-800">{viewingPurchase.tax}</strong>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block text-sans text-[11px]">Warranty Period</span>
                  <strong className="text-xs font-bold text-purple-900">{viewingPurchase.warrantyStart} to {viewingPurchase.warrantyEnd}</strong>
                </div>
              </div>

              {viewingPurchase.remarks && (
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-blue-950 font-medium">
                  <strong>Remarks:</strong> {viewingPurchase.remarks}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
              <button
                onClick={() => setViewingPurchase(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close PO Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PO MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200 text-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-800 text-sm">Create New Purchase Order</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleAddPOSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[85vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PO Number *</label>
                  <input
                    type="text"
                    required
                    value={newPO.poNumber}
                    onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={newPO.invoiceNumber}
                    onChange={(e) => setNewPO({ ...newPO, invoiceNumber: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vendor *</label>
                  <select
                    value={newPO.vendor}
                    onChange={(e) => setNewPO({ ...newPO, vendor: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-semibold bg-white cursor-pointer"
                  >
                    <option value="Dell Technologies">Dell Technologies</option>
                    <option value="Apple Enterprise">Apple Enterprise</option>
                    <option value="Cisco Systems">Cisco Systems</option>
                    <option value="Microsoft AppSource">Microsoft AppSource</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={newPO.purchaseDate}
                    onChange={(e) => setNewPO({ ...newPO, purchaseDate: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell"
                    value={newPO.brand}
                    onChange={(e) => setNewPO({ ...newPO, brand: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Latitude 3480"
                    value={newPO.model}
                    onChange={(e) => setNewPO({ ...newPO, model: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-998822"
                    value={newPO.serial}
                    onChange={(e) => setNewPO({ ...newPO, serial: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Purchase Cost</label>
                  <input
                    type="text"
                    value={newPO.cost}
                    onChange={(e) => setNewPO({ ...newPO, cost: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono"
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
                  Save Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManagement;
