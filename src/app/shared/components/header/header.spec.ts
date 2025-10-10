import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  link?: string;
  exact?: boolean;
  icon?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  menuItems: MenuItem[] = [
    { label: 'Home', link: '/', exact: true },
    { label: 'About', link: '/about' },

    // 🔽 Dropdown Example
    { 
      label: 'Treatments Plan',
      children: [
        { label: 'Physiotherapy', link: '/treatments/physiotherapy' },
        { label: 'Surgery', link: '/treatments/surgery' },
        { label: 'Rehabilitation', link: '/treatments/rehab' }
      ]
    },

    { label: 'Associate Hospital', link: '/hospitals' },
    { label: 'Our Doctors', link: '/doctors' },
    { label: 'Articles', link: '/articles' },
    { label: 'Contact', link: '/contact' },
    { label: 'Login', link: '/login', icon: 'fa-regular fa-circle-user' }
  ];
}
