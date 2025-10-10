import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  // List 1: Company Links
  footerlink1 = [
    { label: 'Home', route: '/' },
    { label: 'About Us', route: '/about' },
    { label: 'Privacy Policy', route: '/privacy-policy' },
    { label: 'Terms And Conditions', route: '/terms-conditions' },
    { label: 'Contact', route: '/contact' }
  ];

  // List 2: Services Links
  footerlink2 = [
    { label: ' Surgical Treatment Plan', route: '/treatments' },
    { label: ' Online Consultation', route: '/online-consultation' },
    { label: 'Associate Hospital', route: '/associate-hospital' },
    { label: 'Our Doctors', route: '/doctors' },
    { label: 'Articles', route: '/blog' }
  ];

  // List 3: Support Links
  footerlink3 = [
    { label: 'FAQs', route: '/' },
    { label: 'Help Center', route: '/' },
    { label: 'Privacy Policy', route: '/' },
    { label: 'Terms of Service', route: '/' }
  ];

  // Newsletter input
  email: string = '';

  subscribe() {
    if (this.email) {
      console.log('Subscribed with:', this.email);
      alert(`Thank you for subscribing, ${this.email}!`);
      this.email = '';
    } else {
      alert('Please enter a valid email.');
    }
  }
}
