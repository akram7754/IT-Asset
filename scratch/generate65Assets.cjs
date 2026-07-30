const fs = require('fs');
const path = require('path');

const firstNames = ['Syed', 'Charan', 'Sarah', 'Michael', 'David', 'Emily', 'Sam', 'Rajesh', 'Ananya', 'Priya', 'Vikram', 'Siddharth', 'Deepak', 'Neha', 'Aman', 'Kavita', 'Rohan', 'Sneha', 'Arjun', 'Meera', 'Karan', 'Pooja', 'Rahul', 'Divya', 'Suresh', 'Anita', 'Manish', 'Tanya', 'Varun', 'Swati'];
const lastNames = ['Khan', 'Teja', 'Jenkins', 'Chang', 'Smith', 'Davis', 'Chen', 'Kumar', 'Sharma', 'Patel', 'Malhotra', 'Rao', 'Nair', 'Gupta', 'Verma', 'Reddy', 'Mehta', 'Joshi', 'Kapoor', 'Iyer', 'Bhatia', 'Deshmukh', 'Singhania', 'Chawla', 'Pillai', 'Ranganathan', 'Saxena', 'Chopra', 'Agarwal', 'Bansal'];
const departments = ['Engineering', 'IT Support', 'Product', 'Design', 'Human Resources', 'Sales', 'Finance', 'Marketing', 'Operations', 'Executive'];
const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'New York HQ', 'Remote'];

const laptopModels = [
  { name: 'Lenovo ThinkPad L14 Gen 3', serialPrefix: 'PF2VCP3D', proc: 'Intel Core i5-1235U', ram: '16 GB DDR4', storage: '512 GB NVMe SSD', os: 'Windows 11 Pro' },
  { name: 'Lenovo ThinkPad X1 Carbon Gen 10', serialPrefix: 'LNV-SYD-9981', proc: 'Intel Core i7-1260P', ram: '32 GB LPDDR5', storage: '1 TB SSD', os: 'Windows 11 Pro' },
  { name: 'Dell Latitude 3480', serialPrefix: 'DEL-CHR-1092', proc: 'Intel Core i5-8250U', ram: '8 GB', storage: '256 GB SSD', os: 'Windows 10 Pro' },
  { name: 'Dell Latitude 5430 Laptop', serialPrefix: 'DEL-LAT-5430', proc: 'Intel Core i7-1255U', ram: '16 GB DDR4', storage: '512 GB SSD', os: 'Windows 11 Pro' },
  { name: 'MacBook Pro 16" M2 Pro', serialPrefix: 'C02YK1234', proc: 'Apple M2 Pro (12-core)', ram: '32 GB', storage: '512 GB SSD', os: 'macOS Sonoma 14.2' },
  { name: 'HP EliteBook 840 G9', serialPrefix: 'HP-EB-840G9', proc: 'Intel Core i7-1270P', ram: '16 GB DDR5', storage: '1 TB SSD', os: 'Windows 11 Pro' },
  { name: 'Lenovo ThinkPad E14 Gen 4', serialPrefix: 'PF123456', proc: 'AMD Ryzen 7 5825U', ram: '16 GB', storage: '512 GB SSD', os: 'Windows 11 Pro' },
  { name: 'Dell XPS 15 9520', serialPrefix: 'XPS-15-9520', proc: 'Intel Core i9-12900HK', ram: '32 GB DDR5', storage: '1 TB NVMe SSD', os: 'Windows 11 Pro' },
  { name: 'MacBook Air 15" M2', serialPrefix: 'C02FA9988', proc: 'Apple M2 (8-core)', ram: '16 GB', storage: '512 GB SSD', os: 'macOS Sonoma 14.2' },
  { name: 'HP ProBook 440 G8', serialPrefix: 'HP-PB-440G8', proc: 'Intel Core i5-1135G7', ram: '8 GB', storage: '256 GB SSD', os: 'Windows 10 Pro' }
];

const desktopModels = [
  { name: 'Dell OptiPlex 7090 Workstation', proc: 'Intel Core i7-12700', ram: '16 GB DDR4', storage: '1 TB NVMe SSD + 1 TB HDD', os: 'Windows 11 Pro' },
  { name: 'HP ProDesk 600 G6 Desktop', proc: 'Intel Core i5-11500', ram: '16 GB', storage: '512 GB NVMe SSD', os: 'Windows 10 Pro' },
  { name: 'Lenovo ThinkCentre M90q Tiny', proc: 'Intel Core i7-11700T', ram: '32 GB', storage: '1 TB SSD', os: 'Windows 11 Pro' },
  { name: 'Apple Mac Studio M2 Max', proc: 'Apple M2 Max (12-core)', ram: '64 GB', storage: '1 TB SSD', os: 'macOS Sonoma 14.2' }
];

