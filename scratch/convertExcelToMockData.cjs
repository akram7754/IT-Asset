const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = 'C:/Users/Admin/Desktop/IT_Asset_Master_Inventory_All_Inventory_2026-07-31.xlsx';
const workbook = xlsx.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

console.log(`Found ${rawRows.length} rows in Excel file.`);

const parsedAssets = rawRows.map((r, index) => {
  let cat = String(r['Category'] || 'Laptop').trim();
  if (cat.toUpperCase() === 'LAPTOP') cat = 'Laptop';
  if (cat.toUpperCase() === 'DESKTOP') cat = 'Desktop';
  if (cat.toUpperCase() === 'SIM CARD') cat = 'SIM Card';
  if (cat.toUpperCase() === 'MOBILE') cat = 'Mobile';

  let status = String(r['Status'] || 'Available').trim();
  if (status === 'IT Stock') status = 'Available';

  const sno = r['S.No'] || (index + 1);
  const assetCode = r['Asset Code'] || `TGBS/B/L${sno}`;

  return {
    id: String(r['Asset ID'] || `AST-${1000 + index + 1}`).trim(),
    assetCode: assetCode,
    name: String(r['Asset Name'] || '').trim(),
    category: cat,
    serial: String(r['Serial Number'] || '').trim(),
    processor: String(r['Processor'] || '').trim(),
    ram: String(r['RAM'] || '').trim(),
    storage: String(r['Storage'] || '').trim(),
    monitorName: String(r['Monitor Name'] || '').trim(),
    monitorSerial: String(r['Monitor Serial'] || '').trim(),
    mouseModel: String(r['Mouse Model'] || '').trim(),
    mouseSerial: String(r['Mouse Serial'] || '').trim(),
    keyboardSerial: String(r['Keyboard Serial'] || '').trim(),
    accessoryItem: String(r['Accessory Item'] || '').trim(),
    accessoryModel: String(r['Accessory Model'] || '').trim(),
    accessorySerial: String(r['Accessory Serial'] || '').trim(),
    os: String(r['OS'] || '').trim(),
    software: String(r['Installed Software'] || '').trim(),
    simNumber: String(r['SIM ICCID / Serial'] || '').trim(),
    simPhoneNumber: String(r['SIM Mobile Number'] || '').trim(),
    simCarrier: String(r['SIM Carrier'] || '').trim(),
    simPlanDetails: String(r['SIM Plan Details'] || '').trim(),
    status: status,
    assignedTo: String(r['Assigned User'] || '').trim(),
    assignedToEmail: String(r['Assigned Email'] || '').trim(),
    location: String(r['Location'] || 'Bangalore').trim(),
    purchaseDate: String(r['Purchase Date'] || '').trim(),
    modelDate: String(r['Model Date'] || '').trim(),
    memoFile: r['Memo File Attached'] === 'Yes'
  };
});

// Build mockData.js content
const mockDataContent = `export const assetsData = ${JSON.stringify(parsedAssets, null, 2)};

export const employeesData = [
  { id: 'EMP-001', name: 'Syed', role: 'Senior Systems Admin', department: 'IT Operations', email: 'syed@company.com', phone: '+91 9876543210', assetsCount: 3 },
  { id: 'EMP-002', name: 'Charan', role: 'IT Support Specialist', department: 'IT Infrastructure', email: 'charan@company.com', phone: '+91 9876543211', assetsCount: 2 },
  { id: 'EMP-003', name: 'Sarah Jenkins', role: 'Software Engineer', department: 'Engineering', email: 'sarah.j@company.com', phone: '+1 (555) 123-4567', assetsCount: 2 },
  { id: 'EMP-004', name: 'Michael Chang', role: 'Product Manager', department: 'Product', email: 'michael.c@company.com', phone: '+1 (555) 234-5678', assetsCount: 1 },
  { id: 'EMP-005', name: 'David Smith', role: 'UX Designer', department: 'Design', email: 'david.s@company.com', phone: '+1 (555) 345-6789', assetsCount: 3 },
  { id: 'EMP-006', name: 'Emily Davis', role: 'HR Director', department: 'Human Resources', email: 'emily.d@company.com', phone: '+1 (555) 456-7890', assetsCount: 1 },
  { id: 'EMP-007', name: 'Sam Chen', role: 'Sales Lead', department: 'Sales', email: 'sam.c@company.com', phone: '+1 (555) 567-8901', assetsCount: 2 },
  { id: 'EMP-008', name: 'Rajesh Kumar', role: 'DevOps Lead', department: 'Engineering', email: 'rajesh.k@company.com', phone: '+91 9876543212', assetsCount: 2 }
];

export const vendorsData = [
  { id: 'VND-001', name: 'Skyeagle Technologies', type: 'Laptop & Hardware Repair', contact: 'Syed', email: 'syed@skyeagle.com', phone: '+91 9876543210', activePOs: 5, status: 'Active' },
  { id: 'VND-002', name: 'Dell Technologies', type: 'Hardware Supplier', contact: 'Alex Rivera', email: 'alex@dell-partners.com', phone: '+1 (800) 123-4567', activePOs: 3, status: 'Active' },
  { id: 'VND-003', name: 'Apple Enterprise', type: 'Hardware Supplier', contact: 'Sam Chen', email: 'sam.c@apple-ent.com', phone: '+1 (800) 234-5678', activePOs: 1, status: 'Active' },
  { id: 'VND-004', name: 'Cisco Systems', type: 'Network Equipment', contact: 'Jordan Lee', email: 'jlee@cisco.com', phone: '+1 (800) 345-6789', activePOs: 2, status: 'Active' },
  { id: 'VND-005', name: 'Microsoft AppSource', type: 'Software Provider', contact: 'Casey Smith', email: 'casey@microsoft.com', phone: '+1 (800) 456-7890', activePOs: 5, status: 'Active' }
];

export const maintenanceTasksData = [];
`;

const targetPath = path.join(__dirname, '../src/data/mockData.js');
fs.writeFileSync(targetPath, mockDataContent, 'utf-8');
console.log(`Successfully imported ${parsedAssets.length} assets from Excel into ${targetPath}`);
