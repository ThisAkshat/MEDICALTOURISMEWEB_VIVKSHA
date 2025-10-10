import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service'; // ✅ import BannerService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass, NgIf, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  banner: Banner | null = null; // 🔹 Login banner

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private bannerService: BannerService // ✅ inject banner service
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.checkForSignupMessage();
    this.loadBanner();
  }

  initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginForm.valueChanges.subscribe(() => {
      if (this.successMessage || this.errorMessage) {
        this.successMessage = '';
        this.errorMessage = '';
      }
    });
  }

  checkForSignupMessage() {
    this.route.queryParams.subscribe(params => {
      if (params['message'] === 'signup-complete') {
        const email = params['email'] || 'your email';
        this.successMessage = `Signup complete! Please check ${email} and verify your account before logging in.`;

        if (params['email']) {
          this.loginForm.patchValue({ email: params['email'] });
        }

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          console.error('Login error:', error);
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // 🔹 Load Login banner
  loadBanner() {
    this.bannerService.getBannerByTitle('Login').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Login banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading login banner:', err)
    });
  }
}
