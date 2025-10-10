import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PartnerService, Partner } from 'src/app/core/services/partner.service';
import { PatientStory, PatientStoryService } from 'src/app/core/services/patient-story.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class AboutComponent implements OnInit {
  partners: Partner[] = [];
  patientStories: PatientStory[] = [];
  customOptions = {
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

  banner: Banner | undefined;

  constructor(
    private bannerService: BannerService,
    public partnerService: PartnerService,
    private patientStoryService: PatientStoryService
  ) {}

  ngOnInit(): void {
    this.loadPartners();
    this.loadPatientStories();
    this.bannerService.getBannerByTitle('About Us').subscribe(banner => {
      this.banner = banner;
    });
  }
  // Load active partners
  private loadPartners(): void {
    this.partnerService.getActivePartners().subscribe({
      next: (res) => (this.partners = res),
      error: (err) => console.error('Failed to load partners:', err)
    });
  }
  // Load patient stories
  private loadPatientStories(): void {
    this.patientStoryService.getStories().subscribe({
      next: (res) => (this.patientStories = res),
      error: (err) => console.error('Failed to load patient stories:', err)
    });
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
}
