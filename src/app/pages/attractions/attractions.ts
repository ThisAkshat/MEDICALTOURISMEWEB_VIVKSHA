import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface OfferImage {
  id: number;
  owner_type: string;
  owner_id: number;
  url: string;
  is_primary: boolean;
  position: number;
  uploaded_at: string;
}

export interface Offer {
  id: number;
  name: string;
  description: string;
  treatment_type: string | null;
  location: string;
  start_date: string;
  end_date: string;
  discount_percentage: number;
  is_free_camp: boolean;
  treatment_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: OfferImage[];
}

export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  featured_image: string;
  slug: string;
  published_at: string;
}

@Component({
  selector: 'app-attractions',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './attractions.html',
  styleUrl: './attractions.css'
})
export class Attractions implements OnInit {
  offers: Offer[] = [];
  blogs: Blog[] = [];
  recentPosts: Blog[] = [];
  recentOffers: Offer[] = [];
  loading = true;
  offersLoaded = false;
  blogsLoaded = false;
  baseUrl = 'http://165.22.223.163:8000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('🚀 Attractions component initialized');
    this.loadOffers();
    // Load blogs after a short delay to avoid overwhelming the API
    setTimeout(() => this.loadBlogs(), 500);
  }

  loadOffers(): void {
    // Based on your curl command, try the exact URL that worked for you
    const possibleUrls = [
      `${this.baseUrl}/api/v1/api/v1/offers?skip=0&limit=20&is_active=true&include_expired=true`, // Your original curl URL
      `${this.baseUrl}/api/v1/offers?skip=0&limit=20&is_active=true&include_expired=true`,
      `${this.baseUrl}/offers?skip=0&limit=20&is_active=true&include_expired=true`,
      `${this.baseUrl}/api/offers?skip=0&limit=20&is_active=true&include_expired=true`
    ];
    
    const apiUrl = possibleUrls[0]; // Start with your working curl URL
    console.log('🔗 Fetching offers from:', apiUrl);
    
    this.http.get<any>(apiUrl)
      .subscribe({
        next: (data) => {
          console.log('📦 Raw API response:', data);
          
          // Handle different response formats
          if (Array.isArray(data)) {
            this.offers = data;
          } else if (data && data.data && Array.isArray(data.data)) {
            this.offers = data.data;
          } else if (data && data.results && Array.isArray(data.results)) {
            this.offers = data.results;
          } else {
            console.warn('⚠️ Unexpected response format:', data);
            this.offers = [];
          }
          
          this.extractRecentOffers();
          this.offersLoaded = true;
          this.checkLoadingComplete();
          console.log('✅ Offers loaded successfully:', this.offers.length, 'items');
        },
        error: (err) => {
          console.error('❌ Error loading offers:', err);
          console.error('❌ Error details:', err.error);
          console.error('❌ Status:', err.status);
          
          // If first URL fails, try the second one
          if (apiUrl === possibleUrls[0]) {
            console.log('🔄 Trying alternative endpoint:', possibleUrls[1]);
            this.tryAlternativeOfferEndpoint(possibleUrls[1]);
          } else {
            this.offers = [];
            this.offersLoaded = true;
            this.checkLoadingComplete();
          }
        }
      });
  }

  private tryAlternativeOfferEndpoint(url: string): void {
    this.http.get<any>(url)
      .subscribe({
        next: (data) => {
          console.log('📦 Alternative API response:', data);
          this.offers = Array.isArray(data) ? data : (data?.data || []);
          this.extractRecentOffers();
          this.offersLoaded = true;
          this.checkLoadingComplete();
          console.log('✅ Offers loaded from alternative endpoint:', this.offers.length, 'items');
        },
        error: (err) => {
          console.error('❌ Alternative endpoint also failed:', err);
          console.log('🔄 Using fallback static data for testing');
          
          // Fallback static data based on your API response
          this.offers = [
            {
              id: 2,
              name: "33% OFF Oncology Care – Breast & Cervical Check",
              description: "This package is tailored for women's preventive health, focusing on early detection of breast and cervical cancers. It includes mammography for breast cancer screening and Pap smear for cervical cancer. Expert consultations with a gynecologist and oncologist ensure a holistic review of findings, providing timely intervention if needed. Ideal for women aged 30 and above.",
              treatment_type: null,
              location: "Serilingampally, Hydrabad, India",
              start_date: "2025-10-11T15:55:00",
              end_date: "2025-10-12T15:55:00",
              discount_percentage: 33,
              is_free_camp: false,
              treatment_id: 5,
              is_active: true,
              created_at: "2025-09-30T10:25:51.300630",
              updated_at: "2025-10-01T04:25:14.316900",
              images: [
                {
                  id: 41,
                  owner_type: "offer",
                  owner_id: 2,
                  url: "/media/offer/36ca00a1-c8f1-4096-8c1a-f4c5577231e4.jpg",
                  is_primary: true,
                  position: 0,
                  uploaded_at: "2025-09-30T10:25:51.305379"
                }
              ]
            },
            {
              id: 1,
              name: "28%OFF Urology – Kidney Stone Care Package",
              description: "This package is designed for patients suffering from kidney stones. It covers all essential steps including consultation, diagnostic tests, and surgery (PCNL/URSL depending on case). Post-surgery hospitalization and basic care for 2 days are included. With experienced urologists and advanced technology, this package ensures safe and effective stone removal at a reduced cost.",
              treatment_type: null,
              location: "INDORE, M.P. INDIA",
              start_date: "2025-10-04T12:11:00",
              end_date: "2025-10-06T12:11:00",
              discount_percentage: 28,
              is_free_camp: false,
              treatment_id: 2,
              is_active: true,
              created_at: "2025-09-30T06:41:53.475210",
              updated_at: "2025-10-01T04:25:14.316900",
              images: [
                {
                  id: 27,
                  owner_type: "offer",
                  owner_id: 1,
                  url: "/media/offer/601e2989-83d3-4620-89f8-a85605f762fd.jpg",
                  is_primary: true,
                  position: 0,
                  uploaded_at: "2025-09-30T06:41:53.483548"
                }
              ]
            }
          ];
          
          this.extractRecentOffers();
          this.offersLoaded = true;
          this.checkLoadingComplete();
        }
      });
  }

  loadBlogs(): void {
    const blogUrl = `${this.baseUrl}/api/v1/blogs?skip=0&limit=6&published_only=true&featured_only=false`;
    console.log('🔗 Fetching blogs from:', blogUrl);
    
    this.http.get<Blog[]>(blogUrl)
      .subscribe({
        next: (data) => {
          console.log('📰 Raw blog response:', data);
          this.blogs = Array.isArray(data) ? data : [];
          this.extractRecentPosts();
          this.blogsLoaded = true;
          this.checkLoadingComplete();
          console.log('✅ Blogs loaded successfully:', this.blogs.length, 'items');
        },
        error: (err) => {
          console.error('❌ Error loading blogs:', err);
          console.error('❌ Blog error details:', err.error);
          this.blogs = [];
          this.blogsLoaded = true;
          this.checkLoadingComplete();
        }
      });
  }

  private checkLoadingComplete(): void {
    console.log('🔄 Checking loading complete - Offers loaded:', this.offersLoaded, 'Blogs loaded:', this.blogsLoaded);
    
    // Set loading to false when both API calls are complete OR when offers are loaded (prioritize offers)
    if (this.offersLoaded && this.blogsLoaded) {
      this.loading = false;
      console.log('✅ All content loaded. Offers:', this.offers.length, 'Blogs:', this.blogs.length);
    } else if (this.offersLoaded) {
      // If offers are loaded but blogs are taking time, show offers first
      setTimeout(() => {
        if (!this.blogsLoaded) {
          this.loading = false;
          console.log('⚡ Showing offers first. Offers:', this.offers.length);
        }
      }, 2000);
    }
  }

  getOfferImageUrl(offer: Offer): string {
    // Get primary image or first image
    const primaryImage = offer.images.find(img => img.is_primary) || offer.images[0];
    if (primaryImage) {
      return `${this.baseUrl}${primaryImage.url}`;
    }
    return 'assets/images/attractions1.png'; // fallback
  }

  getBlogImageUrl(blog: Blog): string {
    if (blog.featured_image) {
      return blog.featured_image.startsWith('http') 
        ? blog.featured_image 
        : `${this.baseUrl}${blog.featured_image}`;
    }
    return 'assets/images/attractions1.png'; // fallback
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatBlogDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  // Extract recent posts (latest 4 blogs)
  private extractRecentPosts(): void {
    // Sort blogs by published_at in descending order and take first 4
    this.recentPosts = [...this.blogs]
      .sort((a, b) => {
        const dateA = new Date(a.published_at);
        const dateB = new Date(b.published_at);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4);
  }

  // Extract recent offers (latest 4 offers)
  private extractRecentOffers(): void {
    // Sort offers by created_at in descending order and take first 4
    this.recentOffers = [...this.offers]
      .sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4);
  }
}
