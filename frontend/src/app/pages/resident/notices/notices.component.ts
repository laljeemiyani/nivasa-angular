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
  IconSearchComponent,
  IconAlertCircleComponent,
  IconXComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-resident-notices',
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
    IconSearchComponent,
    IconAlertCircleComponent,
    IconXComponent,
  ],
  templateUrl: './notices.component.html',
})
export class ResidentNoticesComponent implements OnInit {
  loading = true;
  notices: any[] = [];
  totalPages = 1;
  currentPage = 1;
  searchQuery = '';
  categoryFilter = '';
  priorityFilter = '';

  private searchDebounce: any = null;

  selectedNotice: any = null;
  isModalOpen = false;

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchNotices();
  }

  fetchNotices() {
    this.loading = true;
    let params: any = {
      page: this.currentPage.toString(),
      limit: '10',
      isActive: 'true',
    };

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.categoryFilter)
      params.category = this.categoryFilter.toLowerCase();
    if (this.priorityFilter)
      params.priority = this.priorityFilter.toLowerCase();

    this.http.get<any>(`${this.apiUrl}/notices`, { params }).subscribe({
      next: (response) => {
        this.notices = response.data.notices;
        this.totalPages = response.data.pagination.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching notices:', error);
        this.loading = false;
      },
    });
  }

  handleSearch(e?: Event) {
    if (e) e.preventDefault();
    this.currentPage = 1;
    this.fetchNotices();
  }

  onSearchInput() {
    this.currentPage = 1;
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      this.fetchNotices();
    }, 300);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.fetchNotices();
  }

  handlePageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchNotices();
  }

  openNoticeModal(notice: any) {
    this.selectedNotice = notice;
    this.isModalOpen = true;
  }

  closeNoticeModal() {
    this.isModalOpen = false;
    this.selectedNotice = null;
  }

  getPriorityColor(priority: string) {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
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
      case 'community':
      case 'event':
        return 'success';
      case 'emergency':
      case 'other':
        return 'error';
      case 'general':
      case 'payment':
        return 'secondary';
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
