import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { User } from 'src/app/shared/interfaces/api.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  showMobileSearchBox = false;
  showDesktopSearchBox = false;
  showUserDropdown = false;

  searchQuery: string = '';
  mobileSearchQuery: string = '';
  desktopSearchQuery: string = '';
  searchResults: any = null; // stores doctors, treatments, hospitals
  mobileSearchResults: any = null;
  desktopSearchResults: any = null;
  private searchSubject = new Subject<string>();
  private mobileSearchSubject = new Subject<string>();
  private desktopSearchSubject = new Subject<string>();
  private subscription = new Subscription();

  // Authentication state
  currentUser: User | null = null;
  isAuthenticated = false;

  @ViewChild('mobileSearchContainer') mobileSearchContainer!: ElementRef;
  @ViewChild('desktopSearchContainer') desktopSearchContainer!: ElementRef;

  constructor(
    private treatmentService: TreatmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
    this.subscription.add(authSub);

    // Check initial authentication state
    this.isAuthenticated = this.authService.isAuthenticated();

    // Debounce search input for mobile
    const mobileSearchSub = this.mobileSearchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        if (query && query.length > 2) {
          this.treatmentService.searchAll(query, 10).subscribe({
            next: (data) => {
              // API returns { query, total_results, results: { doctors, treatments, hospitals } }
              this.mobileSearchResults = data.results;
            },
            error: (err) => {
              console.error('Mobile search error:', err);
              this.mobileSearchResults = null;
            }
          });
        } else {
          this.mobileSearchResults = null;
        }
      });
    this.subscription.add(mobileSearchSub);

    // Debounce search input for desktop
    const desktopSearchSub = this.desktopSearchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        if (query && query.length > 2) {
          this.treatmentService.searchAll(query, 10).subscribe({
            next: (data) => {
              // API returns { query, total_results, results: { doctors, treatments, hospitals } }
              this.desktopSearchResults = data.results;
            },
            error: (err) => {
              console.error('Desktop search error:', err);
              this.desktopSearchResults = null;
            }
          });
        } else {
          this.desktopSearchResults = null;
        }
      });
    this.subscription.add(desktopSearchSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // ✅ NEW: Close navbar when navigation link is clicked (for responsive mode)
  closeNavbar() {
    this.isMenuOpen = false;
  }

  toggleMobileSearchBox() {
    this.showMobileSearchBox = !this.showMobileSearchBox;
    this.mobileSearchResults = null;
    this.mobileSearchQuery = '';
  }

  toggleDesktopSearchBox() {
    this.showDesktopSearchBox = !this.showDesktopSearchBox;
    this.desktopSearchResults = null;
    this.desktopSearchQuery = '';
  }

  // Legacy method for backward compatibility
  toggleSearchBox() {
    this.toggleDesktopSearchBox();
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout() {
    this.authService.logout();
    this.showUserDropdown = false;
    this.closeNavbar(); // ✅ Close navbar when logging out
    this.router.navigate(['/']);
  }

  navigateToProfile() {
    this.showUserDropdown = false;
    this.closeNavbar(); // ✅ Close navbar when navigating to profile
    this.router.navigate(['/dashboard']);
  }

  onMobileSearchChange(query: string) {
    this.mobileSearchSubject.next(query);
  }

  onDesktopSearchChange(query: string) {
    this.desktopSearchSubject.next(query);
  }

  // Legacy method for backward compatibility
  onSearchChange(query: string) {
    this.onDesktopSearchChange(query);
  }

  toSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  onMobileSearchSubmit(): void {
    if (this.mobileSearchQuery && this.mobileSearchQuery.trim().length > 0) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.mobileSearchQuery.trim() } 
      });
      this.showMobileSearchBox = false;
      this.mobileSearchResults = null;
      this.closeNavbar(); // ✅ Close navbar when navigating to search results
    }
  }

  onDesktopSearchSubmit(): void {
    if (this.desktopSearchQuery && this.desktopSearchQuery.trim().length > 0) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.desktopSearchQuery.trim() } 
      });
      this.showDesktopSearchBox = false;
      this.desktopSearchResults = null;
    }
  }

  // Legacy method for backward compatibility
  onSearchSubmit(): void {
    this.onDesktopSearchSubmit();
  }

  navigateToMobileSearchResults(): void {
    this.closeNavbar(); // ✅ Close navbar when navigating to search results
    this.onMobileSearchSubmit();
  }

  navigateToDesktopSearchResults(): void {
    this.onDesktopSearchSubmit();
  }

  // Legacy method for backward compatibility
  navigateToSearchResults(): void {
    this.onDesktopSearchSubmit();
  }

  selectMobileSearchResult(type: string, id: number): void {
    this.showMobileSearchBox = false;
    this.mobileSearchResults = null;
    this.closeNavbar(); // ✅ Close navbar when navigating
    
    switch (type) {
      case 'doctor':
        this.router.navigate(['/doctor-details', id]);
        break;
      case 'treatment':
        this.router.navigate(['/treatment-detail', id]);
        break;
      case 'hospital':
        this.router.navigate(['/hospital-detail', id]);
        break;
    }
  }

  selectDesktopSearchResult(type: string, id: number): void {
    this.showDesktopSearchBox = false;
    this.desktopSearchResults = null;
    
    switch (type) {
      case 'doctor':
        this.router.navigate(['/doctor-details', id]);
        break;
      case 'treatment':
        this.router.navigate(['/treatment-detail', id]);
        break;
      case 'hospital':
        this.router.navigate(['/hospital-detail', id]);
        break;
    }
  }

  // Legacy method for backward compatibility
  selectSearchResult(type: string, id: number): void {
    this.selectDesktopSearchResult(type, id);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    
    // Handle mobile search box click outside
    if (
      this.showMobileSearchBox &&
      this.mobileSearchContainer &&
      !this.mobileSearchContainer.nativeElement.contains(target)
    ) {
      this.showMobileSearchBox = false;
      this.mobileSearchResults = null;
    }

    // Handle desktop search box click outside
    if (
      this.showDesktopSearchBox &&
      this.desktopSearchContainer &&
      !this.desktopSearchContainer.nativeElement.contains(target)
    ) {
      this.showDesktopSearchBox = false;
      this.desktopSearchResults = null;
    }

    // Handle user dropdown click outside
    if (this.showUserDropdown && !target.closest('.user-dropdown-container')) {
      this.showUserDropdown = false;
    }
  }
}
