import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors.html',
  styleUrls: ['./doctors.css']
})
export class Doctors implements OnInit {
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBanner();
    this.loadFilters();
    this.loadDoctors();
  }

  loadBanner() {
    this.bannerService.getBannerByTitle('Doctors').subscribe({
      next: (banner) => {
        if (banner) {
          this.banner = banner;
          console.log('✅ Doctors banner loaded:', this.banner);
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