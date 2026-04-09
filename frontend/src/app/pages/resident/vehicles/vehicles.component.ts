import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';
import {
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleComponent,
  ModalBodyComponent,
  ModalFooterComponent,
} from '../../../shared/components/ui/modal/modal.component';

import {
  IconAlertCircleComponent,
  IconXComponent,
  IconTrashComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-resident-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    IconAlertCircleComponent,
    IconXComponent,
    IconTrashComponent,
  ],
  templateUrl: './vehicles.component.html',
})
export class ResidentVehiclesComponent implements OnInit {
  loading = true;
  submitting = false;
  vehicles: any[] = [];

  // Allocation tracking
  parkingAllocation = 2;
  activeVehicleCount = 0;
  canAddMore = true;

  // Available slots logic removed since it is auto-allocated

  // Parking requests
  parkingRequests: any[] = [];
  hasPendingRequest = false;
  loadingRequests = false;

  // Modals
  isModalOpen = false;
  isDeleteDialogOpen = false;
  isRequestModalOpen = false;
  isRequestHistoryOpen = false;
  selectedVehicle: any = null;
  modalMode: 'create' | 'edit' = 'create';

  formData = {
    vehicleType: '',
    vehicleName: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleNumber: '',
    parkingSlot: '',
  };

  requestFormData = {
    requestedSlots: 1,
    reason: '',
  };

