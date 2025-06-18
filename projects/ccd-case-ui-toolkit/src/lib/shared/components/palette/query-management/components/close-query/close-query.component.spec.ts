import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseQueryComponent } from './close-query.component';
import { MockRpxTranslatePipe } from '../../../../../../shared/test/mock-rpx-translate.pipe';

describe('CloseQueryComponent', () => {
  let component: CloseQueryComponent;
  let fixture: ComponentFixture<CloseQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CloseQueryComponent,
        MockRpxTranslatePipe
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CloseQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
