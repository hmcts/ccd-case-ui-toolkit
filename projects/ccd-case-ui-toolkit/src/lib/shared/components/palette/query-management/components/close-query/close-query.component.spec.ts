import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseQueryComponent } from './close-query.component';
import { MockRpxTranslatePipe } from '../../../../../../shared/test/mock-rpx-translate.pipe';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

describe('CloseQueryComponent', () => {
  let component: CloseQueryComponent;
  let fixture: ComponentFixture<CloseQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule],
      declarations: [
        CloseQueryComponent,
        MockRpxTranslatePipe
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CloseQueryComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      closeQuery: new FormControl(false)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
