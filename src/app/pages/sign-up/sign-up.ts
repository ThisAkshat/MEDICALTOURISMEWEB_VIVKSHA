import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import BannerService

@Component({
  selector: 'app-sign-up',
  standalone: true, 
  imports: [NgClass, NgIf, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUp implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  banner: Banner | null = null; // 🔹 Sign Up banner

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private bannerService: BannerService // ✅ inject banner service
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadBanner();
  }

  initializeForm() {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const signupData = this.signupForm.value;

      this.authService.signup(signupData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/login'], { 
            queryParams: { 
              message: 'signup-complete',
              email: signupData.email 
            } 
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
          console.error('Signup error:', error);
        }
      });
    } else {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  // 🔹 Load Sign Up banner
  loadBanner() {
    this.bannerService.getBannerByTitle('Sign Up').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Sign Up banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading sign up banner:', err)
    });
  }
}
