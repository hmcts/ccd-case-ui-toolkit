import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcdCloseQueryComponent } from './ccd-close-query.component';

describe('CcdCloseQueryComponent', () => {
  let component: CcdCloseQueryComponent;
  let fixture: ComponentFixture<CcdCloseQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcdCloseQueryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CcdCloseQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
