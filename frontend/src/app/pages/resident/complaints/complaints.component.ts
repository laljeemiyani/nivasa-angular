import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
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
  IconEyeComponent,
  IconClockComponent,
  IconXComponent,
  IconSearchComponent,
  IconEditComponent,
  IconTrashComponent,
  IconAlertCircleComponent,
  IconFileTextComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-resident-complaints',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    IconEyeComponent,
    IconClockComponent,
    IconXComponent,
    IconSearchComponent,
    IconEditComponent,
    IconTrashComponent,
    IconAlertCircleComponent,
    IconFileTextComponent,
  ],
  templateUrl: './complaints.component.html',
})
export class ResidentComplaintsComponent implements OnInit {
  loading = true;
  submitting = false;
  complaints: any[] = [];
  totalPages = 1;
  currentPage = 1;
  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';

  private searchDebounce: any = null;

  isModalOpen = false;
  isDeleteDialogOpen = false;
  selectedComplaint: any = null;
  modalMode: 'create' | 'edit' | 'view' = 'create';

  formData = {
    title: '',
    description: '',
    category: '',
  };
  attachment: File | null = null;

  // Dynamic categories from admin settings
  complaintCategories: Array<{name: string; order: number; isActive: boolean}> = [];

  apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Pre-set filters based on query params (e.g. ?status=resolved)
    const statusFromQuery = this.route.snapshot.queryParamMap.get('status');
    if (statusFromQuery) {
      this.statusFilter = statusFromQuery.toLowerCase();
    }

    this.fetchCategories();
    this.fetchComplaints();
  }

  // Fetch complaint categories from admin settings
  fetchCategories() {
    this.http.get<any>(`${this.apiUrl}/admin/settings/complaint-categories`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Filter only active categories
            this.complaintCategories = (response.data || [])
              .filter((cat: any) => cat.isActive !== false)
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
            // Set default category if available
            if (this.complaintCategories.length > 0 && !this.formData.category) {
              this.formData.category = this.complaintCategories[0].name.toLowerCase();
            }
          }
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
          // Fallback categories if API fails
          this.complaintCategories = [
            { name: 'Maintenance', order: 1, isActive: true },
            { name: 'Security', order: 2, isActive: true },
            { name: 'Cleanliness', order: 3, isActive: true },
            { name: 'Noise', order: 4, isActive: true },
            { name: 'Parking', order: 5, isActive: true },
            { name: 'Plumbing', order: 6, isActive: true },
            { name: 'Electrical', order: 7, isActive: true },
            { name: 'Other', order: 8, isActive: true }
          ];
          if (!this.formData.category) {
            this.formData.category = 'maintenance';
          }
        }
      });
  }

  fetchComplaints() {
    this.loading = true;
    let params: any = {
      page: this.currentPage.toString(),
      limit: '10',
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.categoryFilter)
      params.category = this.categoryFilter.toLowerCase();

    this.http
      .get<any>(`${this.apiUrl}/complaints/my-complaints`, { params })
      .subscribe({
        next: (response) => {
          this.complaints =
            response.data?.complaints || response.data?.data?.complaints || [];
          this.totalPages =
            response.data?.pagination?.totalPages ||
            response.data?.data?.pagination?.totalPages ||
            1;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching complaints:', error);
          this.loading = false;
        },
      });
  }

  handleSearch(e?: Event) {
    if (e) e.preventDefault();
    this.currentPage = 1;
    this.fetchComplaints();
  }

  onSearchInput() {
    this.currentPage = 1;
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      this.fetchComplaints();
    }, 300);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.fetchComplaints();
  }

  handlePageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchComplaints();
  }

  openCreateModal() {
    this.modalMode = 'create';
    const defaultCategory = this.complaintCategories.length > 0 
      ? this.complaintCategories[0].name.toLowerCase() 
      : 'maintenance';
    this.formData = { title: '', description: '', category: defaultCategory };
    this.attachment = null;
    this.isModalOpen = true;
  }

  openEditModal(complaint: any) {
    this.modalMode = 'edit';
    this.selectedComplaint = complaint;
    this.formData = {
      title: complaint.title,
      description: complaint.description,
      category: complaint.category || 'maintenance',
    };
    this.attachment = null;
    this.isModalOpen = true;
  }

  openViewModal(complaint: any) {
    this.modalMode = 'view';
    this.selectedComplaint = complaint;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedComplaint = null;
    this.attachment = null;
  }

  openDeleteDialog(complaint: any) {
    this.selectedComplaint = complaint;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog() {
    this.isDeleteDialogOpen = false;
    this.selectedComplaint = null;
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.attachment = event.target.files[0];
    }
  }

  handleSubmit() {
    if (!this.formData.title.trim() || !this.formData.description.trim()) {
      this.toastService.warning('Validation Error', 'Please fill out all required fields.');
      return;
    }

    this.submitting = true;

    // Normalize category
    this.formData.category = this.formData.category.toLowerCase();

    if (this.modalMode === 'create') {
      let request;
      if (this.attachment) {
        const formData = new FormData();
        formData.append('title', this.formData.title);
        formData.append('description', this.formData.description);
        formData.append('category', this.formData.category);
        formData.append('complaintAttachment', this.attachment);
        request = this.http.post(`${this.apiUrl}/complaints`, formData);
      } else {
        request = this.http.post(`${this.apiUrl}/complaints`, this.formData);
      }

      request.subscribe({
        next: () => {
          this.toastService.success('Complaint Submitted', 'Your complaint has been submitted successfully.');
          this.closeModal();
          this.fetchComplaints();
          this.submitting = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', err.error?.message || 'Failed to submit complaint');
          this.submitting = false;
        },
      });
    } else if (this.modalMode === 'edit') {
      this.http
        .put(
          `${this.apiUrl}/complaints/${this.selectedComplaint._id}`,
          this.formData,
        )
        .subscribe({
          next: () => {
            this.toastService.success('Complaint Updated', 'Your complaint has been updated successfully.');
            this.closeModal();
            this.fetchComplaints();
            this.submitting = false;
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error', err.error?.message || 'Failed to update complaint');
            this.submitting = false;
          },
        });
    }
  }

  async handleDelete() {
    const confirmed = await this.confirmDialogService.confirmDelete('this complaint');
    if (!confirmed) return;

    this.http
      .delete(`${this.apiUrl}/complaints/${this.selectedComplaint._id}`)
      .subscribe({
        next: () => {
          this.toastService.success('Complaint Deleted', 'Your complaint has been deleted successfully.');
          this.closeDeleteDialog();
          this.fetchComplaints();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', err.error?.message || 'Failed to delete complaint');
        },
      });
  }

  getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'warning';
      case 'in progress':
      case 'in_progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getCategoryColor(category: string) {
    switch (category?.toLowerCase()) {
      case 'maintenance':
        return 'info';
      case 'security':
        return 'error';
      case 'cleaning':
        return 'success';
      case 'noise':
        return 'warning';
      case 'parking':
        return 'secondary';
      case 'plumbing':
      case 'electrical':
        return 'info';
      default:
        return 'secondary';
    }
  }

  formatDate(dateStr: string) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPages() {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }
}
