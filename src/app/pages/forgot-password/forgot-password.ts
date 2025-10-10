import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import BannerService

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  banner: Banner | null = null; // 🔹 Forgot Password banner

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private bannerService: BannerService // ✅ inject banner service
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadBanner();
  }

  initializeForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          this.forgotPasswordForm.reset();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to send reset link. Please try again.';
          console.error('Forgot password error:', error);
        }
      });
    } else {
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        this.forgotPasswordForm.get(key)?.markAsTouched();
      });
    }
  }

  // 🔹 Load Forgot Password banner
  loadBanner() {
    this.bannerService.getBannerByTitle('Forgot Password').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Forgot Password banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading forgot password banner:', err)
    });
  }
}
