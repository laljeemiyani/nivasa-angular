import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';
import {
  TabsComponent,
  TabsContentComponent,
} from '../../../shared/components/ui/tabs/tabs.component';

import {
  IconUserComponent,
  IconShieldComponent,
  IconCameraComponent,
  IconAlertCircleComponent,
  IconEyeComponent,
  IconEyeOffComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-resident-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    TabsComponent,
    TabsContentComponent,
    IconUserComponent,
    IconShieldComponent,
    IconCameraComponent,
    IconAlertCircleComponent,
    IconEyeComponent,
    IconEyeOffComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  profileTabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Security', value: 'security' },
  ];
  loading = true;
  saving = false;
  changingPassword = false;
  uploadingPhoto = false;

  profile: any = null;
  profilePhoto: { preview: string; name: string } | null = null;
  isEditing = false;

  showPasswords = { current: false, new: false, confirm: false };

  formData = {
    fullName: '',
    phoneNumber: '',
    age: '',
    gender: '',
    wing: '',
    flatNumber: '',
    residentType: '',
  };
  errors: any = {};

  passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/auth/profile`).subscribe({
      next: (response) => {
        const user = response.data.user;
        this.profile = user;

        if (user.profilePhotoUrl) {
          this.profilePhoto = {
            preview: `/uploads/profile_photos/${user.profilePhotoUrl}`,
            name: user.profilePhotoUrl,
          };
        }

        this.formData = {
          fullName: user.fullName || '',
          phoneNumber: user.phoneNumber || '',
          age: user.age || '',
          gender: user.gender || '',
          wing: user.wing || '',
          flatNumber: user.flatNumber || '',
          residentType: user.residentType || '',
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.loading = false;
      },
    });
  }

  handleProfilePhotoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    this.uploadingPhoto = true;
    const formData = new FormData();
    formData.append('profilePhoto', file);

    this.http
      .post<any>(`${this.apiUrl}/auth/update-profile-photo`, formData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.profilePhoto = {
              preview: URL.createObjectURL(file),
              name: file.name,
            };

            // Refresh user context in AuthService
            this.http
              .get<any>(`${this.apiUrl}/auth/profile`)
              .subscribe((res) => {
                this.authService.updateUser(res.data.user);
              });
          }
          this.uploadingPhoto = false;
        },
        error: (error) => {
          console.error('Error uploading photo:', error);
          alert(error.error?.message || 'Failed to upload photo');
          this.uploadingPhoto = false;
        },
      });
  }

  validateField(name: string, value: string) {
    let errorMessage = null;
    switch (name) {
      case 'phoneNumber':
        if (value && !/^[0-9]{10}$/.test(value)) {
          errorMessage = 'Phone number must be exactly 10 digits';
        }
        break;
      case 'age':
        if (value && (parseInt(value) < 18 || parseInt(value) > 120)) {
          errorMessage = 'Age must be between 18 and 120 years';
        }
        break;
      case 'flatNumber':
        if (value && !/^([1-9]|1[0-4])(0[1-4])$/.test(value)) {
          errorMessage =
            'Flat number must be in format: 101-104, ... 1401-1404';
        }
        break;
    }

    if (errorMessage) {
      this.errors[name] = errorMessage;
    } else {
      delete this.errors[name];
    }
    return errorMessage;
  }

  handleInputChange(e: any, name: string) {
    let value = e.target.value;
    if (name === 'phoneNumber') {
      value = value.replace(/[^0-9]/g, '').substring(0, 10);
    } else if (name === 'age') {
      value = value.replace(/[^0-9]/g, '').substring(0, 3);
    }
    (this.formData as any)[name] = value;
    this.validateField(name, value);
  }

  handleSelectChange(e: any, name: string) {
    const value = e.target.value;
    (this.formData as any)[name] = value;
    this.validateField(name, value);
  }

  handleProfileUpdate() {
    const validationErrors: any = {};
    Object.keys(this.formData).forEach((key) => {
      const error = this.validateField(key, (this.formData as any)[key]);
      if (error) validationErrors[key] = error;
    });

    if (Object.keys(validationErrors).length > 0) return;

    this.saving = true;
    this.http.put(`${this.apiUrl}/auth/profile`, this.formData).subscribe({
      next: () => {
        this.isEditing = false;
        this.saving = false;
        this.fetchProfile();
      },
      error: (error) => {
        console.error('Update failed:', error);
        alert(error.error?.message || 'Update failed');
        this.saving = false;
      },
    });
  }

  handlePasswordUpdate() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    this.changingPassword = true;
    const body = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword,
    };

    this.http.put(`${this.apiUrl}/auth/change-password`, body).subscribe({
      next: () => {
        alert('Password changed successfully');
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
        this.changingPassword = false;
      },
      error: (error) => {
        console.error('Password change failed:', error);
        alert(error.error?.message || 'Failed to change password');
        this.changingPassword = false;
      },
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    this.showPasswords[field] = !this.showPasswords[field];
  }

  getKeys(obj: any) {
    return Object.keys(obj);
  }
}
