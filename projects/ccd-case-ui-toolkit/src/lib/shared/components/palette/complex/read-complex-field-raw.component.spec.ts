import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject, of } from 'rxjs';

import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { LabelSubstitutorModule, PlaceholderService } from '../../../directives/substitutor';
import { CaseField, FieldType } from '../../../domain';
import { ReadFieldsFilterPipe } from '../../../pipes/complex/ccd-read-fields-filter.pipe';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { text } from '../../../test/helpers';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { PaletteContext } from '../base-field/palette-context.enum';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadComplexFieldRawComponent } from './read-complex-field-raw.component';

const initTests = (
  caseField,
  mocks,
  translationService: Pick<RpxTranslationService, 'language' | 'language$' | 'getTranslation$'> = {
    language: 'en',
    language$: of('en'),
    getTranslation$: jasmine.createSpy('getTranslation$').and.returnValue(of(''))
  },
  contextFields: CaseField[] = []
) => {
  let fixture: ComponentFixture<ReadComplexFieldRawComponent>;
  let component: ReadComplexFieldRawComponent;
  let de: DebugElement;

  TestBed
    .configureTestingModule({
      imports: [
        PaletteUtilsModule,
        ConditionalShowModule,
        LabelSubstitutorModule,
        ...mocks
      ],
      declarations: [
        ReadComplexFieldRawComponent,
        FieldsFilterPipe,
        ReadFieldsFilterPipe,
        MockRpxTranslatePipe
      ],
      providers: [
        FieldsUtils,
        PlaceholderService,
        { provide: RpxTranslationService, useValue: translationService }
      ]
    })
    .compileComponents();

  fixture = TestBed.createComponent(ReadComplexFieldRawComponent);
  component = fixture.componentInstance;

  component.caseField = caseField;
  component.caseFields = contextFields;
  component.context = PaletteContext.CHECK_YOUR_ANSWER;

  de = fixture.debugElement;
  fixture.detectChanges();

  return {
    de,
    component,
    fixture,
  };
};

const expectCaseField = (de, caseField) => {
  expect(de.componentInstance.caseField).toEqual(caseField);
};

const expectCaseFieldPartial = (de, caseField) => {
  expect(de.componentInstance.caseField).toEqual(jasmine.objectContaining(caseField));
};

const expectLabel = (de: DebugElement, label) => {
  expect(text(de)).toEqual(label);
};

const expectContext = (de, expectedContext) => {
  expect(de.componentInstance.context).toEqual(expectedContext);
};

