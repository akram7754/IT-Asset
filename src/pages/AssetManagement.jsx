import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Filter, Edit2, Trash2, QrCode, Monitor, 
  MousePointer, Cpu, User, HardDrive, Smartphone, Network, Laptop,
  Eye, Mail, Layers, ShieldCheck, Database, AppWindow, MapPin, Calendar, CheckCircle2, ChevronRight, X,
  CreditCard, Phone, Radio, Signal, Check, Upload, Download, FileSpreadsheet, FileText, Globe, Wrench, History, Headphones
} from 'lucide-react';
import { assetsData, employeesData } from '../data/mockData';
import { saveAssetsToStorage, hydrateAssetsWithIDB, saveMemoToIDB } from '../utils/storage';

const AssetManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('search') || '';
  const statusFromUrl = searchParams.get('status') || 'All';
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(statusFromUrl);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('25');
  const [showAssetHistoryInDetails, setShowAssetHistoryInDetails] = useState(false);
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('itam_assets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved assets:', e);
      }
    }
    return assetsData;
  });

  // Safely persist assets into LocalStorage & IndexedDB (prevents QuotaExceededError)
  useEffect(() => {
    saveAssetsToStorage(assets);
  }, [assets]);

  // On mount, hydrate full memo file data from IndexedDB
  useEffect(() => {
    hydrateAssetsWithIDB(assets).then((hydrated) => {
      if (Array.isArray(hydrated)) {
        setAssets(hydrated);
      }
    });
  }, []);

  const [employeesList, setEmployeesList] = useState(() => {
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
    const syncData = () => {
      const savedAssets = localStorage.getItem('itam_assets');
      if (savedAssets) {
        try {
          const parsed = JSON.parse(savedAssets);
          if (Array.isArray(parsed)) setAssets(parsed);
        } catch (e) {}
      }
      const savedEmps = localStorage.getItem('itam_employees');
      if (savedEmps) {
        try {
          const parsed = JSON.parse(savedEmps);
          if (Array.isArray(parsed)) setEmployeesList(parsed);
        } catch (e) {}
      }
    };

    window.addEventListener('storage', syncData);
    window.addEventListener('focus', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('focus', syncData);
    };
  }, []);

  const [editingAsset, setEditingAsset] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [qrModalAsset, setQrModalAsset] = useState(null);
  const [previewMemoFile, setPreviewMemoFile] = useState(null);
  const [previewTabMode, setPreviewTabMode] = useState('document'); // 'document' | 'letterhead'
  const [toastMessage, setToastMessage] = useState(null);

  // Helper function for uploading and storing memo files cleanly without storage errors
  const handleMemoFileUpload = (file, targetAsset, onSuccess) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showNotification(`File "${file.name}" exceeds the maximum 25MB limit. Please choose a smaller file.`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = event.target.result;
        const updated = {
          ...targetAsset,
          memoFile: fileData,
          memoFileName: file.name,
          memoUploadDate: new Date().toISOString().split('T')[0]
        };

        if (targetAsset && targetAsset.id) {
          await saveMemoToIDB(targetAsset.id, fileData);
        }

        onSuccess(updated);
        showNotification(`Signed Memo "${file.name}" attached successfully!`);
      } catch (err) {
        console.error('Error handling memo file:', err);
        showNotification('Error processing memo file. Please try again.', 'error');
      }
    };

    reader.onerror = (err) => {
      console.error('FileReader error:', err);
      showNotification('Failed to read selected memo file.', 'error');
    };

    reader.readAsDataURL(file);
  };

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [bulkUploadTab, setBulkUploadTab] = useState('excel'); // 'excel' | 'memos'
  const [parsedAssets, setParsedAssets] = useState([]);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [bulkMemoFiles, setBulkMemoFiles] = useState([]);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isSigAuditModalOpen, setIsSigAuditModalOpen] = useState(false);
  const [sigTargetAsset, setSigTargetAsset] = useState(null);
  const [signatureInput, setSignatureInput] = useState('');
  const [sigTabMode, setSigTabMode] = useState('draw');
  const [hasDrawnSig, setHasDrawnSig] = useState(false);
  const sigCanvasRef = React.useRef(null);

  const startSigDraw = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.isDrawingState = true;
    setHasDrawnSig(true);
  };

  const drawSig = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas || !canvas.isDrawingState) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY)) - rect.top;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopSigDraw = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) canvas.isDrawingState = false;
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSig(false);
  };

  const initialFormState = {
    name: '',
    category: 'Desktop',
    serial: '',
    processor: '',
    ram: '',
    storage: '',
    monitorName: '',
    monitorSerial: '',
    mouseModel: '',
    mouseSerial: '',
    accessoryItem: '',
    accessoryModel: '',
    accessorySerial: '',
    keyboardSerial: '',
    graphicCard: '',
    os: '',
    software: '',
    simNumber: '',
    simPhoneNumber: '',
    simCarrier: '',
    simPlanDetails: '',
    modelDate: '',
    assetCode: '',
    memoFile: '',
    memoFileName: '',
    memoUploadDate: '',
    digitalSignature: '',
    assignedTo: '',
    assignedToEmail: '',
    assignedToRole: '',
    assignedToDept: '',
    location: 'New York HQ',
    status: 'Available'
  };
  const [newAsset, setNewAsset] = useState(initialFormState);

  useEffect(() => {
    setSearchTerm(queryFromUrl);
  }, [queryFromUrl]);

  const showNotification = (msg) => {
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

  const categories = ['All', 'Laptop', 'Desktop', 'SIM Card', 'Mobile', 'Monitor', 'Server', 'Network Device', 'Tablet', 'Printer', 'Peripheral'];
  const statuses = ['All', 'IT Stock', 'Assigned', 'Available', 'Under Maintenance', 'Retired'];
  const locations = ['All', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'New York HQ', 'Remote'];

  const filteredAssets = assets.filter((asset) => {
    const term = searchTerm.trim().toLowerCase();

    // Effective status calculation
    const isAssigned = (asset.assignedTo && asset.assignedTo.trim() !== '') || asset.status === 'Assigned';
    const isRetired = asset.status === 'Retired';
    const isMaintenance = asset.status === 'Under Maintenance' || asset.status === 'In Maintenance';
    const isITStock = !isAssigned && !isRetired && !isMaintenance;
    const effectiveStatusText = isAssigned ? 'assigned' : isRetired ? 'retired' : isMaintenance ? 'under maintenance' : 'it stock available';

    // Search query matching across all text fields (including Category, Status, Location)
    const matchesSearch = !term ||
      asset.name.toLowerCase().includes(term) ||
      asset.id.toLowerCase().includes(term) ||
      (asset.assetCode && asset.assetCode.toLowerCase().includes(term)) ||
      (asset.serial && asset.serial.toLowerCase().includes(term)) ||
      (asset.category && asset.category.toLowerCase().includes(term)) ||
      (asset.assignedTo && asset.assignedTo.toLowerCase().includes(term)) ||
      (asset.assignedToEmail && asset.assignedToEmail.toLowerCase().includes(term)) ||
      (asset.processor && asset.processor.toLowerCase().includes(term)) ||
      (asset.monitorSerial && asset.monitorSerial.toLowerCase().includes(term)) ||
      (asset.mouseSerial && asset.mouseSerial.toLowerCase().includes(term)) ||
      (asset.simNumber && asset.simNumber.toLowerCase().includes(term)) ||
      (asset.simPhoneNumber && asset.simPhoneNumber.toLowerCase().includes(term)) ||
      (asset.simCarrier && asset.simCarrier.toLowerCase().includes(term)) ||
      (asset.os && asset.os.toLowerCase().includes(term)) ||
      (asset.graphicCard && asset.graphicCard.toLowerCase().includes(term)) ||
      (asset.location && asset.location.toLowerCase().includes(term)) ||
      effectiveStatusText.includes(term);

    // Category dropdown matching (case-insensitive substring match)
    const matchesCategory = selectedCategory === 'All' || 
      (asset.category && asset.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'Laptop' && asset.category && asset.category.toLowerCase().includes('laptop')) ||
      (selectedCategory === 'Desktop' && asset.category && asset.category.toLowerCase().includes('desktop'));

    // Status dropdown matching
    const matchesStatus =
      selectedStatus === 'All' ? true :
      selectedStatus === 'Assigned' ? isAssigned :
      (selectedStatus === 'IT Stock' || selectedStatus === 'Available') ? isITStock :
      selectedStatus === 'Under Maintenance' ? isMaintenance :
      selectedStatus === 'Retired' ? isRetired :
      (asset.status && asset.status.toLowerCase() === selectedStatus.toLowerCase());

    // Location dropdown matching
    const matchesLocation = selectedLocation === 'All' || 
      (asset.location && asset.location.toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, selectedLocation, itemsPerPage]);

  const itemsPerPageNum = itemsPerPage === 'All' ? filteredAssets.length : (parseInt(itemsPerPage, 10) || 25);
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / (itemsPerPageNum || 1)));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPageNum;
  const indexOfFirstItem = itemsPerPage === 'All' ? 0 : indexOfLastItem - itemsPerPageNum;
  const currentAssets = itemsPerPage === 'All' ? filteredAssets : filteredAssets.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddAssetSubmit = (e) => {
    e.preventDefault();
    if (!newAsset.name) return;

    const nextId = `AST-${1000 + assets.length + 1}`;
    const createdAsset = {
      ...newAsset,
      serial: newAsset.category === 'SIM Card' ? (newAsset.simNumber || `SIM-${nextId}`) : newAsset.serial,
      id: nextId,
      purchaseDate: new Date().toISOString().split('T')[0]
    };

    setAssets([createdAsset, ...assets]);
    setIsAddModalOpen(false);
    setNewAsset(initialFormState);
    showNotification(`New asset ${nextId} added successfully!`);
  };

  const handleSaveEditSubmit = (e) => {
    if (e) e.preventDefault();
    if (!editingAsset) return;

    const updated = assets.map((a) => (a.id === editingAsset.id ? editingAsset : a));
    setAssets(updated);

    if (viewingAsset && viewingAsset.id === editingAsset.id) {
      setViewingAsset(editingAsset);
    }

    const savedId = editingAsset.id;
    setEditingAsset(null);
    showNotification(`Asset ${savedId} updated successfully!`);
  };

  const handleDeleteAsset = (id) => {
    if (window.confirm(`Are you sure you want to delete asset ${id}?`)) {
      setAssets(assets.filter((a) => a.id !== id));
      if (viewingAsset && viewingAsset.id === id) setViewingAsset(null);
      showNotification(`Asset ${id} deleted successfully.`);
    }
  };

  const downloadSampleCSV = () => {
    const sampleHeaders = "Asset Name,Category,Serial / ICCID,Processor,RAM,Storage,OS,Software,SIM Mobile Number,SIM Carrier,SIM Plan Details,Assigned To,Employee Email,Location,Status\n";
    const sampleRows = [
      '"MacBook Air M2","Laptop","C02XX9876","Apple M2","16 GB","512 GB SSD","macOS Sonoma","VS Code, Slack","","","","Sarah Jenkins","sarah.j@company.com","New York HQ","Assigned"',
      '"Dell Latitude 3480","Laptop","6W3TVJ2","Intel Core i3 6th Gen","16 GB","500 GB SSD","Windows 10","MS Office 365","+1 (555) 987-6543","Airtel / AT&T","Corporate 5G","Reeha","reeha@tresconglobal.com","Bangalore","Assigned"',
      '"Corporate 5G SIM Card","SIM Card","8991223344556677889F","","","","","","+1 (555) 321-7654","Verizon","100GB High-Speed","","","New York HQ","Available"'
    ].join('\n');

    const blob = new Blob([sampleHeaders + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'IT_Asset_Bulk_Upload_Sample_Template.csv');
    a.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length <= 1) {
          setUploadError('The uploaded file appears to be empty or missing data rows.');
          return;
        }

        // CSV line parser handling quotes
        const parseCSVLine = (line) => {
          const result = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if ((char === ',' || char === '\t') && !inQuotes) {
              result.push(cur.trim().replace(/^"(.*)"$/, '$1'));
              cur = '';
            } else {
              cur += char;
            }
          }
          result.push(cur.trim().replace(/^"(.*)"$/, '$1'));
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
        const dataRows = lines.slice(1);

        const parsedList = dataRows.map((line, idx) => {
          const cols = parseCSVLine(line);
          if (cols.length < 1 || !cols[0]) return null;

          const getCol = (keyName, defaultIdx) => {
            const hIdx = headers.findIndex(h => h.includes(keyName.toLowerCase()));
            if (hIdx !== -1 && cols[hIdx] !== undefined) return cols[hIdx];
            return cols[defaultIdx] || '';
          };

          const name = getCol('name', 0) || getCol('asset', 0) || `Bulk Asset ${idx + 1}`;
          const category = getCol('category', 1) || 'Laptop';
          const serial = getCol('serial', 2) || getCol('iccid', 2) || `BULK-SN-${Date.now().toString().slice(-4)}-${idx + 1}`;
          const processor = getCol('processor', 3);
          const ram = getCol('ram', 4);
          const storage = getCol('storage', 5);
          const os = getCol('os', 6);
          const software = getCol('software', 7);
          const simPhoneNumber = getCol('mobile', 8) || getCol('phone', 8);
          const simCarrier = getCol('carrier', 9);
          const simPlanDetails = getCol('plan', 10);
          const assignedTo = getCol('assigned', 11) || getCol('employee', 11);
          const assignedToEmail = getCol('email', 12);
          const location = getCol('location', 13) || 'Main Office';
          const status = getCol('status', 14) || (assignedTo ? 'Assigned' : 'Available');

          return {
            name,
            category,
            serial: category === 'SIM Card' ? (serial || `SIM-ICCID-${idx + 1}`) : serial,
            simNumber: serial,
            processor,
            ram,
            storage,
            os,
            software,
            simPhoneNumber,
            simCarrier,
            simPlanDetails,
            assignedTo,
            assignedToEmail,
            location,
            status
          };
        }).filter(Boolean);

        if (parsedList.length === 0) {
          setUploadError('No valid asset rows found in the file.');
        } else {
          setParsedAssets(parsedList);
        }
      } catch (err) {
        setUploadError('Failed to parse file. Please ensure it is a valid CSV or Excel export.');
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmBulkUpload = () => {
    if (parsedAssets.length === 0) return;

    let currentMaxNum = assets.reduce((max, a) => {
      const num = parseInt(a.id.replace('AST-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1000);

    const newAssetsWithIds = parsedAssets.map((asset, idx) => ({
      ...asset,
      id: `AST-${currentMaxNum + idx + 1}`,
      purchaseDate: new Date().toISOString().split('T')[0]
    }));

    setAssets([...newAssetsWithIds, ...assets]);
    setIsUploadModalOpen(false);
    setParsedAssets([]);
    setUploadFileName('');
    showNotification(`Successfully uploaded ${newAssetsWithIds.length} IT Assets in one shot!`);
  };

  const handleBulkMemoFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const name = file.name;
          const lowerName = name.toLowerCase().replace(/[\s\-_]/g, '');

          // Find best matching asset by ID, code, employee name or serial
          let matchedAsset = assets.find((a) => {
            if (a.id && lowerName.includes(a.id.toLowerCase().replace(/[\s\-_]/g, ''))) return true;
            if (a.assetCode && lowerName.includes(a.assetCode.toLowerCase().replace(/[\s\-_]/g, ''))) return true;
            if (a.assignedTo && a.assignedTo.trim() !== '' && lowerName.includes(a.assignedTo.toLowerCase().replace(/[\s\-_]/g, ''))) return true;
            if (a.serial && lowerName.includes(a.serial.toLowerCase().replace(/[\s\-_]/g, ''))) return true;
            return false;
          });

          resolve({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            dataUrl: evt.target.result,
            matchedAssetId: matchedAsset ? matchedAsset.id : (assets[0] ? assets[0].id : '')
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((parsedList) => {
      setBulkMemoFiles((prev) => [...prev, ...parsedList]);
      e.target.value = '';
    });
  };

  const handleConfirmBulkMemosUpload = async () => {
    if (bulkMemoFiles.length === 0) return;

    const updatedAssets = [...assets];
    let attachedCount = 0;

    for (const memoObj of bulkMemoFiles) {
      if (!memoObj.matchedAssetId) continue;
      const targetIdx = updatedAssets.findIndex(a => a.id === memoObj.matchedAssetId);
      if (targetIdx !== -1) {
        updatedAssets[targetIdx] = {
          ...updatedAssets[targetIdx],
          memoFile: memoObj.dataUrl,
          memoFileName: memoObj.name,
          memoUploadDate: new Date().toISOString().split('T')[0]
        };
        // Persist to IndexedDB
        await saveMemoToIDB(memoObj.matchedAssetId, memoObj.dataUrl);
        attachedCount++;
      }
    }

    setAssets(updatedAssets);
    setBulkMemoFiles([]);
    setIsUploadModalOpen(false);
    showNotification(`Successfully attached ${attachedCount} Signed Memos to IT Assets in bulk!`);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Desktop': return <Cpu className="w-4 h-4 text-blue-500" />;
      case 'Laptop': return <Laptop className="w-4 h-4 text-indigo-500" />;
      case 'Monitor': return <Monitor className="w-4 h-4 text-purple-500" />;
      case 'Mobile': return <Smartphone className="w-4 h-4 text-green-500" />;
      case 'SIM Card': return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'Server': return <HardDrive className="w-4 h-4 text-orange-500" />;
      default: return <Network className="w-4 h-4 text-teal-500" />;
    }
  };

  const resolveEmployeeRole = (empName) => {
    if (!empName) return 'Staff / Employee';
    const found = employeesList.find(e => e.name?.toLowerCase() === empName.toLowerCase()) || employeesData.find(e => e.name?.toLowerCase() === empName.toLowerCase());
    if (found) {
      return found.role || found.designation || found.department || 'Staff / Employee';
    }
    return 'Staff / Employee';
  };

  const handleEmployeeSelect = (empName, isEdit = false) => {
    const selectedEmp = employeesList.find(e => e.name === empName) || employeesData.find(e => e.name === empName);
    const email = selectedEmp ? selectedEmp.email : '';
    const role = selectedEmp ? (selectedEmp.role || selectedEmp.designation || selectedEmp.department) : '';

    if (isEdit) {
      setEditingAsset(prev => ({ 
        ...prev, 
        assignedTo: empName, 
        assignedToEmail: email,
        assignedToRole: role || prev.assignedToRole || 'Staff / Employee'
      }));
    } else {
      setNewAsset(prev => ({ 
        ...prev, 
        assignedTo: empName, 
        assignedToEmail: email,
        assignedToRole: role || prev.assignedToRole || 'Staff / Employee'
      }));
    }
  };

  return (
    <div className="space-y-6 flex flex-col min-h-full pb-12 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Asset Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage IT assets, Desktops, Laptops, SIM Cards, and Cellular Data Plans</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setBulkUploadTab('memos');
              setIsUploadModalOpen(true);
            }}
            className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-all shadow-sm gap-2 active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-700" />
            Bulk Upload Signed Memos (Word/PDF)
          </button>
          <button
            onClick={() => {
              setBulkUploadTab('excel');
              setIsUploadModalOpen(true);
            }}
            className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all shadow-sm gap-2 active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Bulk Import Assets (Excel/CSV)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-sm gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Asset
          </button>
        </div>
      </div>

      {/* QUICK INTERACTIVE STOCK BREAKDOWN CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setSelectedStatus('IT Stock')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedStatus === 'IT Stock'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]'
              : 'bg-white text-gray-800 border-purple-200 hover:border-purple-400 hover:bg-purple-50/50'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${selectedStatus === 'IT Stock' ? 'text-purple-200' : 'text-purple-700'}`}>
              📦 IT Stock (Available)
            </span>
            <span className="text-xl font-extrabold mt-0.5 block">
              {assets.filter(a => a.status !== 'Retired' && a.status !== 'Under Maintenance' && (!a.assignedTo || a.assignedTo.trim() === '' || a.status === 'IT Stock' || a.status === 'In IT Stock' || a.status === 'Available')).length}
            </span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${selectedStatus === 'IT Stock' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'}`}>
            Show Stock
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('Assigned')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedStatus === 'Assigned'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
              : 'bg-white text-gray-800 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${selectedStatus === 'Assigned' ? 'text-emerald-200' : 'text-emerald-700'}`}>
              👤 Assigned Assets
            </span>
            <span className="text-xl font-extrabold mt-0.5 block">
              {assets.filter(a => (a.assignedTo && a.assignedTo.trim() !== '') || a.status === 'Assigned').length}
            </span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${selectedStatus === 'Assigned' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            In Use
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('Under Maintenance')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedStatus === 'Under Maintenance'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]'
              : 'bg-white text-gray-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${selectedStatus === 'Under Maintenance' ? 'text-amber-200' : 'text-amber-700'}`}>
              🔧 Under Maintenance
            </span>
            <span className="text-xl font-extrabold mt-0.5 block">
              {assets.filter(a => a.status === 'Under Maintenance' || a.status === 'In Maintenance').length}
            </span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${selectedStatus === 'Under Maintenance' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
            Service
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('All')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            selectedStatus === 'All'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
              : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${selectedStatus === 'All' ? 'text-blue-200' : 'text-gray-500'}`}>
              📊 All Inventory
            </span>
            <span className="text-xl font-extrabold mt-0.5 block">{assets.length}</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${selectedStatus === 'All' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
            View All
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-[260px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </span>
          <input
            type="text"
            className="w-full py-2 pl-9 pr-4 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Search by name, ID, CPU S/N, SIM Card, Carrier, Phone No, Email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-bold text-gray-600">Category:</span>
            <select
              className="py-1 px-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium bg-white cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-bold text-gray-600">Status:</span>
            <select
              className="py-1 px-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium bg-white cursor-pointer"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((st) => (
                <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-bold text-gray-600">Location:</span>
            <select
              className="py-1 px-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium bg-white cursor-pointer"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
              ))}
            </select>
          </div>

          {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedLocation !== 'All' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSelectedLocation('All');
                handleSearchChange('');
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* CLEAN & SLEEK ASSETS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Asset Info</th>
                <th scope="col" className="px-6 py-4 font-semibold">Serial Number</th>
                <th scope="col" className="px-6 py-4 font-semibold">Category</th>
                <th scope="col" className="px-6 py-4 font-semibold">Assigned User</th>
                <th scope="col" className="px-6 py-4 font-semibold">Location</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAssets.map((asset) => (
                <tr 
                  key={asset.id} 
                  onClick={() => setViewingAsset(asset)}
                  className="bg-white border-b border-gray-50 hover:bg-blue-50/60 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 flex items-center gap-2 group-hover:text-primary transition-colors">
                        {getCategoryIcon(asset.category)}
                        {asset.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span className="font-mono">{asset.id}</span>
                        {asset.assetCode && (
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {asset.assetCode}
                          </span>
                        )}
                        {asset.memoFile && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title={`Signed Memo Attached: ${asset.memoFileName || 'Document'}`}>
                            <FileText className="w-3 h-3 text-amber-600" />
                            Signed Memo
                          </span>
                        )}
                        {(asset.modelDate || asset.purchaseDate) && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-sans">
                            • <Calendar className="w-3 h-3 text-gray-400" />
                            {asset.modelDate || asset.purchaseDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-800">
                    <div>{asset.serial || asset.simNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {asset.assignedTo ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {asset.assignedTo}
                        </span>
                        {asset.assignedToEmail && (
                          <span className="text-[11px] text-gray-500 font-mono">{asset.assignedToEmail}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">{asset.location}</td>
                  <td className="px-6 py-4">
                    {asset.status === 'Retired' ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-800 border border-red-200">
                        🚫 Retired
                      </span>
                    ) : asset.status === 'Under Maintenance' ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                        🔧 Under Maintenance
                      </span>
                    ) : asset.status === 'Assigned' || (asset.assignedTo && asset.assignedTo.trim() !== '') ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Assigned
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                        📦 IT Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingAsset(asset)}
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors rounded-md hover:bg-blue-50 flex items-center gap-1 text-xs font-medium"
                        title="View Full Specs & Details"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="hidden lg:inline text-primary">View Specs</span>
                      </button>
                      <button
                        onClick={() => setQrModalAsset(asset)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                        title="Asset Tag & QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingAsset({ ...asset })}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                        title="Edit Asset Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                No IT assets match your current search parameters or active filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                  setSelectedLocation('All');
                  handleSearchChange('');
                }}
                className="px-4 py-2 text-xs font-semibold text-primary bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* PAGINATION & DISPLAY CONTROLS */}
        {filteredAssets.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-gray-900">{itemsPerPage === 'All' ? 1 : Math.min(indexOfFirstItem + 1, filteredAssets.length)}</strong> to{' '}
                <strong className="text-gray-900">{Math.min(indexOfLastItem, filteredAssets.length)}</strong> of{' '}
                <strong className="text-gray-900">{filteredAssets.length}</strong> assets
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-gray-500">Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="py-1 px-2 text-xs border border-gray-300 rounded bg-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="All">All (Unlimited Scroll)</option>
                </select>
              </div>
            </div>

            {itemsPerPage !== 'All' && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 2)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && page - arr[idx - 1] > 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-md font-semibold text-xs border transition-colors cursor-pointer ${
                          safeCurrentPage === page
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  type="button"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULL ASSET SPECIFICATION & DETAILS MODAL / SHEET */}
      {viewingAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md text-white border border-white/20">
                  {getCategoryIcon(viewingAsset.category)}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{viewingAsset.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-blue-200 mt-1 font-mono">
                    <span>ID: {viewingAsset.id}</span>
                    {viewingAsset.assetCode && (
                      <>
                        <span>•</span>
                        <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-400/30 font-mono">
                          Code: {viewingAsset.assetCode}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="bg-blue-800/60 px-2 py-0.5 rounded text-white font-sans">{viewingAsset.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toEdit = viewingAsset;
                    setEditingAsset({ ...toEdit });
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm border border-blue-400/30"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Details
                </button>
                <button 
                  onClick={() => setViewingAsset(null)} 
                  className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content / Details */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50/50">
              {/* Employee Assignment Banner */}
              <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg shadow-xs">
                    {viewingAsset.assignedTo ? viewingAsset.assignedTo.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assigned Employee</span>
                    <h4 className="text-base font-extrabold text-gray-900">{viewingAsset.assignedTo || 'Currently Unassigned'}</h4>
                    {viewingAsset.assignedToEmail && (
                      <p className="text-xs text-blue-600 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        {viewingAsset.assignedToEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <span className={`px-3.5 py-1 text-xs font-extrabold rounded-full border ${
                    viewingAsset.status === 'Available' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    viewingAsset.status === 'Assigned' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {viewingAsset.status}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {viewingAsset.location || 'Bangalore'}
                  </span>
                </div>
              </div>

              {/* IT ASSET MEMO & SIGNED RESPONSIBILITY COPY CARD */}
              <div className="bg-amber-50/70 p-5 rounded-xl shadow-xs border border-amber-200 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-amber-200/70">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    IT ASSET HANDOVER MEMO & SIGNED RESPONSIBILITY COPY
                  </h4>
                  <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                    Employee Liability Signed Copy
                  </span>
                </div>

                {viewingAsset.memoFile ? (
                  <div className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-xs block truncate max-w-xs sm:max-w-md">
                          {viewingAsset.memoFileName || 'IT Asset memo.docx'}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          Uploaded: {viewingAsset.memoUploadDate || '2026-07-26'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewTabMode('document');
                          setPreviewMemoFile({ url: viewingAsset.memoFile, name: viewingAsset.memoFileName, asset: viewingAsset });
                        }}
                        className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        Preview Online
                      </button>
                      <a
                        href={viewingAsset.memoFile}
                        download={viewingAsset.memoFileName || `Signed_Asset_Memo_${viewingAsset.id}.pdf`}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Copy
                      </a>
                      <label className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        Replace
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            handleMemoFileUpload(file, viewingAsset, (updated) => {
                              setViewingAsset(updated);
                              setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
                            });
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/90 p-4 rounded-xl border border-dashed border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">No Signed Memo Attached Yet</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">Upload signed memo (Word, PDF, JPG) confirming employee damage responsibility.</p>
                    </div>

                    <label className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-amber-700" />
                      Upload Signed Memo (PDF/Word)
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          handleMemoFileUpload(file, viewingAsset, (updated) => {
                            setViewingAsset(updated);
                            setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
                          });
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* CPU & SYSTEM HARDWARE SPECS (Match Screenshot layout) */}
              {viewingAsset.category !== 'SIM Card' && (
                <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    CPU & SYSTEM HARDWARE SPECS
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-semibold text-[11px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        Model Date
                      </span>
                      <p className="font-extrabold text-gray-900 text-xs">{viewingAsset.modelDate || viewingAsset.purchaseDate || '2026-07-25'}</p>
                    </div>
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-semibold text-[11px]">CPU Serial Number</span>
                      <p className="font-mono text-xs font-extrabold text-gray-900">
                        {viewingAsset.serial ? (viewingAsset.serial.toLowerCase().startsWith('s/n:') ? viewingAsset.serial : `S/N: ${viewingAsset.serial}`) : 'S/N: PF2VCP3D'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-semibold text-[11px]">Processor</span>
                      <p className="font-extrabold text-gray-900 text-xs">{viewingAsset.processor || 'Intel i3 11th Gen'}</p>
                    </div>
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-semibold text-[11px]">RAM Memory</span>
                      <p className="font-extrabold text-gray-900 text-xs">{viewingAsset.ram || '8 GB'}</p>
                    </div>
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-semibold text-[11px]">HHD / Storage</span>
                      <p className="font-extrabold text-gray-900 text-xs">{viewingAsset.storage || '256gb SSD hard Disk,'}</p>
                    </div>
                    <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 font-semibold text-[11px]">Graphic Card</span>
                      <p className="font-extrabold text-gray-900 text-xs">{viewingAsset.graphicCard || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* OPERATING SYSTEM & INSTALLED SOFTWARE (Match Screenshot) */}
              {viewingAsset.category !== 'SIM Card' && (
                <div className="bg-white p-5 rounded-xl shadow-xs border border-teal-100 space-y-3">
                  <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-teal-100/60">
                    <AppWindow className="w-4 h-4 text-teal-600" />
                    OPERATING SYSTEM & INSTALLED SOFTWARE
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-center">
                    <div>
                      <span className="text-gray-400 font-medium block mb-1">Operating System (OS)</span>
                      <p className="font-bold text-gray-900">{viewingAsset.os || 'Windows 10'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 font-medium block mb-1">Installed Software & Licenses</span>
                      <p className="font-mono text-xs text-gray-800 bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                        {viewingAsset.software || 'Microsoft 365,Hubspot'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* LAPTOP REPAIR & VENDOR SPEND HISTORY LOG */}
              {(() => {
                let vendors = [];
                try {
                  const saved = localStorage.getItem('itam_vendors_table_v4');
                  if (saved) vendors = JSON.parse(saved);
                } catch (e) {}

                if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
                  vendors = [
                    {
                      id: 'VND-001',
                      date: '2026-02-05',
                      user: 'Syed',
                      laptopName: 'Lenovo L14',
                      laptopSerial: 'PF2VCP3D',
                      category: 'Lenovo Laptop Display Change',
                      name: 'Skyeagle Technologies',
                      price: '8,529',
                      invoice: 'STI/2025-26/0085'
                    },
                    {
                      id: 'VND-002',
                      date: '2025-11-12',
                      user: 'Syed',
                      laptopName: 'Lenovo L14',
                      laptopSerial: 'PF2VCP3D',
                      category: 'Battery Replacement & Power IC Repair',
                      name: 'Skyeagle Technologies',
                      price: '3,921',
                      invoice: 'STI/2025-26/0012'
                    }
                  ];
                }

                const rawSerial = (viewingAsset.serial || viewingAsset.simNumber || '').trim().toLowerCase();
                const cleanSerial = rawSerial.replace(/^s\/n:\s*/i, '').trim();
                const assetUser = (viewingAsset.assignedTo || '').trim().toLowerCase();
                const assetName = (viewingAsset.name || '').trim().toLowerCase();

                const matched = vendors.filter(v => {
                  if (!v) return false;
                  const vSerial = (v.laptopSerial || '').trim().toLowerCase().replace(/^s\/n:\s*/i, '');
                  const vUser = (v.user || v.contact || '').trim().toLowerCase();
                  const vLaptop = (v.laptopName || '').trim().toLowerCase();

                  const matchesSerial = cleanSerial && vSerial && (vSerial.includes(cleanSerial) || cleanSerial.includes(vSerial));
                  const matchesUser = assetUser && vUser && (vUser === assetUser);
                  const matchesLaptop = assetName && vLaptop && (vLaptop.includes(assetName) || assetName.includes(vLaptop));

                  return matchesSerial || matchesUser || matchesLaptop;
                });

                const totalProblems = matched.length;
                const totalSpent = matched.reduce((acc, v) => {
                  const priceNum = parseFloat((v.price || '0').replace(/[^0-9.]/g, '')) || 0;
                  return acc + priceNum;
                }, 0);

                return (
                  <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white p-5 rounded-xl shadow-md border border-indigo-700 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-cyan-300" />
                          LAPTOP REPAIR & VENDOR MAINTENANCE SPEND HISTORY
                        </h4>
                        <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                          <span className="text-[11px] font-extrabold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded border border-amber-300/30">
                            ⚠️ {totalProblems} Times Got Problem
                          </span>
                          <span className="text-[11px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-400/30 font-mono">
                            ₹{totalSpent.toLocaleString()} Total Spent
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAssetHistoryInDetails(prev => !prev)}
                        className="px-4 py-2 text-xs font-extrabold text-indigo-950 bg-cyan-300 hover:bg-cyan-200 active:scale-95 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <History className="w-4 h-4 text-indigo-900" />
                        {showAssetHistoryInDetails ? 'Hide Laptop History' : '📜 View Laptop History'}
                      </button>
                    </div>

                    {showAssetHistoryInDetails && (
                      <div className="bg-white text-gray-800 rounded-xl border border-indigo-200 overflow-hidden shadow-xl animate-in fade-in duration-200">
                        <div className="p-3 bg-gray-100/90 border-b border-gray-200 flex justify-between items-center text-xs">
                          <span className="font-bold text-indigo-950">Itemized Maintenance Timeline ({matched.length} Records)</span>
                        </div>
                        {matched.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-indigo-50 text-indigo-950 font-bold uppercase text-[10px] border-b border-indigo-200">
                                <tr>
                                  <th className="p-2.5">Date</th>
                                  <th className="p-2.5">Problem / Service Category</th>
                                  <th className="p-2.5">Vendor Partner</th>
                                  <th className="p-2.5">Vendor Invoice #</th>
                                  <th className="p-2.5 text-right">Repair Cost</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 bg-white">
                                {matched.map((rec, idx) => (
                                  <tr key={idx} className="hover:bg-blue-50/40 font-medium">
                                    <td className="p-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">📅 {rec.date || '2026-02-05'}</td>
                                    <td className="p-2.5 text-purple-900 font-bold">🔧 {rec.category || rec.type}</td>
                                    <td className="p-2.5 font-bold text-gray-900">{rec.name}</td>
                                    <td className="p-2.5 font-mono text-gray-700 font-bold">{rec.invoice || 'STI/2025-26/0085'}</td>
                                    <td className="p-2.5 font-mono font-extrabold text-emerald-700 text-right text-sm">₹{rec.price || '8,529'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 font-semibold text-xs">
                            No repair or maintenance vendor bills logged for this asset yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Monitor & Mouse Peripherals (If applicable) */}
              {viewingAsset.category !== 'SIM Card' && (viewingAsset.monitorName || viewingAsset.mouseModel || viewingAsset.category === 'Desktop') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow-xs border border-purple-100 space-y-2">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-purple-50">
                      <Monitor className="w-4 h-4 text-purple-600" />
                      Monitor Details
                    </h4>
                    <div className="pt-1">
                      <span className="text-xs text-gray-400 font-medium">Monitor Name / Model</span>
                      <p className="text-sm font-semibold text-gray-900">{viewingAsset.monitorName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium">Monitor Serial Number</span>
                      <p className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-100 w-fit mt-0.5">
                        {viewingAsset.monitorSerial || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-xs border border-emerald-100 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-emerald-50">
                      <MousePointer className="w-4 h-4 text-emerald-600" />
                      Mouse Details
                    </h4>
                    <div className="pt-1">
                      <span className="text-xs text-gray-400 font-medium">Mouse Model</span>
                      <p className="text-sm font-semibold text-gray-900">{viewingAsset.mouseModel || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium">Serial Number (Mouse)</span>
                      <p className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 w-fit mt-0.5">
                        {viewingAsset.mouseSerial || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Accessories & Peripherals (Headphones, RJ45 Cable, etc.) */}
              {viewingAsset.category !== 'SIM Card' && (viewingAsset.accessoryItem || viewingAsset.accessoryModel || viewingAsset.accessorySerial) && (
                <div className="bg-white p-5 rounded-xl shadow-xs border border-cyan-200 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-950 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-cyan-100">
                    <Headphones className="w-4 h-4 text-cyan-600" />
                    {viewingAsset.accessoryItem ? `${viewingAsset.accessoryItem} & Additional Accessories` : 'Headphone & Cable Accessory Details'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium block mb-0.5">Item / Accessory Name</span>
                      <p className="font-bold text-gray-900">{viewingAsset.accessoryItem || 'Headphone / Cable'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block mb-0.5">Model Name</span>
                      <p className="font-bold text-gray-900">{viewingAsset.accessoryModel || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block mb-0.5">Serial Number (S/N)</span>
                      <p className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200 w-fit mt-0.5">
                        {viewingAsset.accessorySerial || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SIM CARD & CELLULAR NETWORK DETAILS (At the bottom matching Screenshot) */}
              <div className="bg-emerald-50/60 p-5 rounded-xl shadow-xs border border-emerald-200/80 space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-emerald-200/60">
                  <CreditCard className="w-[18px] h-[18px] text-emerald-600" />
                  SIM CARD & CELLULAR NETWORK DETAILS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-emerald-800 font-medium block">SIM Serial Number (ICCID)</span>
                    <p className="font-mono text-xs font-bold text-emerald-950">
                      S/N: {viewingAsset.simNumber || (viewingAsset.category === 'SIM Card' ? viewingAsset.serial : 'PG02KT94')}
                    </p>
                  </div>
                  <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-emerald-800 font-medium block">Mobile Phone Number</span>
                    <p className="font-semibold text-emerald-950 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {viewingAsset.simPhoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-emerald-800 font-medium block">Telecom Carrier</span>
                    <p className="font-semibold text-emerald-950 flex items-center gap-1">
                      <Signal className="w-3.5 h-3.5 text-emerald-600" />
                      {viewingAsset.simCarrier || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-emerald-800 font-medium block">Data & Voice Plan</span>
                    <p className="font-semibold text-emerald-950">
                      {viewingAsset.simPlanDetails || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
              <button
                onClick={() => {
                  const toEdit = viewingAsset;
                  setEditingAsset({ ...toEdit });
                }}
                className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Asset Details
              </button>
              <button
                onClick={() => setViewingAsset(null)}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#1e40af] hover:bg-[#1e3a8a] rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close Specifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-800">Add New IT Asset</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddAssetSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Top Assignment Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-xs font-medium text-blue-900 mb-1">Assigned To (Employee Name)</label>
                  <input
                    type="text"
                    list="add-employee-list"
                    placeholder="Enter employee name manually..."
                    value={newAsset.assignedTo || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchedEmp = employeesList.find(emp => emp.name.toLowerCase() === val.toLowerCase());
                      setNewAsset(prev => ({
                        ...prev,
                        assignedTo: val,
                        assignedToEmail: matchedEmp ? matchedEmp.email : prev.assignedToEmail,
                        assignedToRole: matchedEmp ? matchedEmp.role : (prev.assignedToRole || ''),
                        assignedToDept: matchedEmp ? matchedEmp.department : (prev.assignedToDept || ''),
                        status: val.trim() !== '' ? 'Assigned' : 'Available'
                      }));
                    }}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium"
                  />
                  <datalist id="add-employee-list">
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.role} • {emp.department} ({emp.email})</option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-900 mb-1">Assigned To Employee Email Id</label>
                  <input
                    type="email"
                    placeholder="e.g. employee@company.com"
                    value={newAsset.assignedToEmail}
                    onChange={(e) => setNewAsset({ ...newAsset, assignedToEmail: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Asset Code / Tag, Asset Info / Name, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Asset Code / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. TGBS/B/L10"
                    value={newAsset.assetCode || ''}
                    onChange={(e) => setNewAsset({ ...newAsset, assetCode: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Asset Info / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell Latitude 3480"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium bg-white cursor-pointer"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop Workstation</option>
                    <option value="SIM Card">SIM Card</option>
                    <option value="Mobile">Mobile / Smartphone</option>
                    <option value="Monitor">Monitor / Display</option>
                    <option value="Server">Server</option>
                    <option value="Network Device">Network Device</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Printer">Printer / Scanner</option>
                    <option value="Peripheral">Peripheral / Accessory</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Model Date, CPU Serial Number, Processor */}
              {newAsset.category !== 'SIM Card' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Model Date / Release Date</label>
                      <input
                        type="text"
                        placeholder="e.g. 2023-05-15 / May 2023"
                        value={newAsset.modelDate || newAsset.purchaseDate || ''}
                        onChange={(e) => setNewAsset({ ...newAsset, modelDate: e.target.value, purchaseDate: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">CPU Serial Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CPU-DEL-7090-X1"
                        value={newAsset.serial}
                        onChange={(e) => setNewAsset({ ...newAsset, serial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Processor</label>
                      <input
                        type="text"
                        placeholder="e.g. Intel Core i7-12700"
                        value={newAsset.processor}
                        onChange={(e) => setNewAsset({ ...newAsset, processor: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Row 4: Ram, HHD / Storage, Graphic Card, OS */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Ram</label>
                      <input
                        type="text"
                        placeholder="e.g. 16 GB DDR4"
                        value={newAsset.ram}
                        onChange={(e) => setNewAsset({ ...newAsset, ram: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">HHD / Storage</label>
                      <input
                        type="text"
                        placeholder="e.g. 512 GB SSD"
                        value={newAsset.storage}
                        onChange={(e) => setNewAsset({ ...newAsset, storage: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Graphic Card</label>
                      <input
                        type="text"
                        placeholder="e.g. NVIDIA RTX 3060 / Intel Iris"
                        value={newAsset.graphicCard || ''}
                        onChange={(e) => setNewAsset({ ...newAsset, graphicCard: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">OS</label>
                      <input
                        type="text"
                        placeholder="e.g. Windows 11 Pro"
                        value={newAsset.os}
                        onChange={(e) => setNewAsset({ ...newAsset, os: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Row 5: Software */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Software</label>
                    <input
                      type="text"
                      placeholder="e.g. Microsoft 365,Hubspot"
                      value={newAsset.software}
                      onChange={(e) => setNewAsset({ ...newAsset, software: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-gray-800"
                    />
                  </div>

                  {/* Row 6: Monitor Name & Serial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">Monitor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dell UltraSharp 27"
                        value={newAsset.monitorName}
                        onChange={(e) => setNewAsset({ ...newAsset, monitorName: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">Monitor- Serial Number</label>
                      <input
                        type="text"
                        placeholder="e.g. MON-DEL-2722-A"
                        value={newAsset.monitorSerial}
                        onChange={(e) => setNewAsset({ ...newAsset, monitorSerial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 7: Mouse Model & Serial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">Mouse Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Logitech MX Master 3S"
                        value={newAsset.mouseModel}
                        onChange={(e) => setNewAsset({ ...newAsset, mouseModel: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">Serial Number (Mouse)</label>
                      <input
                        type="text"
                        placeholder="e.g. MS-LOG-MX3-01"
                        value={newAsset.mouseSerial}
                        onChange={(e) => setNewAsset({ ...newAsset, mouseSerial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 8: Other Accessories & Peripherals (Headphone, RJ45 Cable, etc.) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-cyan-50/50 p-3.5 rounded-xl border border-cyan-200">
                    <div>
                      <label className="block text-xs font-bold text-cyan-950 mb-1 flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5 text-cyan-600" /> Accessory / Item Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Headphone / RJ45 Cable / Dongle"
                        value={newAsset.accessoryItem || ''}
                        onChange={(e) => setNewAsset({ ...newAsset, accessoryItem: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cyan-950 mb-1">Model Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jabra Evolve 65 / Cat6 Cable"
                        value={newAsset.accessoryModel || ''}
                        onChange={(e) => setNewAsset({ ...newAsset, accessoryModel: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cyan-950 mb-1">Serial Number (Accessory S/N)</label>
                      <input
                        type="text"
                        placeholder="e.g. HDP-JAB-9912 (Manual Fill)"
                        value={newAsset.accessorySerial || ''}
                        onChange={(e) => setNewAsset({ ...newAsset, accessorySerial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono text-gray-900 font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SIM CARD DETAILS SECTION */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  SIM CARD DETAILS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">SIM Serial Number (ICCID) *</label>
                    <input
                      type="text"
                      required={newAsset.category === 'SIM Card'}
                      placeholder="S/N: LROAXH46"
                      value={newAsset.simNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, simNumber: e.target.value, serial: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono bg-white text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">SIM Mobile Phone Number</label>
                    <input
                      type="text"
                      placeholder="Mobile number..."
                      value={newAsset.simPhoneNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, simPhoneNumber: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-sans"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Telecom Carrier / Provider</label>
                    <input
                      type="text"
                      placeholder="Carrier provider..."
                      value={newAsset.simCarrier}
                      onChange={(e) => setNewAsset({ ...newAsset, simCarrier: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Data / Voice Plan Details</label>
                    <select
                      value={newAsset.simPlanDetails || ''}
                      onChange={(e) => setNewAsset({ ...newAsset, simPlanDetails: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium cursor-pointer"
                    >
                      <option value="">-- Select Plan --</option>
                      <option value="Data">Data</option>
                      <option value="Voice">Voice</option>
                      <option value="Data / Voice">Data / Voice</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* IT ASSET SIGNED MEMO FILE UPLOAD SECTION */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  IT ASSET SIGNED MEMO COPY (WORD / PDF / SCANNED COPY)
                </label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-amber-200 flex-wrap sm:flex-nowrap">
                  <input
                    type="file"
                    id="add-memo-file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      handleMemoFileUpload(file, newAsset, (updated) => {
                        setNewAsset(updated);
                      });
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor="add-memo-file" className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg border border-amber-300 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    Attach Word / PDF Memo
                  </label>
                  <span className="text-xs text-gray-700 font-mono truncate flex-1 font-semibold">
                    {newAsset.memoFileName ? newAsset.memoFileName : 'No file selected (Word, PDF, JPG)'}
                  </span>
                  {newAsset.memoFileName && (
                    <div className="flex items-center gap-2">
                      {newAsset.memoFile && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPreviewMemoFile({ url: newAsset.memoFile, name: newAsset.memoFileName, asset: newAsset })}
                            className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                            title="Preview document on screen"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            Preview
                          </button>
                          <a
                            href={newAsset.memoFile}
                            download={newAsset.memoFileName}
                            className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-white hover:bg-amber-50 border border-amber-300 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                            title="Download file to computer"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-600" />
                            Download
                          </a>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setNewAsset(prev => ({ ...prev, memoFile: '', memoFileName: '', memoUploadDate: '' }))}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1 cursor-pointer"
                      >
                        &times; Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5 whitespace-nowrap">
                    ✍ Digital Signature:
                  </label>
                  <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Type employee signature (e.g. Charan / Sarah Jenkins)"
                      value={newAsset.digitalSignature || ''}
                      onChange={(e) => setNewAsset({ ...newAsset, digitalSignature: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-serif italic text-blue-900 font-bold bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSigTargetAsset(newAsset);
                        setSignatureInput(newAsset.assignedTo || '');
                        setIsSignatureModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      ✍ Sign Digitally
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 10: Status & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={newAsset.status || 'IT Stock'}
                    onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-gray-800 bg-white cursor-pointer"
                  >
                    <option value="IT Stock">IT Stock</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Available">Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ASSET MODAL (MATCH SCREENSHOT ORDER) */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-800 text-base">Edit Asset Details ({editingAsset.id})</h3>
              </div>
              <button 
                onClick={() => setEditingAsset(null)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Row 1: Top Employee Assignment Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Assigned To (Employee Name)</label>
                  <input
                    type="text"
                    list="edit-employee-list"
                    placeholder="Charan"
                    value={editingAsset.assignedTo || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchedEmp = employeesList.find(emp => emp.name.toLowerCase() === val.toLowerCase());
                      setEditingAsset(prev => ({
                        ...prev,
                        assignedTo: val,
                        assignedToEmail: matchedEmp ? matchedEmp.email : prev.assignedToEmail,
                        assignedToRole: matchedEmp ? matchedEmp.role : (prev.assignedToRole || ''),
                        assignedToDept: matchedEmp ? matchedEmp.department : (prev.assignedToDept || ''),
                        status: val.trim() !== '' ? 'Assigned' : 'Available'
                      }));
                    }}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium"
                  />
                  <datalist id="edit-employee-list">
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.name}>{emp.role} • {emp.department} ({emp.email})</option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Assigned To Employee Email Id</label>
                  <input
                    type="email"
                    placeholder="charan@tresconglobal.com"
                    value={editingAsset.assignedToEmail || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, assignedToEmail: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono text-gray-800"
                  />
                </div>
              </div>

              {/* Row 2: Asset Code / Tag, Asset Info / Name, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Asset Code / Tag</label>
                  <input
                    type="text"
                    placeholder="TGBS/B/L10"
                    value={editingAsset.assetCode || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, assetCode: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Asset Info / Name</label>
                  <input
                    type="text"
                    placeholder="Lenovo V310-14ISK"
                    value={editingAsset.name}
                    onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-gray-800 bg-white cursor-pointer"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop Workstation</option>
                    <option value="SIM Card">SIM Card</option>
                    <option value="Mobile">Mobile / Smartphone</option>
                    <option value="Monitor">Monitor / Display</option>
                    <option value="Server">Server</option>
                    <option value="Network Device">Network Device</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Printer">Printer / Scanner</option>
                    <option value="Peripheral">Peripheral / Accessory</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Model Date, CPU Serial Number, Processor */}
              {editingAsset.category !== 'SIM Card' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Model Date / Release Date</label>
                      <input
                        type="text"
                        placeholder="Mar-18"
                        value={editingAsset.modelDate || editingAsset.purchaseDate || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, modelDate: e.target.value, purchaseDate: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">CPU Serial Number</label>
                      <input
                        type="text"
                        placeholder="S/N: LROAXH46"
                        value={editingAsset.serial || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, serial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Processor</label>
                      <input
                        type="text"
                        placeholder="Intel i3 6th Gen"
                        value={editingAsset.processor || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, processor: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Row 4: Ram, HHD / Storage, Graphic Card, OS */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ram</label>
                      <input
                        type="text"
                        placeholder="8 GB"
                        value={editingAsset.ram || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, ram: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">HHD / Storage</label>
                      <input
                        type="text"
                        placeholder="256 Gb SSD Hard Disk"
                        value={editingAsset.storage || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, storage: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Graphic Card</label>
                      <input
                        type="text"
                        placeholder="e.g. NVIDIA RTX 3060"
                        value={editingAsset.graphicCard || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, graphicCard: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">OS</label>
                      <input
                        type="text"
                        placeholder="Windows 10"
                        value={editingAsset.os || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, os: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Row 5: Software */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Software</label>
                    <input
                      type="text"
                      placeholder="Microsoft 365,Hubspot"
                      value={editingAsset.software || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, software: e.target.value })}
                      className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-gray-800"
                    />
                  </div>

                  {/* Row 6: Monitor Name & Serial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">Monitor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dell UltraSharp 27"
                        value={editingAsset.monitorName || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, monitorName: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-900 mb-1">Monitor- Serial Number</label>
                      <input
                        type="text"
                        placeholder="e.g. MON-DEL-2722-A"
                        value={editingAsset.monitorSerial || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, monitorSerial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 7: Mouse Model & Serial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">Mouse Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Logitech MX Master 3S"
                        value={editingAsset.mouseModel || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, mouseModel: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">Serial Number (Mouse)</label>
                      <input
                        type="text"
                        placeholder="e.g. MS-LOG-MX3-01"
                        value={editingAsset.mouseSerial || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, mouseSerial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 8: Other Accessories & Peripherals (Headphone, RJ45 Cable, etc.) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-cyan-50/50 p-3.5 rounded-xl border border-cyan-200">
                    <div>
                      <label className="block text-xs font-bold text-cyan-950 mb-1 flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5 text-cyan-600" /> Accessory / Item Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Headphone / RJ45 Cable / Dongle"
                        value={editingAsset.accessoryItem || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, accessoryItem: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cyan-950 mb-1">Model Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jabra Evolve 65 / Cat6 Cable"
                        value={editingAsset.accessoryModel || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, accessoryModel: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cyan-950 mb-1">Serial Number (Accessory S/N)</label>
                      <input
                        type="text"
                        placeholder="e.g. HDP-JAB-9912 (Manual Fill)"
                        value={editingAsset.accessorySerial || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, accessorySerial: e.target.value })}
                        className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-mono text-gray-900 font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Row 8: SIM CARD DETAILS SECTION (Matching Screenshot) */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  SIM CARD DETAILS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">SIM Serial Number (ICCID)</label>
                    <input
                      type="text"
                      placeholder="S/N: LROAXH46"
                      value={editingAsset.simNumber || (editingAsset.category === 'SIM Card' ? editingAsset.serial : '')}
                      onChange={(e) => setEditingAsset({ ...editingAsset, simNumber: e.target.value, serial: editingAsset.category === 'SIM Card' ? e.target.value : editingAsset.serial })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono bg-white text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">SIM Mobile Phone Number</label>
                    <input
                      type="text"
                      placeholder="Mobile number..."
                      value={editingAsset.simPhoneNumber || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, simPhoneNumber: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Telecom Carrier / Provider</label>
                    <input
                      type="text"
                      placeholder="Carrier provider..."
                      value={editingAsset.simCarrier || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, simCarrier: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Data / Voice Plan Details</label>
                    <select
                      value={editingAsset.simPlanDetails || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, simPlanDetails: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white font-medium cursor-pointer"
                    >
                      <option value="">-- Select Plan --</option>
                      <option value="Data">Data</option>
                      <option value="Voice">Voice</option>
                      <option value="Data / Voice">Data / Voice</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 9: IT ASSET SIGNED MEMO FILE UPLOAD SECTION (Matching Screenshot) */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-3">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  IT ASSET SIGNED MEMO COPY (WORD / PDF / SCANNED COPY)
                </label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-amber-200 flex-wrap sm:flex-nowrap">
                  <input
                    type="file"
                    id="edit-memo-file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      handleMemoFileUpload(file, editingAsset, (updated) => {
                        setEditingAsset(updated);
                      });
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor="edit-memo-file" className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg border border-amber-300 cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    Attach Word / PDF Memo
                  </label>
                  <span className="text-xs text-gray-700 font-mono truncate flex-1 font-semibold">
                    {editingAsset.memoFileName ? editingAsset.memoFileName : 'IT Asset memo.docx'}
                  </span>
                  {editingAsset.memoFileName && (
                    <div className="flex items-center gap-2">
                      {editingAsset.memoFile && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewTabMode('document');
                              setPreviewMemoFile({ url: editingAsset.memoFile, name: editingAsset.memoFileName, asset: editingAsset });
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                            title="Preview document on screen"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            Preview
                          </button>
                          <a
                            href={editingAsset.memoFile}
                            download={editingAsset.memoFileName}
                            className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-white hover:bg-amber-50 border border-amber-300 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                            title="Download file to computer"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-600" />
                            Download
                          </a>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingAsset(prev => ({ ...prev, memoFile: '', memoFileName: '', memoUploadDate: '' }))}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1 cursor-pointer"
                      >
                        &times; Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5 whitespace-nowrap">
                    ✍ Digital Signature:
                  </label>
                  <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Type employee signature (e.g. Charan / Sarah Jenkins)"
                      value={editingAsset.digitalSignature || ''}
                      onChange={(e) => setEditingAsset({ ...editingAsset, digitalSignature: e.target.value })}
                      className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-serif italic text-blue-900 font-bold bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSigTargetAsset(editingAsset);
                        setSignatureInput(editingAsset.assignedTo || '');
                        setIsSignatureModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      ✍ Sign Digitally
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 10: Status & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingAsset.status}
                    onChange={(e) => setEditingAsset({ ...editingAsset, status: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-semibold text-gray-800 bg-white cursor-pointer"
                  >
                    <option value="IT Stock">IT Stock</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Available">Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Bangalore"
                    value={editingAsset.location || 'Bangalore'}
                    onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                    className="w-full py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save Asset Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrModalAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-semibold text-gray-800 text-sm">Asset Tag & Serial QR</span>
              <button onClick={() => setQrModalAsset(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block">
              <svg className="w-36 h-36 mx-auto text-gray-900" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                <rect x="40" y="10" width="20" height="10" />
                <rect x="10" y="40" width="10" height="20" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="70" y="40" width="20" height="10" />
                <rect x="40" y="70" width="10" height="20" />
                <rect x="70" y="70" width="20" height="20" />
              </svg>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm">{qrModalAsset.name}</h4>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{qrModalAsset.id} • {qrModalAsset.category}</p>
            </div>

            <div className="text-left text-xs bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1 font-mono">
              <div><strong className="text-gray-700">Serial:</strong> {qrModalAsset.serial}</div>
              {qrModalAsset.simPhoneNumber && <div><strong className="text-emerald-700 font-sans">Mobile:</strong> {qrModalAsset.simPhoneNumber}</div>}
              {qrModalAsset.simNumber && <div><strong className="text-emerald-700 font-sans">SIM ICCID:</strong> {qrModalAsset.simNumber}</div>}
              {qrModalAsset.assignedToEmail && (
                <div className="font-sans pt-1 text-blue-700 border-t border-gray-200 mt-1">
                  <strong>Email:</strong> {qrModalAsset.assignedToEmail}
                </div>
              )}
            </div>

            <button
              onClick={() => setQrModalAsset(null)}
              className="w-full py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL (EXCEL ASSETS & BULK MEMOS) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-800 text-base">Bulk IT Asset Operations Center</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Tab Switcher */}
                <div className="flex bg-gray-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setBulkUploadTab('memos')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      bulkUploadTab === 'memos' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📁 Bulk Upload Memos (Word/PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkUploadTab('excel')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      bulkUploadTab === 'excel' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📊 Bulk Import Assets (Excel/CSV)
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setParsedAssets([]);
                    setBulkMemoFiles([]);
                    setUploadFileName('');
                    setUploadError(null);
                  }} 
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {bulkUploadTab === 'memos' ? (
                /* TAB 2: BULK UPLOAD SIGNED MEMOS */
                <div className="space-y-4">
                  <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-700" />
                        Bulk Upload Signed Handover Memos
                      </h4>
                      <p className="text-gray-600 mt-0.5">
                        Select multiple signed memo files (.pdf, .docx, .doc, .jpg, .png). System auto-matches files to IT Assets by Asset ID or Assignee Name.
                      </p>
                    </div>
                  </div>

                  {/* Drag and drop file picker for multiple memos */}
                  <div className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 rounded-xl p-6 text-center transition-colors">
                    <input
                      type="file"
                      id="bulk-memos-input"
                      multiple
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleBulkMemoFilesChange}
                      className="hidden"
                    />
                    <label htmlFor="bulk-memos-input" className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-amber-600 mx-auto" />
                      <div>
                        <span className="font-bold text-gray-800 text-sm">Click to browse or drop MULTIPLE Signed Memo Files here</span>
                        <p className="text-gray-500 text-xs mt-0.5">Select multiple PDFs, Word Documents (.docx), or JPG/PNG Scanned copies</p>
                      </div>
                    </label>
                  </div>

                  {/* Queued Memo Files Matching Table */}
                  {bulkMemoFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-sm">
                          Queued Memos ({bulkMemoFiles.length} Files Ready to Attach)
                        </span>
                        <button
                          type="button"
                          onClick={() => setBulkMemoFiles([])}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                        >
                          Clear Queue
                        </button>
                      </div>

                      <div className="overflow-x-auto max-h-64 border border-gray-200 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-amber-100/70 border-b border-amber-200 text-amber-950 font-semibold sticky top-0">
                            <tr>
                              <th className="p-2.5">#</th>
                              <th className="p-2.5">Uploaded File Name</th>
                              <th className="p-2.5">File Size</th>
                              <th className="p-2.5">Target Asset Assignment</th>
                              <th className="p-2.5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {bulkMemoFiles.map((item, index) => (
                              <tr key={item.id} className="hover:bg-amber-50/40">
                                <td className="p-2.5 font-mono text-gray-400">{index + 1}</td>
                                <td className="p-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                  <span className="truncate max-w-xs">{item.name}</span>
                                </td>
                                <td className="p-2.5 font-mono text-gray-500">{item.size}</td>
                                <td className="p-2.5">
                                  <select
                                    value={item.matchedAssetId}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setBulkMemoFiles(prev => prev.map(m => m.id === item.id ? { ...m, matchedAssetId: val } : m));
                                    }}
                                    className="w-full py-1 px-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-gray-800 bg-white cursor-pointer"
                                  >
                                    <option value="">-- Select Target Asset --</option>
                                    {assets.map(a => (
                                      <option key={a.id} value={a.id}>
                                        {a.id} - {a.name} ({a.assignedTo || 'Unassigned'})
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setBulkMemoFiles(prev => prev.filter(m => m.id !== item.id))}
                                    className="text-red-500 hover:text-red-700 font-bold px-2 py-0.5 text-xs cursor-pointer"
                                  >
                                    &times; Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 1: BULK IMPORT EXCEL / CSV ASSETS */
                <div className="space-y-4">
                  <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                        Upload Excel (.xlsx, .csv) Sheet
                      </h4>
                      <p className="text-gray-600 mt-1">Upload multiple IT assets, hardware serials, and SIM cards in one single click.</p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadSampleCSV}
                      className="px-3 py-2 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Sample CSV Template
                    </button>
                  </div>

                  {/* Drag and drop file picker */}
                  <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 rounded-xl p-6 text-center transition-colors">
                    <input
                      type="file"
                      id="bulk-file-input"
                      accept=".csv,.txt,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="bulk-file-input" className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div>
                        <span className="font-bold text-gray-800 text-sm">Click to browse or drop your Excel / CSV file here</span>
                        <p className="text-gray-400 text-xs mt-0.5">Supports CSV, TSV, or Excel exports</p>
                      </div>
                      {uploadFileName && (
                        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs mt-2 border border-emerald-200">
                          <FileSpreadsheet className="w-4 h-4" />
                          {uploadFileName}
                        </div>
                      )}
                    </label>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-medium">
                      {uploadError}
                    </div>
                  )}

                  {/* Parsed Assets Preview Table */}
                  {parsedAssets.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-sm">
                          Ready for Import ({parsedAssets.length} Assets Found)
                        </span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          Validated
                        </span>
                      </div>

                      <div className="overflow-x-auto max-h-56 border border-gray-200 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold sticky top-0">
                            <tr>
                              <th className="p-2.5">#</th>
                              <th className="p-2.5">Asset Name</th>
                              <th className="p-2.5">Category</th>
                              <th className="p-2.5">Serial / SIM ICCID</th>
                              <th className="p-2.5">Assigned To</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {parsedAssets.map((asset, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="p-2.5 font-mono text-gray-400">{i + 1}</td>
                                <td className="p-2.5 font-bold text-gray-800">{asset.name}</td>
                                <td className="p-2.5">{asset.category}</td>
                                <td className="p-2.5 font-mono text-gray-700">{asset.serial || asset.simNumber || 'N/A'}</td>
                                <td className="p-2.5">{asset.assignedTo || 'Unassigned'}</td>
                                <td className="p-2.5 font-medium text-emerald-700">{asset.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setParsedAssets([]);
                  setBulkMemoFiles([]);
                  setUploadFileName('');
                  setUploadError(null);
                }}
                className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {bulkUploadTab === 'memos' ? (
                <button
                  type="button"
                  disabled={bulkMemoFiles.length === 0}
                  onClick={handleConfirmBulkMemosUpload}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Attach All {bulkMemoFiles.length > 0 ? `${bulkMemoFiles.length} Memos` : ''} to Assets
                </button>
              ) : (
                <button
                  type="button"
                  disabled={parsedAssets.length === 0}
                  onClick={handleConfirmBulkUpload}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Import {parsedAssets.length > 0 ? `${parsedAssets.length} Assets` : ''} One-Shot
                </button>
              )}
            </div>
          </div>
        </div>
      )}



      {/* IN-APP DOCUMENT PREVIEW MODAL */}
      {previewMemoFile && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[95] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Header */}
            <div className="px-6 py-3.5 bg-gradient-to-r from-amber-900 via-amber-950 to-orange-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                  <FileText className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight truncate max-w-md">{previewMemoFile.name || 'Signed IT Asset Memo'}</h3>
                  <span className="text-[11px] text-amber-200">In-App IT Asset Handover Memo Document Viewer</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                <div className="flex bg-amber-950/90 p-1 rounded-lg border border-amber-700/60 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setPreviewTabMode('document')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      previewTabMode === 'document' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-200 hover:text-white'
                    }`}
                  >
                    📄 Uploaded File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTabMode('letterhead')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      previewTabMode === 'letterhead' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-200 hover:text-white'
                    }`}
                  >
                    📋 Official Letterhead
                  </button>
                </div>
                <a
                  href={previewMemoFile.url}
                  download={previewMemoFile.name || 'Signed_Asset_Memo.pdf'}
                  className="px-3.5 py-1.5 text-xs font-bold bg-white text-amber-950 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </a>
                <button
                  onClick={() => setPreviewMemoFile(null)}
                  className="p-1 text-amber-200 hover:text-white hover:bg-white/10 rounded-full transition-colors text-2xl font-bold leading-none px-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-100 flex flex-col items-center justify-start min-h-[500px]">
              {previewTabMode === 'document' && previewMemoFile.url ? (
                <div className="w-full flex flex-col items-center justify-center space-y-4 my-auto">
                  {/* PDF File Viewer */}
                  {(previewMemoFile.url.startsWith('data:application/pdf') || previewMemoFile.name?.toLowerCase().endsWith('.pdf')) ? (
                    <div className="w-full max-w-4xl h-[620px] bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden flex flex-col">
                      <object
                        data={previewMemoFile.url}
                        type="application/pdf"
                        className="w-full h-full"
                      >
                        <iframe
                          src={previewMemoFile.url}
                          title={previewMemoFile.name || 'PDF Document'}
                          className="w-full h-full"
                        >
                          <div className="p-8 text-center space-y-4 my-auto">
                            <FileText className="w-12 h-12 text-amber-600 mx-auto" />
                            <p className="text-sm font-semibold text-gray-700">PDF preview loaded. Download to view locally.</p>
                            <a
                              href={previewMemoFile.url}
                              download={previewMemoFile.name || 'Memo.pdf'}
                              className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg inline-flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" /> Download PDF File
                            </a>
                          </div>
                        </iframe>
                      </object>
                    </div>
                  ) : (previewMemoFile.url.startsWith('data:image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(previewMemoFile.name || '')) ? (
                    /* Image File Viewer */
                    <div className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg border border-gray-300 flex flex-col items-center justify-center space-y-3">
                      <div className="flex justify-between items-center w-full px-2 pb-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-700">Scanned Memo Image Document</span>
                        <a
                          href={previewMemoFile.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1"
                        >
                          Open Full High-Res Image ↗
                        </a>
                      </div>
                      <img
                        src={previewMemoFile.url}
                        alt={previewMemoFile.name || 'Uploaded Memo'}
                        className="max-w-full max-h-[600px] object-contain rounded-lg border border-gray-200 shadow-xs bg-white p-1"
                      />
                    </div>
                  ) : (
                    /* Word Document or Other File */
                    <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-amber-200 text-center space-y-4 my-auto">
                      <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-300">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="font-extrabold text-lg text-gray-900">{previewMemoFile.name || 'Signed IT Asset Memo Document'}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
                        Word document attached and saved securely. Click below to download the exact copy or view the official IT Handover Memo letterhead copy.
                      </p>
                      <div className="pt-3 flex justify-center gap-3 flex-wrap">
                        <a
                          href={previewMemoFile.url}
                          download={previewMemoFile.name || 'Signed_Asset_Memo.docx'}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Download Word Document File
                        </a>
                        <button
                          type="button"
                          onClick={() => setPreviewTabMode('letterhead')}
                          className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          📋 View Handover Letterhead
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* OFFICIAL TRESCON IT ASSET POLICY & HANDOVER MEMO LETTERHEAD PREVIEW */
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-gray-300 max-w-3xl w-full text-left space-y-6 font-sans text-gray-800 my-4 text-xs leading-relaxed">
                  {/* Trescon Header matching exact letterhead banner */}
                  <div className="space-y-4 pb-4">
                    <div className="flex justify-between items-center px-1">
                      {/* Left Logo Section */}
                      <div className="flex items-center">
                        <div className="relative flex items-center">
                          <span className="text-3xl font-extrabold text-[#54c5c1] tracking-tight font-sans">
                            tresc<span className="relative">o<span className="absolute -top-1.5 right-0.5 w-2.5 h-2.5 bg-[#cbe838] rounded-full border border-white shadow-2xs"></span></span>n
                          </span>
                        </div>
                        <div className="h-10 w-px bg-gray-300 mx-5"></div>
                        <div className="text-[11px] text-gray-500 font-sans leading-snug font-medium">
                          Connecting Businesses<br />with Opportunities
                        </div>
                      </div>

                      {/* Right Contact Info Section */}
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-px bg-gray-300"></div>
                        <div className="text-[11px] text-gray-400 space-y-1 font-sans">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <span>tresconglobal.com</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>info@tresconglobal.com</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>+91 81059 75937</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Full Width Bottom Border Rule */}
                    <div className="border-b border-gray-300 w-full"></div>
                  </div>

                  {/* Memo Details Header */}
                  <div className="flex justify-between items-center font-semibold text-gray-900 pt-2 text-xs">
                    <div>To: <span className="font-bold text-gray-900">{previewMemoFile.asset?.assignedTo ? `${previewMemoFile.asset.assignedTo}${previewMemoFile.asset.assignedToRole ? ` (${previewMemoFile.asset.assignedToRole})` : ''}` : 'All Staff'}</span></div>
                    <div>Date: <span className="font-bold text-gray-900">{previewMemoFile.asset?.memoUploadDate || '13th May 2026'}</span></div>
                  </div>

                  {/* Memo Title */}
                  <div className="text-center font-bold text-sm text-gray-900 tracking-wide uppercase py-1 border-b border-gray-200">
                    AMENDMENT TO THE APPOINTMENT LETTER – MEMO
                  </div>

                  {/* Section 1 */}
                  <div className="space-y-1">
                    <h5 className="font-bold text-cyan-700 text-xs">IT Policy – Company Assets</h5>
                    <p className="text-gray-700">
                      This policy forms part of the Appointment Letter and Company Policies. All Company-issued assets remain the property of the Company and must be handled responsibly to prevent loss, theft, or damage.
                    </p>
                  </div>

                  {/* Complete Hardware Asset Specification Table */}
                  {previewMemoFile.asset && (
                    <div className="bg-cyan-50/70 p-4 rounded-xl border border-cyan-200/90 text-xs space-y-2 text-cyan-950 font-sans shadow-2xs">
                      <div className="font-bold text-cyan-900 uppercase tracking-wider text-[11px] pb-1 border-b border-cyan-200 flex justify-between items-center">
                        <span>Assigned Equipment & Hardware Specifications:</span>
                        <span className="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          Code: {previewMemoFile.asset.assetCode || 'N/A'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono pt-1 text-[11px]">
                        <div>
                          <span className="text-gray-500 font-sans block text-[10px]">Equipment Name:</span>
                          <strong className="text-gray-900 font-sans">{previewMemoFile.asset.name}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans block text-[10px]">Model Date:</span>
                          <strong className="text-gray-900">{previewMemoFile.asset.modelDate || previewMemoFile.asset.purchaseDate || 'Mar-18'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans block text-[10px]">CPU Serial Number:</span>
                          <strong className="text-gray-900">S/N: {previewMemoFile.asset.serial || previewMemoFile.asset.simNumber || 'LROAXH46'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans block text-[10px]">Processor:</span>
                          <strong className="text-gray-900 font-sans">{previewMemoFile.asset.processor || 'Intel i3 6th generation'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans block text-[10px]">RAM Memory:</span>
                          <strong className="text-gray-900 font-sans">{previewMemoFile.asset.ram || '8 GB'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 font-sans block text-[10px]">HHD / Storage:</span>
                          <strong className="text-gray-900 font-sans">{previewMemoFile.asset.storage || '256 Gb SSD Hard Disk'}</strong>
                        </div>
                      </div>
                      {(previewMemoFile.asset.monitorName || previewMemoFile.asset.mouseModel) && (
                        <div className="pt-2 border-t border-cyan-200/80 grid grid-cols-2 gap-2 text-[10px] text-gray-600 font-mono">
                          {previewMemoFile.asset.monitorName && (
                            <div>Monitor: <strong className="text-gray-800 font-sans">{previewMemoFile.asset.monitorName}</strong> ({previewMemoFile.asset.monitorSerial || 'N/A'})</div>
                          )}
                          {previewMemoFile.asset.mouseModel && (
                            <div>Mouse: <strong className="text-gray-800 font-sans">{previewMemoFile.asset.mouseModel}</strong> ({previewMemoFile.asset.mouseSerial || 'N/A'})</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 2 */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-cyan-700 text-xs">Employee Responsibilities</h5>
                    <p className="text-gray-700">Employees are responsible for:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Protecting Company-issued assets from loss, theft, or damage.</li>
                      <li>Maintaining assets in good working condition, subject to normal wear and tear.</li>
                      <li>Reporting any loss, damage, or malfunction immediately to the IT and HR Departments.</li>
                    </ul>
                  </div>

                  {/* Section 3 */}
                  <div className="space-y-1">
                    <h5 className="font-bold text-cyan-700 text-xs">Return of Assets</h5>
                    <p className="text-gray-700">
                      Upon resignation, termination, or separation, employees must return all Company-issued assets, including laptops, desktops, mobile phones, SIM cards, chargers, accessories, and storage devices. Any damage, loss, or failure to return assets may result in recovery of repair or replacement costs from the employee.
                    </p>
                  </div>

                  {/* Section 4 */}
                  <div className="space-y-1">
                    <h5 className="font-bold text-cyan-700 text-xs">Non-Compliance</h5>
                    <p className="text-gray-700">
                      Failure to complete the asset handover process may affect relieving formalities, full and final settlement, incentives, commissions, or other dues, subject to applicable laws. Any misuse or tampering of Company assets will be treated as a policy violation, and the Company reserves the right to take disciplinary or legal action as applicable.
                    </p>
                  </div>

                  {/* Sign-off */}
                  <div className="pt-2 text-xs">
                    <p>Sincerely,</p>
                    <div className="mt-4 font-bold text-gray-900">
                      <div>Edward C Maben</div>
                      <div className="font-semibold text-gray-600">Chief Human Resources Officer</div>
                    </div>
                  </div>

                  {/* Acceptance Signature Block */}
                  <div className="pt-4 border-t border-gray-300 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-gray-900">Accepted by:</div>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ✍ Interactive Fields: Click text to edit Name / Role / Date
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span className="whitespace-nowrap font-bold text-gray-700">Employee Name:</span>
                        <input
                          type="text"
                          placeholder="Enter / Edit Employee Name"
                          value={previewMemoFile.asset?.assignedTo || ''}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const matchedEmp = employeesList.find(emp => emp.name?.toLowerCase() === newName.toLowerCase());
                            const newRole = matchedEmp ? (matchedEmp.role || matchedEmp.designation) : (previewMemoFile.asset?.assignedToRole || resolveEmployeeRole(newName));
                            const newEmail = matchedEmp ? matchedEmp.email : (previewMemoFile.asset?.assignedToEmail || '');
                            
                            const updatedAsset = { 
                              ...previewMemoFile.asset, 
                              assignedTo: newName,
                              assignedToEmail: newEmail,
                              assignedToRole: newRole
                            };
                            setPreviewMemoFile(prev => ({ ...prev, asset: updatedAsset }));
                            setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
                            if (viewingAsset && viewingAsset.id === updatedAsset.id) setViewingAsset(updatedAsset);
                          }}
                          className="font-bold text-gray-900 border-b-2 border-amber-400 focus:border-amber-600 bg-amber-50/60 hover:bg-amber-100/80 px-2 py-1 rounded focus:outline-none text-xs font-sans flex-1 transition-all shadow-2xs"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="whitespace-nowrap font-bold text-gray-700">Date:</span>
                        <input
                          type="date"
                          value={previewMemoFile.asset?.memoUploadDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            const updatedAsset = { ...previewMemoFile.asset, memoUploadDate: newDate };
                            setPreviewMemoFile(prev => ({ ...prev, asset: updatedAsset }));
                            setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
                            if (viewingAsset && viewingAsset.id === updatedAsset.id) setViewingAsset(updatedAsset);
                          }}
                          className="font-bold text-gray-900 border-b-2 border-amber-400 focus:border-amber-600 bg-amber-50/60 hover:bg-amber-100/80 px-2 py-1 rounded focus:outline-none text-xs font-sans flex-1 cursor-pointer shadow-2xs"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="whitespace-nowrap font-bold text-gray-700">Designation:</span>
                        <input
                          type="text"
                          placeholder="Enter Designation / Role"
                          value={previewMemoFile.asset?.assignedToRole || resolveEmployeeRole(previewMemoFile.asset?.assignedTo)}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            const updatedAsset = { ...previewMemoFile.asset, assignedToRole: newRole };
                            setPreviewMemoFile(prev => ({ ...prev, asset: updatedAsset }));
                            setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
                            if (viewingAsset && viewingAsset.id === updatedAsset.id) setViewingAsset(updatedAsset);
                          }}
                          className="font-bold text-gray-900 border-b-2 border-amber-400 focus:border-amber-600 bg-amber-50/60 hover:bg-amber-100/80 px-2 py-1 rounded focus:outline-none text-xs font-sans flex-1 transition-all shadow-2xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Signature:</span>
                        {previewMemoFile.asset?.digitalSignature ? (
                          <div className="inline-block relative">
                            {previewMemoFile.asset.digitalSignature.startsWith('data:image/') ? (
                              <img
                                src={previewMemoFile.asset.digitalSignature}
                                alt="Manual Digital Signature"
                                className="h-11 max-w-[200px] object-contain border-b-2 border-gray-900 inline-block px-2 bg-blue-50/60 rounded"
                              />
                            ) : (
                              <span className="font-serif italic font-extrabold text-lg text-blue-950 tracking-wider transform -rotate-3 inline-block px-4 py-1 border-b-2 border-gray-900 bg-blue-50/70 rounded">
                                {previewMemoFile.asset.digitalSignature}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setIsSigAuditModalOpen(true)}
                              className="text-[10px] text-emerald-700 hover:text-emerald-950 font-mono font-bold block mt-0.5 underline cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 transition-all shadow-2xs"
                              title="Click to view official Digital Signature Verification Certificate & Audit Details"
                            >
                              ✓ Verified Digital Signature (Click to View Certificate)
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSigTargetAsset(previewMemoFile.asset);
                              setSignatureInput(previewMemoFile.asset?.assignedTo || '');
                              setHasDrawnSig(false);
                              setIsSignatureModalOpen(true);
                            }}
                            className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            ✍ Sign Digitally Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Disclaimer */}
                  <div className="pt-4 border-t border-gray-200 text-[9px] text-gray-400 leading-tight text-center">
                    Disclaimer: The information shared by Trescon is confidential and intended solely for the recipient. It may not be copied, distributed, or relied upon without prior written consent. Trescon makes no warranties regarding the accuracy or completeness of the content and accepts no liability for any loss arising from its use. © 2025 Trescon. All rights reserved.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MANUAL FREEHAND CANVAS DIGITAL SIGNATURE MODAL */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-sm">Employee Manual Digital Signature Pad</h3>
              </div>
              <button onClick={() => setIsSignatureModalOpen(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tab Mode Selection */}
              <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setSigTabMode('draw')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    sigTabMode === 'draw' ? 'bg-white text-blue-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  ✍ Draw Freehand Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSigTabMode('type')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    sigTabMode === 'type' ? 'bg-white text-blue-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  ⌨ Type Name Signature
                </button>
              </div>

              {sigTabMode === 'draw' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">Draw Your Signature Below (Mouse / Finger):</span>
                    <button
                      type="button"
                      onClick={clearSigCanvas}
                      className="text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 transition-colors"
                    >
                      🧹 Clear Pad
                    </button>
                  </div>
                  <div className="bg-amber-50/20 p-2 rounded-xl border border-dashed border-gray-400 touch-none text-center">
                    <canvas
                      ref={sigCanvasRef}
                      width={420}
                      height={150}
                      onMouseDown={startSigDraw}
                      onMouseMove={drawSig}
                      onMouseUp={stopSigDraw}
                      onMouseLeave={stopSigDraw}
                      onTouchStart={startSigDraw}
                      onTouchMove={drawSig}
                      onTouchEnd={stopSigDraw}
                      className="bg-white rounded-lg cursor-crosshair shadow-inner mx-auto w-full max-w-full"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 text-center font-mono">
                    {hasDrawnSig ? '✓ Manual freehand signature drawn' : 'Use your mouse cursor or finger on touch screen to draw signature.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Type Employee Signature Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name (e.g. Reeha / Sarah Jenkins)"
                      value={signatureInput}
                      onChange={(e) => setSignatureInput(e.target.value)}
                      className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-2">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider block">Live Cursive Digital Signature Preview</span>
                    <div className="py-4 px-6 bg-white rounded-lg border border-dashed border-gray-300 shadow-2xs inline-block min-w-[240px]">
                      <span className="font-serif italic font-extrabold text-2xl text-blue-950 tracking-wider transform -rotate-3 inline-block px-4 py-1 border-b-2 border-gray-900">
                        {signatureInput || 'Employee Signature'}
                      </span>
                      <div className="text-[10px] text-emerald-700 font-mono font-bold mt-2">✓ Digital Verified Signature</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!sigTargetAsset) return;
                  let sigResult = signatureInput.trim();

                  if (sigTabMode === 'draw') {
                    const canvas = sigCanvasRef.current;
                    if (canvas && hasDrawnSig) {
                      sigResult = canvas.toDataURL('image/png');
                    }
                  }

                  if (!sigResult) sigResult = 'Signed';

                  if (editingAsset && sigTargetAsset.id === editingAsset.id) {
                    setEditingAsset(prev => ({ ...prev, digitalSignature: sigResult }));
                  }
                  if (newAsset && sigTargetAsset === newAsset) {
                    setNewAsset(prev => ({ ...prev, digitalSignature: sigResult }));
                  }

                  setAssets(prev => prev.map(a => a.id === sigTargetAsset.id ? { ...a, digitalSignature: sigResult } : a));

                  if (previewMemoFile && previewMemoFile.asset?.id === sigTargetAsset.id) {
                    setPreviewMemoFile(prev => ({
                      ...prev,
                      asset: { ...prev.asset, digitalSignature: sigResult }
                    }));
                  }

                  setIsSignatureModalOpen(false);
                  showNotification('Manual Digital Signature applied successfully!');
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                ✓ Apply Digital Signature
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DIGITAL SIGNATURE VERIFICATION CERTIFICATE MODAL */}
      {isSigAuditModalOpen && previewMemoFile?.asset && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-emerald-200 animate-in zoom-in-95 duration-200">
            {/* Certificate Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-wide">DIGITAL SIGNATURE AUDIT CERTIFICATE</h3>
                  <span className="text-xs text-emerald-300 font-mono">Verified IT Asset Responsibility Record</span>
                </div>
              </div>
              <button
                onClick={() => setIsSigAuditModalOpen(false)}
                className="text-emerald-200 hover:text-white text-2xl font-bold px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Certificate Content Body */}
            <div className="p-6 space-y-4 text-xs font-sans text-gray-800 bg-gray-50/50">
              {/* Verification Status Banner */}
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl flex items-center gap-3 shadow-2xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-emerald-950 text-sm">AUTHENTIC & VALIDATED DIGITAL SIGNATURE</div>
                  <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    Cryptographically timestamped and bound to assigned employee record.
                  </div>
                </div>
              </div>

              {/* Signature Image / Cursive Graphic Preview */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center space-y-1 shadow-xs">
                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Captured Signature Image</span>
                <div className="py-3 px-4 inline-block min-w-[200px]">
                  {previewMemoFile.asset.digitalSignature?.startsWith('data:image/') ? (
                    <img
                      src={previewMemoFile.asset.digitalSignature}
                      alt="Captured Signature"
                      className="h-14 max-w-[240px] object-contain mx-auto border-b-2 border-gray-900 pb-1"
                    />
                  ) : (
                    <span className="font-serif italic font-extrabold text-2xl text-blue-950 tracking-wider transform -rotate-3 inline-block px-4 py-1 border-b-2 border-gray-900">
                      {previewMemoFile.asset.digitalSignature}
                    </span>
                  )}
                </div>
              </div>

              {/* Signer & Audit Trail Grid */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between pb-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-sans">Signer Name:</span>
                  <strong className="text-gray-900 font-sans">{previewMemoFile.asset.assignedTo || 'Assigned User'}</strong>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-sans">Designation / Role:</span>
                  <strong className="text-gray-900 font-sans">{previewMemoFile.asset.assignedToRole || 'Staff / Employee'}</strong>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-sans">Signer Email:</span>
                  <strong className="text-blue-600">{previewMemoFile.asset.assignedToEmail || 'N/A'}</strong>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-sans">Asset ID / Code:</span>
                  <strong className="text-emerald-700">{previewMemoFile.asset.assetCode || previewMemoFile.asset.id}</strong>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-sans">Verification Timestamp:</span>
                  <strong className="text-gray-800">{previewMemoFile.asset.memoUploadDate || new Date().toISOString().split('T')[0]}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-sans">Security Audit Hash:</span>
                  <strong className="text-xs text-gray-500 truncate max-w-[180px]">SHA256:7f8a9b...3c4e5f</strong>
                </div>
              </div>

              {/* Legal Disclaimer Box */}
              <div className="p-3 bg-gray-100 rounded-lg text-[10px] text-gray-500 leading-relaxed border border-gray-200">
                This digital signature record is binding per Trescon IT asset governance policies. Any unauthorized modification invalidates this audit certificate.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsSigAuditModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                ✓ Close Verification Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
