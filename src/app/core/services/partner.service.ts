import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  is_active: boolean;
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
