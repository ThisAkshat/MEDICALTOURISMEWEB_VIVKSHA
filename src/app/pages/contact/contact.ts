import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service';
import { ContactService, ContactInfo } from 'src/app/core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  treatmentTypes: string[] = [];
  isSubmitted: boolean = false;
  banner: Banner | null = null;
  contactInfo: ContactInfo | null = null;

  // ✅ NEW: Dropdown open/close state
  isDepartmentDropdownOpen = false;

  // ✅ NEW: Selected display value
  selectedDepartmentLabel: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private treatmentService: TreatmentService,
    private bannerService: BannerService,
    private contactService: ContactService,
    private sanitizer: DomSanitizer
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]
      ],
      department: ['', Validators.required],
      query: ['', Validators.required],
    });
  }

  // ✅ NEW: Toggle dropdown
  toggleDepartmentDropdown(): void {
    this.isDepartmentDropdownOpen = !this.isDepartmentDropdownOpen;
  }

  // ✅ NEW: Select department
  selectDepartment(type: string): void {
    this.contactForm.patchValue({ department: type });
    this.selectedDepartmentLabel = type;
    this.isDepartmentDropdownOpen = false;
  }

  // ✅ NEW: Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.custom-select-wrapper')) {
      this.isDepartmentDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    // load Contact banner
    this.bannerService.getBannerByTitle('Contact').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Contact banner loaded:', this.banner);
        }
      },
      error: (err) => console.error('❌ Error loading contact banner:', err)
    });

    // load contact information
    this.contactService.getContactInfo().subscribe({
      next: (contactInfo) => {
        this.contactInfo = contactInfo;
        console.log('✅ Contact info loaded:', this.contactInfo);
      },
      error: (err) => console.error('❌ Error loading contact info:', err)
    });

    // fetch treatment types on load
    this.treatmentService.getTreatmentTypes().subscribe({
      next: (types) => this.treatmentTypes = types,
      error: (err) => console.error('Error loading treatment types ❌', err)
    });
  }

  // ✅ NEW: Generate dynamic Google Maps embed URL with pin pointer
  getMapUrl(): SafeResourceUrl {
    let mapUrl: string;
    
    if (this.contactInfo?.address) {
      const encodedAddress = encodeURIComponent(this.contactInfo.address);
      // Simple Google Maps search URL - automatically shows red pin marker for the searched address
      mapUrl = `https://maps.google.com/maps?width=100%25&height=400&hl=en&q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;
    } else {
      // Fallback to default Indore location with pin marker (original embed URL already has marker)
      mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14717.094017012312!2d75.88652043885348!3d22.755229057468668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396302af403406fb%3A0x5b50834b117f8bab!2sVijay%20Nagar%2C%20Scheme%20No%2054%2C%20Indore%2C%20Madhya%20Pradesh%20452010!5e0!3m2!1sen!2sin!4v1758971607856!5m2!1sen!2sin";
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const payload = {
        first_name: this.contactForm.value.firstName,
        last_name: this.contactForm.value.lastName,
        email: this.contactForm.value.email,
        phone: String(this.contactForm.value.mobile),
        subject: 'Contact Form Submission',
        message: this.contactForm.value.query,
        service_type: this.contactForm.value.department
      };

      this.http.post('http://165.22.223.163:8000/api/v1/contact', payload).subscribe({
        next: (res) => {
          console.log('Form Submitted ✅', res);
          this.isSubmitted = true;
          this.contactForm.reset();
          // ✅ Reset dropdown label
          this.selectedDepartmentLabel = '';
        },
        error: (err) => {
          console.error('Form submission error ❌', err);
          alert('Something went wrong. Please try again.');
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}