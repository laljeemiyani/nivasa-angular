import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';

import {
  CardComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  IconSearchComponent,
  IconUsersComponent,
  IconChevronLeftComponent,
  IconChevronRightComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-family-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardContentComponent,
    BadgeComponent,
    IconSearchComponent,
    IconUsersComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
  ],
  templateUrl: './family-members.component.html',
})
export class AdminFamilyMembersComponent implements OnInit {
  Math = Math;
  familyMembers: any[] = [];
  residentGroups: Array<{ resident: any; members: any[] }> = [];
  loading = true;
  totalItems = 0;
  totalPages = 1;
  currentPage = 1;
  searchQuery = '';

  expandedResidentId: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.fetchFamilyMembers();
  }

  fetchFamilyMembers() {
    this.loading = true;
    let url = `${this.apiUrl}/admin/family-members?page=${this.currentPage}&limit=10`;
    if (this.searchQuery) {
      url += `&search=${this.searchQuery}`;
    }

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.success || response.data) {
          const resData = response.data || response;
          this.familyMembers = resData.familyMembers || [];
          const pagination = resData.pagination || {
            totalPages: 1,
            totalItems: 0,
          };
          this.totalPages = pagination.totalPages;
          this.totalItems = pagination.totalItems;
          this.buildResidentGroups();
        } else {
          this.familyMembers = [];
          this.residentGroups = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching family members:', error);
        this.loading = false;
        this.toast.error('Failed to load family members', error.error?.message || 'Please try again.');
      },
    });
  }

  private buildResidentGroups() {
    const map = new Map<string, { resident: any; members: any[] }>();
    for (const member of this.familyMembers) {
      const resident = member.userId || null;
      const key = resident?._id || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          resident,
          members: [],
        });
      }
      map.get(key)!.members.push(member);
    }
    this.residentGroups = Array.from(map.values());
  }

  handleSearch(e?: Event) {
    if (e) e.preventDefault();
    this.currentPage = 1;
    this.fetchFamilyMembers();
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchFamilyMembers();
    }
  }

  getPages() {
    const pages = [];
    for (let i = 0; i < Math.min(5, this.totalPages); i++) {
      let pageNum = this.currentPage - 2 + i;
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        pages.push(pageNum);
      }
    }
    return pages;
  }

  toggleResident(residentId: string | null) {
    if (!residentId) return;
    this.expandedResidentId =
      this.expandedResidentId === residentId ? null : residentId;
  }
}
