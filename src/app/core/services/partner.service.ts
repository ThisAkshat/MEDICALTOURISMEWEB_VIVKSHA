import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string | null;
  description: string | null;
  location: string | null;
  position: number;
  is_active: boolean;
  hospital_id: number | null;
  created_at: string;
  updated_at: string;
  hospital: any | null;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private baseUrl = 'http://165.22.223.163:8000';

  constructor(private http: HttpClient) {}

  getActivePartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.baseUrl}/api/v1/partners?active_only=true`);
  }

  getFullLogoUrl(logoPath: string): string {
    return `${this.baseUrl}${logoPath}`;
  }
}
