import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';

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

  relationPresets = [
    { label: 'Spouse', value: 'Spouse' },
    { label: 'Child', value: 'Child' },
    { label: 'Parent', value: 'Parent' },
    { label: 'Sibling', value: 'Sibling' },
    { label: 'Other', value: 'Other' },
  ];
  selectedRelationPreset: string | null = null;

  // Expected family count selector (used only for UX, not hard backend limit)
  expectedFamilyCount: number | '6+' | null = null;
  expectedFamilyOptions: Array<{ label: string; value: number | '6+' }> = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '6+', value: '6+' },
  ];

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
    this.http.get<any>(`${this.apiUrl}/family`).subscribe({
      next: (response) => {
        this.familyMembers = response.data?.familyMembers ?? [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching family:', error);
        this.loading = false;
        this.toast.error('Failed to load family members', error.error?.message || 'Please try again.');
      },
    });
  }

  openCreateModal() {
    // Enforce soft cap when a concrete number is selected
    if (
      typeof this.expectedFamilyCount === 'number' &&
      this.familyMembers.length >= this.expectedFamilyCount
    ) {
      this.toast.warning(
        'Family limit reached',
        `You already added ${this.familyMembers.length} of ${this.expectedFamilyCount} family members. Increase the number above if you need to add more.`,
      );
      return;
    }

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
    this.selectedRelationPreset = null;
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
    this.selectedRelationPreset = this.relationPresets.find(
      (p) => p.value.toLowerCase() === String(member.relation || '').toLowerCase(),
    )?.value ?? null;
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
      case 'fullName':
        if (!value || !value.trim()) {
          errorMessage = 'Full name is required';
        } else if (value.trim().length < 2 || value.trim().length > 100) {
          errorMessage = 'Full name must be between 2 and 100 characters';
        }
        break;
      case 'relation':
        if (!value || !value.trim()) {
          errorMessage = 'Relation is required';
        } else if (value.trim().length < 2 || value.trim().length > 50) {
          errorMessage = 'Relation must be between 2 and 50 characters';
        }
        break;
      case 'phone':
        if (value && !/^[0-9]{10}$/.test(value))
          errorMessage = 'Phone number must be exactly 10 digits';
        break;
      case 'age':
        if (!value) {
          errorMessage = 'Age is required';
        } else if (parseInt(value, 10) < 0 || parseInt(value, 10) > 120) {
          errorMessage = 'Age must be between 0 and 120';
        }
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
      case 'gender':
        if (!value) {
          errorMessage = 'Gender is required';
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

  selectRelationPreset(preset: string) {
    this.selectedRelationPreset = preset;
    if (preset !== 'Other') {
      this.formData.relation = preset;
      this.validateField('relation', this.formData.relation);
    } else {
      this.formData.relation = '';
    }
  }

  handleSubmit() {
    ['fullName', 'relation', 'age', 'gender', 'phone', 'email'].forEach((key) => {
      this.validateField(key, (this.formData as any)[key]);
    });

    if (Object.keys(this.errors).length > 0) {
      this.toast.warning('Validation Error', 'Please fix the highlighted fields.');
      return;
    }

    this.submitting = true;
    const body = {
      fullName: this.formData.fullName.trim(),
      relation: this.formData.relation.trim(),
      phone: this.formData.phone ? this.formData.phone.trim() : undefined,
      email: this.formData.email ? this.formData.email.trim().toLowerCase() : undefined,
      age: this.formData.age ? parseInt(this.formData.age, 10) : undefined,
      gender: this.formData.gender || undefined,
    };

    if (this.modalMode === 'create') {
      this.http.post(`${this.apiUrl}/family`, body).subscribe({
        next: () => {
          this.toast.success('Family member added');
          this.closeModal();
          this.fetchFamilyMembers();
          this.submitting = false;
        },
        error: (err) => {
          console.error(err);
          this.submitting = false;
          this.toast.error('Failed to add family member', err.error?.message || 'Please try again.');
        },
      });
    } else {
      this.http
        .put(`${this.apiUrl}/family/${this.selectedMember._id}`, body)
        .subscribe({
          next: () => {
            this.toast.success('Family member updated');
            this.closeModal();
            this.fetchFamilyMembers();
            this.submitting = false;
          },
          error: (err) => {
            console.error(err);
            this.submitting = false;
            this.toast.error('Failed to update family member', err.error?.message || 'Please try again.');
          },
        });
    }
  }

  handleDelete() {
    this.http
      .delete(`${this.apiUrl}/family/${this.selectedMember._id}`)
      .subscribe({
        next: () => {
          this.toast.success('Family member removed');
          this.closeDeleteDialog();
          this.fetchFamilyMembers();
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Failed to remove family member', err.error?.message || 'Please try again.');
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
