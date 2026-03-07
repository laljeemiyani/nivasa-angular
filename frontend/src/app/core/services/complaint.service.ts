import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComplaintService {
  private apiUrl = environment.apiUrl;

  private complaintsSubject = new BehaviorSubject<any[]>([]);
  public complaints$ = this.complaintsSubject.asObservable();

  private totalPagesSubject = new BehaviorSubject<number>(1);
  public totalPages$ = this.totalPagesSubject.asObservable();

  private complaintHistorySubject = new BehaviorSubject<any[]>([]);
  public complaintHistory$ = this.complaintHistorySubject.asObservable();

  private totalHistoryPagesSubject = new BehaviorSubject<number>(1);
  public totalHistoryPages$ = this.totalHistoryPagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadComplaints(params?: any) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ''
        ) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }

    this.http
      .get<any>(`${this.apiUrl}/complaints/my-complaints`, {
        params: httpParams,
      })
      .subscribe({
        next: (response) => {
          const complaints =
            response.data?.complaints || response.data?.data?.complaints || [];
          const totalPages =
            response.data?.pagination?.totalPages ||
            response.data?.data?.pagination?.totalPages ||
            1;
          this.complaintsSubject.next(complaints);
          this.totalPagesSubject.next(totalPages);
        },
        error: (error) => console.error('Error fetching complaints:', error),
      });
  }

  loadComplaintHistory(params?: any) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ''
        ) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }

    this.http
      .get<any>(`${this.apiUrl}/admin/complaints/history`, {
        params: httpParams,
      })
      .subscribe({
        next: (response) => {
          const complaints =
            response.data?.complaints || response.data?.data?.complaints || [];
          const totalPages =
            response.data?.pagination?.totalPages ||
            response.data?.data?.pagination?.totalPages ||
            1;
          this.complaintHistorySubject.next(complaints);
          this.totalHistoryPagesSubject.next(totalPages);
        },
        error: (error) =>
          console.error('Error fetching complaint history:', error),
      });
  }

  addComplaint(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/complaints`, data).pipe(
      tap((response) => {
        const newComplaint =
          response.data?.complaint || response.data || response;
        const current = this.complaintsSubject.value;
        this.complaintsSubject.next([newComplaint, ...current]);
      }),
    );
  }

  updateComplaint(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/complaints/${id}`, data).pipe(
      tap((response) => {
        const updatedComplaint =
          response.data?.complaint || response.data || response;
        const current = this.complaintsSubject.value;
        const index = current.findIndex((c) => c._id === id);
        if (index !== -1) {
          const updatedList = [...current];
          updatedList[index] = { ...updatedList[index], ...updatedComplaint };
          this.complaintsSubject.next(updatedList);
        }
      }),
    );
  }

  deleteComplaint(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/complaints/${id}`).pipe(
      tap(() => {
        const current = this.complaintsSubject.value;
        this.complaintsSubject.next(current.filter((c) => c._id !== id));
      }),
    );
  }
}
