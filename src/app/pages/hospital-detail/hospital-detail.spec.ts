import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalDetail } from './hospital-detail';

describe('HospitalDetail', () => {
  let component: HospitalDetail;
  let fixture: ComponentFixture<HospitalDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
