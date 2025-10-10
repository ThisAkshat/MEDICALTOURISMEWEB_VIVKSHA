import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineConsultation } from './online-consultation';

describe('OnlineConsultation', () => {
  let component: OnlineConsultation;
  let fixture: ComponentFixture<OnlineConsultation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineConsultation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineConsultation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
