import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  booleanAttribute,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn } from '../../../../core/utils/cn';

export type FileUploadVariant = 'default' | 'filled' | 'outlined';
export type FileUploadSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  template: `
    <div class="w-full">
      <label
        *ngIf="label"
        class="block mb-2 text-sm font-medium text-gray-700"
        >{{ label }}</label
      >

      <div
        [class]="computedContainerClass"
        (dragenter)="handleDrag($event)"
        (dragleave)="handleDrag($event)"
        (dragover)="handleDrag($event)"
        (drop)="handleDrop($event)"
      >
        <div class="flex flex-col items-center justify-center space-y-2">
          <!-- Upload Icon -->
          <svg
            class="w-8 h-8 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p class="text-sm text-gray-500">
            Drag & drop files here, or
            <label
              class="mx-1 text-primary-600 hover:text-primary-500 cursor-pointer"
            >
              browse
              <input
                #fileInput
                type="file"
                class="hidden"
                [accept]="accept"
                [multiple]="multiple"
                [disabled]="disabled"
                (change)="handleChange($event)"
              />
            </label>
          </p>
          <p class="text-xs text-gray-400">
            Maximum file size: {{ formatFileSize(maxSize) }}
          </p>
        </div>
      </div>

      <!-- File preview -->
      <div *ngIf="showPreview && files.length > 0" class="mt-4 space-y-2">
        <div
          *ngFor="let file of files; let i = index"
          class="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md"
        >
          <div class="flex items-center space-x-2">
            <!-- File Icon -->
            <svg
              class="text-gray-400 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p
                class="text-sm font-medium text-gray-700 truncate"
                style="max-width: 200px;"
              >
                {{ file.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(file.size) }}
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="removeFile(i)"
            class="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <p *ngIf="error" class="mt-1 text-xs text-error">{{ error }}</p>
    </div>
  `,
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() label = 'Upload File';
  @Input() accept = '*/*';
  @Input() maxSize = 10485760; // 10MB default
  @Input({ transform: booleanAttribute }) multiple = false;
  @Input() variant: FileUploadVariant = 'default';
  @Input() size: FileUploadSize = 'md';
  @Input() customClass = '';
  @Input() error: string | null = null;
  @Input({ transform: booleanAttribute }) showPreview = true;
  @Input({ transform: booleanAttribute }) disabled = false;

  @Output() fileChange = new EventEmitter<File[] | File | null>();
  @Output() fileRemove = new EventEmitter<number>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  dragActive = false;
  files: File[] = [];

  onChange: any = () => {};
  onTouched: any = () => {};

  get computedContainerClass(): string {
    const variantClasses: Record<FileUploadVariant, string> = {
      default:
        'border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100',
      filled:
        'border-2 border-dashed border-primary-300 bg-primary-50 hover:bg-primary-100',
      outlined:
        'border-2 border-dashed border-gray-300 bg-transparent hover:border-primary-300',
    };

    const sizeClasses: Record<FileUploadSize, string> = {
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    };

    return cn(
      'rounded-lg transition-colors',
      variantClasses[this.variant],
      sizeClasses[this.size],
      this.dragActive ? 'border-primary-500 bg-primary-50' : '',
      this.error ? 'border-error-300 bg-error-50' : '',
      this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      this.customClass,
    );
  }

  handleDrag(e: DragEvent) {
    if (this.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      this.dragActive = true;
    } else if (e.type === 'dragleave') {
      this.dragActive = false;
    }
  }

  handleDrop(e: DragEvent) {
    if (this.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    this.dragActive = false;

    if (
      e.dataTransfer &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      this.handleFilesList(e.dataTransfer.files);
    }
  }

  handleChange(e: Event) {
    if (this.disabled) return;
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFilesList(target.files);
    }
    // Reset input value so same file can be selected again if removed
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private handleFilesList(fileList: FileList) {
    const filesArray = Array.from(fileList);
    const validFiles = filesArray.filter((f) => f.size <= this.maxSize);

    if (validFiles.length !== filesArray.length) {
      this.error = `Some files exceeded the maximum size of ${this.formatFileSize(this.maxSize)}`;
    } else {
      this.error = null;
    }

    if (!this.multiple) {
      const newFiles = validFiles.slice(0, 1);
      this.files = newFiles;
      this.emitChange(this.files[0] || null);
    } else {
      this.files = [...this.files, ...validFiles];
      this.emitChange(this.files);
    }
    this.onTouched();
  }

  removeFile(index: number) {
    if (this.disabled) return;
    this.files.splice(index, 1);
    this.fileRemove.emit(index);
    if (this.multiple) {
      this.emitChange(this.files);
    } else {
      this.emitChange(null);
    }
  }

  private emitChange(value: any) {
    this.onChange(value);
    this.fileChange.emit(value);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(value: any): void {
    if (Array.isArray(value)) {
      this.files = [...value];
    } else if (value instanceof File) {
      this.files = [value];
    } else {
      this.files = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
