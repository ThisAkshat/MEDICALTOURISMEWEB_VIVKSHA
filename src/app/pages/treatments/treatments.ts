import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';
import { BannerService, Banner } from 'src/app/core/services/banner.service';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treatments.html',
  styleUrls: ['./treatments.css']
})
export class Treatments implements OnInit {
  slug: string | null = null;
  treatmentName: string | null = null;

  treatments: Treatment[] = [];
  filteredTreatments: Treatment[] = [];
  loading = true;

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
    this.bannerService.getBannerByTitle('Treatment Plan').subscribe({
      next: (banner) => {
        this.banner = banner;
      },
      error: (err) => console.error('Error loading banner:', err)
    });
  }

  /** Load all treatments from API */
  loadTreatments(): void {
    this.loading = true;
    const requestPayload: any = { skip: 0, limit: 100 };

    this.treatmentService.searchTreatments(requestPayload).subscribe({
      next: (data) => {
        this.treatments = data.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));

        this.availableLocations = Array.from(new Set(this.treatments.map(t => t.location).filter(Boolean)));
        this.availableTreatmentTypes = Array.from(new Set(this.treatments.map(t => t.treatment_type).filter(Boolean)));

        this.filteredTreatments = [...this.treatments];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching treatments:', err);
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
      return locationMatch && treatmentMatch;
    });
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
}
