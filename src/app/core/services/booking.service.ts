import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingRequest {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  treatment_id: number | null;
  budget: string;
  medical_history_file: string;
  doctor_preference: string;
  hospital_preference: string;
  preferred_time_slot: string;  // ✅ Added time slot field
  user_query: string;
  travel_assistant: boolean;
  stay_assistant: boolean;
  personal_assistant: boolean;
}

export interface BookingResponse extends BookingRequest {
  id: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://165.22.223.163:8000';
  private apiUrl = `${this.baseUrl}/api/v1/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(data: BookingRequest, file?: File): Observable<BookingResponse> {
    const formData = new FormData();
    
    // Append all the form fields
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('mobile_no', data.mobile_no);
    formData.append('treatment_id', data.treatment_id ? data.treatment_id.toString() : '');
    formData.append('budget', data.budget || '');
    formData.append('doctor_preference', data.doctor_preference || '');
    formData.append('hospital_preference', data.hospital_preference || '');
    formData.append('preferred_time_slot', data.preferred_time_slot || '');  // ✅ Added time slot
    formData.append('user_query', data.user_query || '');
    formData.append('travel_assistant', data.travel_assistant.toString());
    formData.append('stay_assistant', data.stay_assistant.toString());
    formData.append('personal_assistant', data.personal_assistant.toString());
    
    // Append file if provided, otherwise append empty string
    if (file) {
      formData.append('medical_history_file', file);
    } else {
      formData.append('medical_history_file', '');
    }

    const headers = new HttpHeaders({
      'accept': 'application/json'
      // Don't set Content-Type for FormData - browser will set it automatically with boundary
    });

    return this.http.post<BookingResponse>(this.apiUrl, formData, { headers });
  }

  // File upload method - you can implement this when you have the endpoint
  uploadFile(file: File): Observable<{file_url: string}> {
    const formData = new FormData();
    formData.append('file', file);

    // This endpoint needs to be implemented on your backend
    return this.http.post<{file_url: string}>(`${this.baseUrl}/api/v1/upload`, formData);
  }

  // Validate file before upload
  validateFile(file: File): {valid: boolean, error?: string} {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid file (PDF, DOC, DOCX, JPG, PNG)' };
    }

    return { valid: true };
  }
}
