import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import banner service
import { ModalComponent } from '@core/modal/modal.component';

interface BookingRequest {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  treatment_id: number;
  budget: string;
  medical_history_file: string;
  doctor_preference: string;
  hospital_preference: string;
  user_query: string;
  travel_assistant: boolean;
  stay_assistant: boolean;
}

interface BookingResponse extends BookingRequest {
  id: number;
  created_at: string;
}

@Component({
  selector: 'app-online-consultation',
  imports: [CommonModule, ModalComponent, ReactiveFormsModule, HttpClientModule],
  templateUrl: './online-consultation.html',
  styleUrl: './online-consultation.css'
})
export class OnlineConsultation implements OnInit {
  doctors: (Doctor & { hospitalName?: string })[] = [];
  hospitalCache: { [id: number]: string } = {};
  loading = true;
  showModal = false;
  selectedDoctor: Doctor | null = null;
  baseUrl = 'http://165.22.223.163:8000';
  selectedFile: File | null = null;

  // ✅ Banner
  banner: Banner | null = null;

  // Filter properties
  locations: string[] = [];
  specializations: string[] = [];
  selectedLocation = '';
  selectedSpecialization = '';
  isLocationOpen = false;
  isSpecializationOpen = false;

  // Form
  bookingForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  // Budget options
  budgetOptions = [
    { value: '1000 - 5000', label: '₹1,000 - ₹5,000' },
    { value: '5000 - 10000', label: '₹5,000 - ₹10,000' },
    { value: '10000 - 25000', label: '₹10,000 - ₹25,000' },
    { value: '25000 - 50000', label: '₹25,000 - ₹50,000' },
    { value: '50000+', label: '₹50,000+' }
  ];

