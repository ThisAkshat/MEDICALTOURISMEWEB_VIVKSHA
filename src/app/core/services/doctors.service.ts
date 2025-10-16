// src/app/core/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DoctorImage {
  id: number;
  owner_type: string | null;
  owner_id: number | null;
  url: string;
  is_primary: boolean;
  position: number;
  uploaded_at: string;
}

export interface AssociatedHospital {
  id: number;
  name: string;
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
  time_slots: string | Record<string, string>;  // ✅ JSON string or object for weekly schedule
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  images: DoctorImage[];
  faqs: any[];               // ✅ array of FAQ objects
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
  associated_hospitals: AssociatedHospital[];  // ✅ array of associated hospitals
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

  // Helper method to parse time slots JSON string
  parseTimeSlots(timeSlotsJson: string): Record<string, string> {
    try {
      return JSON.parse(timeSlotsJson);
    } catch (error) {
      console.error('Error parsing time slots:', error);
      return {};
    }
  }

  // Helper method to get primary image from doctor images
  getPrimaryImage(doctor: Doctor): DoctorImage | null {
    return doctor.images?.find(img => img.is_primary) || doctor.images?.[0] || null;
  }

  // Helper method to get all FAQ questions and answers as array
  getAllFAQs(doctor: Doctor): Array<{question: string, answer: string}> {
    const faqs: Array<{question: string, answer: string}> = [];
    
    // Add individual FAQ fields if they exist
    if (doctor.faq1_question && doctor.faq1_answer) {
      faqs.push({ question: doctor.faq1_question, answer: doctor.faq1_answer });
    }
    if (doctor.faq2_question && doctor.faq2_answer) {
      faqs.push({ question: doctor.faq2_question, answer: doctor.faq2_answer });
    }
    if (doctor.faq3_question && doctor.faq3_answer) {
      faqs.push({ question: doctor.faq3_question, answer: doctor.faq3_answer });
    }
    if (doctor.faq4_question && doctor.faq4_answer) {
      faqs.push({ question: doctor.faq4_question, answer: doctor.faq4_answer });
    }
    if (doctor.faq5_question && doctor.faq5_answer) {
      faqs.push({ question: doctor.faq5_question, answer: doctor.faq5_answer });
    }
    
    // Add any FAQs from the faqs array if they exist
    if (doctor.faqs && Array.isArray(doctor.faqs)) {
      faqs.push(...doctor.faqs);
    }
    
    return faqs;
  }

  // Helper method to get skills as array
  getSkillsArray(doctor: Doctor): string[] {
    if (!doctor.skills) return [];
    return doctor.skills.split(/[\r\n]+/).map(skill => skill.trim()).filter(skill => skill.length > 0);
  }
}
