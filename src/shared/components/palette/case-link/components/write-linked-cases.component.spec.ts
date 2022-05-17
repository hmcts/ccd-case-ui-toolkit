import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LinkedCasesState } from '../domain';
import { LinkedCasesPages } from '../enums';
import { WriteLinkedCasesComponent } from './write-linked-cases.component';

describe('WriteLinkedCasesComponent', () => {
  let component: WriteLinkedCasesComponent;
  let fixture: ComponentFixture<WriteLinkedCasesComponent>;

  let router = {
    url: 'linkCases'
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [WriteLinkedCasesComponent],
      providers: [
        { provide: Router, useValue: router }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteLinkedCasesComponent);
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
    // expect(component.linkedCasesPage).toEqual(LinkedCasesPages.LINK_CASE);
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    component.proceedToNextState();
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should isAtFinalState return correct value', () => {
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.isAtFinalState()).toBe(false);
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    expect(component.isAtFinalState()).toBe(true);
  });

  it('should getNextPage return correct page', () => {
    const linkedCasesState1: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    };
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.getNextPage(linkedCasesState1)).toEqual(LinkedCasesPages.LINK_CASE);

    const linkedCasesState2: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.LINK_CASE,
      navigateToNextPage: true
    };
    component.linkedCasesPage = LinkedCasesPages.LINK_CASE;
    expect(component.getNextPage(linkedCasesState2)).toEqual(LinkedCasesPages.CHECK_YOUR_ANSWERS);
  });
});