  errors: any = {};

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService,
  ) { }

  ngOnInit() {
    this.fetchVehicles();
    this.fetchParkingRequests();
  }

  fetchVehicles() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/vehicles/my-vehicles`).subscribe({
      next: (response) => {
        this.vehicles = response.data.vehicles;
        this.parkingAllocation = response.data.parkingAllocation;
        this.activeVehicleCount = response.data.activeVehicleCount;
        this.canAddMore = response.data.canAddMore;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching vehicles:', error);
        this.loading = false;
      },
    });
  }

  // Manual slot fetching removed

  fetchParkingRequests() {
    this.loadingRequests = true;
    this.http.get<any>(`${this.apiUrl}/parking/my-requests`).subscribe({
      next: (response) => {
        this.parkingRequests = response.data.requests;
        this.hasPendingRequest = this.parkingRequests.some(
          (r: any) => r.status === 'pending',
        );
        this.loadingRequests = false;
      },
      error: (error) => {
        console.error('Error fetching parking requests:', error);
        this.loadingRequests = false;
      },
    });
  }

  openCreateModal() {
    this.modalMode = 'create';

    // Auto-allocate parking slot
    const user = this.authService.currentState.user;
    let nextSlot = '';
    if (user && user.wing && user.flatNumber) {
      const prefix = `${user.wing}-${user.flatNumber}-P`;
      const prefixUpper = prefix.toUpperCase();

      const usedNumbers = this.vehicles
        .map(v => v.parkingSlot)
        .filter(slot => slot && slot.toUpperCase().startsWith(prefixUpper))
        .map(slot => parseInt(slot.toUpperCase().replace(prefixUpper, ''), 10))
        .filter(n => !isNaN(n));

      let nextIndex = 1;
      while (usedNumbers.includes(nextIndex)) {
        nextIndex++;
      }
      nextSlot = `${user.wing}-${user.flatNumber}-P${nextIndex}`;
    }

    this.formData = {
      vehicleType: '',
      vehicleName: '',
      vehicleModel: '',
      vehicleColor: '',
      vehicleNumber: '',
      parkingSlot: nextSlot,
    };
    this.errors = {};
    this.isModalOpen = true;
  }

  openEditModal(vehicle: any) {
    this.modalMode = 'edit';
    this.selectedVehicle = vehicle;
    this.formData = {
      vehicleType: vehicle.vehicleType || '',
      vehicleName: vehicle.vehicleName || '',
      vehicleModel: vehicle.vehicleModel || '',
      vehicleColor: vehicle.vehicleColor || '',
      vehicleNumber: vehicle.vehicleNumber || '',
      parkingSlot: vehicle.parkingSlot || '',
    };
    this.errors = {};
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedVehicle = null;
  }

  openDeleteDialog(vehicle: any) {
    this.selectedVehicle = vehicle;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog() {
    this.isDeleteDialogOpen = false;
    this.selectedVehicle = null;
  }

  openRequestModal() {
    this.requestFormData = { requestedSlots: 1, reason: '' };
    this.isRequestModalOpen = true;
  }

  closeRequestModal() {
    this.isRequestModalOpen = false;
  }

  openRequestHistory() {
    this.isRequestHistoryOpen = true;
  }

  closeRequestHistory() {
    this.isRequestHistoryOpen = false;
  }

  validateForm() {
    this.errors = {};
    if (!this.formData.vehicleType) this.errors.vehicleType = 'Vehicle type is required';
    if (!this.formData.vehicleName) this.errors.vehicleName = 'Vehicle make / name is required';
    if (!this.formData.vehicleModel) this.errors.vehicleModel = 'Model is required';
    if (!this.formData.vehicleColor) this.errors.vehicleColor = 'Color is required';
    if (!this.formData.parkingSlot) this.errors.parkingSlot = 'Parking slot is required';

    // Normalize and validate registration number against backend format
    if (!this.formData.vehicleNumber) {
      this.errors.vehicleNumber = 'Registration number is required';
    } else {
      const raw = this.formData.vehicleNumber.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const pattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/; // e.g. MH04AB1234
      if (!pattern.test(raw)) {
        this.errors.vehicleNumber =
          'Use format like MH04AB1234 (state code, 2 digits, 1–2 letters, 4 digits)';
      } else {
        this.formData.vehicleNumber = raw;
      }
    }
    return Object.keys(this.errors).length === 0;
  }

  handleSubmit() {
    if (!this.validateForm()) return;

    this.submitting = true;
    if (this.modalMode === 'create') {
      console.log('=== FRONTEND VEHICLE SUBMIT ===');
      console.log('Payload:', JSON.stringify(this.formData, null, 2));
      this.http.post(`${this.apiUrl}/vehicles`, this.formData).subscribe({
        next: () => {
          this.toastService.success('Vehicle Added', 'Your vehicle has been registered successfully.');
          this.closeModal();
          this.fetchVehicles();
          this.submitting = false;
        },
        error: (err) => {
          console.error(
            'Full error response:',
            JSON.stringify(err.error, null, 2),
          );
          console.error('HTTP status:', err.status);
          this.toastService.error('Error', err.error?.message || 'Failed to save vehicle');
          this.submitting = false;
        },
      });
    } else {
      this.http
        .put(
          `${this.apiUrl}/vehicles/${this.selectedVehicle._id}`,
          this.formData,
        )
        .subscribe({
          next: () => {
            this.toastService.success('Vehicle Updated', 'Your vehicle has been updated successfully.');
            this.closeModal();
            this.fetchVehicles();
            this.submitting = false;
          },
          error: (err) => {
            console.error(err);
            this.toastService.error('Error', err.error?.message || 'Failed to update vehicle');
            this.submitting = false;
          },
        });
    }
  }

  async handleDelete() {
    const confirmed = await this.confirmDialogService.confirmDelete('this vehicle');
    if (!confirmed) return;

    this.http
      .delete(`${this.apiUrl}/vehicles/${this.selectedVehicle._id}`)
      .subscribe({
        next: () => {
          this.toastService.success('Vehicle Deleted', 'Your vehicle has been removed successfully.');
          this.closeDeleteDialog();
          this.fetchVehicles();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', err.error?.message || 'Failed to delete vehicle');
        },
      });
  }

  submitParkingRequest() {
    if (!this.requestFormData.reason.trim()) {
      this.toastService.warning('Validation Error', 'Please provide a reason for your request.');
      return;
    }
    this.submitting = true;
    this.http
      .post(`${this.apiUrl}/parking/request`, this.requestFormData)
      .subscribe({
        next: () => {
          this.toastService.success('Request Submitted', 'Your parking slot request has been submitted successfully.');
          this.closeRequestModal();
          this.fetchParkingRequests();
          this.submitting = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', err.error?.message || 'Failed to submit request');
          this.submitting = false;
        },
      });
  }

  getVehicleTypeColor(type: string) {
    switch (type?.toLowerCase()) {
      case 'car':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'bike':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'scooter':
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400';
      case 'truck':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400';
    }
  }

  getRequestStatusColor(status: string) {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'pending':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400';
    }
  }

  wings = ['A', 'B', 'C', 'D', 'E', 'F'];
  floors = Array.from({ length: 14 }, (_, i) => i + 1);
}
