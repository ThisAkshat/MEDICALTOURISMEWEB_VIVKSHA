import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Treatment, TreatmentSearchParams } from '../../shared/interfaces/treatment.interface';

@Injectable({
  providedIn: 'root'
})
export class TreatmentService {
  constructor(private apiService: ApiService) {}

  searchTreatments(params: TreatmentSearchParams = {}): Observable<Treatment[]> {
    let httpParams = new HttpParams()
      .set('skip', params.skip?.toString() || '0')
      .set('limit', params.limit?.toString() || '100');

    if (params.location) {
      httpParams = httpParams.set('location', params.location.trim());
    }

    if (params.treatment_type) {
      httpParams = httpParams.set('treatment_type', params.treatment_type.trim());
    }

    if (params.featured_only) {
      httpParams = httpParams.set('featured_only', 'true');
    }

    if (params.ayushman_only) {
      httpParams = httpParams.set('ayushman_only', 'true');
    }

    console.log('API Request URL:', '/api/v1/treatments?' + httpParams.toString());
    return this.apiService.get<Treatment[]>('/api/v1/treatments', httpParams);
  }

  getLocations(): Observable<string[]> {
    return this.apiService.get<string[]>('/api/filters/locations');
  }

  getTreatmentTypes(): Observable<string[]> {
    return this.apiService.get<string[]>('/api/v1/filters/treatment-types');
  }

  /** ✅ Get single treatment by ID */
  getTreatmentById(id: number): Observable<Treatment> {
    return this.apiService.get<Treatment>(`/api/v1/treatments/${id}`);
  }

  /** ✅ Get Ayushman treatments specifically */
  getAyushmanTreatments(params: Omit<TreatmentSearchParams, 'ayushman_only'> = {}): Observable<Treatment[]> {
    return this.searchTreatments({ ...params, ayushman_only: true });
  }

  /** ✅ New universal search method (Doctors + Treatments + Hospitals) */
  searchAll(query: string, limit: number = 10): Observable<any> {
    const httpParams = new HttpParams()
      .set('query', query.trim())
      .set('limit', limit.toString());

    console.log('API Request URL:', '/api/v1/search?' + httpParams.toString());
    return this.apiService.get<any>('/api/v1/search', httpParams);
  }
}
