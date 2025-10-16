import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OfferService } from 'src/app/core/services/offer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-attractions-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './attractions-detail.html',
  styleUrls: ['./attractions-detail.css']
})
export class AttractionsDetail implements OnInit, OnDestroy {
  offer: any;
  recentOffers: any[] = [];
  loading = true;
  error = '';
  private routeSubscription: Subscription = new Subscription();

  constructor(
    private offerService: OfferService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id')) || 1;
      this.loadOfferDetails(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  private loadOfferDetails(id: number): void {
    this.loading = true;
    this.error = '';
    
    // Load specific offer details
    this.offerService.getOfferById(id).subscribe({
      next: (data) => {
        this.offer = data;
        this.loading = false;
        // Load recent offers after current offer is loaded
        this.loadRecentOffers();
      },
      error: () => {
        this.error = 'Failed to load offer details.';
        this.loading = false;
      }
    });
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
