import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import BannerService

interface BlogImage {
  id: number;
  owner_type: string | null;
  owner_id: number | null;
  url: string;
  is_primary: boolean;
  position: number | null;
  uploaded_at: string;
}

interface Blog {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  featured_image: string;
  meta_description: string | null;
  tags: string | null;
  category: string | null;
  author_name: string | null;
  reading_time: number | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  slug: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  images: BlogImage[];
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, NgFor, DatePipe],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css']
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];
  allBlogs: Blog[] = []; // Store original blog list for filtering
  categories: string[] = [];
  recentPosts: Blog[] = [];
  selectedCategory: string | null = null; // Track selected category
  baseUrl = 'http://165.22.223.163:8000'; // API base URL
  banner: Banner | null = null;           // 🔹 Blog banner

  constructor(
    private http: HttpClient, 
    private bannerService: BannerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 🔹 Load Blog Banner
    this.bannerService.getBannerByTitle('Blog').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Blog banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading blog banner:', err)
    });

    // 🔹 Load blogs
    this.http
      .get<Blog[]>(`${this.baseUrl}/api/v1/blogs?skip=0&limit=100&published_only=false&featured_only=false`)
      .subscribe((data) => {
        this.allBlogs = data || []; // Store original list
        this.blogs = [...this.allBlogs]; // Create a copy for display
        this.extractCategories();
        this.extractRecentPosts();
        
        // Check for category filter from query parameters
        this.route.queryParams.subscribe(params => {
          if (params['category']) {
            this.filterByCategory(params['category']);
          }
        });
      });
  }

  getImageUrl(path: string): string {
    return path ? this.baseUrl + path : 'assets/images/blog-img.png';
  }

  // Extract unique categories from blogs
  private extractCategories(): void {
    const allCategories = this.allBlogs
      .map(blog => blog.category)
      .filter(category => category !== null && category !== undefined && category.trim() !== '')
      .map(category => category!.trim().toUpperCase());
    
    // Get unique categories and sort them
    this.categories = [...new Set(allCategories)].sort();
  }

  // Extract recent posts (latest 4 blogs)
  private extractRecentPosts(): void {
    // Sort blogs by published_at or created_at in descending order and take first 4
    this.recentPosts = [...this.allBlogs]
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at);
        const dateB = new Date(b.published_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4);
  }

  // Method to filter blogs by category
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    
    // Filter blogs by the selected category (case-insensitive comparison)
    this.blogs = this.allBlogs.filter(blog => 
      blog.category && blog.category.trim().toUpperCase() === category.toUpperCase()
    );
    
    console.log(`Filtered blogs by category "${category}":`, this.blogs.length, 'results');
  }

  // Method to show all blogs (clear filter)
  showAllBlogs(): void {
    this.selectedCategory = null;
    this.blogs = [...this.allBlogs];
    console.log('Showing all blogs:', this.blogs.length, 'results');
  }
}
