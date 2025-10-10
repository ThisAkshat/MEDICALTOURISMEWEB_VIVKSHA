import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { ModalComponent } from '@core/modal/modal.component';

interface BookingRequest {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  treatment_id: number | null;
  budget: string;
  medical_history_file: string;
  doctor_preference: string;
  hospital_preference: string;
  consultation_fee: string; // ✅ added
  user_query: string;
  travel_assistant: boolean;
  stay_assistant: boolean;
}

interface BookingResponse extends BookingRequest {
  id: number;
  created_at: string;
}

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    HttpClientModule,
    ModalComponent
  ],
  templateUrl: './doctor-details.html',
  styleUrls: ['./doctor-details.css']
})
export class DoctorDetails implements OnInit {
  doctor: Doctor | null = null;
  hospitalName = '';
  relatedDoctors: Doctor[] = [];
  loadingRelatedDoctors = false;
  showModal = false;
  baseUrl = 'http://165.22.223.163:8000';
  consultationForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  expandedFaqIndex: number | null = null;
  selectedFile: File | null = null;

  // Dropdown options
  budgetOptions = [
    { value: '10000 - 50000', label: '₹10,000 - ₹50,000' },
    { value: '50000 - 100000', label: '₹50,000 - ₹1,00,000' },
    { value: '100000 - 300000', label: '₹1,00,000 - ₹3,00,000' },
    { value: '300000 - 500000', label: '₹3,00,000 - ₹5,00,000' },
    { value: '500000 - 800000', label: '₹5,00,000 - ₹8,00,000' },
    { value: '800000+', label: '₹8,00,000+' }
  ];

  serviceOptions = [
    { value: 1, label: 'General Consultation' },
    { value: 2, label: 'Follow-up Consultation' },
    { value: 3, label: 'Specialist Consultation' },
    { value: 4, label: 'Second Opinion' },
    { value: 5, label: 'Emergency Consultation' }
  ];

