import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { MockRpxTranslatePipe } from '../../../../../../shared/test/mock-rpx-translate.pipe';
import { QualifyingQuestionsComponent } from './qualifying-questions.component';
import { By } from '@angular/platform-browser';
import { QualifyingQuestionsErrorMessage } from '../../enums';

describe('QualifyingQuestionsComponent', () => {
  let component: QualifyingQuestionsComponent;
  let fixture: ComponentFixture<QualifyingQuestionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QualifyingQuestionsComponent,
        MockRpxTranslatePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualifyingQuestionsComponent);
    component = fixture.componentInstance;
    component.qualifyingQuestionsControl = new FormControl(null, Validators.required);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
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
  });
});