const mobileModels = [
  { name: 'Apple iPhone 14 Pro (256GB)', os: 'iOS 17.2', storage: '256 GB' },
  { name: 'Samsung Galaxy S23 Ultra', os: 'Android 14', storage: '512 GB' },
  { name: 'Apple iPad Air Gen 5 (64GB)', os: 'iPadOS 17', storage: '64 GB' },
  { name: 'Google Pixel 8 Pro', os: 'Android 14', storage: '256 GB' }
];

const assets = [];

// Create AST-1001 to AST-1065
for (let i = 1; i <= 65; i++) {
  const idNum = 1000 + i;
  const id = `AST-${idNum}`;
  const assetCode = `TGBS/B/L${i}`;

  let category = 'Laptop';
  if (i % 6 === 0) category = 'SIM Card';
  else if (i % 5 === 0) category = 'Desktop';
  else if (i % 8 === 0) category = 'Mobile';
  else if (i % 15 === 0) category = 'Server';
  else category = 'Laptop';

  let status = 'Assigned';
  if (i % 4 === 0) status = 'Available';
  else if (i % 11 === 0) status = 'Under Maintenance';
  else if (i % 23 === 0) status = 'Retired';
  else status = 'Assigned';

  const fn = firstNames[(i - 1) % firstNames.length];
  const ln = lastNames[(i - 1) % lastNames.length];
  const assignedTo = status === 'Assigned' ? `${fn} ${ln}` : (i === 1 || i === 62 ? 'Syed' : (i === 2 || i === 63 ? 'Charan' : ''));
  const assignedToEmail = assignedTo ? `${fn.toLowerCase()}.${ln.toLowerCase()}@company.com` : '';
  const loc = locations[(i - 1) % locations.length];

  let item = {};

  if (category === 'Laptop') {
    const model = laptopModels[(i - 1) % laptopModels.length];
    let serial = `${model.serialPrefix}-${i}`;
    if (i === 1) serial = 'PF2VCP3D';
    if (i === 2) serial = 'LNV-SYD-9981';
    if (i === 3) serial = 'DEL-CHR-1092';
    if (i === 62) serial = 'S/N:PF2VCP3D';

    item = {
      id,
      assetCode,
      name: i === 1 || i === 62 ? 'Lenovo ThinkPad L14' : model.name,
      category: 'Laptop',
      serial,
      processor: model.proc,
      ram: model.ram,
      storage: model.storage,
      monitorName: 'Built-in FHD Display',
      monitorSerial: `MON-LNV-${100 + i}`,
      mouseModel: 'Logitech Wireless Mouse M185',
      mouseSerial: `MS-LOG-${200 + i}`,
      accessoryItem: i % 2 === 0 ? 'Headphone' : 'RJ45 Cable',
      accessoryModel: i % 2 === 0 ? 'Jabra Evolve 65' : 'Cat6 Patch Cable 5m',
      accessorySerial: `ACC-${i % 2 === 0 ? 'HDP' : 'RJ45'}-${300 + i}`,
      keyboardSerial: `KB-LNV-${100 + i}`,
      os: model.os,
      software: 'Microsoft 365, Hubspot, Chrome, Slack, Zoom',
      simNumber: i % 3 === 0 ? `899110${1000000000 + i}` : '',
      simPhoneNumber: i % 3 === 0 ? `+91 98${70000000 + i}` : '',
      simCarrier: i % 3 === 0 ? 'Airtel Business 5G' : '',
      simPlanDetails: i % 3 === 0 ? 'Corporate Unlimited Data' : '',
      status: assignedTo ? 'Assigned' : status,
      assignedTo: assignedTo || 'Syed',
      assignedToEmail: assignedToEmail || 'syed@company.com',
      location: loc,
      purchaseDate: `2024-0${(i % 9) + 1}-15`,
      modelDate: 'Mar-22'
    };
  } else if (category === 'Desktop') {
    const model = desktopModels[(i - 1) % desktopModels.length];
    item = {
      id,
      assetCode,
      name: model.name,
      category: 'Desktop',
      serial: `CPU-DT-${1000 + i}`,
      processor: model.proc,
      ram: model.ram,
      storage: model.storage,
      monitorName: 'Dell UltraSharp 27" 4K',
      monitorSerial: `MON-DEL-${300 + i}`,
      mouseModel: 'Logitech MX Master 3S',
      mouseSerial: `MS-LOG-${400 + i}`,
      keyboardSerial: `KB-LOG-${400 + i}`,
      accessoryItem: 'Headphone',
      accessoryModel: 'Logitech H390 USB Headset',
      accessorySerial: `ACC-HDP-${500 + i}`,
      os: model.os,
      software: 'Microsoft 365, AutoCAD 2024, CrowdStrike Antivirus',
      simNumber: '',
      simPhoneNumber: '',
      simCarrier: '',
      simPlanDetails: '',
      status,
      assignedTo,
      assignedToEmail,
      location: loc,
      purchaseDate: `2023-10-${(i % 25) + 1}`,
      modelDate: 'Jan-23'
    };
  } else if (category === 'SIM Card') {
    item = {
      id,
      assetCode,
      name: `Corporate 5G SIM Card (${fn} ${ln})`,
      category: 'SIM Card',
      serial: `899110${8800000000 + i}F`,
      processor: '',
      ram: '',
      storage: '',
      monitorName: '',
      monitorSerial: '',
      mouseModel: '',
      mouseSerial: '',
      keyboardSerial: '',
      os: '',
      software: '5G International Roaming Enabled',
      simNumber: `899110${8800000000 + i}F`,
      simPhoneNumber: `+91 98${80000000 + i}`,
      simCarrier: i % 2 === 0 ? 'Airtel Enterprise 5G' : 'Jio Corporate 5G',
      simPlanDetails: '100GB High-Speed Corporate Plan',
      status: assignedTo ? 'Assigned' : 'Available',
      assignedTo: assignedTo || '',
      assignedToEmail: assignedToEmail || '',
      location: loc,
      purchaseDate: `2024-02-${(i % 20) + 1}`
    };
  } else if (category === 'Mobile') {
    const model = mobileModels[(i - 1) % mobileModels.length];
    item = {
      id,
      assetCode,
      name: model.name,
      category: 'Mobile',
      serial: `MOB-IMEI-${9000000 + i}`,
      processor: 'Octa-Core Bionic Processor',
      ram: '8 GB',
      storage: model.storage,
      monitorName: '',
      monitorSerial: '',
      mouseModel: '',
      mouseSerial: '',
      keyboardSerial: '',
      os: model.os,
      software: 'MDM Corporate Agent, MS Outlook, Slack, Teams',
      simNumber: `899110${7700000000 + i}F`,
      simPhoneNumber: `+91 99${70000000 + i}`,
      simCarrier: 'Vodafone Idea Enterprise',
      simPlanDetails: 'Unlimited Voice & 5G Data',
      status: assignedTo ? 'Assigned' : 'Available',
      assignedTo,
      assignedToEmail,
      location: loc,
      purchaseDate: `2023-11-${(i % 20) + 1}`
    };
  } else {
    item = {
      id,
      assetCode,
      name: `Dell PowerEdge R750 Enterprise Server`,
      category: 'Server',
      serial: `SRV-DEL-750-${i}`,
      processor: '2x Intel Xeon Gold 6330',
      ram: '256 GB ECC DDR4',
      storage: '8x 3.84 TB Enterprise NVMe SSD (RAID 10)',
      monitorName: 'Rack KVM Console 17"',
      monitorSerial: `KVM-RACK-${i}`,
      mouseModel: 'Integrated KVM Mouse',
      mouseSerial: `KVM-MS-${i}`,
      keyboardSerial: `KVM-KB-${i}`,
      os: 'Ubuntu Server 22.04 LTS',
      software: 'Docker Enterprise, Kubernetes, PostgreSQL 16, Nginx',
      simNumber: '',
      simPhoneNumber: '',
      simCarrier: '',
      simPlanDetails: '',
      status: 'Available',
      assignedTo: '',
      assignedToEmail: '',
      location: 'Data Center 1 (Bangalore)',
      purchaseDate: '2023-05-20'
    };
  }

  assets.push(item);
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
console.log(`Successfully generated 65 assets in ${targetPath}`);
