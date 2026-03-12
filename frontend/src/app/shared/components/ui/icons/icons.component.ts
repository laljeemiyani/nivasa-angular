import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

@Component({
  selector: 'app-icon-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  `,
})
export class IconHomeComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      />
    </svg>
  `,
})
export class IconUsersComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-exclamation-triangle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  `,
})
export class IconExclamationTriangleComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-megaphone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  `,
})
export class IconMegaphoneComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-truck',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    </svg>
  `,
})
export class IconTruckComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-bars3',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  `,
})
export class IconBars3Component {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-xmark',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  `,
})
export class IconXMarkComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-logout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  `,
})
export class IconLogoutComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-user-circle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  `,
})
export class IconUserCircleComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [class]="computedClass"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  `,
})
export class IconSearchComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-eye',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,
})
export class IconEyeComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-check',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,
})
export class IconCheckComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-x',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`,
})
export class IconXComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-trash',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
    ></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>`,
})
export class IconTrashComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-chevron-left',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>`,
})
export class IconChevronLeftComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-chevron-right',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>`,
})
export class IconChevronRightComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-clock',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>`,
})
export class IconClockComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-alert-circle',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>`,
})
export class IconAlertCircleComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-user',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>`,
})
export class IconUserComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-edit',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>`,
})
export class IconEditComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-file-text',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>`,
})
export class IconFileTextComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-shield',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>`,
})
export class IconShieldComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-camera',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
    ></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>`,
})
export class IconCameraComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-phone',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    ></path>
  </svg>`,
})
export class IconPhoneComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-map-pin',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>`,
})
export class IconMapPinComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-eye-off',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
    ></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>`,
})
export class IconEyeOffComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-check-circle',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>`,
})
export class IconCheckCircleComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}

@Component({
  selector: 'app-icon-cog',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    [class]="computedClass"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,
})
export class IconCogComponent {
  @Input() customClass = 'h-5 w-5';
  get computedClass() {
    return cn(this.customClass);
  }
}
