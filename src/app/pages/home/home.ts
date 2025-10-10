import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { HeroSection } from '../hero-section/hero-section';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { PartnerService, Partner } from 'src/app/core/services/partner.service';
import { PatientStory, PatientStoryService } from 'src/app/core/services/patient-story.service';
import { OfferService } from 'src/app/core/services/offer.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroSection, CarouselModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  treatments: Treatment[] = [];
  partners: Partner[] = [];
  patientStories: PatientStory[] = [];
  offers: any[] = [];
  hospitals: Hospital[] = [];
  loadingHospitals = true;

  patientsCount = 0;
  patientsTarget = 2500;
  awardsCount = 0;
  awardsTarget = 25;

  hasSearchResults = false;

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    dots: true,
    margin: 25,
    nav: false,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 }
    }
  };

  constructor(
    private treatmentService: TreatmentService,
    public partnerService: PartnerService,
    private patientStoryService: PatientStoryService,
    private offerService: OfferService,
    private hospitalService: HospitalService // Inject hospital service
  ) { }

  ngOnInit(): void {
    this.loadTopTreatments();
    this.loadPartners();
    this.loadPatientStories();
    this.loadOffers();
    this.loadHospitals(); // Load hospitals dynamically
    this.startCounter('patientsCount', this.patientsTarget, 20, 25);
    this.startCounter('awardsCount', this.awardsTarget, 50, 1);
  }

  // Load top treatments (filter featured on frontend, limit to 4)
  private loadTopTreatments(): void {
    this.treatmentService.searchTreatments({ skip: 0, limit: 20 }).subscribe({
      next: (res) => {
        this.treatments = res.filter(treatment => treatment.is_featured).slice(0, 4);
      },
      error: (err) => console.error('Failed to load treatments:', err)
    });
  }

  // Load active partners (limit to 3)
  private loadPartners(): void {
    this.partnerService.getActivePartners().subscribe({
      next: (res) => (this.partners = res.slice(0)),
      error: (err) => console.error('Failed to load partners:', err)
    });
  }

  // Load patient stories (limit to 3)
  private loadPatientStories(): void {
    this.patientStoryService.getStories().subscribe({
      next: (res) => (this.patientStories = res.slice(0, 3)),
      error: (err) => console.error('Failed to load patient stories:', err)
    });
  }

  // Load offers (limit to 3 for homepage)
  private loadOffers(): void {
    this.offerService.getAllOffers(0, 3, true, false).subscribe({
      next: (res) => (this.offers = res),
      error: (err) => console.error('Failed to load offers:', err)
    });
  }

  // Load active hospitals
  // Load featured hospitals only
  private loadHospitals(): void {
    this.loadingHospitals = true;
    this.hospitalService.getHospitals(0, 10).subscribe({
      next: (res) => {
        // Filter only active AND featured hospitals
        this.hospitals = res.filter(h => h.is_active && h.is_featured);
        this.loadingHospitals = false;
      },
      error: (err) => {
        console.error('Failed to load hospitals:', err);
        this.loadingHospitals = false;
      }
    });
  }
  


  // Get offer image URL
  getOfferImageUrl(offer: any): string {
    return this.offerService.getOfferImageUrl(offer);
  }

  // Get star icons for ratings
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
  hospitalSliderOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    margin: 20,
    dots: true,
    nav: false,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      992: { items: 3 }
    }
  };


  // Handle search result changes
  onSearchResultsChange(hasResults: boolean): void {
    this.hasSearchResults = hasResults;
    console.log('Search results state changed:', hasResults);
  }

  // Counter animation
  private startCounter(counterName: 'patientsCount' | 'awardsCount', target: number, speed: number, step: number): void {
    const interval = setInterval(() => {
      if (this[counterName] < target) {
        this[counterName] += step;
      } else {
        this[counterName] = target;
        clearInterval(interval);
      }
    }, speed);
  }
}
