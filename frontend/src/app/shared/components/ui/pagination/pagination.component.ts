import {
  Component,
  Input,
  Output,
  EventEmitter,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav role="navigation" aria-label="pagination" [class]="computedNavClass">
      <ul class="flex flex-row items-center gap-1">
        <!-- Previous Button -->
        <li>
          <button
            [attr.aria-label]="'Go to previous page'"
            [class]="getLinkClass(false, false) + ' gap-1 pl-2.5'"
            [disabled]="currentPage <= 1 || disabled"
            (click)="setPage($event, currentPage - 1)"
          >
            <span>Previous</span>
          </button>
        </li>

        <!-- Page Items (Dynamic generation of items can be enhanced later if needed, providing a simpler array of pages for now) -->
        <li *ngFor="let page of pages">
          <span
            *ngIf="page === -1"
            class="flex h-9 w-9 items-center justify-center"
          >
            <span class="text-sm">...</span>
          </span>
          <button
            *ngIf="page !== -1"
            [attr.aria-current]="currentPage === page ? 'page' : null"
            [class]="getLinkClass(currentPage === page, true)"
            [disabled]="disabled"
            (click)="setPage($event, page)"
          >
            {{ page }}
          </button>
        </li>

        <!-- Next Button -->
        <li>
          <button
            [attr.aria-label]="'Go to next page'"
            [class]="getLinkClass(false, false) + ' gap-1 pr-2.5'"
            [disabled]="currentPage >= totalPages || disabled"
            (click)="setPage($event, currentPage + 1)"
          >
            <span>Next</span>
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() customClass = '';

  @Output() pageChange = new EventEmitter<number>();

  get computedNavClass(): string {
    return cn('mx-auto flex w-full justify-center', this.customClass);
  }

  // Generates array like [1, 2, 3, -1, 10] where -1 is ellipsis
  get pages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // A more simplified logic, just mimicking the structure. A true pagination algorithm fits here.
      pages.push(1);
      if (this.currentPage > 3) pages.push(-1); // Ellipsis

      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) pages.push(-1); // Ellipsis
      if (this.totalPages > 1) pages.push(this.totalPages);
    }

    return pages;
  }

  getLinkClass(isActive: boolean, isIconSize: boolean): string {
    return cn(
      'inline-flex h-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-600 text-white'
        : 'bg-transparent hover:bg-gray-100 hover:text-gray-900',
      isIconSize ? 'w-9' : 'px-4 py-2',
      this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    );
  }

  setPage(e: Event, page: number) {
    e.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
