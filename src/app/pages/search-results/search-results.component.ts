import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  searchResults: any = null;
  loading: boolean = false;
  totalResults: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private treatmentService: TreatmentService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.performSearch(this.searchQuery);
      }
    });
  }
  

  performSearch(query: string): void {
    this.loading = true;
    this.treatmentService.searchAll(query, 50).subscribe({
      next: (data) => {
        this.searchResults = data.results;
        this.totalResults = data.total_results;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchResults = null;
        this.loading = false;
      }
    });
  }

  navigateToDoctor(doctorId: number): void {
    this.router.navigate(['/doctors', doctorId]);
  }

  navigateToTreatment(treatmentId: number): void {
    this.router.navigate(['/treatments', treatmentId]);
  }

  navigateToHospital(hospitalId: number): void {
    this.router.navigate(['/hospitals', hospitalId]);
  }

  formatPrice(treatment: any): string {
    if (treatment.price_exact) {
      return `₹${treatment.price_exact.toLocaleString()}`;
    } else if (treatment.price_min && treatment.price_max) {
      return `₹${treatment.price_min.toLocaleString()} - ₹${treatment.price_max.toLocaleString()}`;
    }
    return 'Price on request';
  }

  getStars(rating: number | null): ('full' | 'half' | 'empty')[] {
    if (rating === null) {
      return Array(5).fill('empty');
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return [
      ...Array(fullStars).fill('full'),
      ...Array(halfStar).fill('half'),
      ...Array(emptyStars).fill('empty')
    ];
  }

  getHospitalImageUrl(hospital: any): string {
    // Check if hospital has images array
    if (hospital.images && hospital.images.length > 0) {
      // First try to find the primary image
      const primaryImage = hospital.images.find((img: any) => img.is_primary === true);
      if (primaryImage) {
        return `http://165.22.223.163:8000${primaryImage.url}`;
      }
      
      // If no primary image, use the first image
      const firstImage = hospital.images[0];
      if (firstImage) {
        return `http://165.22.223.163:8000${firstImage.url}`;
      }
    }
    
    // Fallback to default image
    return 'assets/images/hospital-default.png';
  }

  getDoctorImageUrl(doctor: any): string {
    // Check if doctor has profile_photo
    if (doctor.profile_photo) {
      // If the image field already contains the full URL
      if (doctor.profile_photo.startsWith('http')) {
        return doctor.profile_photo;
      }
      // If it's a relative path, prepend the base URL
      return `http://165.22.223.163:8000${doctor.profile_photo.startsWith('/') ? '' : '/'}${doctor.profile_photo}`;
    }
    
    // Fallback to default doctor image
    return 'assets/images/dtl-doctor.png';
  }

  onImageError(event: any): void {
    console.log('Image failed to load:', event.target.src);
    // Set fallback image on error - use appropriate default based on context
    if (event.target.src.includes('hospital')) {
      event.target.src = 'assets/images/hospital-default.png';
    } else {
      event.target.src = 'assets/images/dtl-doctor.png';
    }
  }
}
