import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentDetail } from './treatment-detail';

describe('TreatmentDetail', () => {
  let component: TreatmentDetail;
  let fixture: ComponentFixture<TreatmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreatmentDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreatmentDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
