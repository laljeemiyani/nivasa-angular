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
    BadgeComponent,
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

  // Available slots
  availableSlots: any[] = [];
  filteredSlots: any[] = [];
  slotSearch = '';
  filterWing = '';
  filterFloor = '';
  loadingSlots = false;

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

  constructor(private http: HttpClient) {}

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

  fetchAvailableSlots() {
    this.loadingSlots = true;
    const params: any = {};
    if (this.filterWing) params.wing = this.filterWing;
    if (this.filterFloor) params.floor = this.filterFloor;

    this.http
      .get<any>(`${this.apiUrl}/vehicles/available-slots`, { params })
      .subscribe({
        next: (response) => {
          this.availableSlots = response.data.slots;
          this.applySlotSearch();
          this.loadingSlots = false;
        },
        error: (error) => {
          console.error('Error fetching available slots:', error);
          this.loadingSlots = false;
        },
      });
  }

  applySlotSearch() {
    if (!this.slotSearch) {
      this.filteredSlots = this.availableSlots;
    } else {
      const search = this.slotSearch.toUpperCase();
      this.filteredSlots = this.availableSlots.filter((slot: any) =>
        slot.slotNumber.includes(search),
      );
    }
  }

  onSlotFilterChange() {
    this.fetchAvailableSlots();
  }

  onSlotSearchChange() {
    this.applySlotSearch();
  }

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
    this.formData = {
      vehicleType: '',
      vehicleName: '',
      vehicleModel: '',
      vehicleColor: '',
      vehicleNumber: '',
      parkingSlot: '',
    };
    this.errors = {};
    this.slotSearch = '';
    this.filterWing = '';
    this.filterFloor = '';
    this.isModalOpen = true;
    this.fetchAvailableSlots();
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
    this.slotSearch = '';
    this.filterWing = '';
    this.filterFloor = '';
    this.isModalOpen = true;
    this.fetchAvailableSlots();
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
    if (!this.formData.vehicleType) this.errors.vehicleType = 'Required';
    if (!this.formData.vehicleName) this.errors.vehicleName = 'Required';
    if (!this.formData.vehicleModel) this.errors.vehicleModel = 'Required';
    if (!this.formData.vehicleNumber) this.errors.vehicleNumber = 'Required';
    if (!this.formData.vehicleColor) this.errors.vehicleColor = 'Required';
    if (!this.formData.parkingSlot) this.errors.parkingSlot = 'Required';
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
          alert(err.error?.message || 'Failed to save vehicle');
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
            this.closeModal();
            this.fetchVehicles();
            this.submitting = false;
          },
          error: (err) => {
            console.error(err);
            alert(err.error?.message || 'Failed to update vehicle');
            this.submitting = false;
          },
        });
    }
  }

  handleDelete() {
    this.http
      .delete(`${this.apiUrl}/vehicles/${this.selectedVehicle._id}`)
      .subscribe({
        next: () => {
          this.closeDeleteDialog();
          this.fetchVehicles();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Failed to delete vehicle');
        },
      });
  }

  submitParkingRequest() {
    if (!this.requestFormData.reason.trim()) {
      alert('Please provide a reason for your request.');
      return;
    }
    this.submitting = true;
    this.http
      .post(`${this.apiUrl}/parking/request`, this.requestFormData)
      .subscribe({
        next: () => {
          this.closeRequestModal();
          this.fetchParkingRequests();
          this.submitting = false;
          alert('Parking slot request submitted successfully!');
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Failed to submit request');
          this.submitting = false;
        },
      });
  }

  getVehicleTypeColor(type: string) {
    switch (type?.toLowerCase()) {
      case 'car':
        return 'info';
      case 'bike':
        return 'success';
      case 'scooter':
        return 'secondary';
      case 'truck':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getRequestStatusColor(status: string) {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  wings = ['A', 'B', 'C', 'D', 'E', 'F'];
  floors = Array.from({ length: 14 }, (_, i) => i + 1);
}
