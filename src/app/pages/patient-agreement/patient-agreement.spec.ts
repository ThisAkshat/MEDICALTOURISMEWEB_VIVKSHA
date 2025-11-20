import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAgreement } from './patient-agreement';

describe('PatientAgreement', () => {
  let component: PatientAgreement;
  let fixture: ComponentFixture<PatientAgreement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientAgreement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAgreement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
