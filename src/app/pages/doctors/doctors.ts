import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service';
import { Title, Meta } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctors.html',
  styleUrls: ['./doctors.css']
})
export class Doctors implements OnInit {
    generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
  doctors: (Doctor & { hospitalName?: string })[] = [];
  hospitalCache: { [id: number]: string } = {};
  loading = true;

  // Filter variables
  locations: string[] = [];
  specializations: string[] = [];
  selectedLocation: string = '';
  selectedSpecialization: string = '';

  // Dropdown open/close states
  isLocationOpen = false;
  isSpecializationOpen = false;

  // Banner
  banner: Banner | null = null;

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private bannerService: BannerService,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private metaService: Meta
  ) {}

ngOnInit(): void {

  this.loadBanner();
  this.loadFilters();
  this.loadDoctors();

  /* ================= TITLE ================= */

  this.titleService.setTitle(
    'Dr. Rajesh Sharma – Leading Cardiac Surgeon in India | CureOn'
  );

  /* ================= BASIC META ================= */

  this.metaService.updateTag({
    name: 'description',
    content: 'Dr. Rajesh Sharma is a leading cardiac surgeon in India with extensive experience in heart bypass and advanced cardiac procedures. Consult through CureOn Medical Tourism for international patient assistance.'
  });

  this.metaService.updateTag({
    name: 'robots',
    content: 'index, follow'
  });

  /* ================= OPEN GRAPH ================= */

  this.metaService.updateTag({
    property: 'og:type',
    content: 'profile'
  });

  this.metaService.updateTag({
    property: 'og:url',
    content: 'https://www.cureonmedicaltourism.com/doctors/dr-rajesh-sharma-cardiac-surgeon-india'
  });

  this.metaService.updateTag({
    property: 'og:title',
    content: 'Dr. Rajesh Sharma – Cardiac Surgeon in India'
  });

  this.metaService.updateTag({
    property: 'og:description',
    content: 'Experienced cardiac surgeon in India specializing in heart bypass surgery and advanced cardiac procedures for international patients.'
  });

  this.metaService.updateTag({
    property: 'og:image',
    content: 'https://www.cureonmedicaltourism.com/images/doctors/dr-rajesh-sharma.jpg'
  });

  this.metaService.updateTag({
    property: 'og:site_name',
    content: 'CureOn Medical Tourism'
  });

  /* ================= TWITTER ================= */

  this.metaService.updateTag({
    name: 'twitter:card',
    content: 'summary_large_image'
  });

  this.metaService.updateTag({
    name: 'twitter:title',
    content: 'Dr. Rajesh Sharma – Leading Cardiac Surgeon in India'
  });

  this.metaService.updateTag({
    name: 'twitter:description',
    content: 'Consult Dr. Rajesh Sharma through CureOn Medical Tourism for expert cardiac treatment in India.'
  });

  this.metaService.updateTag({
    name: 'twitter:image',
    content: 'https://www.cureonmedicaltourism.com/images/doctors/dr-rajesh-sharma.jpg'
  });

}

  loadBanner() {
    this.bannerService.getBannerByTitle('Doctors').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          //console.log('✅ Doctors banner loaded:', this.banner);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('❌ Error loading banner:', err)
    });
  }

  loadFilters() {
    this.doctorService.getLocations().subscribe({
      next: (data) => this.locations = data || [],
      error: (err) => console.error('Error loading locations', err)
    });

    this.doctorService.getSpecializations().subscribe({
      next: (data) => this.specializations = data || [],
      error: (err) => console.error('Error loading specializations', err)
    });
  }

  loadDoctors() {
    this.loading = true;

    this.doctorService.getDoctors(0, 100, this.selectedLocation).subscribe({
      next: (data: Doctor[]) => {
        let doctorsList = data;

        if (this.selectedSpecialization) {
          doctorsList = doctorsList.filter(d =>
            d.specialization?.toLowerCase() === this.selectedSpecialization.toLowerCase()
          );
        }

        this.doctors = doctorsList.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

        const uniqueHospitalIds = [...new Set(this.doctors.map(doc => doc.hospital_id))];
        if (uniqueHospitalIds.length === 0) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        let hospitalRequestsCompleted = 0;
        const totalHospitalRequests = uniqueHospitalIds.length;

        const checkAllHospitalsLoaded = () => {
          hospitalRequestsCompleted++;
          if (hospitalRequestsCompleted >= totalHospitalRequests) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        };

        uniqueHospitalIds.forEach((hospitalId) => {
          if (this.hospitalCache[hospitalId]) {
            this.doctors.forEach((doctor, index) => {
              if (doctor.hospital_id === hospitalId) {
                this.doctors[index].hospitalName = this.hospitalCache[hospitalId];
              }
            });
            checkAllHospitalsLoaded();
          } else {
            this.hospitalService.getHospitalById(hospitalId).subscribe({
              next: (hospital: Hospital) => {
                this.hospitalCache[hospitalId] = hospital.name;
                this.doctors.forEach((doctor, index) => {
                  if (doctor.hospital_id === hospitalId) {
                    this.doctors[index].hospitalName = hospital.name;
                  }
                });
                checkAllHospitalsLoaded();
              },
              error: () => {
                this.hospitalCache[hospitalId] = 'Hospital not available';
                this.doctors.forEach((doctor, index) => {
                  if (doctor.hospital_id === hospitalId) {
                    this.doctors[index].hospitalName = 'Hospital not available';
                  }
                });
                checkAllHospitalsLoaded();
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('❌ Error loading doctors:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Toggle dropdown methods
  toggleLocationDropdown(): void {
    this.isLocationOpen = !this.isLocationOpen;
    this.isSpecializationOpen = false;
  }

  toggleSpecializationDropdown(): void {
    this.isSpecializationOpen = !this.isSpecializationOpen;
    this.isLocationOpen = false;
  }

  // Select methods
  selectLocation(loc: string): void {
    this.selectedLocation = loc;
    this.isLocationOpen = false;
    this.onFilterChange();
  }

  selectSpecialization(spec: string): void {
    this.selectedSpecialization = spec;
    this.isSpecializationOpen = false;
    this.onFilterChange();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.isLocationOpen = false;
      this.isSpecializationOpen = false;
    }
  }

  // Original function - unchanged
  onFilterChange() {
    this.loadDoctors();
  }

  getStars(rating: number | null): ('full' | 'half' | 'empty')[] {
    if (rating === null) return Array(5).fill('empty');
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return [
      ...Array(fullStars).fill('full'),
      ...Array(halfStar).fill('half'),
      ...Array(emptyStars).fill('empty')
    ];
  }
}