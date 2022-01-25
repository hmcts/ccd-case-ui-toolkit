import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CaseFlagFieldState } from './enums';
import { WriteCaseFlagFieldComponent } from './write-case-flag-field.component';

describe('WriteCaseFlagFieldComponent', () => {
  let component: WriteCaseFlagFieldComponent;
  let fixture: ComponentFixture<WriteCaseFlagFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      declarations: [ WriteCaseFlagFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteCaseFlagFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have called ngOnInit, created a FormGroup with a validator, and set the correct Case Flag field starting state', () => {
    expect(component.ngOnInit).toBeTruthy();
    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.validator).toBeTruthy();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_LOCATION);
    // Initial validity of the form is expected to be false because it is at the starting state (only valid at the final state)
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
  });

  it('should move the Case Flag field to the next state, and update the validity if it is at the final state (FLAG_SUMMARY)', () => {
    spyOn(component.formGroup, 'updateValueAndValidity').and.callThrough();
    const nextButton = fixture.debugElement.nativeElement.querySelector('button[type=button]');
    nextButton.click();
    fixture.detectChanges();
    // Field is expected to move to next state but not the final one yet
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_COMMENTS);
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
    nextButton.click();
    fixture.detectChanges();
    // Field is expected to move to final state and the form to become valid
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_SUMMARY);
    expect(component.isAtFinalState()).toBe(true);
    // Form validation should not be called until reaching the final state, hence expecting only one call
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalledTimes(1);
    expect(component.formGroup.errors).toBeNull();
    expect(component.formGroup.valid).toBe(true);
  });
});
