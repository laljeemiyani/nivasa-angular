import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  IconSearchComponent,
  IconCheckComponent,
  IconXComponent,
  IconEyeComponent,
  IconAlertCircleComponent,
  IconChevronLeftComponent,
  IconChevronRightComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-vehicles',
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
    IconSearchComponent,
    IconCheckComponent,
    IconXComponent,
    IconEyeComponent,
    IconAlertCircleComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
  ],
  templateUrl: './vehicles.component.html',
})
export class AdminVehiclesComponent implements OnInit {
  vehicles: any[] = [];
  loading = false;

  page = 1;
  totalPages = 1;

  searchQuery = '';
  vehicleTypeFilter = '';
  statusFilter = '';

  selectedVehicle: any = null;
  modalOpen = false;

  statusDialogOpen = false;
  statusAction: 'approve' | 'reject' | null = null;
  processingStatus = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.fetchVehicles();
  }

  fetchVehicles() {
    this.loading = true;
    let params: any = { page: this.page.toString(), limit: '10' };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.vehicleTypeFilter) params.vehicleType = this.vehicleTypeFilter;
    if (this.statusFilter) params.status = this.statusFilter;

    this.http.get<any>(`${this.apiUrl}/admin/vehicles`, { params }).subscribe({
      next: (response) => {
        this.vehicles = response.data.vehicles;
        this.totalPages = response.data.pagination.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch vehicles:', error);
        this.loading = false;
      },
    });
  }

  onFilterChange() {
    this.page = 1;
    this.fetchVehicles();
  }

  handleSearch(e?: Event) {
    if (e) e.preventDefault();
    this.page = 1;
    this.fetchVehicles();
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetchVehicles();
  }

  openVehicleModal(vehicle: any) {
    this.selectedVehicle = vehicle;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedVehicle = null;
  }

  openStatusDialog(vehicle: any, action: 'approve' | 'reject') {
    this.selectedVehicle = vehicle;
    this.statusAction = action;
    this.statusDialogOpen = true;
  }

  closeStatusDialog() {
    this.statusDialogOpen = false;
    this.selectedVehicle = null;
    this.statusAction = null;
  }

  handleUpdateStatus() {
    if (!this.selectedVehicle || !this.statusAction) return;

    this.processingStatus = true;
    const status = this.statusAction === 'approve' ? 'approved' : 'rejected';

    this.http
      .put(`${this.apiUrl}/admin/vehicles/${this.selectedVehicle._id}/status`, {
        status,
      })
      .subscribe({
        next: () => {
          const index = this.vehicles.findIndex(
            (v) => v._id === this.selectedVehicle._id,
          );
          if (index !== -1) {
            this.vehicles[index].status = status;
          }
          this.toast.success(`Vehicle ${status === 'approved' ? 'approved' : 'rejected'}`);
          this.closeStatusDialog();
          this.processingStatus = false;
        },
        error: (error) => {
          console.error('Failed to update vehicle status:', error);
          this.processingStatus = false;
          this.toast.error('Failed to update vehicle status', error.error?.message || 'Please try again.');
        },
      });
  }

  formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getPages() {
    const pages = [];
    for (let i = 0; i < Math.min(5, this.totalPages); i++) {
      let pageNum;
      if (this.totalPages <= 5) pageNum = i + 1;
      else if (this.page <= 3) pageNum = i + 1;
      else if (this.page >= this.totalPages - 2)
        pageNum = this.totalPages - 4 + i;
      else pageNum = this.page - 2 + i;
      pages.push(pageNum);
    }
    return pages;
  }
}
