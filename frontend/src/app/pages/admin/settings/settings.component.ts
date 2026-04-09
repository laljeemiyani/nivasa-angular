import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, interval, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { 
  AdminSettingsService, 
  AdminProfile, 
  PlatformSettings, 
  SocietySettings,
  ResidentSettings,
  NotificationPreferences,
  ActiveSession,
  OnlineResident,
  ResidentActivityStats,
  LoginLog,
  AdminActivityLog,
  InactiveResident
} from '../../../core/services/admin-settings.service';
import { environment } from '../../../../environments/environment';

interface SectionNav {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  // Make Math available in template
  Math = Math;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  private destroy$ = new Subject<void>();
  private settingsService = inject(AdminSettingsService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  public authService = inject(AuthService);
  
  apiUrl = environment.apiUrl;
  
  // Navigation
  sections: SectionNav[] = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'platform', label: 'Platform', icon: 'globe' },
    { id: 'society', label: 'Society', icon: 'building' },
    { id: 'residents', label: 'Residents', icon: 'users' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' }
  ];
  
  activeSection = 'profile';
  isLoading = false;
  
  // Profile
  profile: AdminProfile | null = null;
  profileForm: FormGroup;
  profilePhotoPreview: string | null = null;
  isProfileChanged = false;
  
  // Security
  emailForm: FormGroup;
  passwordForm: FormGroup;
  passwordStrength = 0;
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };
  
  // Platform Settings
  platformSettings: PlatformSettings | null = null;
  platformForm: FormGroup;
  isPlatformChanged = false;
  
  // Society Settings
  societySettings: SocietySettings | null = null;
  societyForm: FormGroup;
  isSocietyChanged = false;
  newCategoryName = '';
  
  // Resident Settings
  residentSettings: ResidentSettings | null = null;
  residentForm: FormGroup;
  isResidentChanged = false;
  
  // Notification Preferences
  notificationPrefs: NotificationPreferences | null = null;
  notificationForm: FormGroup;
  
  // Activity
  activityStats: ResidentActivityStats = {
    onlineCount: 0,
    inactiveCount: 0,
    loginsToday: 0,
    loginsThisWeek: 0
  };
  onlineResidents: OnlineResident[] = [];
  loginHistory: LoginLog[] = [];
  loginHistoryFilters = {
    society: '',
    startDate: '',
    endDate: '',
    action: '',
    accountStatus: ''
  };
  loginHistoryPagination = { page: 1, limit: 20, total: 0, pages: 0 };
  
  // Logs
  adminActivityLogs: AdminActivityLog[] = [];
  platformEventLogs: any[] = [];
  adminLoginLogs: any[] = [];
  logsPagination = { page: 1, limit: 20, total: 0, pages: 0 };
  activeLogTab: 'activity' | 'platform' | 'login' = 'activity';
  
  // Inactive Residents
  inactiveResidents: InactiveResident[] = [];
  inactiveSearchQuery = '';
  inactivePagination = { page: 1, limit: 10, total: 0, pages: 0 };
  
  // Pending Residents
  pendingResidents: any[] = [];
  pendingPagination = { page: 1, limit: 10, total: 0, pages: 0 };
  selectedPendingResident: any = null;
  rejectionReason = '';
  
  // Danger Zone
  dangerConfirmations: { [key: string]: string } = {};
  selectedResidentForDelete: InactiveResident | null = null;
  
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  constructor() {
    // Profile Form
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      designation: ['', [Validators.maxLength(100)]]
    });
    
    // Email Form
    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required]
    });
    
    // Password Form
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
    
    // Platform Form
    this.platformForm = this.fb.group({
      platformName: ['', Validators.required],
      tagline: [''],
      maintenanceMode: [false],
      allowSocietyRegistration: [true],
      allowResidentRegistration: [true],
      enableComplaints: [true],
      enableNoticeBoard: [true],
      enableVisitorLog: [true]
    });
    
    // Society Form
    this.societyForm = this.fb.group({
      maxResidentsPerSociety: [500, [Validators.min(1), Validators.max(10000)]],
      maxVehiclesPerResident: [3, [Validators.min(0), Validators.max(10)]],
      maxComplaintsPerMonth: [10, [Validators.min(1), Validators.max(100)]],
      visitorPassValidityHours: [24, [Validators.min(1), Validators.max(168)]],
      noticeExpiryDays: [30, [Validators.min(1), Validators.max(365)]],
      autoApproveSocieties: [false],
      autoCloseComplaints: [false],
      allowReopenComplaints: [true]
    });
    
    // Resident Form
    this.residentForm = this.fb.group({
      approvalMode: ['super_admin'],
      maxFailedLoginAttempts: [5, [Validators.min(1), Validators.max(10)]],
      lockoutDurationMinutes: [30, [Validators.min(5), Validators.max(1440)]],
      allowProfileEdit: [true],
      allowPasswordChange: [true],
      strongPasswordRequired: [true]
    });
    
    // Notification Form
    this.notificationForm = this.fb.group({
      newSocietyRegistered: [true],
      newResident: [true],
      complaintFiled: [true],
      complaintEscalated: [true],
      residentAccountInactivated: [true],
      residentReactivated: [true],
      suspiciousLogin: [true],
      weeklyReport: [true],
      weeklyReportDay: ['Monday']
    });
    
    // Setup change detection
    this.setupChangeDetection();
  }
  
  ngOnInit(): void {
    this.loadAllData();
    this.startPolling();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private setupChangeDetection(): void {
    // Profile changes
    this.profileForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.isProfileChanged = this.profileForm.dirty && this.profileForm.valid;
      });
    
    // Platform changes
    this.platformForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.isPlatformChanged = this.platformForm.dirty && this.platformForm.valid;
      });
    
    // Society changes
    this.societyForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.isSocietyChanged = this.societyForm.dirty && this.societyForm.valid;
      });
    
    // Resident changes
    this.residentForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.isResidentChanged = this.residentForm.dirty && this.residentForm.valid;
      });
    
    // Password strength
    this.passwordForm.get('newPassword')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.checkPasswordStrength(value);
      });
  }
  
  private loadAllData(): void {
    this.loadProfile();
    this.loadPlatformSettings();
    this.loadSocietySettings();
    this.loadResidentSettings();
    this.loadNotificationPreferences();
    this.loadActivityData();
    this.loadLogs();
    this.loadInactiveResidents();
    this.loadPendingResidents();
  }
  
  private startPolling(): void {
    // Poll online residents every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.activeSection === 'activity') {
          this.loadActivityData();
        }
      });
  }
  
  // ==================== NAVIGATION ====================
  
  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate offset for sticky header (64px = h-16)
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
  
  // ==================== PROFILE ====================
  
  loadProfile(): void {
    this.settingsService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.profile = response.data;
            this.profileForm.patchValue({
              fullName: response.data.fullName,
              phoneNumber: response.data.phoneNumber,
              designation: response.data.designation || ''
            });
            this.profilePhotoPreview = response.data.profilePhotoUrl || null;
          }
        },
        error: (err) => {
          this.toast.error('Failed to load profile');
        }
      });
  }
  
  saveProfile(): void {
    if (this.profileForm.invalid) return;
    
    this.isLoading = true;
    this.settingsService.updateProfile(this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toast.success('Profile updated successfully');
            this.profileForm.markAsPristine();
            this.isProfileChanged = false;
            // Reload profile and update auth service
            this.loadProfile();
            this.refreshAuthUser();
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.error?.message || 'Failed to update profile');
        }
      });
  }
  
  // Refresh auth user data to update navbar/header
  private refreshAuthUser(): void {
    const currentUser = this.authService.currentState.user;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        fullName: this.profileForm.value.fullName
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.authService.updateProfile(updatedUser).subscribe();
    }
  }
  
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhotoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Upload
      this.isLoading = true;
      this.settingsService.uploadProfilePhoto(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.toast.success('Profile photo uploaded');
              this.profilePhotoPreview = response.data.photoUrl;
              // Update auth user with new photo
              this.updateAuthUserPhoto(response.data.photoUrl);
              // Reload profile to ensure sync
              this.loadProfile();
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.toast.error('Failed to upload photo');
          }
        });
    }
  }
  
  // Update auth user photo in localStorage and auth service
  private updateAuthUserPhoto(photoUrl: string): void {
    const currentUser = this.authService.currentState.user;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        profilePhotoUrl: photoUrl
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Trigger auth state update
      this.authService.updateProfile(updatedUser).subscribe();
    }
  }
  
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
  
  // ==================== SECURITY ====================
  
  changeEmail(): void {
    if (this.emailForm.invalid) return;
    
    const { newEmail, confirmEmail } = this.emailForm.value;
    if (newEmail !== confirmEmail) {
      this.toast.error('Email addresses do not match');
      return;
    }
    
    this.isLoading = true;
    this.settingsService.changeEmail(this.emailForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toast.success('Email changed successfully');
            this.emailForm.reset();
            // Reload profile to show updated masked email
            this.loadProfile();
            // Update auth user with new email
            this.refreshAuthUserEmail(newEmail);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.error?.message || 'Failed to change email');
        }
      });
  }
  
  // Refresh auth user email in localStorage
  private refreshAuthUserEmail(newEmail: string): void {
    const currentUser = this.authService.currentState.user;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        email: newEmail
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.authService.updateProfile(updatedUser).subscribe();
    }
  }
  
  // Get masked email for display
  getMaskedEmail(email: string | undefined): string {
    if (!email) return 'Not set';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '***' 
      : '***';
    return `${maskedLocal}@${domain}`;
  }
  
  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }
    
    this.passwordRequirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    };
    
    const met = Object.values(this.passwordRequirements).filter(Boolean).length;
    this.passwordStrength = (met / 5) * 100;
  }
  
  changePassword(): void {
    if (this.passwordForm.invalid) return;
    
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }
    
    this.isLoading = true;
    this.settingsService.changePassword(this.passwordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toast.success('Password changed successfully. Please log in again.');
            this.passwordForm.reset();
            setTimeout(() => {
              this.authService.logout(true).subscribe();
            }, 2000);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.error(err.error?.message || 'Failed to change password');
        }
      });
  }
  

  
  // ==================== PLATFORM SETTINGS ====================
  
  loadPlatformSettings(): void {
    this.settingsService.getPlatformSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.platformSettings = response.data;
            this.platformForm.patchValue(response.data);
          }
        }
      });
  }
  
  savePlatformSettings(): void {
    if (this.platformForm.invalid) return;
    
    this.isLoading = true;
    this.settingsService.updatePlatformSettings(this.platformForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toast.success('Platform settings saved');
            this.platformForm.markAsPristine();
            this.isPlatformChanged = false;
          }
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to save platform settings');
        }
      });
  }
  
  togglePlatformSetting(controlName: string): void {
    const control = this.platformForm.get(controlName);
    if (control) {
      control.setValue(!control.value);
      control.markAsDirty();
      this.savePlatformSettings();
    }
  }
  
  // ==================== SOCIETY SETTINGS ====================
  
  loadSocietySettings(): void {
    this.settingsService.getSocietySettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.societySettings = response.data;
            this.societyForm.patchValue({
              maxResidentsPerSociety: response.data.maxResidentsPerSociety,
              maxVehiclesPerResident: response.data.maxVehiclesPerResident,
              maxComplaintsPerMonth: response.data.maxComplaintsPerMonth,
              visitorPassValidityHours: response.data.visitorPassValidityHours,
              noticeExpiryDays: response.data.noticeExpiryDays,
              autoApproveSocieties: response.data.autoApproveSocieties,
              autoCloseComplaints: response.data.autoCloseComplaints,
              allowReopenComplaints: response.data.allowReopenComplaints
            });
          }
        }
      });
  }
  
  saveSocietySettings(): void {
    if (this.societyForm.invalid) return;
    
    const data = {
      ...this.societyForm.value,
      complaintCategories: this.societySettings?.complaintCategories || []
    };
    
    this.isLoading = true;
    this.settingsService.updateSocietySettings(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toast.success('Society settings saved');
            this.societyForm.markAsPristine();
            this.isSocietyChanged = false;
          }
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to save society settings');
        }
      });
  }
  
  addComplaintCategory(): void {
    if (!this.newCategoryName.trim()) return;
    
    const categories = this.societySettings?.complaintCategories || [];
    categories.push({
      name: this.newCategoryName.trim(),
      order: categories.length + 1,
      isActive: true
    });
    
    if (this.societySettings) {
      this.societySettings.complaintCategories = categories;
    }
    
    this.newCategoryName = '';
    this.isSocietyChanged = true;
    this.saveCategoryChanges();
  }
  
  removeComplaintCategory(index: number): void {
    const categories = this.societySettings?.complaintCategories || [];
    categories.splice(index, 1);
    // Reorder remaining
    categories.forEach((cat, i) => cat.order = i + 1);
    
    if (this.societySettings) {
      this.societySettings.complaintCategories = categories;
    }
    
    this.isSocietyChanged = true;
    this.saveCategoryChanges();
  }
  
  moveCategory(index: number, direction: 'up' | 'down'): void {
    const categories = this.societySettings?.complaintCategories || [];
    if (direction === 'up' && index > 0) {
      [categories[index], categories[index - 1]] = [categories[index - 1], categories[index]];
    } else if (direction === 'down' && index < categories.length - 1) {
      [categories[index], categories[index + 1]] = [categories[index + 1], categories[index]];
    }
    
    // Reorder
    categories.forEach((cat, i) => cat.order = i + 1);
    
    if (this.societySettings) {
      this.societySettings.complaintCategories = categories;
    }
    
    this.isSocietyChanged = true;
    this.saveCategoryChanges();
  }
  
  saveCategoryChanges(): void {
    const data = {
      ...this.societySettings,
      complaintCategories: this.societySettings?.complaintCategories || []
    };
    
    this.settingsService.updateSocietySettings(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Categories updated');
        },
        error: () => {
          this.toast.error('Failed to update categories');
        }
      });
  }
  
  toggleCategoryActive(index: number): void {
    const categories = this.societySettings?.complaintCategories || [];
    if (categories[index]) {
      categories[index].isActive = !categories[index].isActive;
      this.isSocietyChanged = true;
      this.saveCategoryChanges();
    }
  }
  
  // ==================== RESIDENT SETTINGS ====================
  
  loadResidentSettings(): void {
    this.settingsService.getResidentSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.residentSettings = response.data;
            this.residentForm.patchValue(response.data);
          }
        }
      });
  }
  
  saveResidentSettings(): void {
    if (this.residentForm.invalid) return;
    
    this.isLoading = true;
    this.settingsService.updateResidentSettings(this.residentForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toast.success('Resident settings saved');
            this.residentForm.markAsPristine();
            this.isResidentChanged = false;
          }
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to save resident settings');
        }
      });
  }
  
  // ==================== NOTIFICATION PREFERENCES ====================
  
  loadNotificationPreferences(): void {
    this.settingsService.getNotificationPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationPrefs = response.data;
            this.notificationForm.patchValue(response.data);
          }
        }
      });
  }
  
  saveNotificationPreferences(): void {
    this.settingsService.updateNotificationPreferences(this.notificationForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.success('Notification preferences saved');
          }
        },
        error: () => {
          this.toast.error('Failed to save notification preferences');
        }
      });
  }
  
  toggleNotification(key: string): void {
    const control = this.notificationForm.get(key);
    if (control) {
      control.setValue(!control.value);
      this.saveNotificationPreferences();
    }
  }
  
  // ==================== ACTIVITY ====================
  
  loadActivityData(): void {
    this.settingsService.getOnlineResidents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.activityStats = response.data.stats;
            this.onlineResidents = response.data.onlineResidents;
          }
        }
      });
    
    this.loadLoginHistory();
  }
  
  loadLoginHistory(): void {
    this.settingsService.getLoginHistory({
      page: this.loginHistoryPagination.page,
      limit: this.loginHistoryPagination.limit,
      ...this.loginHistoryFilters
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loginHistory = response.data.logs;
            this.loginHistoryPagination = response.data.pagination;
          }
        }
      });
  }
  
  applyLoginFilters(): void {
    this.loginHistoryPagination.page = 1;
    this.loadLoginHistory();
  }
  
  forceLogout(userId: string, userName: string): void {
    this.confirmDialog.confirm({
      title: 'Force Logout',
      message: `Are you sure you want to force logout ${userName}?`,
      confirmText: 'Force Logout',
      cancelText: 'Cancel'
    }).subscribe(result => {
      if (result) {
        this.settingsService.forceLogoutResident(userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toast.success('User logged out');
              this.loadActivityData();
            },
            error: () => {
              this.toast.error('Failed to force logout');
            }
          });
      }
    });
  }
  
  // ==================== LOGS ====================
  
  loadLogs(): void {
    switch (this.activeLogTab) {
      case 'activity':
        this.loadAdminActivityLogs();
        break;
      case 'platform':
        this.loadPlatformEventLogs();
        break;
      case 'login':
        this.loadAdminLoginLogs();
        break;
    }
  }
  
  loadAdminActivityLogs(): void {
    this.settingsService.getAdminActivityLogs({
      page: this.logsPagination.page,
      limit: this.logsPagination.limit
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.adminActivityLogs = response.data.logs;
            this.logsPagination = response.data.pagination;
          }
        }
      });
  }
  
  loadPlatformEventLogs(): void {
    this.settingsService.getPlatformEventLogs({
      page: this.logsPagination.page,
      limit: this.logsPagination.limit
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.platformEventLogs = response.data.logs;
            this.logsPagination = response.data.pagination;
          }
        }
      });
  }
  
  loadAdminLoginLogs(): void {
    this.settingsService.getAdminLoginHistory({
      page: this.logsPagination.page,
      limit: this.logsPagination.limit
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.adminLoginLogs = response.data.logs;
            this.logsPagination = response.data.pagination;
          }
        }
      });
  }
  
  switchLogTab(tab: 'activity' | 'platform' | 'login'): void {
    this.activeLogTab = tab;
    this.logsPagination.page = 1;
    this.loadLogs();
  }
  
  exportLogs(format: 'csv' | 'pdf'): void {
    this.toast.info(`Exporting logs as ${format.toUpperCase()}...`);
    // Implementation would generate and download file
  }
  
  // ==================== INACTIVE RESIDENTS ====================
  
  loadInactiveResidents(): void {
    this.settingsService.getInactiveResidents({
      page: this.inactivePagination.page,
      limit: this.inactivePagination.limit,
      search: this.inactiveSearchQuery
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.inactiveResidents = response.data.residents;
            this.inactivePagination = response.data.pagination;
          }
        }
      });
  }
  
  searchInactive(): void {
    this.inactivePagination.page = 1;
    this.loadInactiveResidents();
  }
  
  reactivateResident(id: string, name: string): void {
    this.confirmDialog.confirm({
      title: 'Reactivate Resident',
      message: `Are you sure you want to reactivate ${name}?`,
      confirmText: 'Reactivate',
      cancelText: 'Cancel'
    }).subscribe(result => {
      if (result) {
        this.settingsService.reactivateResident(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toast.success('Resident reactivated');
              this.loadInactiveResidents();
            },
            error: () => {
              this.toast.error('Failed to reactivate resident');
            }
          });
      }
    });
  }
  
  // ==================== DANGER ZONE ====================
  
  executeDangerAction(action: string, confirmationValue: string): void {
    switch (action) {
      case 'reset':
        this.resetPlatform(confirmationValue);
        break;
      case 'clearLogs':
        this.clearLogs(confirmationValue);
        break;
      case 'export':
        this.exportData(confirmationValue);
        break;
      case 'reactivateAll':
        this.reactivateAll(confirmationValue);
        break;
      case 'delete':
        if (this.selectedResidentForDelete) {
          this.permanentDelete(this.selectedResidentForDelete, confirmationValue);
        }
        break;
    }
  }
  
  resetPlatform(confirmation: string): void {
    if (confirmation !== 'RESET') {
      this.toast.error('Invalid confirmation code');
      return;
    }
    
    this.settingsService.resetPlatformSettings(confirmation)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Platform settings reset to defaults');
          this.dangerConfirmations['reset'] = '';
          this.loadPlatformSettings();
        },
        error: () => {
          this.toast.error('Failed to reset platform settings');
        }
      });
  }
  
  clearLogs(confirmation: string): void {
    if (confirmation !== 'CLEAR LOGS') {
      this.toast.error('Invalid confirmation code');
      return;
    }
    
    this.settingsService.clearAllLogs(confirmation)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Logs cleared successfully');
          this.dangerConfirmations['clearLogs'] = '';
          this.loadLogs();
        },
        error: () => {
          this.toast.error('Failed to clear logs');
        }
      });
  }
  
  exportData(password: string): void {
    this.settingsService.exportAllData(password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Download JSON file
            const dataStr = JSON.stringify(response.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nivasa-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.toast.success('Data exported successfully');
            this.dangerConfirmations['export'] = '';
          }
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to export data');
        }
      });
  }
  
  reactivateAll(confirmation: string): void {
    if (confirmation !== 'REACTIVATE ALL') {
      this.toast.error('Invalid confirmation code');
      return;
    }
    
    this.settingsService.reactivateAllInactive(confirmation)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.toast.success(`${response.count} residents reactivated`);
          this.dangerConfirmations['reactivateAll'] = '';
          this.loadInactiveResidents();
        },
        error: () => {
          this.toast.error('Failed to reactivate residents');
        }
      });
  }
  
  permanentDelete(resident: InactiveResident, confirmation: string): void {
    const expectedConfirmation = `DELETE ${resident.fullName}`;
    if (confirmation !== expectedConfirmation) {
      this.toast.error(`Type "${expectedConfirmation}" to confirm`);
      return;
    }
    
    this.settingsService.permanentDeleteResident(resident._id, confirmation, resident.fullName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Resident permanently deleted');
          this.selectedResidentForDelete = null;
          this.dangerConfirmations['delete'] = '';
          this.loadInactiveResidents();
        },
        error: () => {
          this.toast.error('Failed to delete resident');
        }
      });
  }
  
  selectResidentForDelete(resident: InactiveResident): void {
    this.selectedResidentForDelete = resident;
    this.dangerConfirmations['delete'] = '';
  }
  
  // ==================== PENDING RESIDENTS ====================
  
  loadPendingResidents(): void {
    this.settingsService.getPendingResidents({
      page: this.pendingPagination.page,
      limit: this.pendingPagination.limit
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.pendingResidents = response.data.residents;
            this.pendingPagination = response.data.pagination;
          }
        },
        error: (err) => {
          this.toast.error('Failed to load pending residents');
        }
      });
  }
  
  approveResident(id: string, name: string): void {
    this.confirmDialog.confirm({
      title: 'Approve Resident',
      message: `Are you sure you want to approve ${name}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel'
    }).subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.settingsService.approveResident(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.toast.success(`${name} approved successfully`);
              this.loadPendingResidents();
            },
            error: () => {
              this.isLoading = false;
              this.toast.error('Failed to approve resident');
            }
          });
      }
    });
  }
  
  rejectResident(id: string, name: string): void {
    this.selectedPendingResident = this.pendingResidents.find(r => r._id === id);
    this.rejectionReason = '';
  }
  
  confirmRejectResident(): void {
    if (!this.selectedPendingResident || !this.rejectionReason.trim()) return;
    
    this.isLoading = true;
    this.settingsService.rejectResident(this.selectedPendingResident._id, this.rejectionReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.success(`${this.selectedPendingResident.fullName} rejected`);
          this.selectedPendingResident = null;
          this.rejectionReason = '';
          this.loadPendingResidents();
        },
        error: () => {
          this.isLoading = false;
          this.toast.error('Failed to reject resident');
        }
      });
  }
  
  cancelReject(): void {
    this.selectedPendingResident = null;
    this.rejectionReason = '';
  }
  
  // ==================== HELPERS ====================
  
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }
  
  formatRelativeTime(date: string | Date | undefined): string {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  
  getStrengthColor(): string {
    if (this.passwordStrength < 40) return 'bg-red-500';
    if (this.passwordStrength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  }
  
  getStrengthText(): string {
    if (this.passwordStrength < 40) return 'Weak';
    if (this.passwordStrength < 80) return 'Medium';
    return 'Strong';
  }
}
