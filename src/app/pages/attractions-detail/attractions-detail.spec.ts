import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttractionsDetail } from './attractions-detail';

describe('AttractionsDetail', () => {
  let component: AttractionsDetail;
  let fixture: ComponentFixture<AttractionsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttractionsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttractionsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
