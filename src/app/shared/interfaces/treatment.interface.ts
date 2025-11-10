import { Doctor } from 'src/app/core/services/doctors.service';

export interface Treatment {
  id: number;
  name: string;
  short_description: string;
  long_description: string;
  treatment_type: string;
  price_min: number | null;
  price_max: number | null;
  price_exact: number | null;
  rating: number | null;
  hospital_id: number | null;
  other_hospital_name?: string | null;
  doctor_id: number | null;
  other_doctor_name?: string | null;
  location: string;
  features: string | null;
  is_ayushman: boolean;
  Includes: string | null;
  excludes: string | null;
  is_featured: boolean;
  created_at: string;
  images?: TreatmentImage[];
  faqs?: any[];
  faq1_question?: string | null;
  faq1_answer?: string | null;
  faq2_question?: string | null;
  faq2_answer?: string | null;
  faq3_question?: string | null;
  faq3_answer?: string | null;
  faq4_question?: string | null;
  faq4_answer?: string | null;
  faq5_question?: string | null;
  faq5_answer?: string | null;
  // Associated doctors returned by the API
  associated_doctors?: Doctor[];
}

export interface TreatmentImage {
  id: number;
  owner_type?: string | null;
  owner_id?: number | null;
  url: string;
  is_primary: boolean;
  position: number;
  uploaded_at: string;
}


export interface TreatmentSearchParams {
  skip?: number;
  limit?: number;
  location?: string;
  treatment_type?: string;
  featured_only?: boolean;
  ayushman_only?: boolean;
}