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

@Component({
  selector: 'app-resident-family',
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
  ],
  templateUrl: './family.component.html',
})
export class FamilyComponent implements OnInit {
  loading = true;
  submitting = false;
  familyMembers: any[] = [];

  isModalOpen = false;
  isDeleteDialogOpen = false;
  selectedMember: any = null;
  modalMode: 'create' | 'edit' = 'create';

  formData = {
    fullName: '',
    relation: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
  };
  errors: any = {};

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchFamilyMembers();
  }

  fetchFamilyMembers() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/family`).subscribe({
      next: (response) => {
        this.familyMembers = response.data.familyMembers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching family:', error);
        this.loading = false;
      },
    });
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.formData = {
      fullName: '',
      relation: '',
      phone: '',
      email: '',
      age: '',
      gender: 'Male',
    };
    this.errors = {};
    this.isModalOpen = true;
  }

  openEditModal(member: any) {
    this.modalMode = 'edit';
    this.selectedMember = member;
    this.formData = {
      fullName: member.fullName,
      relation: member.relation,
      phone: member.phone || '',
      email: member.email || '',
      age: member.age || '',
      gender: member.gender || 'Male',
    };
    this.errors = {};
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedMember = null;
  }

  openDeleteDialog(member: any) {
    this.selectedMember = member;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog() {
    this.isDeleteDialogOpen = false;
    this.selectedMember = null;
  }

  validateField(name: string, value: string) {
    let errorMessage = null;
    switch (name) {
      case 'phone':
        if (value && !/^[0-9]{10}$/.test(value))
          errorMessage = 'Phone number must be exactly 10 digits';
        break;
      case 'age':
        if (value && (parseInt(value) < 0 || parseInt(value) > 120))
          errorMessage = 'Age must be between 0 and 120';
        break;
      case 'email':
        if (
          value &&
          value.length > 0 &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          errorMessage = 'Please enter a valid email address';
        }
        break;
    }

    if (errorMessage) {
      this.errors[name] = errorMessage;
    } else {
      delete this.errors[name];
    }
  }

  handleInputChange(e: any, name: string) {
    let value = e.target.value;
    if (name === 'phone') value = value.replace(/[^0-9]/g, '').substring(0, 10);

    (this.formData as any)[name] = value;
    this.validateField(name, value);
  }

  handleSubmit() {
    const validationErrors: any = {};
    Object.keys(this.formData).forEach((key) => {
      this.validateField(key, (this.formData as any)[key]);
    });

    if (Object.keys(this.errors).length > 0) return;

    this.submitting = true;
    const body = {
      ...this.formData,
      age: this.formData.age ? parseInt(this.formData.age, 10) : undefined,
    };

    if (this.modalMode === 'create') {
      this.http.post(`${this.apiUrl}/family`, body).subscribe({
        next: () => {
          this.closeModal();
          this.fetchFamilyMembers();
          this.submitting = false;
        },
        error: (err) => {
          console.error(err);
          this.submitting = false;
        },
      });
    } else {
      this.http
        .put(`${this.apiUrl}/family/${this.selectedMember._id}`, body)
        .subscribe({
          next: () => {
            this.closeModal();
            this.fetchFamilyMembers();
            this.submitting = false;
          },
          error: (err) => {
            console.error(err);
            this.submitting = false;
          },
        });
    }
  }

  handleDelete() {
    this.http
      .delete(`${this.apiUrl}/family/${this.selectedMember._id}`)
      .subscribe({
        next: () => {
          this.closeDeleteDialog();
          this.fetchFamilyMembers();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  getRelationColor(relation: string) {
    switch (relation.toLowerCase()) {
      case 'spouse':
        return 'info';
      case 'child':
        return 'success';
      case 'parent':
        return 'secondary';
      case 'sibling':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getKeys(obj: any) {
    return Object.keys(obj);
  }
}
