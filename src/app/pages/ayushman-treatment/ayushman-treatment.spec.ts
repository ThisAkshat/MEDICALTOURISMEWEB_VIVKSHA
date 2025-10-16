import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyushmanTreatment } from './ayushman-treatment';

describe('AyushmanTreatment', () => {
  let component: AyushmanTreatment;
  let fixture: ComponentFixture<AyushmanTreatment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyushmanTreatment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AyushmanTreatment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
