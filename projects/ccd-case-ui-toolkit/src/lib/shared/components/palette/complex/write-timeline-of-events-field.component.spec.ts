import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng2-mock-component';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { CaseField } from '../../../domain/definition';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { MockFieldLabelPipe } from '../../../test/mock-field-label.pipe';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { IsCompoundPipe, IsReadOnlyPipe, PaletteUtilsModule } from '../utils';
import {
  DATE_INPUT_INVALID,
  DATE_INPUT_REQUIRED,
  DateInputPartConfiguration,
  TIMELINE_OF_EVENTS_DATE_INPUT
} from './date-input-configuration';
import { WriteComplexFieldComponent } from './write-complex-field.component';
import { WriteTimelineOfEventsFieldComponent } from './write-timeline-of-events-field.component';

import createSpyObj = jasmine.createSpyObj;

const createTimelineField = (
  dayDisplayContext = 'OPTIONAL',
  monthDisplayContext: string | null = null,
  yearDisplayContext: string | null = null
): CaseField => {
  const displayContexts = new Map<string, string | null>([
    [TIMELINE_OF_EVENTS_DATE_INPUT.day.fieldId, dayDisplayContext],
    [TIMELINE_OF_EVENTS_DATE_INPUT.month.fieldId, monthDisplayContext],
    [TIMELINE_OF_EVENTS_DATE_INPUT.year.fieldId, yearDisplayContext]
  ]);
  const datePartFields = Object.values(TIMELINE_OF_EVENTS_DATE_INPUT).map((part: DateInputPartConfiguration) => ({
    id: part.fieldId,
    label: part.label,
    display_context: displayContexts.get(part.fieldId),
    field_type: { id: 'Number', type: 'Number' },
    value: null
  }));

  return {
    id: 'timelineOfEvents',
    label: 'Timeline of events',
    display_context: 'COMPLEX',
    field_type: {
      id: 'TimelineOfEvents',
      type: 'Complex',
      complex_fields: [
        { id: 'timelineDateLabel', label: 'Date', hint_text: 'For example, 12 11 2007', field_type: { id: 'Label', type: 'Label' }, value: null },
        ...datePartFields,
        { id: 'timelineDescription', label: 'What happened', display_context: 'MANDATORY', field_type: { id: 'TextArea', type: 'TextArea' }, value: null }
      ]
    }
  } as CaseField;
};

