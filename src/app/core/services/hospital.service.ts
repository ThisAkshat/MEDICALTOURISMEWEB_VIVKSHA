import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface HospitalImage {
  id: number;
  owner_type: string | null;
  owner_id: number | null;
  url: string;
  is_primary: boolean;
  position: number;
  uploaded_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  description: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  established_year: number | null;
  bed_count: number | null;
  specializations: string;
  rating: number;
  features: string;
  facilities: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  images: HospitalImage[];
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
export class HospitalService {
  constructor(private apiService: ApiService) {}

  getHospitals(skip = 0, limit = 100): Observable<Hospital[]> {
    return this.apiService.get<Hospital[]>(
      `/api/v1/hospitals?skip=${skip}&limit=${limit}`
    );
  }

  getHospitalById(id: number): Observable<Hospital> {
    return this.apiService.get<Hospital>(`/api/v1/hospitals/${id}`);
  }
}