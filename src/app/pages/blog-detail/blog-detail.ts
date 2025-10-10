import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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

interface BlogDetail {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  images: { id: number; url: string }[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, NgFor, DatePipe],
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.css']
})
export class BlogDetailComponent implements OnInit {
  blog!: BlogDetail;
  allBlogs: Blog[] = [];
  categories: string[] = [];
  recentPosts: Blog[] = [];
  baseUrl = 'http://165.22.223.163:8000';
  banner: Banner | null = null; // 🔹 Blog Detail banner

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private bannerService: BannerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // from /blog/:id
    if (id) {
      this.http
        .get<BlogDetail>(`${this.baseUrl}/api/v1/blogs/${id}`)
        .subscribe((data) => {
          this.blog = data;
        });
    }

    // 🔹 Load all blogs for categories and recent posts
    this.http
      .get<Blog[]>(`${this.baseUrl}/api/v1/blogs?skip=0&limit=100&published_only=false&featured_only=false`)
      .subscribe((data) => {
        this.allBlogs = data || [];
        this.extractCategories();
        this.extractRecentPosts();
      });

    // 🔹 Load Blog Detail Banner
    this.bannerService.getBannerByTitle('Blog Detail').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Blog Detail banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading blog detail banner:', err)
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

  // Navigate to blog page with category filter
  filterByCategory(category: string): void {
    this.router.navigate(['/blog'], { 
      queryParams: { category: category }
    });
  }
}
