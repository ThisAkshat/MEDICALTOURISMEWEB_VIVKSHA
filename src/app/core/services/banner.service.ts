import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Banner {
  id: number;
  name: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = 'http://165.22.223.163:8000/api/v1/banners?active_only=false';

  constructor(private http: HttpClient) {}

  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(this.apiUrl);
  }

  getBannerByTitle(title: string): Observable<Banner | undefined> {
    return this.getBanners().pipe(
      map(banners => banners.find(b => b.title.toLowerCase() === title.toLowerCase()))
    );
  }
  getBannerByName(name: string): Observable<Banner | undefined> {
    return this.getBanners().pipe(
      map(banners => banners.find(b => b.name.toLowerCase() === name.toLowerCase()))
    );
  }
}
