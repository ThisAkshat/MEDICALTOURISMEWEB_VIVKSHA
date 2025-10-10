import { environment } from '../../../environments/environment';

export class ApiEndpoints {
  private static readonly endpoints = environment.apiEndpoints;

  static get auth() {
    return {
      login: this.endpoints.auth.login,
      register: this.endpoints.auth.register,
      forgotPassword: this.endpoints.auth.forgotPassword,
      resetPassword: this.endpoints.auth.resetPassword
    };
  }

  static get user() {
    return {
      profile: this.endpoints.user.profile,
      updateProfile: this.endpoints.user.updateProfile
    };
  }

  static get treatments() {
    return {
      list: this.endpoints.treatments.list,
      details: (id: string | number) => this.endpoints.treatments.details.replace(':id', id.toString()),
      search: this.endpoints.treatments.search
    };
  }

  static get hospitals() {
    return {
      list: this.endpoints.hospitals.list,
      details: (id: string | number) => this.endpoints.hospitals.details.replace(':id', id.toString()),
      search: this.endpoints.hospitals.search
    };
  }

  static get doctors() {
    return {
      list: this.endpoints.doctors.list,
      details: (id: string | number) => this.endpoints.doctors.details.replace(':id', id.toString()),
      search: this.endpoints.doctors.search
    };
  }

  static get bookings() {
    return {
      create: this.endpoints.bookings.create,
      list: this.endpoints.bookings.list,
      details: (id: string | number) => this.endpoints.bookings.details.replace(':id', id.toString()),
      cancel: (id: string | number) => this.endpoints.bookings.cancel.replace(':id', id.toString())
    };
  }
}