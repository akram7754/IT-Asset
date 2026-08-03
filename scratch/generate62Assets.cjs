const fs = require('fs');
const path = require('path');

const firstNames = ['Syed', 'Charan', 'Sarah', 'Michael', 'David', 'Emily', 'Sam', 'Rajesh', 'Ananya', 'Priya', 'Vikram', 'Siddharth', 'Deepak', 'Neha', 'Aman', 'Kavita', 'Rohan', 'Sneha', 'Arjun', 'Meera', 'Karan', 'Pooja', 'Rahul', 'Divya', 'Suresh', 'Anita', 'Manish', 'Tanya', 'Varun', 'Swati'];
const lastNames = ['Khan', 'Teja', 'Jenkins', 'Chang', 'Smith', 'Davis', 'Chen', 'Kumar', 'Sharma', 'Patel', 'Malhotra', 'Rao', 'Nair', 'Gupta', 'Verma', 'Reddy', 'Mehta', 'Joshi', 'Kapoor', 'Iyer', 'Bhatia', 'Deshmukh', 'Singhania', 'Chawla', 'Pillai', 'Ranganathan', 'Saxena', 'Chopra', 'Agarwal', 'Bansal'];
const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'New York HQ', 'Remote'];

const laptopModels = [
  { name: 'Lenovo ThinkPad L14', serialPrefix: 'PF2VCP3D', proc: 'Intel Core i5-1235U', ram: '16 GB DDR4', storage: '512 GB NVMe SSD', os: 'Windows 11 Pro' },
  { name: 'Lenovo ThinkPad X1 Carbon', serialPrefix: 'LNV-SYD-9981', proc: 'Intel Core i7-1260P', ram: '32 GB LPDDR5', storage: '1 TB SSD', os: 'Windows 11 Pro' },
  { name: 'Dell Latitude 3480', serialPrefix: 'DEL-CHR-1092', proc: 'Intel Core i5-8250U', ram: '8 GB', storage: '256 GB SSD', os: 'Windows 10 Pro' },
  { name: 'Dell Latitude 5430 Laptop', serialPrefix: 'DEL-LAT-5430', proc: 'Intel Core i7-1255U', ram: '16 GB DDR4', storage: '512 GB SSD', os: 'Windows 11 Pro' },
  { name: 'MacBook Pro 16" M2 Pro', serialPrefix: 'C02YK1234', proc: 'Apple M2 Pro (12-core)', ram: '32 GB', storage: '512 GB SSD', os: 'macOS Sonoma 14.2' }
];

const assets = [];

// Exactly 62 assets total: 47 Assigned, 15 Available, 0 Under Maintenance
// 61 Cellular/SIM Cards
for (let i = 1; i <= 62; i++) {
  const idNum = 1000 + i;
  const id = `AST-${idNum}`;
  const assetCode = `TGBS/B/L${i}`;

  const status = i <= 47 ? 'Assigned' : 'Available';

  const fn = firstNames[(i - 1) % firstNames.length];
  const ln = lastNames[(i - 1) % lastNames.length];
  const assignedTo = status === 'Assigned' ? `${fn} ${ln}` : '';
  const assignedToEmail = status === 'Assigned' ? `${fn.toLowerCase()}.${ln.toLowerCase()}@company.com` : '';
  const loc = locations[(i - 1) % locations.length];

  let category = 'Laptop';
  if (i % 6 === 0) category = 'SIM Card';
  else if (i % 8 === 0) category = 'Desktop';
  else category = 'Laptop';

  const hasSim = i <= 61;

  const model = laptopModels[(i - 1) % laptopModels.length];
  let serial = `${model.serialPrefix}-${i}`;
  if (i === 1) serial = 'PF2VCP3D';
  if (i === 2) serial = 'LNV-SYD-9981';

  assets.push({
    id,
    assetCode,
    name: category === 'SIM Card' ? `Corporate 5G SIM Card (${fn} ${ln})` : model.name,
    category,
    serial,
    processor: category === 'SIM Card' ? '' : model.proc,
    ram: category === 'SIM Card' ? '' : model.ram,
    storage: category === 'SIM Card' ? '' : model.storage,
    monitorName: category === 'SIM Card' ? '' : 'Built-in FHD Display',
    monitorSerial: category === 'SIM Card' ? '' : `MON-LNV-${100 + i}`,
    mouseModel: category === 'SIM Card' ? '' : 'Logitech Wireless Mouse M185',
    mouseSerial: category === 'SIM Card' ? '' : `MS-LOG-${200 + i}`,
    accessoryItem: category === 'SIM Card' ? '' : (i % 2 === 0 ? 'Headphone' : 'RJ45 Cable'),
    accessoryModel: category === 'SIM Card' ? '' : (i % 2 === 0 ? 'Jabra Evolve 65' : 'Cat6 Patch Cable 5m'),
    accessorySerial: category === 'SIM Card' ? '' : `ACC-${300 + i}`,
    keyboardSerial: category === 'SIM Card' ? '' : `KB-LNV-${100 + i}`,
    os: category === 'SIM Card' ? '' : model.os,
    software: 'Microsoft 365, Hubspot, Chrome, Slack',
    simNumber: hasSim ? `899110${1000000000 + i}` : '',
    simPhoneNumber: hasSim ? `+91 98${70000000 + i}` : '',
    simCarrier: hasSim ? (i % 2 === 0 ? 'Airtel Business 5G' : 'Jio Corporate 5G') : '',
    simPlanDetails: hasSim ? 'Corporate Unlimited Data' : '',
    status,
    assignedTo,
    assignedToEmail,
    location: loc,
    purchaseDate: `2024-0${(i % 9) + 1}-15`,
    modelDate: 'Mar-22'
  });
}

const mockDataContent = `export const assetsData = ${JSON.stringify(assets, null, 2)};

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

export const maintenanceTasksData = [
  { id: 'MNT-201', asset: 'Lenovo ThinkPad L14 (PF2VCP3D)', issue: 'Display Screen Change & Panel Repair', assignedTo: 'Skyeagle Technologies', priority: 'High', status: 'Completed', dueDate: '2026-02-05' },
  { id: 'MNT-202', asset: 'Lenovo ThinkPad L14 (PF2VCP3D)', issue: 'Battery Replacement & Power IC Repair', assignedTo: 'Skyeagle Technologies', priority: 'High', status: 'Completed', dueDate: '2025-11-12' },
  { id: 'MNT-203', asset: 'Cisco Meraki MR46', issue: 'Firmware Update', assignedTo: 'John Doe', priority: 'High', status: 'In Progress', dueDate: '2026-03-01' },
  { id: 'MNT-204', asset: 'MacBook Pro 16"', issue: 'Battery Replacement', assignedTo: 'Jane Smith', priority: 'Medium', status: 'Scheduled', dueDate: '2026-03-05' }
];
`;

const targetPath = path.join(__dirname, '../src/data/mockData.js');
fs.writeFileSync(targetPath, mockDataContent, 'utf-8');
console.log(`Successfully restored exact 62 assets dataset in ${targetPath}`);
