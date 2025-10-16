import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TreatmentService } from '../../core/services/treatment.service';
import { DoctorService, Doctor } from '../../core/services/doctors.service';
import { Treatment } from '../../shared/interfaces/treatment.interface';
import { BannerService, Banner } from 'src/app/core/services/banner.service';
import { ModalComponent } from '@core/modal/modal.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent], // ✅ Add ModalComponent
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.css']
})
export class HeroSection implements OnInit, OnDestroy {
  @Output() searchResultsChange = new EventEmitter<boolean>();

  /** ✅ Modal state */
  showNoResultsModal = false;

  /** ✅ Banner */
  banner: Banner | null = null;
  baseUrl = 'http://165.22.223.163:8000';

  /** Treatment search */
  locations: string[] = [];
  treatments: string[] = [];
  searchResults: Treatment[] = [];
  selectedLocation: string = '';
  selectedTreatment: string = '';
  isSearching = false;
  searchClicked = false;
  buttonClicked = false;

  /** Doctor search */
  doctorLocations: string[] = [];
  specializations: string[] = [];
  doctorResults: Doctor[] = [];
  selectedDoctorLocation: string = '';
  selectedSpecialization: string = '';
  isDoctorSearching = false;
  doctorSearchClicked = false;

  /** Custom dropdown state */
  openDropdown: 'location' | 'treatment' | 'doctorLocation' | 'specialization' | null = null;

  constructor(
    private treatmentService: TreatmentService,
    private doctorService: DoctorService,
    private router: Router,
    private bannerService: BannerService
  ) {}

