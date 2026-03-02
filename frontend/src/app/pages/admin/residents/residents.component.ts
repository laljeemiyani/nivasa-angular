import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
  IconUsersComponent,
  IconSearchComponent,
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
    IconUsersComponent,
    IconSearchComponent,
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
  statusFilter = 'pending';

  selectedResident: any = null;
  modalOpen = false;
  actionStatus = '';
  rejectionReason = '';
  actionLoading = false;

  deleteModalOpen = false;
  deleteReason = '';
  deleteSource = 'manual';
  deleteLoading = false;

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
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
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedResident = null;
    this.actionStatus = '';
    this.rejectionReason = '';
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
      alert('Please provide a reason before rejecting this resident.');
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
          this.closeModal();
          this.fetchResidents();
          this.actionLoading = false;
        },
        error: (error) => {
          console.error('Failed to update resident status:', error);
          this.actionLoading = false;
        },
      });
  }

  handleResidentDeletion() {
    if (!this.selectedResident?._id) return;
    if (!this.deleteReason || !this.deleteReason.trim()) {
      alert('Add a short note explaining why this resident is being deleted.');
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
          this.closeDeleteModal();
          this.fetchResidents();
          this.deleteLoading = false;
        },
        error: (error) => {
          console.error('Failed to delete resident:', error);
          this.deleteLoading = false;
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
}
