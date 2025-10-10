import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateHospital } from './associate-hospital';

describe('AssociateHospital', () => {
  let component: AssociateHospital;
  let fixture: ComponentFixture<AssociateHospital>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociateHospital]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociateHospital);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
