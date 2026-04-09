const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '../src/app/layouts/admin-layout/admin-layout.component.ts');
const resPath = path.join(__dirname, '../src/app/layouts/resident-layout/resident-layout.component.ts');

let adminCode = fs.readFileSync(adminPath, 'utf8');
adminCode = adminCode.replace(
    '<div class="flex items-center gap-x-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors">',
    '<div routerLink="/admin/client-profile" class="flex items-center gap-x-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors">'
);
fs.writeFileSync(adminPath, adminCode);

let resCode = fs.readFileSync(resPath, 'utf8');
resCode = resCode.replace(
    '<div class="flex items-center gap-x-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors">',
    '<div routerLink="/resident/profile" class="flex items-center gap-x-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors">'
);
fs.writeFileSync(resPath, resCode);

console.log('Added routerLinks to header profiles!');
