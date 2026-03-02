import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private authUrl = environment.apiUrl + '/auth';
  private adminUrl = environment.apiUrl + '/admin';
  private residentUrl = environment.apiUrl;

  // --- Admin API ---
  getAdminDashboardStats(): Observable<any> {
    return this.http.get(`${this.adminUrl}/dashboard/stats`);
  }

  getAdminResidents(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.adminUrl}/residents`, { params: httpParams });
  }

  updateResidentStatus(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.adminUrl}/residents/${userId}/status`, data);
  }

  deleteResident(userId: string, data: any): Observable<any> {
    return this.http.delete(`${this.adminUrl}/residents/${userId}`, {
      body: data,
    });
  }

  getAdminComplaints(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.adminUrl}/complaints`, { params: httpParams });
  }

  updateComplaintStatus(complaintId: string, data: any): Observable<any> {
    return this.http.put(
      `${this.adminUrl}/complaints/${complaintId}/status`,
      data,
    );
  }

  deleteAdminComplaint(complaintId: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/complaints/${complaintId}`);
  }

  getAdminNotices(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.residentUrl}/notices/admin`, {
      params: httpParams,
    });
  }

  createNotice(data: any): Observable<any> {
    return this.http.post(`${this.residentUrl}/notices/admin`, data);
  }

  updateNotice(noticeId: string, data: any): Observable<any> {
    return this.http.put(`${this.residentUrl}/notices/admin/${noticeId}`, data);
  }

  deleteNotice(noticeId: string): Observable<any> {
    return this.http.delete(`${this.residentUrl}/notices/admin/${noticeId}`);
  }

  getAdminVehicles(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.adminUrl}/vehicles`, { params: httpParams });
  }

  updateVehicleStatusAdmin(vehicleId: string, data: any): Observable<any> {
    return this.http.put(`${this.adminUrl}/vehicles/${vehicleId}/status`, data);
  }

  // --- Resident API ---
  getResidentNotices(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.residentUrl}/notices`, { params: httpParams });
  }

  getResidentComplaints(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.residentUrl}/complaints`, {
      params: httpParams,
    });
  }

  createComplaint(data: any): Observable<any> {
    return this.http.post(`${this.residentUrl}/complaints`, data);
  }

  updateComplaint(complaintId: string, data: any): Observable<any> {
    return this.http.put(`${this.residentUrl}/complaints/${complaintId}`, data);
  }

  deleteComplaint(complaintId: string): Observable<any> {
    return this.http.delete(`${this.residentUrl}/complaints/${complaintId}`);
  }

  getFamilyMembers(): Observable<any> {
    return this.http.get(`${this.residentUrl}/family`);
  }

  addFamilyMember(data: any): Observable<any> {
    return this.http.post(`${this.residentUrl}/family`, data);
  }

  updateFamilyMember(memberId: string, data: any): Observable<any> {
    return this.http.put(`${this.residentUrl}/family/${memberId}`, data);
  }

  deleteFamilyMember(memberId: string): Observable<any> {
    return this.http.delete(`${this.residentUrl}/family/${memberId}`);
  }

  getVehicles(): Observable<any> {
    return this.http.get(`${this.residentUrl}/vehicles/my-vehicles`);
  }

  addVehicle(data: any): Observable<any> {
    return this.http.post(`${this.residentUrl}/vehicles`, data);
  }

  updateVehicle(vehicleId: string, data: any): Observable<any> {
    return this.http.put(`${this.residentUrl}/vehicles/${vehicleId}`, data);
  }

  deleteVehicle(vehicleId: string): Observable<any> {
    return this.http.delete(`${this.residentUrl}/vehicles/${vehicleId}`);
  }
}
