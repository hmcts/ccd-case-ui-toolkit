import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CaseEditPageComponent } from '../../case-editor';
import { LinkedCasesPages } from './enums';
import { WriteLinkedCasesFieldComponent } from './write-linked-cases-field.component';

describe('WriteLinkedCasesFieldComponent', () => {
  let component: WriteLinkedCasesFieldComponent;
  let fixture: ComponentFixture<WriteLinkedCasesFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [WriteLinkedCasesFieldComponent],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteLinkedCasesFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have called ngOnInit, created a FormGroup with a validator, and set the correct linked cases starting page', () => {
    expect(component.ngOnInit).toBeTruthy();
    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.validator).toBeTruthy();
    expect(component.linkedCasesPage).toBe(LinkedCasesPages.BEFORE_YOU_START);
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
  });

  it('should isAtFinalState return correct state', () => {
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    expect(component.isAtFinalState()).toEqual(true);
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.isAtFinalState()).toEqual(false);
  });

  it('should proceedToNextState navigate to correct page', () => {
    spyOn(component.formGroup, 'updateValueAndValidity');
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    component.proceedToNextState();
    expect(component.formGroup.updateValueAndValidity).not.toHaveBeenCalled();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.LINK_CASE);
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    component.proceedToNextState();
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
  })
});
