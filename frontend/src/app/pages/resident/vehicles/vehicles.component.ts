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

  isModalOpen = false;
  isDeleteDialogOpen = false;
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
  errors: any = {};

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchVehicles();
  }

  fetchVehicles() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/vehicles/my-vehicles`).subscribe({
      next: (response) => {
        this.vehicles = response.data.vehicles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching vehicles:', error);
        this.loading = false;
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

  validateForm() {
    this.errors = {};
    if (!this.formData.vehicleType) this.errors.vehicleType = 'Required';
    if (!this.formData.vehicleName) this.errors.vehicleName = 'Required';
    if (!this.formData.vehicleModel) this.errors.vehicleModel = 'Required';
    if (!this.formData.vehicleNumber) this.errors.vehicleNumber = 'Required';
    return Object.keys(this.errors).length === 0;
  }

  handleSubmit() {
    if (!this.validateForm()) return;

    this.submitting = true;
    if (this.modalMode === 'create') {
      this.http.post(`${this.apiUrl}/vehicles`, this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.fetchVehicles();
          this.submitting = false;
        },
        error: (err) => {
          console.error(err);
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
}
