import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'treatments',
    loadComponent: () => import('./pages/treatments/treatments').then(m => m.Treatments)
  },
  {
    path: 'treatments',
    loadComponent: () => import('./pages/treatments/treatments').then(m => m.Treatments)
  },
  {
    path: 'associate-hospital',
    loadComponent: () => import('./pages/associate-hospital/associate-hospital').then(m => m.AssociateHospital)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./pages/doctors/doctors').then(m => m.Doctors)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up').then(m => m.SignUp)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'online-consultation',
    loadComponent: () => import('./pages/online-consultation/online-consultation').then(m => m.OnlineConsultation)
  },
  {
    path: 'hospital-detail/:id',
    loadComponent: () => import('./pages/hospital-detail/hospital-detail').then(m => m.HospitalDetail)
  },
  {
    path: 'ayushman-treatment',
    loadComponent: () => import('./pages/ayushman-treatment/ayushman-treatment').then(m => m.AyushmanTreatment)
  },
  {
    path: 'treatment-detail/:id',
    loadComponent: () => import('./pages/treatment-detail/treatment-detail').then(m => m.TreatmentDetail)
  },
  {
    path: 'ayushman-treatment-detail',
    loadComponent: () => import('./pages/ayushman-treatment-detail/ayushman-treatment-detail').then(m => m.AyushmanTreatmentDetail)
  },
  {
    path: 'blog',
    loadComponent: () =>
    import('./pages/blog/blog').then(m => m.BlogComponent)
  },
  {
    path: 'blog-detail/:id',
    loadComponent: () =>
    import('./pages/blog-detail/blog-detail').then(m => m.BlogDetailComponent)
  },
  {
    path: 'attractions-detail/:id',
    loadComponent: () =>
    import('./pages/attractions-detail/attractions-detail').then(m => m.AttractionsDetail)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy)
  },
  {
    path: 'terms-conditions',
    loadComponent: () => import('./pages/terms-conditions/terms-conditions').then(m => m.TermsConditions)
  },
  {
    path: 'attractions',
    loadComponent: () => import('./pages/attractions/attractions').then(m => m.Attractions)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound)
  },
  {
    path: 'doctor-details/:id',
    loadComponent: () => import('./pages/doctor-details/doctor-details').then(m => m.DoctorDetails)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search-results/search-results.component').then(m => m.SearchResultsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
