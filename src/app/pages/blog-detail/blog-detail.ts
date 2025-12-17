import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe, NgFor, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
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
  baseUrl = 'https://portal.cureonmedicaltourism.com';
  banner: Banner | null = null; // 🔹 Blog Detail banner

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private bannerService: BannerService,
    private router: Router,
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // from /blog/:id
    if (id) {
      this.http
        .get<BlogDetail>(`${this.baseUrl}/api/v1/blogs/${id}`)
        .subscribe((data) => {
          this.blog = data;
          this.setMetaTagsForBlog(this.blog);
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
          //console.log('✅ Blog Detail banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading blog detail banner:', err)
    });
  }

  getImageUrl(path: string): string {
    return path ? this.baseUrl + path : 'assets/images/blog-img.png';
  }

  private stripHtml(html = ''): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private setMetaTagsForBlog(blog: BlogDetail): void {
    if (!blog) return;

    const title = `${blog.title} - Cureon Medical Tourism`;
    const description = (blog.excerpt && blog.excerpt.trim()) || this.stripHtml(blog.content).slice(0, 160);
    const image = this.getImageUrl(blog.featured_image || '');
    const canonicalUrl = `${this.document?.location?.origin || ''}/blog-detail/${blog.id}`;

    try {
      this.titleService.setTitle(title);

      // Basic meta
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ name: 'keywords', content: '' });

      // Open Graph
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:type', content: 'article' });
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
      if (image) this.meta.updateTag({ property: 'og:image', content: image });

      // Twitter
      this.meta.updateTag({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      if (image) this.meta.updateTag({ name: 'twitter:image', content: image });

      // Canonical link
      let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
      if (link) {
        link.href = canonicalUrl;
      } else {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', canonicalUrl);
        this.document.head.appendChild(link);
      }

      // JSON-LD structured data for Article
      const ldId = 'blog-json-ld';
      const existing = this.document.getElementById(ldId);
      if (existing) existing.remove();

      const ld = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: description,
        image: image || undefined,
        datePublished: blog.published_at || undefined,
        author: {
          '@type': 'Person',
          name: (blog as any).author_name || 'Cureon Medical Tourism'
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      };

      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = ldId;
      script.text = JSON.stringify(ld);
      this.document.head.appendChild(script);
    } catch (err) {
      // Failsafe: don't break the page
      console.warn('Failed to set meta tags for blog:', err);
    }
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
