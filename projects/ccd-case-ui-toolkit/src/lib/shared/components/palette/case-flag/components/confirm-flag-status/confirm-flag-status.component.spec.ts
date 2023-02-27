import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ConfirmFlagStatusComponent } from './confirm-flag-status.component';

describe('ConfirmFlagStatusComponent', () => {
  let component: ConfirmFlagStatusComponent;
  let fixture: ComponentFixture<ConfirmFlagStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ConfirmFlagStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmFlagStatusComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    // Deliberately omitted fixture.detectChanges() here to allow for a different default status to be set for each
    // test
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should pre-select the flag status according to the default status of "Requested"', () => {
    component.defaultStatus = 'Requested';
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // First radio button with status "Requested" is expected to be selected
    expect(radioButtons[0].checked).toBe(true);
    expect(radioButtons[1].checked).toBe(false);
    expect(radioButtons[2].checked).toBe(false);
  });

  it('should pre-select the flag status according to the default status of "Active"', () => {
    component.defaultStatus = 'Active';
    fixture.detectChanges();
    const radioButtons = fixture.debugElement.nativeElement.querySelectorAll('.govuk-radios__input') as HTMLInputElement[];
    // Second radio button with status "Active" is expected to be selected
    expect(radioButtons[0].checked).toBe(false);
    expect(radioButtons[1].checked).toBe(true);
    expect(radioButtons[2].checked).toBe(false);
  });
});
