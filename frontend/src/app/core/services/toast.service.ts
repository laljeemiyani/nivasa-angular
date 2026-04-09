import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new Subject<Toast[]>();
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();
  
  private toasts: Toast[] = [];
  private defaultDuration = 5000;

  /**
   * Show a success toast
   */
  success(title: string, message?: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  /**
   * Show an error toast
   */
  error(title: string, message?: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration: duration ?? 7000 });
  }

  /**
   * Show a warning toast
   */
  warning(title: string, message?: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration });
  }

  /**
   * Show an info toast
   */
  info(title: string, message?: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }

  /**
   * Show a custom toast
   */
  show(options: { type: ToastType } & ToastOptions): void {
    const toast: Toast = {
      id: this.generateId(),
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? this.defaultDuration,
      dismissible: options.dismissible ?? true
    };

    this.toasts = [...this.toasts, toast];
    this.toastsSubject.next(this.toasts);

    // Auto dismiss after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next(this.toasts);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts = [];
    this.toastsSubject.next(this.toasts);
  }

  /**
   * Show API error message
   */
  apiError(error: any, fallbackMessage: string = 'An error occurred'): void {
    const message = error?.error?.message || error?.message || fallbackMessage;
    this.error('Error', message);
  }

  /**
   * Show success message for an action
   */
  actionSuccess(action: string): void {
    this.success(`${action} successfully`);
  }

  /**
   * Show error message for an action
   */
  actionError(action: string, error?: any): void {
    const message = error?.error?.message || `Failed to ${action.toLowerCase()}`;
    this.error(`Failed to ${action.toLowerCase()}`, message);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
