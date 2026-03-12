import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

import {
  CardComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import {
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleComponent,
  ModalBodyComponent,
  ModalFooterComponent,
} from '../../../shared/components/ui/modal/modal.component';

import {
  IconChevronLeftComponent,
  IconChevronRightComponent,
  IconEyeComponent,
  IconXComponent,
  IconTrashComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-notices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardContentComponent,
    BadgeComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
    IconEyeComponent,
    IconXComponent,
    IconTrashComponent,
  ],
  templateUrl: './notices.component.html',
})
export class AdminNoticesComponent implements OnInit {
  notices: any[] = [];
  loading = false;
  page = 1;
  totalPages = 1;
  categoryFilter = '';
  priorityFilter = '';

  selectedNotice: any = null;
  modalOpen = false;
  modalMode: 'view' | 'create' | 'edit' = 'view';

  formData = {
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    expiryDate: '',
  };
  actionLoading = false;

  private apiUrl = environment.apiUrl;
  currentDate = new Date().toISOString().split('T')[0];

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService,
  ) {}

  ngOnInit() {
    this.fetchNotices();
  }

  fetchNotices() {
    this.loading = true;
    let params: any = { page: this.page.toString(), limit: '10' };

    if (this.categoryFilter) params.category = this.categoryFilter;
    if (this.priorityFilter) params.priority = this.priorityFilter;

    this.http.get<any>(`${this.apiUrl}/notices/admin`, { params }).subscribe({
      next: (response) => {
        const resData = response.data;
        if (Array.isArray(resData)) {
          this.notices = resData;
          this.totalPages = 1;
        } else {
          this.notices = resData.notices || resData.items || [];
          this.totalPages =
            resData.pagination?.totalPages || resData.totalPages || 1;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch notices:', error);
        this.loading = false;
      },
    });
  }

  onFilterChange() {
    this.page = 1;
    this.fetchNotices();
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetchNotices();
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.formData = {
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      expiryDate: '',
    };
    this.modalOpen = true;
  }

  openEditModal(notice: any) {
    this.modalMode = 'edit';
    this.selectedNotice = notice;
    this.formData = {
      title: notice.title,
      description: notice.description,
      category: notice.category,
      priority: notice.priority,
      expiryDate: notice.expiryDate
        ? new Date(notice.expiryDate).toISOString().split('T')[0]
        : '',
    };
    this.modalOpen = true;
  }

  openViewModal(notice: any) {
    this.modalMode = 'view';
    this.selectedNotice = notice;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedNotice = null;
    this.modalMode = 'view';
  }

  handleSubmit() {
    if (!this.formData.title.trim() || !this.formData.description.trim()) {
      this.toastService.warning('Validation Error', 'Please fill in all required fields');
      return;
    }

    this.actionLoading = true;

    // For update use put, for create use post
    const request =
      this.modalMode === 'create'
        ? this.http.post(`${this.apiUrl}/notices/admin`, this.formData)
        : this.http.put(
            `${this.apiUrl}/notices/admin/${this.selectedNotice._id}`,
            this.formData,
          );

    request.subscribe({
      next: () => {
        this.toastService.success(
          this.modalMode === 'create' ? 'Notice Created' : 'Notice Updated',
          this.modalMode === 'create' 
            ? 'The notice has been created successfully.' 
            : 'The notice has been updated successfully.'
        );
        this.fetchNotices();
        this.closeModal();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error(`Failed to ${this.modalMode} notice:`, error);

        const backendErrors = error?.error?.errors;
        let details = '';
        if (Array.isArray(backendErrors) && backendErrors.length > 0) {
          // Combine all field messages into a single readable line
          details = backendErrors
            .map((e: any) => e.msg)
            .filter((msg: any) => !!msg)
            .join(' • ');
        }

        this.toastService.error(
          'Validation Error',
          details || error.error?.message || `Failed to ${this.modalMode} notice`
        );
        this.actionLoading = false;
      },
    });
  }

  async handleDelete(noticeId: string) {
    const confirmed = await this.confirmDialogService.confirmDelete('this notice');
    if (!confirmed) return;

    this.http.delete(`${this.apiUrl}/notices/admin/${noticeId}`).subscribe({
      next: () => {
        this.toastService.success('Notice Deleted', 'The notice has been deleted successfully.');
        this.fetchNotices();
      },
      error: (error) => {
        console.error('Failed to delete notice:', error);
        this.toastService.error('Error', error.error?.message || 'Failed to delete notice');
      },
    });
  }

  formatDate(dateString: string) {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return new Date(dateString).toISOString().split('T')[0];
  }

  getPages() {
    const pages = [];
    for (let i = 0; i < Math.min(5, this.totalPages); i++) {
      let pageNum = this.page - 2 + i;
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        pages.push(pageNum);
      }
    }
    return pages;
  }
}
