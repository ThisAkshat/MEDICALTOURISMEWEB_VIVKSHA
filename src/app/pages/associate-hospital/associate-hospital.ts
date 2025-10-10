import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { BannerService, Banner } from 'src/app/core/services/banner.service';

@Component({
  selector: 'app-associate-hospital',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associate-hospital.html',
  styleUrls: ['./associate-hospital.css']
})
export class AssociateHospital implements OnInit {
  hospitals: Hospital[] = [];
  banner: Banner | undefined;
  loading = true;

  constructor(
    private hospitalService: HospitalService,
    private bannerService: BannerService
  ) {}

  ngOnInit(): void {
    // Fetch hospitals
    this.hospitalService.getHospitals().subscribe({
      next: (data) => {
        this.hospitals = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading hospitals:', err);
        this.loading = false;
      }
    });

    // Fetch banner for Associate Hospital page
    this.bannerService.getBannerByTitle('Associate Hospital').subscribe({
      next: (banner) => {
        this.banner = banner;
      },
      error: (err) => console.error('Error loading banner:', err)
    });
  }
}
