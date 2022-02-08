import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
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

  it('should call submit form if next button is clicked', () => {
    spyOn(component, 'onSubmit');
    expect(component.validationErrors.length).toEqual(0);
    const nextButtonElement = fixture.debugElement.nativeElement.querySelector('.button');
    nextButtonElement.click();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it ('should fail vaildation if other flag type selected and description not entered', () => {
    fixture.debugElement.nativeElement.querySelector('#flag-type-other').click();
    fixture.debugElement.nativeElement.querySelector('.button').click();
    // TODO: Will be implemented further once this component is completely plugged in to the wizard
  });

  it ('should fail vaildation if other flag type selected and description entered is more than 80 characters', () => {
    fixture.debugElement.nativeElement.querySelector('#flag-type-other').click();
    const otherFlagTypeDescriptionElement = fixture.debugElement.nativeElement.querySelector('#other-flag-type-description');
    expect(otherFlagTypeDescriptionElement).toBeDefined();
    otherFlagTypeDescriptionElement.text = 'OtherFlagTypeDescriptionTestWithMoreThanEightyCharactersShouldFailTheValidationAsExpected';
    fixture.debugElement.nativeElement.querySelector('.button').click();
    // TODO: Will be implemented further once this component is completely plugged in to the wizard
  });
});
