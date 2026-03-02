import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminNotificationData {
  userId?: string;
  title: string;
  message: string;
  type: string;
  relatedModel?: string;
  relatedId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminNotificationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin/notifications';

  createForResident(data: AdminNotificationData): Observable<any> {
    return this.http.post(`${this.apiUrl}/resident`, data);
  }

  createForAllResidents(data: AdminNotificationData): Observable<any> {
    return this.http.post(`${this.apiUrl}/all`, data);
  }
}