describe('WriteTimelineOfEventsFieldComponent', () => {
  const fieldWriteComponentMock = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'caseFields', 'formGroup', 'idPrefix', 'isExpanded', 'parent', 'isInSearchBlock']
  });

  const fieldReadComponentMock = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'caseFields', 'formGroup', 'withLabel']
  });

  @Pipe({
    name: 'ccdIsReadOnly',
    standalone: false
  })
  class IsReadOnlyPipeMock implements PipeTransform {
    public transform(field: CaseField): boolean {
      return field?.display_context?.toUpperCase() === 'READONLY';
    }
  }

  let fixture: ComponentFixture<WriteTimelineOfEventsFieldComponent>;
  let component: WriteTimelineOfEventsFieldComponent;
  let rootForm: FormGroup;
  let formValidatorsService: jasmine.SpyObj<FormValidatorsService>;

  beforeEach(waitForAsync(() => {
    formValidatorsService = createSpyObj<FormValidatorsService>('formValidatorsService', ['addValidators']);

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          ConditionalShowModule,
          ReactiveFormsModule,
          fieldWriteComponentMock,
          fieldReadComponentMock
        ],
        declarations: [
          WriteComplexFieldComponent,
          WriteTimelineOfEventsFieldComponent,
          FieldsFilterPipe,
          IsReadOnlyPipeMock,
          MockRpxTranslatePipe,
          MockFieldLabelPipe
        ],
        providers: [
          IsCompoundPipe,
          IsReadOnlyPipe,
          { provide: FormValidatorsService, useValue: formValidatorsService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteTimelineOfEventsFieldComponent);
    component = fixture.componentInstance;
    rootForm = new FormGroup({});
    component.formGroup = rootForm;
    component.caseField = createTimelineField();
    fixture.detectChanges();
  }));

  it('should render the date question and inputs from the date-part configuration', () => {
    const inputs = Array.from(fixture.nativeElement.querySelectorAll('.form-date input')) as HTMLInputElement[];
    const parts = Object.values(TIMELINE_OF_EVENTS_DATE_INPUT);

    expect(fixture.nativeElement.querySelector('fieldset legend').textContent).toContain('Date');
    expect(fixture.nativeElement.querySelector('.form-hint').textContent).toContain('For example, 12 11 2007');
    expect(fixture.nativeElement.querySelector('ccd-field-write')).toBeTruthy();
    expect(inputs.length).toBe(parts.length);
    expect(inputs.map((input) => input.id)).toEqual(parts.map((part) => component.dateInputId(part.fieldId)));
    expect(inputs.map((input) => input.maxLength)).toEqual(parts.map((part) => part.maxLength));
    expect(fixture.nativeElement.querySelector(
      `label[for="${component.dateInputId(TIMELINE_OF_EVENTS_DATE_INPUT.day.fieldId)}"]`
    ).textContent).toContain('Day (optional)');
    expect(fixture.nativeElement.querySelector(
      `label[for="${component.dateInputId(TIMELINE_OF_EVENTS_DATE_INPUT.month.fieldId)}"]`
    ).textContent).toContain('Month');
    expect(fixture.nativeElement.querySelector(
      `label[for="${component.dateInputId(TIMELINE_OF_EVENTS_DATE_INPUT.year.fieldId)}"]`
    ).textContent).toContain('Year');
  });

  it('should identify date-part fields from the shared configuration', () => {
    Object.values(TIMELINE_OF_EVENTS_DATE_INPUT).forEach((part) => {
      expect(component.isDateInputPart({ id: part.fieldId } as CaseField)).toBeTrue();
    });
    expect(component.isDateInputPart({ id: 'timelineDescription' } as CaseField)).toBeFalse();
  });

  it('should apply configured part classes and the optional-date layout', () => {
    const groups = Array.from(fixture.nativeElement.querySelectorAll('.form-date > .form-group')) as HTMLElement[];
    const parts = Object.values(TIMELINE_OF_EVENTS_DATE_INPUT);

    expect(groups.map((group) => parts.find((part) => group.classList.contains(part.cssClass))?.cssClass))
      .toEqual(parts.map((part) => part.cssClass));
    expect(component.hasOptionalDatePart()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.form-date').classList.contains('form-date-has-optional-part')).toBeTrue();
  });

  it('should allow an unknown day and preserve all three child values in the complex payload', () => {
    component.monthControl.setValue('4');
    component.yearControl.setValue('2024');
    component.dayControl.setValue(null);
    fixture.detectChanges();

    expect(component.dayControl.valid).toBeTrue();
    expect(rootForm.valid).toBeTrue();
    expect(rootForm.value.timelineOfEvents).toEqual({
      timelineDateLabel: null,
      timelineDay: null,
      timelineMonth: '4',
      timelineYear: '2024',
      timelineDescription: null
    });
  });

  it('should require month and year and validate complete dates, including leap years', () => {
    expect(component.monthControl.errors[DATE_INPUT_REQUIRED]).toBe('Month is required');
    expect(component.yearControl.errors[DATE_INPUT_REQUIRED]).toBe('Year is required');

    component.monthControl.setValue('2');
    component.yearControl.setValue('2024');
    component.dayControl.setValue('29');
    expect(component.dayControl.valid).toBeTrue();

    component.yearControl.setValue('2023');
    expect(component.dayControl.errors[DATE_INPUT_INVALID]).toBe('Enter a valid date');

    component.dayControl.setValue('28');
    expect(component.dayControl.valid).toBeTrue();
  });

  it('should reject non-integers, out-of-range months and impossible calendar dates', () => {
    component.yearControl.setValue('2024');
    component.monthControl.setValue('13');
    expect(component.monthControl.errors[DATE_INPUT_INVALID]).toBe('Enter a valid month');

    component.monthControl.setValue('4');
    component.dayControl.setValue('31');
    expect(component.dayControl.errors[DATE_INPUT_INVALID]).toBe('Enter a valid date');

    component.dayControl.setValue('1.5');
    expect(component.dayControl.errors[DATE_INPUT_INVALID]).toBe('Enter a valid day');
  });

  it('should clear a previously entered day when it is emptied', () => {
    component.dayControl.setValue('12');
    component.clearEmptyDatePart(component.dayControl);
    component.dayControl.setValue('');
    component.clearEmptyDatePart(component.dayControl);
    fixture.detectChanges();

    expect(rootForm.value.timelineOfEvents[TIMELINE_OF_EVENTS_DATE_INPUT.day.fieldId]).toBeNull();
  });

  it('should keep values and input IDs independent between repeated timeline rows', () => {
    const collectionField = { id: 'timelineEvents', field_type: { type: 'Collection' } };
    const firstRow = new FormGroup({});
    const secondRow = new FormGroup({});
    const firstCaseField = createTimelineField();
    const secondCaseField = createTimelineField();
    (firstRow as any).caseField = firstCaseField;
    (secondRow as any).caseField = secondCaseField;
    (firstRow as any).component = { caseField: collectionField };
    (secondRow as any).component = { caseField: collectionField };

    const firstFixture = TestBed.createComponent(WriteTimelineOfEventsFieldComponent);
    firstFixture.componentInstance.caseField = firstCaseField;
    firstFixture.componentInstance.parent = firstRow;
    firstFixture.componentInstance.formGroup = rootForm;
    firstFixture.componentInstance.idPrefix = 'row0_';
    firstFixture.detectChanges();

    const secondFixture = TestBed.createComponent(WriteTimelineOfEventsFieldComponent);
    secondFixture.componentInstance.caseField = secondCaseField;
    secondFixture.componentInstance.parent = secondRow;
    secondFixture.componentInstance.formGroup = rootForm;
    secondFixture.componentInstance.idPrefix = 'row1_';
    secondFixture.detectChanges();

    firstFixture.componentInstance.monthControl.setValue('3');
    firstFixture.componentInstance.yearControl.setValue('2025');
    secondFixture.componentInstance.monthControl.setValue('10');
    secondFixture.componentInstance.yearControl.setValue('2026');

    expect(firstRow.value).toEqual({ timelineDateLabel: null, timelineDay: null, timelineMonth: '3', timelineYear: '2025', timelineDescription: null });
    expect(secondRow.value).toEqual({ timelineDateLabel: null, timelineDay: null, timelineMonth: '10', timelineYear: '2026', timelineDescription: null });
    const dayFieldId = TIMELINE_OF_EVENTS_DATE_INPUT.day.fieldId;
    expect(firstFixture.nativeElement.querySelector(`#${firstFixture.componentInstance.dateInputId(dayFieldId)}`)).toBeTruthy();
    expect(secondFixture.nativeElement.querySelector(`#${secondFixture.componentInstance.dateInputId(dayFieldId)}`)).toBeTruthy();
    firstFixture.destroy();
    secondFixture.destroy();
  });
});
