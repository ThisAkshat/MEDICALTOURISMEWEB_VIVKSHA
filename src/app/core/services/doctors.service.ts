// src/app/core/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DoctorImage {
  id: number;
  url: string;
  is_primary: boolean;
  position: number;
  uploaded_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  profile_photo: string;
  short_description: string;
  long_description: string;
  designation: string;
  specialization: string;
  qualification: string;     // ✅ single qualification string from API
  qualifications: string;    // ✅ full qualifications block (multi-line)
  experience_years: number | null;
  rating: number | null;
  consultancy_fee: number;
  hospital_id: number;
  location: string | null;
  gender: string;
  skills: string;
  highlights: string;
  awards: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  images: DoctorImage[];
  faqs: any[]; // can define proper type later if API stabilizes
  // Individual FAQ fields
  faq1_question?: string;
  faq1_answer?: string;
  faq2_question?: string;
  faq2_answer?: string;
  faq3_question?: string;
  faq3_answer?: string;
  faq4_question?: string;
  faq4_answer?: string;
  faq5_question?: string;
  faq5_answer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  constructor(private apiService: ApiService) {}

  getDoctors(skip = 0, limit = 100, location?: string): Observable<Doctor[]> {
    let url = `/api/v1/doctors?skip=${skip}&limit=${limit}`;
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    return this.apiService.get<Doctor[]>(url);
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.apiService.get<Doctor>(`/api/v1/doctors/${id}`);
  }

  getLocations(): Observable<string[]> {
    return this.apiService.get<string[]>(`/api/v1/doctor-filters/locations`);
  }

  getSpecializations(): Observable<string[]> {
    return this.apiService.get<string[]>(`/api/v1/filters/specializations`);
  }

  searchDoctors(skip = 0, limit = 100, searchTerm?: string, location?: string): Observable<Doctor[]> {
    let url = `/api/v1/doctors?skip=${skip}&limit=${limit}`;
    
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    
    return this.apiService.get<Doctor[]>(url);
  }

  getDoctorsByHospital(hospitalId: number, skip = 0, limit = 100): Observable<Doctor[]> {
    let url = `/api/v1/doctors?skip=${skip}&limit=${limit}&hospital_id=${hospitalId}`;
    return this.apiService.get<Doctor[]>(url);
  }
}
