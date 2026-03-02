const fs = require('fs');

const tsFiles = [
  'src/app/pages/admin/complaints/complaints.component.ts',
  'src/app/pages/admin/dashboard/dashboard.component.ts',
  'src/app/pages/admin/notices/notices.component.ts',
  'src/app/pages/admin/residents/residents.component.ts',
  'src/app/pages/admin/vehicles/vehicles.component.ts',
  'src/app/pages/resident/complaints/complaints.component.ts',
  'src/app/pages/resident/family/family.component.ts',
  'src/app/pages/resident/notices/notices.component.ts',
  'src/app/pages/resident/vehicles/vehicles.component.ts',
  'src/app/pages/resident/profile/profile.component.ts'
];

const replaceMap = {
  "'destructive'": "'error'",
  "'blue'": "'info'",
  "'green'": "'success'",
  "'red'": "'error'",
  "'orange'": "'warning'",
  "'purple'": "'secondary'"
};

tsFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  let m = false;

  for (const [k, v] of Object.entries(replaceMap)) {
    if (c.includes(k)) {
      c = c.split(k).join(v);
      m = true;
    }
  }

  if (f.includes('dashboard.component.ts') && !c.includes('{ BadgeVariant }')) {
    c = c.replace(/import { BadgeComponent } from '..\/..\/..\/shared\/components\/ui\/badge\/badge.component';/g, "import { BadgeComponent, BadgeVariant } from '../../../shared/components/ui/badge/badge.component';");
    m = true;
  }
  
  if (f.includes('profile.component.ts') && !c.includes('profileTabs =')) {
    c = c.replace('export class ProfileComponent implements OnInit {', "export class ProfileComponent implements OnInit {\n  profileTabs = [{label: 'Profile', value: 'profile'}, {label: 'Security', value: 'security'}];");
    m = true;
  }

  if (m) {
    fs.writeFileSync(f, c);
    console.log('Fixed', f);
  }
});

const htmlFiles = [
  'src/app/pages/resident/profile/profile.component.html'
];

htmlFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  let m = false;

  if (c.includes('$event.target.files')) {
    c = c.replace(/\$event\.target\.files/g, '$any($event.target).files');
    m = true;
  }

  if (c.includes('<app-tabs-list')) {
    c = c.replace(/<app-tabs-list[\s\S]*?<\/app-tabs-list>/g, '');
    c = c.replace('<app-tabs defaultValue="profile">', '<app-tabs defaultValue="profile" [tabs]="profileTabs">');
    m = true;
  }

  if (m) {
    fs.writeFileSync(f, c);
    console.log('Fixed HTML', f);
  }
});

console.log('Done');
