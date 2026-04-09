import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';


import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import {
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleComponent,
  ModalBodyComponent,
  ModalFooterComponent,
} from '../../../shared/components/ui/modal/modal.component';

import {
  IconUsersComponent,
  IconCheckComponent,
  IconXComponent,
  IconEyeComponent,
  IconTrashComponent,
  IconAlertCircleComponent,
  IconChevronLeftComponent,
  IconChevronRightComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-residents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BadgeComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    IconUsersComponent,
    IconCheckComponent,
    IconXComponent,
    IconEyeComponent,
    IconTrashComponent,
    IconAlertCircleComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
  ],
  templateUrl: './residents.component.html',
})
export class AdminResidentsComponent implements OnInit {
  residents: any[] = [];
  loading = false;
  page = 1;
  totalPages = 1;
  search = '';
  // Default to showing all statuses so admin sees everything by default
  statusFilter = '';

  selectedResident: any = null;
  modalOpen = false;
  actionStatus = '';
  rejectionReason = '';
  actionLoading = false;

  deleteModalOpen = false;
  deleteReason = '';
  deleteSource = 'manual';
  deleteLoading = false;

  // Vehicles for selected resident (view mode)
  residentVehicles: any[] = [];
  vehiclesLoading = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const statusFromQuery = this.route.snapshot.queryParamMap.get('status');
    if (statusFromQuery) {
      this.statusFilter = statusFromQuery.toLowerCase();
    }
    this.fetchResidents();
  }

  fetchResidents() {
    this.loading = true;
    let params: any = { page: this.page.toString(), limit: '10' };
    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;

    this.http.get<any>(`${this.apiUrl}/admin/residents`, { params }).subscribe({
      next: (response) => {
        this.residents = response.data.residents;
        this.totalPages = response.data.pagination.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch residents:', error);
        this.loading = false;
      },
    });
  }

  onFilterChange() {
    this.page = 1;
    this.fetchResidents();
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetchResidents();
  }

  openModal(resident: any, status: string) {
    this.selectedResident = resident;
    this.actionStatus = status;
    this.rejectionReason = '';
    this.modalOpen = true;

    if (status === 'view') {
      this.fetchResidentVehicles(resident._id);
    } else {
      this.residentVehicles = [];
    }
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedResident = null;
    this.actionStatus = '';
    this.rejectionReason = '';
    this.residentVehicles = [];
    this.vehiclesLoading = false;
  }

  openDeleteModal(resident: any) {
    this.selectedResident = resident;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.selectedResident = null;
    this.deleteReason = '';
    this.deleteSource = 'manual';
  }

  handleStatusUpdate() {
    if (
      this.actionStatus === 'rejected' &&
      (!this.rejectionReason || !this.rejectionReason.trim())
    ) {
      this.toastService.warning('Validation Error', 'Please provide a reason before rejecting this resident.');
      return;
    }

    this.actionLoading = true;
    const payload = {
      status: this.actionStatus,
      rejectionReason:
        this.actionStatus === 'rejected' ? this.rejectionReason : undefined,
    };

    this.http
      .put(
        `${this.apiUrl}/admin/residents/${this.selectedResident._id}/status`,
        payload,
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            this.actionStatus === 'approved' ? 'Resident Approved' : 'Resident Rejected',
            this.actionStatus === 'approved' 
              ? 'The resident has been approved successfully.' 
              : 'The resident has been rejected.'
          );
          this.closeModal();
          this.fetchResidents();
          this.actionLoading = false;
        },
        error: (error) => {
          console.error('Failed to update resident status:', error);
          this.toastService.error('Error', error.error?.message || 'Failed to update resident status');
          this.actionLoading = false;
        },
      });
  }

  handleResidentDeletion() {
    if (!this.selectedResident?._id) return;
    if (!this.deleteReason || !this.deleteReason.trim()) {
      this.toastService.warning('Validation Error', 'Add a short note explaining why this resident is being deleted.');
      return;
    }

    this.deleteLoading = true;
    const body = {
      reason: this.deleteReason,
      source: this.deleteSource,
    };

    this.http
      .delete(`${this.apiUrl}/admin/residents/${this.selectedResident._id}`, {
        body,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Resident Deleted', 'The resident has been deleted successfully.');
          this.closeDeleteModal();
          this.fetchResidents();
          this.deleteLoading = false;
        },
        error: (error) => {
          console.error('Failed to delete resident:', error);
          this.toastService.error('Error', error.error?.message || 'Failed to delete resident');
          this.deleteLoading = false;
        },
      });
  }

  private fetchResidentVehicles(residentId: string) {
    if (!residentId) {
      this.residentVehicles = [];
      return;
    }
    this.vehiclesLoading = true;
    const params: any = { page: '1', limit: '50', userId: residentId };
    this.http
      .get<any>(`${this.apiUrl}/vehicles`, { params })
      .subscribe({
        next: (response) => {
          this.residentVehicles = Array.isArray(response.data)
            ? response.data
            : response.data?.vehicles || [];
          this.vehiclesLoading = false;
        },
        error: (error) => {
          console.error('Failed to fetch resident vehicles:', error);
          this.vehiclesLoading = false;
        },
      });
  }

  getPages() {
    const pages = [];
    for (let i = 0; i < Math.min(5, this.totalPages); i++) {
      const pageNum = this.page - 2 + i;
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        pages.push(pageNum);
      }
    }
    return pages;
  }

  exportLoading = false;

  exportData() {
    this.exportLoading = true;

    // Try to call backend export endpoint. If it doesn't exist, we'll fall back to client-side export of current view.
    this.http.get(`${this.apiUrl}/admin/residents/export`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `nivasa-residents-${new Date().toISOString().split('T')[0]}.csv`);
        this.exportLoading = false;
      },
      error: (error) => {
        console.warn('Backend export failed or endpoint missing, falling back to client-side export.', error);
        this.generateClientSideExport();
        this.exportLoading = false;
      }
    });
  }

  private generateClientSideExport() {
    // If backend doesn't support thorough export yet, build a CSV from the currently loaded page of residents
    const headers = ['Resident Name', 'Email Address', 'Wing', 'Flat Number', 'Status'];
    let csvContent = headers.join(',') + '\n';

    this.residents.forEach(resident => {
      const row = [
        `"${(resident.fullName || '').replace(/"/g, '""')}"`,
        `"${(resident.email || '').replace(/"/g, '""')}"`,
        `"${(resident.wing || '').replace(/"/g, '""')}"`,
        `"${(resident.flatNumber || '').replace(/"/g, '""')}"`,
        `"${(resident.status || '').toUpperCase()}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `nivasa-residents-page-${this.page}.csv`);
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
