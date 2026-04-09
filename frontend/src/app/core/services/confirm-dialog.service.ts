import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private stateSubject = new Subject<ConfirmState>();
  public state$ = this.stateSubject.asObservable();
  
  private currentState: ConfirmState = {
    isOpen: false,
    message: '',
    title: 'Confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info',
  };

  /**
   * Show a confirmation dialog and return an observable that resolves to true/false
   */
  confirm(options: ConfirmOptions): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.currentState = {
        ...this.currentState,
        ...options,
        isOpen: true,
        resolve: (value: boolean) => {
          observer.next(value);
          observer.complete();
        }
      };
      this.stateSubject.next(this.currentState);
    });
  }

  /**
   * Show a confirmation dialog and return a promise that resolves to true/false
   */
  async confirmAsync(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.currentState = {
        ...this.currentState,
        ...options,
        isOpen: true,
        resolve
      };
      this.stateSubject.next(this.currentState);
    });
  }

  /**
   * Quick confirmation for delete actions
   */
  async confirmDelete(itemName: string = 'this item'): Promise<boolean> {
    return this.confirmAsync({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash'
    });
  }

  /**
   * Quick confirmation for logout actions
   */
  async confirmLogout(): Promise<boolean> {
    return this.confirmAsync({
      title: 'Sign Out',
      message: 'Are you sure you want to log out? You will need to sign in again to access your account.',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'warning',
      icon: 'logout'
    });
  }

  /**
   * Resolve the current dialog with the given value
   */
  resolve(value: boolean): void {
    if (this.currentState.resolve) {
      this.currentState.resolve(value);
    }
    this.currentState = {
      ...this.currentState,
      isOpen: false,
      resolve: undefined
    };
    this.stateSubject.next(this.currentState);
  }

  /**
   * Close the dialog without resolving
   */
  close(): void {
    this.resolve(false);
  }
}
