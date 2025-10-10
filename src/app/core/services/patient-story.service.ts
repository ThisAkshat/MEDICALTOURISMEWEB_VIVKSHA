import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientStory {
  id: number;
  patient_name: string;
  description: string;
  rating: number;
  profile_photo: string;
  treatment_type: string;
  hospital_name: string;
  location: string;
  position: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientStoryService {
  private apiUrl = 'http://165.22.223.163:8000/api/v1/stories?active_only=true&featured_only=false&limit=10';

  constructor(private http: HttpClient) {}

  getStories(): Observable<PatientStory[]> {
    return this.http.get<PatientStory[]>(this.apiUrl);
  }
}
