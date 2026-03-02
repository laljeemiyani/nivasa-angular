import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

@Component({
  selector: 'app-tabs-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="active" [class]="computedClass" role="tabpanel">
      <ng-content></ng-content>
    </div>
  `,
})
export class TabsContentComponent {
  @Input() value!: string;
  @Input() customClass = '';
  active = false;

  get computedClass(): string {
    return cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      this.customClass,
    );
  }
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass">
      <!-- Tabs List implementation inside the parent for simplicity -->
      <div
        *ngIf="tabs.length > 0"
        class="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 mb-2"
      >
        <button
          *ngFor="let tab of tabs"
          type="button"
          role="tab"
          [attr.aria-selected]="tab.value === selectedValue"
          [class]="getTriggerClass(tab.value)"
          (click)="selectTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Content Projection -->
      <ng-content></ng-content>
    </div>
  `,
})
export class TabsComponent implements AfterContentInit {
  @Input() defaultValue?: string;
  @Input() value?: string;
  @Input() customClass = '';

  @Input() tabs: { label: string; value: string }[] = []; // Allow providing tabs easily without nested triggers.

  @Output() valueChange = new EventEmitter<string>();

  @ContentChildren(TabsContentComponent)
  contentChildren!: QueryList<TabsContentComponent>;

  selectedValue: string = '';

  ngAfterContentInit() {
    this.selectedValue =
      this.value ||
      this.defaultValue ||
      (this.tabs.length > 0 ? this.tabs[0].value : '');
    this.updateContentVisibility();
  }

  get computedClass(): string {
    return cn('tabs', this.customClass);
  }

  getTriggerClass(tabValue: string): string {
    const isActive = this.selectedValue === tabValue;
    return cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      isActive
        ? 'bg-white text-gray-900 shadow-sm'
        : 'hover:bg-gray-200 hover:text-gray-900',
    );
  }

  selectTab(value: string) {
    this.selectedValue = value;
    this.valueChange.emit(value);
    this.updateContentVisibility();
  }

  private updateContentVisibility() {
    if (this.contentChildren) {
      this.contentChildren.forEach((child) => {
        child.active = child.value === this.selectedValue;
      });
    }
  }
}
