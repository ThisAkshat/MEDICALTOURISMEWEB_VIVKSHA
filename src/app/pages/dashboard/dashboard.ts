import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/interfaces/api.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading = true;
  errorMessage = '';
  private subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.subscribeToUserChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private subscribeToUserChanges() {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (!user && !this.isLoading) {
        // User logged out, redirect to login
        this.router.navigate(['/login']);
      }
    });
    this.subscription.add(userSub);
  }

  private loadUserProfile() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile. Please try again.';
        console.error('Profile load error:', error);
        
        // If unauthorized, redirect to login
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
