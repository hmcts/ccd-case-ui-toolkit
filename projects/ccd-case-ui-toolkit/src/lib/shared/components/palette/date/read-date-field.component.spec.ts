import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CaseView } from '../../../domain';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { CaseNotifier } from '../../case-editor';
import { DatePipe } from '../utils/date.pipe';
import { ReadDateFieldComponent } from './read-date-field.component';

describe('ReadDateFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Date',
    type: 'Date'
  };
  const VALUE = '1800-07-15';
  describe('Non-persistable readonly date field', () => {
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;
    const FORMATTED_VALUE = '15 Jul 1800';
    const EMPTY = '';

    let fixture: ComponentFixture<ReadDateFieldComponent>;
    let component: ReadDateFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {

      TestBed
        .configureTestingModule({
          declarations: [
            ReadDateFieldComponent,
            DatePipe,
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDateFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render output with date pipe formatting', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(FORMATTED_VALUE);
    });

    it('should default to utc time zone', () => {
      expect(component.timeZone).toBe('utc');
    });

    it('should render empty string value as empty string', () => {
      component.caseField.value = '';
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });

    it('should render undefined value as empty string', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });

    it('should render null value as empty string', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });
  });

  describe('Persistable readonly date field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const REGISTER_CONTROL = (control) => {
      FORM_GROUP.addControl(FIELD_ID, control);
      return control;
    };
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadDateFieldComponent>;
    let component: ReadDateFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {

      TestBed
        .configureTestingModule({
          declarations: [
            ReadDateFieldComponent,
            DatePipe
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDateFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[CASE_FIELD.id]).toBeTruthy();
      expect(FORM_GROUP.controls[CASE_FIELD.id].value).toBe(VALUE);
    });

  });

  describe('Service-specific readonly date field time zone', () => {
    const DATE_TIME_VALUE = '2025-07-26T20:10:05Z';
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'DateTime',
        type: 'DateTime'
      },
      value: DATE_TIME_VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadDateFieldComponent>;
    let component: ReadDateFieldComponent;
    let de: DebugElement;
    let caseViewSubject: BehaviorSubject<CaseView>;
    let expectedLocalDateTime: string;

    beforeEach(waitForAsync(() => {
      delete CASE_FIELD.hmctsServiceId;
      caseViewSubject = new BehaviorSubject<CaseView>(createCaseView('CIVIL', 'CIVIL'));
      expectedLocalDateTime = new DatePipe(new FormatTranslatorService()).transform(DATE_TIME_VALUE, 'local', null);

      TestBed
        .configureTestingModule({
          declarations: [
            ReadDateFieldComponent,
            DatePipe
          ],
          providers: [
            FormatTranslatorService,
            {
              provide: CaseNotifier,
              useValue: {
                caseView: caseViewSubject.asObservable()
              }
            }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDateFieldComponent);
      component = fixture.componentInstance;
      component.caseField = CASE_FIELD;
      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should keep utc time zone for non-outlier services', () => {
      expect(component.timeZone).toBe('utc');
    });

    it('should keep utc time zone for Probate cases without a resolved HMCTS service ID', () => {
      caseViewSubject.next(createCaseView('PROBATE', 'GrantOfRepresentation'));
      fixture.detectChanges();

      expect(component.timeZone).toBe('utc');
    });

    it('should use local time zone for ABA2 HMCTS service cases', () => {
      caseViewSubject.next(createCaseView('DIVORCE', 'Divorce', 'ABA2'));
      fixture.detectChanges();

      expect(component.timeZone).toBe('local');
    });

    it('should use local time zone for fields with an ABA2 HMCTS service ID', () => {
      component.caseField.hmctsServiceId = 'ABA2';
      fixture.detectChanges();

      expect(component.timeZone).toBe('local');
      expect(de.nativeElement.textContent).toEqual(expectedLocalDateTime);
    });

    it('should fall back to case service ID when a field service ID is unresolved', () => {
      component.caseField.hmctsServiceId = undefined;
      caseViewSubject.next(createCaseView('PROBATE', 'GrantOfRepresentation', 'ABA6'));
      fixture.detectChanges();

      expect(component.timeZone).toBe('local');
    });

    it('should not fall back to case service ID when a field service ID is explicitly unresolved', () => {
      component.caseField.hmctsServiceId = '';
      caseViewSubject.next(createCaseView('PROBATE', 'GrantOfRepresentation', 'ABA6'));
      fixture.detectChanges();

      expect(component.timeZone).toBe('utc');
    });

    it('should use local time zone for ABA6 HMCTS service cases', () => {
      caseViewSubject.next(createCaseView('PROBATE', 'GrantOfRepresentation', 'ABA6'));
      fixture.detectChanges();

      expect(component.timeZone).toBe('local');
      expect(de.nativeElement.textContent).toEqual(expectedLocalDateTime);
    });

    it('should keep utc time zone for Financial Remedy case types without a resolved HMCTS service ID', () => {
      caseViewSubject.next(createCaseView('DIVORCE', 'FinancialRemedyMVP2'));
      fixture.detectChanges();

      expect(component.timeZone).toBe('utc');
    });
  });

});

function createCaseView(jurisdictionId: string, caseTypeId: string, hmctsServiceId?: string): CaseView {
  const caseView = {
    case_type: {
      id: caseTypeId,
      name: caseTypeId,
      jurisdiction: {
        id: jurisdictionId,
        name: jurisdictionId
      }
    },
    channels: [],
    state: {
      id: 'state',
      name: 'State'
    },
    tabs: [],
    triggers: [],
    events: []
  } as CaseView;

  if (hmctsServiceId) {
    caseView.hmctsServiceId = hmctsServiceId;
  }

  return caseView;
}
