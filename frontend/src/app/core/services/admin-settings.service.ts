import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AdminProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  username?: string;
  profilePhotoUrl?: string;
  designation?: string;
  bio?: string;
  accountCreatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  maintenanceMode: boolean;
  allowSocietyRegistration: boolean;
  allowResidentRegistration: boolean;
  enableComplaints: boolean;
  enableNoticeBoard: boolean;
  enableVisitorLog: boolean;
  timezone: string;
  dateFormat: string;
}

export interface SocietySettings {
  maxResidentsPerSociety: number;
  maxVehiclesPerResident: number;
  maxComplaintsPerMonth: number;
  complaintCategories: Array<{
    _id?: string;
    name: string;
    order: number;
    isActive: boolean;
  }>;
  visitorPassValidityHours: number;
  noticeExpiryDays: number;
  autoApproveSocieties: boolean;
  autoCloseComplaints: boolean;
  allowReopenComplaints: boolean;
}

export interface ResidentSettings {
  approvalMode: 'auto' | 'society_admin' | 'super_admin';
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  allowProfileEdit: boolean;
  allowPasswordChange: boolean;
  strongPasswordRequired: boolean;
  accountDeletionPolicy: string;
}

export interface NotificationPreferences {
  newSocietyRegistered: boolean;
  newResident: boolean;
  complaintFiled: boolean;
  complaintEscalated: boolean;
  residentAccountInactivated: boolean;
  residentReactivated: boolean;
  suspiciousLogin: boolean;
  weeklyReport: boolean;
  weeklyReportDay: string;
}

export interface ActiveSession {
  _id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  loginAt: string;
  lastActivityAt: string;
}

export interface OnlineResident {
  _id: string;
  userId: string;
  userName: string;
  societyName: string;
  flatNumber: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  loginAt: string;
}

export interface ResidentActivityStats {
  onlineCount: number;
  inactiveCount: number;
  loginsToday: number;
  loginsThisWeek: number;
}

export interface LoginLog {
  _id: string;
  userId: string;
  userName: string;
  societyName: string;
  flatNumber: string;
  action: 'login' | 'logout' | 'forced_logout';
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  timestamp: string;
  isInactive?: boolean;
}

export interface AdminActivityLog {
  _id: string;
  action: string;
  entityType: string;
  timestamp: string;
  ipAddress: string;
}

