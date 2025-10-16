import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AboutUsImage {
  id: number;
  owner_type: string | null;
  owner_id: number | null;
  url: string;
  is_primary: boolean;
  position: number;
  uploaded_at: string;
}

export interface FeaturedCard {
  id: number;
  about_us_id: number;
  heading: string;
  description: string;
  position: number;
  created_at: string;
  images: any[];
}

export interface AboutUs {
  id: number;
  heading: string;
  description: string;
  vision_heading: string;
  vision_desc: string;
  vision: string | null;
  mission: string;
  bottom_heading: string;
  bottom_desc: string;
  bottom_list: string;
  feature_title: string;
  feature_desc: string;
  position: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  featured_cards: FeaturedCard[];
  images: AboutUsImage[];
}

@Injectable({
  providedIn: 'root'
})
export class AboutUsService {
  private apiUrl = 'http://165.22.223.163:8000/api/v1/about-us';

  constructor(private http: HttpClient) {}

  getAboutUsInfo(): Observable<AboutUs[]> {
    return this.http.get<AboutUs[]>(this.apiUrl);
  }

  getAboutUsImageUrl(imagePath: string): string {
    return `http://165.22.223.163:8000${imagePath}`;
  }

  getPrimaryImage(aboutUs: AboutUs): AboutUsImage | null {
    return aboutUs.images.find(img => img.is_primary) || aboutUs.images[0] || null;
  }

  getBottomListItems(bottomList: string): string[] {
    return bottomList.split('.').filter(item => item.trim().length > 0).map(item => item.trim());
  }
}