  isTreatmentDropdownOpen = false;
  isBudgetDropdownOpen = false;
  selectedTreatmentLabel: string = '';
  selectedBudgetLabel: string = '';

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.consultationForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile_no: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      treatment_id: [null], // Hardcoded to null
      budget: [''],
      doctor_preference: [''],
      hospital_preference: [''],
      consultation_fee: [''], // ✅ added
      medical_history_file: [''],
      user_query: [''],
      travel_assistant: [false], // Hardcoded to false
      stay_assistant: [false] // Hardcoded to false
    });
  }

  // Dropdown logic
  toggleTreatmentDropdown(): void {
    this.isTreatmentDropdownOpen = !this.isTreatmentDropdownOpen;
    this.isBudgetDropdownOpen = false;
  }

  toggleBudgetDropdown(): void {
    this.isBudgetDropdownOpen = !this.isBudgetDropdownOpen;
    this.isTreatmentDropdownOpen = false;
  }

  selectTreatment(service: { value: number; label: string }): void {
    this.consultationForm.patchValue({ treatment_id: service.value });
    this.selectedTreatmentLabel = service.label;
    this.isTreatmentDropdownOpen = false;
  }

  selectBudget(budget: { value: string; label: string }): void {
    this.consultationForm.patchValue({ budget: budget.value });
    this.selectedBudgetLabel = budget.label;
    this.isBudgetDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.custom-select-wrapper')) {
      this.isTreatmentDropdownOpen = false;
      this.isBudgetDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    const doctorId = Number(this.route.snapshot.paramMap.get('id'));
    if (doctorId) {
      this.fetchDoctor(doctorId);
    }
  }

  fetchDoctor(id: number) {
    this.doctorService.getDoctorById(id).subscribe({
      next: (data) => {
        this.doctor = data;
        if (data.hospital_id) {
          this.fetchHospitalName(data.hospital_id);
          this.fetchRelatedDoctors(data.hospital_id, id);
        }
      },
      error: (err) => console.error(err)
    });
  }

  fetchHospitalName(hospitalId: number) {
    this.hospitalService.getHospitalById(hospitalId).subscribe({
      next: (hospital: Hospital) => {
        this.hospitalName = hospital.name;
      },
      error: (err) => console.error('Error fetching hospital', err)
    });
  }

  fetchRelatedDoctors(hospitalId: number, currentDoctorId: number) {
    this.loadingRelatedDoctors = true;
    this.doctorService.getDoctorsByHospital(hospitalId, 0, 10).subscribe({
      next: (doctors) => {
        this.relatedDoctors = doctors
          .filter(doctor => doctor.id !== currentDoctorId)
          .slice(0, 3);
        this.loadingRelatedDoctors = false;
      },
      error: (err) => {
        console.error('Error fetching related doctors', err);
        this.loadingRelatedDoctors = false;
      }
    });
  }

  getDynamicFaqs(): { question: string; answer: string }[] {
    if (!this.doctor) return [];
    const faqs: { question: string; answer: string }[] = [];
    for (let i = 1; i <= 5; i++) {
      const q = (this.doctor as any)[`faq${i}_question`];
      const a = (this.doctor as any)[`faq${i}_answer`];
      if (q && a) faqs.push({ question: q, answer: a });
    }
    if (Array.isArray(this.doctor.faqs)) {
      this.doctor.faqs.forEach((faq: any) => {
        if (faq.question && faq.answer) {
          faqs.push({ question: faq.question, answer: faq.answer });
        }
      });
    }
    return faqs;
  }

  toggleFaq(index: number): void {
    this.expandedFaqIndex = this.expandedFaqIndex === index ? null : index;
  }

  isFaqExpanded(index: number): boolean {
    return this.expandedFaqIndex === index;
  }

  openModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  // ✅ UPDATED: Reset form (now includes consultation_fee)
  resetForm() {
    this.consultationForm.reset();
    this.isSubmitting = false;
    this.submitSuccess = false;
    this.submitError = '';

    this.selectedTreatmentLabel = '';
    this.selectedBudgetLabel = '';
    this.selectedFile = null; // Clear selected file

    this.consultationForm.patchValue({
      travel_assistant: false, // Hardcoded to false
      stay_assistant: false, // Hardcoded to false
      treatment_id: null, // Hardcoded to null
      budget: '',
      doctor_preference: this.doctor?.name || '',
      hospital_preference: this.hospitalName || '',
      consultation_fee: this.doctor?.consultancy_fee ? `₹${this.doctor.consultancy_fee}` : '' // ✅ default fee
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('File selected:', file.name, file.size, file.type);
    }
  }

  async onSubmit() {
    this.markFormGroupTouched();

    if (this.consultationForm.invalid) {
      this.submitError = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      const formData = this.consultationForm.value;

      // Create FormData for multipart/form-data
      const multipartFormData = new FormData();
      
      // Append all the form fields
      multipartFormData.append('first_name', formData.first_name);
      multipartFormData.append('last_name', formData.last_name);
      multipartFormData.append('email', formData.email);
      multipartFormData.append('mobile_no', formData.mobile_no);
      multipartFormData.append('treatment_id', ''); // Hardcoded to null/empty
      multipartFormData.append('budget', formData.budget || `₹${this.doctor?.consultancy_fee || ''}`);
      multipartFormData.append('doctor_preference', formData.doctor_preference || (this.doctor?.name || ''));
      multipartFormData.append('hospital_preference', formData.hospital_preference || (this.hospitalName || ''));
      multipartFormData.append('user_query', formData.user_query || 'Consultation booking request');
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
        {
          headers: {
            'accept': 'application/json'
            // Don't set Content-Type for FormData - browser will set it automatically with boundary
          }
        }
      ).toPromise();

      console.log('Consultation booked successfully:', response);
      this.submitSuccess = true;

      setTimeout(() => {
        this.closeModal();
      }, 2000);

    } catch (error: any) {
      console.error('Error booking consultation:', error);
      this.submitError = error.error?.message || 'Failed to book consultation. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.consultationForm.controls).forEach(key => {
      const control = this.consultationForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.consultationForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.consultationForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'first_name': return 'First name is required';
          case 'last_name': return 'Last name is required';
          case 'email': return 'Email is required';
          case 'mobile_no': return 'Mobile number is required';
          case 'treatment_id': return 'Please select a service';
          case 'budget': return 'Please select a budget preference';
          default: return `${fieldName.replace('_', ' ')} is required`;
        }
      }
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return 'Please enter a valid 10-digit mobile number';
      if (field.errors['minlength']) return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}
