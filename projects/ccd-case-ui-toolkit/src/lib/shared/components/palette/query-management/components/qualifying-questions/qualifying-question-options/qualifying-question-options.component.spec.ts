import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { MockRpxTranslatePipe } from '../../../../../../../shared/test/mock-rpx-translate.pipe';
import { QualifyingQuestionsErrorMessage } from '../../../enums';
import { QualifyingQuestionOptionsComponent } from './qualifying-question-options.component';
import { QualifyingQuestionService } from '../../../services';

describe('QualifyingQuestionOptionsComponent', () => {
  let component: QualifyingQuestionOptionsComponent;
  let fixture: ComponentFixture<QualifyingQuestionOptionsComponent>;
  const router = {
    navigate: jasmine.createSpy('navigate')
  };
  const caseId = '12345';
  const mockRoute = {
    snapshot: {
      params: {
        cid: caseId
      }
    }
  };

  const qualifyingQuestionService = jasmine.createSpyObj('qualifyingQuestionService', ['getQualifyingQuestionSelection']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QualifyingQuestionOptionsComponent,
        MockRpxTranslatePipe
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: router },
        { provide: QualifyingQuestionService, useValue: qualifyingQuestionService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualifyingQuestionOptionsComponent);
    component = fixture.componentInstance;
    component.qualifyingQuestionsControl = new FormControl(null, Validators.required);
    component.qualifyingQuestions$ = of([
      {
        markdown: '',
        name: 'Response to directions',
        url: '/response-to-directions'
      }
    ]);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the link to case details queries tab', () => {
    component.click();
    expect(router.navigate).toHaveBeenCalledWith(['cases', 'case-details', '12345'], { fragment: 'Queries' });
  });

  describe('displayError', () => {
    describe('true', () => {
      it('should return true when qualifyingQuestionsControl is touched and has required error', () => {
        component.qualifyingQuestionsControl.markAsTouched();
        component.qualifyingQuestionsControl.setValue(null);
        expect(component.displayError).toBe(true);
      });
    });

    describe('false', () => {
      it('should return false when qualifyingQuestionsControl is not touched', () => {
        expect(component.qualifyingQuestionsControl.touched).toBe(false);
        expect(component.displayError).toBe(false);
      });

      it('should return false when qualifyingQuestionsControl is touched and does not have required error', () => {
        component.qualifyingQuestionsControl.markAsTouched();
        component.qualifyingQuestionsControl.setValue('test');
        expect(component.displayError).toBe(false);
      });
    });
  });

  describe('should display errors in template', () => {
    beforeEach(() => {
      component.qualifyingQuestionsControl.markAsTouched();
      component.qualifyingQuestionsControl.setValue(null);
      fixture.detectChanges();
    });

    it('should have the govuk-form-group-error class', () => {
      const formGroupEl = fixture.debugElement.query(By.css('.govuk-form-group'));
      expect(formGroupEl.nativeElement.classList).toContain('govuk-form-group--error');
    });

    it('should display govuk-error-message', () => {
      const errorMessageEl = fixture.debugElement.query(By.css('.govuk-error-message'));
      expect(errorMessageEl).toBeTruthy();
      expect(errorMessageEl.nativeElement.textContent.trim()).toBe(`Error: ${QualifyingQuestionsErrorMessage.SELECT_AN_OPTION}`);
    });

    it('should initialize qualifyingQuestionsControl with saved selection if available', () => {
      const savedSelection = 'saved-option';
      qualifyingQuestionService.getQualifyingQuestionSelection.and.returnValue(savedSelection);

      component.ngOnInit();

      expect(qualifyingQuestionService.getQualifyingQuestionSelection).toHaveBeenCalled();
      expect(component.qualifyingQuestionsControl.value).toBe(savedSelection);
    });
  });
});