  ngOnInit(): void {
    console.log('HeroSection ngOnInit called');

    this.loadBannerBasedOnRoute();
    this.loadLocations();
    this.loadTreatments();
    this.loadDoctorLocations();
    this.loadSpecializations();

    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  // --------------------------
  // 🔹 Modal Methods
  // --------------------------
  closeNoResultsModal() {
    this.showNoResultsModal = false;
  }

  clearSearchFromModal() {
    this.clearSearch();
    this.showNoResultsModal = false;
  }

  // --------------------------
  // 🔹 Dropdown Methods
  // --------------------------
  toggleDropdown(type: 'location' | 'treatment' | 'doctorLocation' | 'specialization') {
    this.openDropdown = this.openDropdown === type ? null : type;
  }

  selectLocation(loc: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedLocation = loc;
    this.openDropdown = null;
  }

  selectTreatment(treatment: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedTreatment = treatment;
    this.openDropdown = null;
  }

  selectDoctorLocation(loc: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedDoctorLocation = loc;
    this.openDropdown = null;
  }

  selectSpecialization(spec: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedSpecialization = spec;
    this.openDropdown = null;
  }

  handleOutsideClick(event: MouseEvent) {
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    let clickedInside = false;

    dropdowns.forEach((dropdown) => {
      if (dropdown.contains(event.target as Node)) {
        clickedInside = true;
      }
    });

    if (!clickedInside) this.openDropdown = null;
  }

  // --------------------------
  // 🔹 Banner
  // --------------------------
  loadBannerBasedOnRoute(): void {
    let pageName = 'Home';
    const currentPath = this.router.url.toLowerCase();

    if (currentPath.includes('contact')) pageName = 'Contact';
    else if (currentPath.includes('login')) pageName = 'Login';
    else if (currentPath.includes('signup')) pageName = 'Sign Up';
    else if (currentPath.includes('forgot-password')) pageName = 'Forgot Password';
    else if (currentPath.includes('online-consultation')) pageName = 'Online Consultation';
    else if (currentPath.includes('doctors')) pageName = 'Doctors';
    else if (currentPath.includes('blog')) pageName = 'Blog';
    else if (currentPath.includes('about')) pageName = 'About Us';
    else if (currentPath.includes('treatment')) pageName = 'Treatment Plan';
    else if (currentPath.includes('attractions')) pageName = 'Attractions';
    else if (currentPath.includes('associate-hospital')) pageName = 'Associate Hospital';

    console.log('Fetching banner for:', pageName);

    this.bannerService.getBannerByName(pageName).subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('Banner loaded:', banner);
        } else {
          console.warn(`Banner not found for ${pageName}, using fallback.`);
        }
      },
      error: (error) => {
        console.error('Error fetching banner:', error);
      }
    });
  }

  // --------------------------
  // 🔹 Navigation
  // --------------------------
  goToContact() {
    this.router.navigate(['/contact']);
  }

  goToAttractions() {
    this.router.navigate(['/attractions']);
  }

  // --------------------------
  // 🔹 Treatment Search
  // --------------------------
  loadLocations(): void {
    this.treatmentService.getLocations().subscribe({
      next: (locations) => (this.locations = locations),
      error: (error) => {
        console.error('Error fetching locations:', error);
        this.locations = ['Indore', 'Bhopal', 'Delhi', 'Mumbai'];
      }
    });
  }

  loadTreatments(): void {
    this.treatmentService.getTreatmentTypes().subscribe({
      next: (treatments) => (this.treatments = treatments),
      error: (error) => {
        console.error('Error fetching treatments:', error);
        this.treatments = ['Cardiology', 'Neurology', 'Orthopedics', 'Cancer Treatment'];
      }
    });
  }

  getStars(rating: number | null): ('full' | 'half' | 'empty')[] {
    if (rating === null) return Array(5).fill('empty');
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return [
      ...Array(fullStars).fill('full'),
      ...Array(halfStar).fill('half'),
      ...Array(emptyStars).fill('empty')
    ];
  }

  search() {
    if (!this.selectedLocation && !this.selectedTreatment) return;

    this.searchClicked = true;
    this.isSearching = true;
    this.doctorResults = [];
    this.doctorSearchClicked = false;

    const params: any = { skip: 0, limit: 100 };
    if (this.selectedLocation) params.location = this.selectedLocation.toLowerCase();
    if (this.selectedTreatment) params.treatment_type = this.selectedTreatment;

    this.treatmentService.searchTreatments(params).subscribe({
      next: (results) => {
        this.searchResults = results.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
        );
        this.isSearching = false;
        
        // ✅ Show modal if no results found
        if (this.searchResults.length === 0) {
          this.showNoResultsModal = true;
        }
        
        this.searchResultsChange.emit(this.searchResults.length > 0);
        
        if (this.searchResults.length > 0) {
          setTimeout(() => {
            document.querySelector('.search-results-container')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error searching treatments:', error);
        this.isSearching = false;
        this.searchResults = [];
        this.searchResultsChange.emit(false);
        // ✅ Show modal on error too
        this.showNoResultsModal = true;
      }
    });
  }

  clearSearch() {
    this.selectedLocation = '';
    this.selectedTreatment = '';
    this.searchResults = [];
    this.isSearching = false;
    this.searchClicked = false;
    this.searchResultsChange.emit(false);
  }

  // --------------------------
  // 🔹 Doctor Search
  // --------------------------
  loadDoctorLocations(): void {
    this.doctorService.getLocations().subscribe({
      next: (locations) => (this.doctorLocations = locations),
      error: (error) => {
        console.error('Error fetching doctor locations:', error);
        this.doctorLocations = ['Indore', 'Mumbai', 'Delhi', 'Bangalore'];
      }
    });
  }

  loadSpecializations(): void {
    this.doctorService.getSpecializations().subscribe({
      next: (specializations) => (this.specializations = specializations),
      error: (error) => {
        console.error('Error fetching specializations:', error);
        this.specializations = ['Interventional Cardiology', 'Neurology', 'Orthopedics', 'Oncology'];
      }
    });
  }

  searchDoctors() {
    this.doctorSearchClicked = true;
    this.isDoctorSearching = true;
    this.searchResults = [];
    this.searchClicked = false;

    this.doctorService.getDoctors(0, 100, this.selectedDoctorLocation || undefined).subscribe({
      next: (doctors) => {
        let filtered = doctors;
        if (this.selectedSpecialization) {
          filtered = doctors.filter(d =>
            d.specialization?.toLowerCase().includes(this.selectedSpecialization.toLowerCase())
          );
        }
        this.doctorResults = filtered.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
        );
        this.isDoctorSearching = false;
        
        // ✅ Show modal if no doctor results found
        if (this.doctorResults.length === 0) {
          this.showNoResultsModal = true;
        }
        
        this.searchResultsChange.emit(this.doctorResults.length > 0);
        
        if (this.doctorResults.length > 0) {
          setTimeout(() => {
            document.querySelector('.doctor-results-container')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      },
      error: (error) => {
        console.error('Error searching doctors:', error);
        this.isDoctorSearching = false;
        this.doctorResults = [];
        this.searchResultsChange.emit(false);
        // ✅ Show modal on error too
        this.showNoResultsModal = true;
      }
    });
  }

  clearDoctorSearch() {
    this.selectedDoctorLocation = '';
    this.selectedSpecialization = '';
    this.doctorResults = [];
    this.isDoctorSearching = false;
    this.doctorSearchClicked = false;
    this.searchResultsChange.emit(false);
  }
}