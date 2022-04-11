import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { FlagType } from '../../../../../domain/case-flag';
import { CaseFlagRefdataService } from '../../../../../services/case-flag';
import { CaseFlagFieldState, SelectFlagTypeErrorMessage } from '../../enums';
import { SelectFlagTypeComponent } from './select-flag-type.component';

import createSpyObj = jasmine.createSpyObj;

describe('SelectFlagTypeComponent', () => {
  let component: SelectFlagTypeComponent;
  let fixture: ComponentFixture<SelectFlagTypeComponent>;
  let caseFlagRefdataService: jasmine.SpyObj<CaseFlagRefdataService>;
  const otherFlagType = {
    name: 'Other',
    hearingRelevant: true,
    flagComment: true,
    flagCode: 'OT0001',
    isParent: false,
    path: ['Party'],
    childFlags: []
  } as FlagType;

  beforeEach(async(() => {
    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>('caseFlagRefdataService', ['getCaseFlagsRefdata']);
    caseFlagRefdataService.getCaseFlagsRefdata.and.returnValue(of([
      {
        name: 'Party',
        hearingRelevant: false,
        flagComment: false,
        flagCode: 'CATGRY',
        isParent: true,
        path: [''],
        childFlags: [
          {
            name: 'Reasonable adjustment',
            hearingRelevant: false,
            flagComment: false,
            flagCode: 'CATGRY',
            isParent: true,
            path: ['Party'],
            childFlags: []
          },
          {
            name: 'Potentially suicidal',
            hearingRelevant: true,
            flagComment: false,
            flagCode: 'PF0003',
            isParent: false,
            path: ['Party'],
            childFlags: []
          },
          otherFlagType
        ]
      }
    ]));
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SelectFlagTypeComponent],
      providers: [
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFlagTypeComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      'flagType': new FormControl(''),
      'otherFlagTypeDescription': new FormControl('')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set flag type selected if radio button selected', () => {
    // Third radio button (with index 2) expected to be "Other" from test data
    const radioOtherElement = fixture.debugElement.nativeElement.querySelector('#flag-type-2');
    radioOtherElement.click();
    expect(component.selectedFlagType).toEqual(otherFlagType);
    expect(component.otherFlagTypeSelected).toBe(true);
  });

  it('should emit to parent if the validation succeeds', () => {
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-0').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    expect(component.caseFlagStateEmitter.emit)
      .toHaveBeenCalledWith({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: [] });
  });

  it('should fail vaildation if other flag type selected and description not entered', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-2').click();
    const otherFlagTypeDescriptionElement = nativeElement.querySelector('#other-flag-type-description');
    expect(otherFlagTypeDescriptionElement).toBeDefined();
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    const errorSummaryElement = nativeElement.querySelector('#flag-type-error-message');
    expect(errorSummaryElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED);
  });

  it('should fail vaildation if other flag type selected and description entered is more than 80 characters', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-2').click();
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