  // Service options
  serviceOptions = [
    { value: 1, label: 'General Consultation' },
    { value: 2, label: 'Specialist Consultation' },
    { value: 3, label: 'Second Opinion' },
    { value: 4, label: 'Follow-up Consultation' },
    { value: 5, label: 'Emergency Consultation' }
  ];

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private bannerService: BannerService, // ✅ banner service
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.bookingForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile_no: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      treatment_id: [null], // Hardcoded to null
      budget: [''],
      doctor_preference: [''],
      hospital_preference: [''],
      medical_history_file: [''],
      user_query: [''],
      travel_assistant: [false], // Hardcoded to false
      stay_assistant: [false] // Hardcoded to false
    });
  }

  ngOnInit(): void {
    console.log('✅ Online Consultation component initialized');

    // 🔹 Load Online Consultation Banner
    this.bannerService.getBannerByTitle('Online Consultation').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Banner loaded:', this.banner);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('❌ Error loading banner:', err);
      }
    });

    // 🔹 Load filter data
    this.loadFilterData();

    // 🔹 Load doctors
    this.loadDoctors();
  }

  // -------------------
  // Doctor Load Logic
  // -------------------
  private loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (data: Doctor[]) => {
        if (!data || data.length === 0) {
          this.doctors = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        // sort doctors by rating
        this.doctors = data.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

        const uniqueHospitalIds = [...new Set(this.doctors.map(doc => doc.hospital_id))];
        let hospitalRequestsCompleted = 0;

        const checkAllHospitalsLoaded = () => {
          hospitalRequestsCompleted++;
          if (hospitalRequestsCompleted >= uniqueHospitalIds.length) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        };

        uniqueHospitalIds.forEach((hospitalId) => {
          if (this.hospitalCache[hospitalId]) {
            this.doctors.forEach((doc, i) => {
              if (doc.hospital_id === hospitalId) {
                this.doctors[i].hospitalName = this.hospitalCache[hospitalId];
              }
            });
            checkAllHospitalsLoaded();
          } else {
            this.hospitalService.getHospitalById(hospitalId).subscribe({
              next: (hospital: Hospital) => {
                this.hospitalCache[hospitalId] = hospital.name;
                this.doctors.forEach((doc, i) => {
                  if (doc.hospital_id === hospitalId) {
                    this.doctors[i].hospitalName = hospital.name;
                  }
                });
                checkAllHospitalsLoaded();
              },
              error: () => {
                this.hospitalCache[hospitalId] = 'Hospital not available';
                this.doctors.forEach((doc, i) => {
                  if (doc.hospital_id === hospitalId) {
                    this.doctors[i].hospitalName = 'Hospital not available';
                  }
                });
                checkAllHospitalsLoaded();
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('❌ Error loading doctors:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // -------------------
  // Banner / Booking Form Helpers
  // -------------------
  getStars(rating: number | null): ('full' | 'half' | 'empty')[] {
    if (rating === null) return Array(5).fill('empty');
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return [
      ...Array(fullStars).fill('full'),
      ...Array(halfStar).fill('half'),
      ...Array(emptyStars).fill('empty')
    ];
  }

  // openModal(doctor: Doctor) {
  //   this.selectedDoctor = doctor;
  //   this.showModal = true;
  //   this.resetForm();
  //   this.bookingForm.patchValue({
  //     doctor_preference: doctor.name,
  //     hospital_preference: (doctor as any).hospitalName || ''
  //   });
  //   this.cdr.detectChanges();
  // }

  openModal(doctor: Doctor) {
  this.selectedDoctor = doctor;
  this.showModal = true;
  this.resetForm();

  // ✅ Auto-fill Doctor, Hospital, and Consultation Fees
  this.bookingForm.patchValue({
    doctor_preference: doctor.name,
    hospital_preference: (doctor as any).hospitalName || '',
    budget: doctor.consultancy_fee ? `₹${doctor.consultancy_fee}` : ''
  });

  this.cdr.detectChanges();
}


  closeModal() {
    this.showModal = false;
    this.selectedDoctor = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  resetForm() {
    this.bookingForm.reset();
    this.bookingForm.patchValue({
      travel_assistant: false, // Hardcoded to false
      stay_assistant: false, // Hardcoded to false
      treatment_id: null, // Hardcoded to null
      budget: ''
    });
    this.selectedFile = null; // Clear selected file
    this.isSubmitting = false;
    this.submitSuccess = false;
    this.submitError = '';
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('File selected:', file.name, file.size, file.type);
    }
  }

  async onSubmit() {
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      const formData = this.bookingForm.value;
      
      // Create FormData for multipart/form-data
      const multipartFormData = new FormData();
      
      // Append all the form fields
      multipartFormData.append('first_name', formData.first_name);
      multipartFormData.append('last_name', formData.last_name);
      multipartFormData.append('email', formData.email);
      multipartFormData.append('mobile_no', formData.mobile_no);
      multipartFormData.append('treatment_id', ''); // Hardcoded to null/empty
      multipartFormData.append('budget', formData.budget || '');
      multipartFormData.append('doctor_preference', formData.doctor_preference || (this.selectedDoctor?.name || ''));
      multipartFormData.append('hospital_preference', formData.hospital_preference || ((this.selectedDoctor as any)?.hospitalName || ''));
      multipartFormData.append('user_query', formData.user_query || 'Online consultation booking');
      multipartFormData.append('travel_assistant', 'false'); // Hardcoded to false
      multipartFormData.append('stay_assistant', 'false'); // Hardcoded to false
      multipartFormData.append('personal_assistant', 'false'); // Add missing field
      
      // Append file if selected, otherwise append empty string
      if (this.selectedFile) {
        multipartFormData.append('medical_history_file', this.selectedFile);
      } else {
        multipartFormData.append('medical_history_file', '');
      }

      const response = await this.http.post<BookingResponse>(
        `${this.baseUrl}/api/v1/bookings`,
        multipartFormData,
        { headers: { 'accept': 'application/json' } }
      ).toPromise();

      console.log('✅ Booking created:', response);
      this.submitSuccess = true;
      setTimeout(() => this.closeModal(), 2000);
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      this.submitError = error.error?.message || 'Failed to create booking. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName.replace('_', ' ')} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return 'Please enter a valid mobile number';
      if (field.errors['minlength']) return `${fieldName.replace('_', ' ')} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  // Filter Methods
  private loadFilterData(): void {
    // Load locations
    this.doctorService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (err) => console.error('Error loading locations:', err)
    });

    // Load specializations
    this.doctorService.getSpecializations().subscribe({
      next: (specializations) => {
        this.specializations = specializations;
      },
      error: (err) => console.error('Error loading specializations:', err)
    });
  }

  // Location dropdown methods
  toggleLocationDropdown(): void {
    this.isLocationOpen = !this.isLocationOpen;
    if (this.isLocationOpen) {
      this.isSpecializationOpen = false;
    }
  }

  selectLocation(location: string): void {
    this.selectedLocation = location;
    this.isLocationOpen = false;
    this.filterDoctors();
  }

  // Specialization dropdown methods
  toggleSpecializationDropdown(): void {
    this.isSpecializationOpen = !this.isSpecializationOpen;
    if (this.isSpecializationOpen) {
      this.isLocationOpen = false;
    }
  }

  selectSpecialization(specialization: string): void {
    this.selectedSpecialization = specialization;
    this.isSpecializationOpen = false;
    this.filterDoctors();
  }

  // Filter doctors based on selected criteria
  private filterDoctors(): void {
    this.loading = true;
    this.doctorService.searchDoctors(0, 100, '', this.selectedLocation).subscribe({
      next: (data: Doctor[]) => {
        let filteredDoctors = data;

        // Filter by specialization if selected
        if (this.selectedSpecialization) {
          filteredDoctors = data.filter(doctor => 
            doctor.specialization?.toLowerCase().includes(this.selectedSpecialization.toLowerCase())
          );
        }

        // Sort and process doctors
        this.doctors = filteredDoctors.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        this.loadHospitalNamesForDoctors();
      },
      error: (err) => {
        console.error('Error filtering doctors:', err);
        this.loading = false;
      }
    });
  }

  // Load hospital names for doctors
  private loadHospitalNamesForDoctors(): void {
    const uniqueHospitalIds = [...new Set(this.doctors.map(doc => doc.hospital_id))];
    let hospitalRequestsCompleted = 0;

    const checkAllHospitalsLoaded = () => {
      hospitalRequestsCompleted++;
      if (hospitalRequestsCompleted >= uniqueHospitalIds.length) {
        this.loading = false;
        this.cdr.detectChanges();
      }
    };

    uniqueHospitalIds.forEach((hospitalId) => {
      if (this.hospitalCache[hospitalId]) {
        this.doctors.forEach((doc, i) => {
          if (doc.hospital_id === hospitalId) {
            this.doctors[i].hospitalName = this.hospitalCache[hospitalId];
          }
        });
        checkAllHospitalsLoaded();
      } else {
        this.hospitalService.getHospitalById(hospitalId).subscribe({
          next: (hospital: Hospital) => {
            this.hospitalCache[hospitalId] = hospital.name;
            this.doctors.forEach((doc, i) => {
              if (doc.hospital_id === hospitalId) {
                this.doctors[i].hospitalName = hospital.name;
              }
            });
            checkAllHospitalsLoaded();
          },
          error: () => {
            this.hospitalCache[hospitalId] = 'Hospital not available';
            this.doctors.forEach((doc, i) => {
              if (doc.hospital_id === hospitalId) {
                this.doctors[i].hospitalName = 'Hospital not available';
              }
            });
            checkAllHospitalsLoaded();
          }
        });
      }
    });
  }
}
