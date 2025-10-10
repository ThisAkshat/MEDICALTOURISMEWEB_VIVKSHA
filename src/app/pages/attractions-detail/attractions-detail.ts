import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OfferService } from 'src/app/core/services/offer.service';

@Component({
  selector: 'app-attractions-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './attractions-detail.html',
  styleUrls: ['./attractions-detail.css']
})
export class AttractionsDetail implements OnInit {
  offer: any;
  recentOffers: any[] = [];
  loading = true;
  error = '';

  constructor(
    private offerService: OfferService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;
    
    // Load specific offer details
    this.offerService.getOfferById(id).subscribe({
      next: (data) => {
        this.offer = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load offer details.';
        this.loading = false;
      }
    });

    // Load recent offers for sidebar
    this.loadRecentOffers();
  }

  getPrimaryImage(offer: any): string {
    const primary = offer.images?.find((img: any) => img.is_primary);
    return primary ? primary.url : offer.images?.[0]?.url || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Load recent offers for sidebar
  loadRecentOffers(): void {
    this.offerService.getAllOffers().subscribe({
      next: (data) => {
        // Get latest 4 offers, excluding the current one
        this.recentOffers = data
          .filter((offer: any) => offer.id !== this.offer?.id)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4);
      },
      error: (err) => {
        console.error('Failed to load recent offers:', err);
        this.recentOffers = [];
      }
    });
  }

  // Get offer image URL
  getOfferImageUrl(offer: any): string {
    const primary = offer.images?.find((img: any) => img.is_primary);
    const imageUrl = primary ? primary.url : offer.images?.[0]?.url || '';
    return imageUrl ? `http://165.22.223.163:8000${imageUrl}` : 'assets/images/attractions1.png';
  }

  // Navigate to contact page
  contactNow(): void {
    this.router.navigate(['/contact']);
  }
}
