import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectFlagTypeErrorMessage } from '../..';
import { SelectFlagTypeComponent } from './select-flag-type.component';

describe('SelectFlagTypeComponent', () => {
  let component: SelectFlagTypeComponent;
  let fixture: ComponentFixture<SelectFlagTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SelectFlagTypeComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFlagTypeComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      'flagType': new FormControl(''),
      'urgent-case': new FormControl(''),
      'vulnerable-user': new FormControl(''),
      'other': new FormControl(''),
      'otherFlagTypeDescription': new FormControl('')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set flag type selected if radio button selected', () => {
    const radioOtherElement = fixture.debugElement.nativeElement.querySelector('#flag-type-other');
    radioOtherElement.click();
    expect(component.flagTypeSelected).toEqual('other');
  });

  it('should fail validation if flag type is not selected', () => {
    spyOn(component, 'onNext');
    const nextButtonElement = fixture.debugElement.nativeElement.querySelector('.button');
    nextButtonElement.click();
    expect(component.onNext).toHaveBeenCalled();
  });

  it ('should fail vaildation if other flag type selected and description not entered', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-other').click();
    const otherFlagTypeDescriptionElement = nativeElement.querySelector('#other-flag-type-description');
    expect(otherFlagTypeDescriptionElement).toBeDefined();
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    const errorSummaryElement = nativeElement.querySelector('#flag-type-error-message');
    expect(errorSummaryElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED);
  });

  it ('should fail vaildation if other flag type selected and description entered is more than 80 characters', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-other').click();
    fixture.detectChanges();
    const otherFlagTypeDescriptionElement: HTMLInputElement = nativeElement.querySelector('#other-flag-type-description');
    expect(otherFlagTypeDescriptionElement).toBeDefined();
    fixture.detectChanges();
    otherFlagTypeDescriptionElement.value = 'OtherFlagTypeDescriptionTestWithMoreThanEightyCharactersShouldFailTheValidationAsExpected';
    otherFlagTypeDescriptionElement.dispatchEvent(new Event('input'));
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    const errorSummaryElement = nativeElement.querySelector('#flag-type-error-message');
    expect(errorSummaryElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED);
  });
});
