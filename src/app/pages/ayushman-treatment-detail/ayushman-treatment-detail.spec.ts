import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyushmanTreatmentDetail } from './ayushman-treatment-detail';

describe('AyushmanTreatmentDetail', () => {
  let component: AyushmanTreatmentDetail;
  let fixture: ComponentFixture<AyushmanTreatmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyushmanTreatmentDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AyushmanTreatmentDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