export interface InactiveResident {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  deletedAt: string;
  deletionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSettingsService {
  private apiUrl = environment.apiUrl + '/admin';
  
  // Cache for settings
  private platformSettings$ = new BehaviorSubject<PlatformSettings | null>(null);
  private societySettings$ = new BehaviorSubject<SocietySettings | null>(null);
  private residentSettings$ = new BehaviorSubject<ResidentSettings | null>(null);
  private notificationPrefs$ = new BehaviorSubject<NotificationPreferences | null>(null);

  constructor(private http: HttpClient) {}

  // ==================== PROFILE ====================
  
  getProfile(): Observable<{ success: boolean; data: AdminProfile }> {
    return this.http.get<{ success: boolean; data: AdminProfile }>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<AdminProfile>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/profile`, data);
  }

  uploadProfilePhoto(file: File): Observable<{ success: boolean; data: { photoUrl: string } }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ success: boolean; data: { photoUrl: string } }>(
      `${this.apiUrl}/profile/photo`, 
      formData
    );
  }

  // ==================== SECURITY ====================
  
  changeEmail(data: { newEmail: string; confirmEmail: string; currentPassword: string }): 
    Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/change-email`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): 
    Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/change-password`, data);
  }

  getSessions(): Observable<{ success: boolean; data: ActiveSession[] }> {
    return this.http.get<{ success: boolean; data: ActiveSession[] }>(`${this.apiUrl}/sessions`);
  }

  revokeSession(sessionId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  logoutAllOthers(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/logout-all-others`, {});
  }

  // ==================== PLATFORM SETTINGS ====================
  
  getPlatformSettings(): Observable<{ success: boolean; data: PlatformSettings }> {
    return this.http.get<{ success: boolean; data: PlatformSettings }>(`${this.apiUrl}/settings/platform`)
      .pipe(
        tap(response => this.platformSettings$.next(response.data)),
        shareReplay(1)
      );
  }

  updatePlatformSettings(settings: Partial<PlatformSettings>): 
    Observable<{ success: boolean; message: string; data: PlatformSettings }> {
    return this.http.put<{ success: boolean; message: string; data: PlatformSettings }>(
      `${this.apiUrl}/settings/platform`, 
      settings
    ).pipe(
      tap(response => this.platformSettings$.next(response.data))
    );
  }

  getPlatformSettingsCache(): Observable<PlatformSettings | null> {
    return this.platformSettings$.asObservable();
  }

  // ==================== SOCIETY SETTINGS ====================
  
  getSocietySettings(): Observable<{ success: boolean; data: SocietySettings }> {
    return this.http.get<{ success: boolean; data: SocietySettings }>(`${this.apiUrl}/settings/society`)
      .pipe(
        tap(response => this.societySettings$.next(response.data)),
        shareReplay(1)
      );
  }

  updateSocietySettings(settings: Partial<SocietySettings>): 
    Observable<{ success: boolean; message: string; data: SocietySettings }> {
    return this.http.put<{ success: boolean; message: string; data: SocietySettings }>(
      `${this.apiUrl}/settings/society`, 
      settings
    ).pipe(
      tap(response => this.societySettings$.next(response.data))
    );
  }

  // ==================== RESIDENT SETTINGS ====================
  
  getResidentSettings(): Observable<{ success: boolean; data: ResidentSettings }> {
    return this.http.get<{ success: boolean; data: ResidentSettings }>(`${this.apiUrl}/settings/residents`)
      .pipe(
        tap(response => this.residentSettings$.next(response.data)),
        shareReplay(1)
      );
  }

  updateResidentSettings(settings: Partial<ResidentSettings>): 
    Observable<{ success: boolean; message: string; data: ResidentSettings }> {
    return this.http.put<{ success: boolean; message: string; data: ResidentSettings }>(
      `${this.apiUrl}/settings/residents`, 
      settings
    ).pipe(
      tap(response => this.residentSettings$.next(response.data))
    );
  }

  // ==================== NOTIFICATION PREFERENCES ====================
  
  getNotificationPreferences(): Observable<{ success: boolean; data: NotificationPreferences }> {
    return this.http.get<{ success: boolean; data: NotificationPreferences }>(`${this.apiUrl}/settings/notifications`)
      .pipe(
        tap(response => this.notificationPrefs$.next(response.data)),
        shareReplay(1)
      );
  }

  updateNotificationPreferences(prefs: Partial<NotificationPreferences>): 
    Observable<{ success: boolean; message: string; data: NotificationPreferences }> {
    return this.http.put<{ success: boolean; message: string; data: NotificationPreferences }>(
      `${this.apiUrl}/settings/notifications`, 
      prefs
    ).pipe(
      tap(response => this.notificationPrefs$.next(response.data))
    );
  }

  // ==================== RESIDENT ACTIVITY ====================
  
  getOnlineResidents(): Observable<{ success: boolean; data: { stats: ResidentActivityStats; onlineResidents: OnlineResident[] } }> {
    return this.http.get<{ success: boolean; data: { stats: ResidentActivityStats; onlineResidents: OnlineResident[] } }>(
      `${this.apiUrl}/activity/online`
    );
  }

  pollOnlineResidents(intervalMs: number = 30000): Observable<{ success: boolean; data: { stats: ResidentActivityStats; onlineResidents: OnlineResident[] } }> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getOnlineResidents())
    );
  }

  getLoginHistory(params: { 
    page?: number; 
    limit?: number; 
    society?: string; 
    startDate?: string; 
    endDate?: string;
    action?: string;
    accountStatus?: string;
  } = {}): Observable<{ 
    success: boolean; 
    data: { logs: LoginLog[]; pagination: any } 
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.http.get<{ success: boolean; data: { logs: LoginLog[]; pagination: any } }>(
      `${this.apiUrl}/activity/history?${queryParams.toString()}`
    );
  }

  forceLogoutResident(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/activity/force-logout/${userId}`, 
      {}
    );
  }

  // ==================== ACTIVITY LOGS ====================
  
  getAdminActivityLogs(params: { page?: number; limit?: number; entityType?: string; startDate?: string; endDate?: string } = {}): 
    Observable<{ success: boolean; data: { logs: AdminActivityLog[]; pagination: any } }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.http.get<{ success: boolean; data: { logs: AdminActivityLog[]; pagination: any } }>(
      `${this.apiUrl}/logs/activity?${queryParams.toString()}`
    );
  }

  getPlatformEventLogs(params: { page?: number; limit?: number } = {}): 
    Observable<{ success: boolean; data: { logs: any[]; pagination: any } }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.http.get<{ success: boolean; data: { logs: any[]; pagination: any } }>(
      `${this.apiUrl}/logs/platform?${queryParams.toString()}`
    );
  }

  getAdminLoginHistory(params: { page?: number; limit?: number } = {}): 
    Observable<{ success: boolean; data: { logs: any[]; pagination: any } }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.http.get<{ success: boolean; data: { logs: any[]; pagination: any } }>(
      `${this.apiUrl}/logs/login?${queryParams.toString()}`
    );
  }

  // ==================== INACTIVE RESIDENTS ====================
  
  getInactiveResidents(params: { page?: number; limit?: number; search?: string } = {}): 
    Observable<{ success: boolean; data: { residents: InactiveResident[]; pagination: any } }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.http.get<{ success: boolean; data: { residents: InactiveResident[]; pagination: any } }>(
      `${this.apiUrl}/residents/inactive?${queryParams.toString()}`
    );
  }

  reactivateResident(id: string): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/residents/${id}/reactivate`, 
      {}
    );
  }

  // ==================== PENDING RESIDENTS ====================
  
  getPendingResidents(params: { page?: number; limit?: number } = {}): 
    Observable<{ success: boolean; data: { residents: any[]; pagination: any } }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.http.get<{ success: boolean; data: { residents: any[]; pagination: any } }>(
      `${this.apiUrl}/residents/pending?${queryParams.toString()}`
    );
  }

  approveResident(id: string): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/residents/${id}/approve`, 
      {}
    );
  }

  rejectResident(id: string, reason: string): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.put<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/residents/${id}/reject`, 
      { rejectionReason: reason }
    );
  }

  // ==================== DANGER ZONE ====================
  
  resetPlatformSettings(confirmation: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/danger/reset-platform`, 
      { confirmation }
    );
  }

  clearAllLogs(confirmation: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/danger/clear-logs`, 
      { confirmation }
    );
  }

  exportAllData(password: string): Observable<{ success: boolean; message: string; data: any }> {
    return this.http.post<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/danger/export-data`, 
      { password }
    );
  }

  reactivateAllInactive(confirmation: string): Observable<{ success: boolean; message: string; count: number }> {
    return this.http.post<{ success: boolean; message: string; count: number }>(
      `${this.apiUrl}/danger/reactivate-all`, 
      { confirmation }
    );
  }

  permanentDeleteResident(id: string, confirmation: string, residentName: string): 
    Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/danger/permanent-delete/${id}`,
      { body: { confirmation, residentName } }
    );
  }
}

// Helper function for tap operator
function tap<T>(callback: (value: T) => void): import('rxjs').OperatorFunction<T, T> {
  return (source) => new Observable<T>(observer => {
    return source.subscribe({
      next: (value) => {
        try {
          callback(value);
        } catch (err) {
          // Ignore errors in tap
        }
        observer.next(value);
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
}
