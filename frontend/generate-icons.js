const fs = require('fs');
const fp = 'src/app/shared/components/ui/icons/icons.component.ts';
let c = fs.readFileSync(fp,'utf8');

// First replace all "selector: 'icon-" with "selector: 'app-icon-"
c = c.replace(/selector: 'icon-/g, "selector: 'app-icon-");

const icons = [
  'IconEyeComponent','IconCheckComponent','IconXComponent','IconTrashComponent',
  'IconChevronLeftComponent','IconChevronRightComponent','IconClockComponent','IconAlertCircleComponent',
  'IconUserComponent','IconEditComponent','IconFileTextComponent','IconShieldComponent',
  'IconCameraComponent','IconPhoneComponent','IconMapPinComponent','IconEyeOffComponent',
  'IconCheckCircleComponent'
];

icons.forEach(n => {
  if (c.includes('export class ' + n)) return; // skip if already added
  let s = n.replace('Component','').replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
  c += `\n@Component({
  selector: 'app-${s}',
  standalone: true,
  imports: [CommonModule],
  template: \`<svg [class]="computedClass" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>\`
})
export class ${n} {
  @Input() customClass="h-5 w-5";
  get computedClass() {
    return cn(this.customClass);
  }
}
`;
});

fs.writeFileSync(fp, c);
console.log('Fixed selectors and appended missing icons.');
