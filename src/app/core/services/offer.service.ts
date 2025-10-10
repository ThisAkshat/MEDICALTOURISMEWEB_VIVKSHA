import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private baseUrl = 'http://165.22.223.163:8000/api/v1/offers';

  constructor(private http: HttpClient) {}

  // Fetch single offer by ID
  getOfferById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Fetch all offers with query parameters
  getAllOffers(skip: number = 0, limit: number = 100, activeOnly: boolean = true, currentOnly: boolean = false): Observable<any[]> {
    const params = `?skip=${skip}&limit=${limit}&active_only=${activeOnly}&current_only=${currentOnly}`;
    return this.http.get<any[]>(`${this.baseUrl}${params}`);
  }

  // Get offer image URL
  getOfferImageUrl(offer: any): string {
    const primaryImage = offer.images?.find((img: any) => img.is_primary);
    const imageUrl = primaryImage ? primaryImage.url : offer.images?.[0]?.url || '';
    return imageUrl ? `http://165.22.223.163:8000${imageUrl}` : 'assets/images/offer1.png';
  }
}