describe('ReadComplexFieldRawComponent', () => {
  const $COMPLEX_LIST = By.css('dl.complex-raw');
  const $COMPLEX_LIST_ITEMS = By.css('dl.complex-raw>dd');
  const $COMPLEX_LIST_LABELS = By.css('dl.complex-raw>dt');
  const $COMPLEX_LIST_VALUES = By.css('dl.complex-raw>dd>ccd-field-read');

  let fieldReadComponentMock;

  let fixture: ComponentFixture<ReadComplexFieldRawComponent>;
  let component: ReadComplexFieldRawComponent;
  let de: DebugElement;

  beforeEach(() => {
    fieldReadComponentMock = MockComponent({
      selector: 'ccd-field-read',
      inputs: ['caseField', 'caseFields', 'context', 'formGroup', 'topLevelFormGroup', 'idPrefix']
    });
  });

  describe('translation guards', () => {
    let translateSpy: jasmine.Spy;
    let language$: BehaviorSubject<'en' | 'cy'>;
    let translationResult$: BehaviorSubject<string>;
    let translationService: Pick<RpxTranslationService, 'language' | 'language$' | 'getTranslation$'>;

    beforeEach(() => {
      translateSpy = spyOn(MockRpxTranslatePipe.prototype, 'transform')
        .and.callFake((value: string) => `Translated: ${value}`);
      language$ = new BehaviorSubject<'en' | 'cy'>('en');
      translationResult$ = new BehaviorSubject('');
      translationService = {
        language: 'en',
        language$: language$.asObservable(),
        getTranslation$: jasmine.createSpy('getTranslation$').and.returnValue(translationResult$.asObservable())
      };
    });

    const renderField = (label: string, type: 'FixedList' | 'Text' | 'Label' = 'FixedList'): CaseField => {
      const child = Object.assign(new CaseField(), {
        id: 'child',
        label,
        display_context: 'READONLY',
        field_type: {
          id: type,
          type,
          fixed_list_items: [{ code: 'A', label: 'Option A' }]
        }
      });
      const parent = Object.assign(new CaseField(), {
        id: 'parentComplex',
        label: 'Parent heading',
        display_context: 'READONLY',
        field_type: { id: 'Complex', type: 'Complex', complex_fields: [child] },
        value: { child: 'A' }
      });
      const personName = Object.assign(new CaseField(), {
        id: 'personName',
        field_type: { id: 'Text', type: 'Text' },
        value: 'PRIVATE_NAME'
      });
      const test = initTests(parent, [fieldReadComponentMock], translationService, [personName]);
      fixture = test.fixture;
      component = test.component;
      de = test.de;
      return de.query($COMPLEX_LIST_VALUES).componentInstance.caseField;
    };

    const heading = (): string => de.query($COMPLEX_LIST_LABELS).nativeElement.textContent.trim();

    it('should translate an ordinary eligible FixedList heading', () => {
      renderField('Ordinary heading');

      expect(heading()).toBe('Translated: Ordinary heading');
      expect(translateSpy).toHaveBeenCalledWith('Ordinary heading');
    });

    it('should continue displaying Text headings directly without translation', () => {
      renderField('Text heading', 'Text');

      expect(heading()).toBe('Text heading');
      expect(translateSpy).not.toHaveBeenCalled();
    });

    (['isTranslated', 'translationHandledLocally'] as const).forEach(flag => {
      it(`should bypass translation of an eligible heading when ${flag} is true`, () => {
        const child = renderField('Ordinary heading');
        child.label = 'Resolved PRIVATE_NAME';
        child[flag] = true;
        fixture.detectChanges();

        expect(heading()).toBe('Resolved PRIVATE_NAME');
        expect(translateSpy).not.toHaveBeenCalledWith('Resolved PRIVATE_NAME');
      });
    });

    it('should keep interpolation local while Welsh is pending, on fallback and after success', () => {
      const template = 'Contact ${personName}';
      translationResult$.next(template);
      const child = renderField(template);
      translationService.language = 'cy';
      language$.next('cy');
      fixture.detectChanges();

      expect(heading()).toBe('Contact PRIVATE_NAME');
      expect(child.isTranslated).toBe(false);
      expect(child.translationHandledLocally).toBe(true);

      translationResult$.next(template + ' [Translation in progress]');
      fixture.detectChanges();
      expect(heading()).toBe('Contact PRIVATE_NAME');

      translationResult$.next(template);
      fixture.detectChanges();
      expect(heading()).toBe('Contact PRIVATE_NAME');
      expect(child.isTranslated).toBe(false);

      translationResult$.next('Welsh contact ${personName}');
      fixture.detectChanges();

      expect(heading()).toBe('Welsh contact PRIVATE_NAME');
      expect(child.isTranslated).toBe(true);
      expect(translationService.getTranslation$).toHaveBeenCalledOnceWith(template);
      expect(translateSpy.calls.allArgs().some(args => args[0]?.includes('PRIVATE_NAME'))).toBe(false);
    });

    it('should honour the guard for a hidden Label heading without hiding its value', () => {
      const child = renderField('Label heading', 'Label');
      expect(de.query($COMPLEX_LIST_LABELS).nativeElement.hidden).toBe(true);
      // [hidden] leaves bindings active, so an unhandled eligible heading still reaches the pipe.
      expect(translateSpy).toHaveBeenCalledWith('Label heading');

      child.label = 'Label PRIVATE_NAME';
      child.translationHandledLocally = true;
      fixture.detectChanges();

      expect(heading()).toBe('Label PRIVATE_NAME');
      expect(de.query($COMPLEX_LIST_LABELS).nativeElement.hidden).toBe(true);
      expect(de.query($COMPLEX_LIST_ITEMS).nativeElement.hidden).toBe(false);
      expect(translateSpy).not.toHaveBeenCalledWith('Label PRIVATE_NAME');
    });

    it('should preserve hidden state on both the heading and value', () => {
      const child = renderField('Ordinary heading');
      child.hidden = true;
      fixture.detectChanges();

      expect(de.query($COMPLEX_LIST_LABELS).nativeElement.hidden).toBe(true);
      expect(de.query($COMPLEX_LIST_ITEMS).nativeElement.hidden).toBe(true);
    });
  });

  describe('when simple values split across children fields', () => {
    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Flat 9'
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: '111 East India road'
        }) as CaseField,
        ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Poplar'
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField = (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_VALUES
      }) as CaseField);

      const test = initTests(caseField, [
        fieldReadComponentMock
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should render a list', () => {
      const complexList = de.query($COMPLEX_LIST);

      expect(complexList).toBeTruthy();
    });

    it('should render one list item per child field', () => {
      const complexListItems = de.queryAll($COMPLEX_LIST_ITEMS);

      expect(complexListItems.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
    });

    it('should render one field read component per child field', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
      expectCaseFieldPartial(complexListValues[0], FIELD_TYPE_WITH_VALUES.complex_fields[0]);
      expectCaseFieldPartial(complexListValues[1], FIELD_TYPE_WITH_VALUES.complex_fields[1]);
      expectCaseFieldPartial(complexListValues[2], FIELD_TYPE_WITH_VALUES.complex_fields[2]);
    });

    it('should render one field read component per child field', () => {
      const complexListLabels = de.queryAll($COMPLEX_LIST_LABELS);

      expect(complexListLabels.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
      expectLabel(complexListLabels[0], FIELD_TYPE_WITH_VALUES.complex_fields[0].label);
      expectLabel(complexListLabels[1], FIELD_TYPE_WITH_VALUES.complex_fields[1].label);
      expectLabel(complexListLabels[2], FIELD_TYPE_WITH_VALUES.complex_fields[2].label);
    });

    it('should render one field read component per child field', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expectContext(complexListValues[0], PaletteContext.CHECK_YOUR_ANSWER);
      expectContext(complexListValues[1], PaletteContext.CHECK_YOUR_ANSWER);
      expectContext(complexListValues[2], PaletteContext.CHECK_YOUR_ANSWER);
    });
  });

  describe('when empty values split across children fields', () => {
    const FIELD_TYPE_WITH_MISSING_VALUE: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Flat 9'
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: ''
        }) as CaseField,
        ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Poplar'
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField = (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_MISSING_VALUE
      }) as CaseField);

      const test = initTests(caseField, [
        fieldReadComponentMock
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should omit child fields with empty values', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITH_MISSING_VALUE.complex_fields.length - 1);
      expectCaseFieldPartial(complexListValues[0], FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[0]);
      expectCaseFieldPartial(complexListValues[1], FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[2]);
    });
  });

  describe('when simple values as object on root field', () => {
    const FIELD_TYPE_WITHOUT_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
        ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField = (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_VALUES,
        value: {
          AddressLine1: 'Flat 9',
          AddressLine2: '111 East India road',
          AddressLine3: 'Poplar',
        }
      }) as CaseField);

      const test = initTests(caseField, [
        fieldReadComponentMock
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should render one field read component per child field', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITHOUT_VALUES.complex_fields.length);
      expectCaseFieldPartial(complexListValues[0], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[0],
        {
          value: caseField.value['AddressLine1']
        }
      ));
      expectCaseFieldPartial(complexListValues[1], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[1],
        {
          value: caseField.value['AddressLine2']
        }
      ));
      expectCaseFieldPartial(complexListValues[2], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[2],
        {
          value: caseField.value['AddressLine3']
        }
      ));
    });
  });

  describe('when empty values as object on root field', () => {
    const FIELD_TYPE_WITHOUT_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
        ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField = (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_VALUES,
        value: {
          AddressLine1: 'Flat 9',
          AddressLine3: 'Poplar',
        }
      }) as CaseField);

      const test = initTests(caseField, [
        fieldReadComponentMock
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should omit child fields with empty values', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITHOUT_VALUES.complex_fields.length - 1);
      expectCaseFieldPartial(complexListValues[0], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[0],
        {
          value: caseField.value['AddressLine1']
        }
      ));
      expectCaseFieldPartial(complexListValues[1], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[2],
        {
          value: caseField.value['AddressLine3']
        }
      ));
    });
  });
});
