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
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/core/services/seo.service';
import { YoutubeService } from '@core/services/youtube.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroSection, CarouselModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  treatments: Treatment[] = [];
  partners: Partner[] = [];
  patientStories: PatientStory[] = [];
  offers: any[] = [];
  hospitals: Hospital[] = [];
  loadingHospitals = true;

  patientsCount = 0;
  patientsTarget = 10000;
  awardsCount = 0;
  awardsTarget = 25;

  videos: any[] = [];
  youtubeChannelUrl = 'https://www.youtube.com/@CureonMedicalTourism';
  selectedVideo: SafeResourceUrl | null = null;

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
      1000: { items: 3 },
    },
  };

  constructor(
    private sanitizer: DomSanitizer,
    private youtube: YoutubeService,
    private treatmentService: TreatmentService,
    public partnerService: PartnerService,
    private patientStoryService: PatientStoryService,
    private offerService: OfferService,
    private hospitalService: HospitalService, // Inject hospital service
    private titleService: Title,
    private metaService: Meta,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.loadTopTreatments();
    this.loadPartners();
    this.loadPatientStories();
    this.loadOffers();
    this.loadHospitals(); // Load hospitals dynamically
    this.startCounter('patientsCount', this.patientsTarget, 20, 25);
    this.startCounter('awardsCount', this.awardsTarget, 50, 1);

    this.youtube.getChannelVideos().subscribe((data: any) => {
      console.log('YouTube API wrking:', data);

      this.videos = data.items.filter((item: any) => {
        const title = item.snippet.title.toLowerCase();
        return !title.includes('#shorts');
      });

      this.videos = data.items.map((item: any) => {
        return {
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          videoId: item.id.videoId,
        };
      });
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow',
    });
    this.metaService.updateTag({
      name: 'keywords',
      content:
        'medical tourism company in India, medical travel India, international patient services India, affordable treatment in India, CureOn Medical Tourism',
    });

    this.metaService.updateTag({
      name: 'author',
      content: 'CureOn Medical Tourism',
    });
    this.seoService.setTitle('Medical Tourism in India | Trusted Medical Travel Company – CureOn');

    this.seoService.setDescription(
      'CureOn Medical Tourism helps international patients access affordable, world-class healthcare in India. Connect with top hospitals, expert doctors, and complete medical travel support.',
    );

    this.seoService.setCanonical('https://www.cureonmedicaltourism.com/');

    //Open Graph Tags
    this.metaService.updateTag({
      property: 'og:type',
      content: 'website',
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://www.cureonmedicaltourism.com/',
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: 'Medical Tourism in India | Affordable & Trusted Healthcare Access',
    });
    this.metaService.updateTag({
      property: 'og:description',
      content:
        'Helping international patients receive high-quality medical treatment in India with complete travel coordination and personalized care.',
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: 'https://www.cureonmedicaltourism.com/assets/images/og-image.jpg',
    });
    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'CureOn Medical Tourism',
    });
    this.metaService.updateTag({
      property: 'og:locale',
      content: 'en_US',
    });

    //TWITTER
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    this.metaService.updateTag({
      name: 'twitter:title',
      content: 'Medical Tourism in India | CureOn Medical Travel Experts',
    });

    this.metaService.updateTag({
      name: 'twitter:description',
      content:
        'Affordable healthcare in India for international patients with end-to-end medical travel assistance',
    });

    this.metaService.updateTag({
      name: 'twitter:image',
      content: 'https://www.cureonmedicaltourism.com/assets/images/twitter-card.jpg',
    });
  }
  openVideo(videoId: string) {
    const url = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    this.selectedVideo = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeVideo() {
    this.selectedVideo = null;
  }

  //   private setCanonicalURL(url?: string) {
  //   const canURL = url || window.location.href;
  //   let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
  //   if (!link) {
  //     link = document.createElement('link');
  //     link.setAttribute('rel', 'canonical');
  //     document.head.appendChild(link);
  //   }
  //   link.setAttribute('href', canURL);
  // }

  // Load top treatments (filter featured on frontend, limit to 4)
  private loadTopTreatments(): void {
    // Request featured treatments from the dedicated featured endpoint and limit to 4
    this.treatmentService.getFeaturedTreatments(0, 4).subscribe({
      next: (res) => {
        console.log('[Home] featured treatments response:', res);
        this.treatments = Array.isArray(res) ? res.slice(0, 4) : [];
        console.log('[Home] treatments set, length=', this.treatments.length);
      },
      error: (err) => {
        console.error('Failed to load featured treatments:', err);
      },
    });
  }

  // Load active partners (limit to 3)
  private loadPartners(): void {
    this.partnerService.getActivePartners().subscribe({
      next: (res) => (this.partners = res.slice(0)),
      error: (err) => console.error('Failed to load partners:', err),
    });
  }

  // Load patient stories (limit to 3)
  private loadPatientStories(): void {
    this.patientStoryService.getStories().subscribe({
      next: (res) => (this.patientStories = res.slice(0, 3)),
      error: (err) => console.error('Failed to load patient stories:', err),
    });
  }

  // Load offers (limit to 3 for homepage)
  private loadOffers(): void {
    this.offerService.getAllOffers(0, 3, true, false).subscribe({
      next: (res) => (this.offers = res),
      error: (err) => console.error('Failed to load offers:', err),
    });
  }

  // Load active hospitals
  // Load featured hospitals only
  private loadHospitals(): void {
    this.loadingHospitals = true;
    this.hospitalService.getHospitals(0, 10).subscribe({
      next: (res) => {
        // Filter only active AND featured hospitals
        this.hospitals = res.filter((h) => h.is_active && h.is_featured);
        this.loadingHospitals = false;
      },
      error: (err) => {
        console.error('Failed to load hospitals:', err);
        this.loadingHospitals = false;
      },
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
      ...Array(emptyStars).fill('empty'),
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
      992: { items: 3 },
    },
  };

  // Handle search result changes
  onSearchResultsChange(hasResults: boolean): void {
    this.hasSearchResults = hasResults;
    //console.log('Search results state changed:', hasResults);
  }

  // Counter animation
  private startCounter(
    counterName: 'patientsCount' | 'awardsCount',
    target: number,
    speed: number,
    step: number,
  ): void {
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
