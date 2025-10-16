import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';
import { BannerService, Banner } from 'src/app/core/services/banner.service';

@Component({
  selector: 'app-ayushman-treatment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ayushman-treatment.html',
  styleUrls: ['./ayushman-treatment.css']
})
export class AyushmanTreatment implements OnInit {
  slug: string | null = null;
  treatmentName: string | null = null;

  treatments: Treatment[] = [];
  filteredTreatments: Treatment[] = [];
  loading = true;
  baseUrl = 'http://165.22.223.163:8000';

  // Banner
  banner: Banner | undefined;

  // Filters
  selectedLocation: string = '';
  selectedTreatmentType: string = '';

  // Dropdown data
  availableLocations: string[] = [];
  availableTreatmentTypes: string[] = [];

  // Dropdown open/close states
  isLocationOpen = false;
  isTreatmentOpen = false;

  constructor(
    private route: ActivatedRoute,
    private treatmentService: TreatmentService,
    private bannerService: BannerService
  ) {}

  ngOnInit(): void {
    this.loadTreatments();

    // ✅ Load Treatments Banner
    this.bannerService.getBannerByTitle('Ayushman Treatment').subscribe({
      next: (banner) => {
        this.banner = banner;
      },
      error: (err) => console.error('Error loading banner:', err)
    });
  }

  /** Load Ayushman treatments from API */
  loadTreatments(): void {
    this.loading = true;
    const requestPayload = { skip: 0, limit: 100 };

    this.treatmentService.getAyushmanTreatments(requestPayload).subscribe({
      next: (data) => {
        console.log(' Ayushman treatments loaded:', data);
        
        // Verify all treatments have is_ayushman: true
        const ayushmanCount = data.filter(t => t.is_ayushman === true).length;
        console.log(` Verification: ${ayushmanCount}/${data.length} treatments have is_ayushman: true`);
        
        this.treatments = data.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));

        this.availableLocations = Array.from(new Set(this.treatments.map(t => t.location).filter(Boolean)));
        this.availableTreatmentTypes = Array.from(new Set(this.treatments.map(t => t.treatment_type).filter(Boolean)));

        this.filteredTreatments = [...this.treatments];
        this.loading = false;
        
        console.log(` Loaded ${this.treatments.length} Ayushman treatments`);
      },
      error: (err) => {
        console.error('Error fetching Ayushman treatments:', err);
        this.loading = false;
      }
    });
  }

  toggleLocationDropdown(): void {
    this.isLocationOpen = !this.isLocationOpen;
    this.isTreatmentOpen = false;
  }

  toggleTreatmentDropdown(): void {
    this.isTreatmentOpen = !this.isTreatmentOpen;
    this.isLocationOpen = false;
  }

  selectLocation(loc: string): void {
    this.selectedLocation = loc;
    this.isLocationOpen = false;
    this.applyFilters();
  }

  selectTreatment(type: string): void {
    this.selectedTreatmentType = type;
    this.isTreatmentOpen = false;
    this.applyFilters();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any): void {
    if (!event.target.closest('.custom-select-wrapper')) {
      this.isLocationOpen = false;
      this.isTreatmentOpen = false;
    }
  }

  applyFilters(): void {
    this.filteredTreatments = this.treatments.filter(t => {
      const locationMatch = this.selectedLocation ? t.location === this.selectedLocation : true;
      const treatmentMatch = this.selectedTreatmentType ? t.treatment_type === this.selectedTreatmentType : true;
      const ayushmanMatch = t.is_ayushman === true; // Ensure only Ayushman treatments
      return locationMatch && treatmentMatch && ayushmanMatch;
    });
    
    console.log(`🔍 Filtered ${this.filteredTreatments.length} Ayushman treatments after applying filters`);
  }

  // Get only Ayushman treatments for display
  get ayushmanTreatments(): Treatment[] {
    return this.filteredTreatments.filter(t => t.is_ayushman === true);
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

  private slugToName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // TrackBy function for better performance in *ngFor
  trackByTreatmentId(index: number, treatment: Treatment): number {
    return treatment.id;
  }
}