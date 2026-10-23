import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { PaletteContext } from '../base-field/palette-context.enum';
import { ReadCollectionFieldComponent } from './read-collection-field.component';

const TRANSLATION_STATES = [
  { isTranslated: false, translationHandledLocally: false },
  { isTranslated: true, translationHandledLocally: false },
  { isTranslated: false, translationHandledLocally: true },
  { isTranslated: true, translationHandledLocally: true }
];

describe('ReadCollectionFieldComponent', () => {
  const $CHILD_FIELDS = By.css('table>tbody>tr>td>ccd-field-read');

  const NESTED_FIELD_TYPE: FieldType = {
    id: 'Text',
    type: 'Text'
  };
  const FIELD_TYPE: FieldType = {
    id: 'Collection',
    type: 'Collection',
    collection_field_type: NESTED_FIELD_TYPE
  };
  const VALUES = [
    {
      value: 'Pierre',
    },
    {
      value: 'Paul',
    },
    {
      value: 'Jacques',
    }
  ];
  const CASE_FIELD: CaseField = ({
    id: 'x',
    label: 'X',
    field_type: FIELD_TYPE,
    display_context: 'OPTIONAL',
    value: VALUES,
    hidden: false
  }) as CaseField;
  const fieldReadComponentMock = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'caseFields', 'context', 'formGroup', 'topLevelFormGroup', 'idPrefix']
  });

  let fixture: ComponentFixture<ReadCollectionFieldComponent>;
  let component: ReadCollectionFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [fieldReadComponentMock],
        declarations: [
          ReadCollectionFieldComponent
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadCollectionFieldComponent);
    component = fixture.componentInstance;

    component.caseField = { ...CASE_FIELD, value: VALUES.slice() } as CaseField;
    component.context = PaletteContext.CHECK_YOUR_ANSWER;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('render values as a table with one row and one cell per value', () => {
    component.caseField.value = VALUES;
    fixture.detectChanges();

    const cells = de.queryAll($CHILD_FIELDS);

    for (let i = 0; i < VALUES.length; i++) {
      const field = cells[i].componentInstance;

      expect(field.caseField).toEqual({
        id: `${i}`,
        label: `X ${i + 1}`,
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: VALUES[i].value,
        hidden: false,
        parent: component.caseField,
        isTranslated: component.caseField.isTranslated,
        translationHandledLocally: component.caseField.translationHandledLocally
      });
    }
  });

  TRANSLATION_STATES.forEach(state => {
    it(`should copy numbered-label flags isTranslated=${state.isTranslated}, translationHandledLocally=${state.translationHandledLocally}`, () => {
      component.caseField = Object.assign(new CaseField(), component.caseField, state, {
        label: 'Contact PRIVATE_NAME'
      });
      fixture.detectChanges();

      const fields = de.queryAll($CHILD_FIELDS);
      expect(fields.length).toBe(VALUES.length);
      fields.forEach((element, index) => {
        const field = element.componentInstance.caseField;
        expect(field).not.toBe(component.caseField);
        expect(field.label).toBe(`Contact PRIVATE_NAME ${index + 1}`);
        expect(field.isTranslated).toBe(state.isTranslated);
        expect(field.translationHandledLocally).toBe(state.translationHandledLocally);
        expect(field.value).toBe(VALUES[index].value);
        expect(field.parent).toBe(component.caseField);
      });
      expect(component.caseField.label).toBe('Contact PRIVATE_NAME');
    });
  });

  it('should NOT render anything when value is undefined', () => {
    component.caseField.value = undefined;
    fixture.detectChanges();

    expect(de.children.length).toBe(0);
  });

  it('should NOT render anything when value is null', () => {
    component.caseField.value = null;
    fixture.detectChanges();

    expect(de.children.length).toBe(0);
  });

  it('should NOT render anything when value is empty array', () => {
    component.caseField.value = [];
    fixture.detectChanges();

    expect(de.children.length).toBe(0);
  });

  it('render values as a table with one row and one cell per value', () => {
    component.caseField.value = VALUES;
    fixture.detectChanges();

    const cells = de.queryAll($CHILD_FIELDS);

    for (let i = 0; i < VALUES.length; i++) {
      const field = cells[i].componentInstance;
      expect(field.context).toEqual(PaletteContext.CHECK_YOUR_ANSWER);
    }
  });
});

describe('ReadCollectionFieldComponent with display_context_parameter', () => {
  const $CHILD_FIELDS = By.css('table>tbody>tr>td>ccd-field-read');

  const NESTED_FIELD_TYPE: FieldType = {
    id: 'Text',
    type: 'Text'
  };
  const FIELD_TYPE: FieldType = {
    id: 'Collection',
    type: 'Collection',
    collection_field_type: NESTED_FIELD_TYPE
  };
  const VALUES = [
    {
      value: 'Pierre',
    },
    {
      value: 'Paul',
    },
    {
      value: 'Jacques',
    }
  ];

  const CASE_FIELD_WITH_DISPLAY_CONTEXT: CaseField = ({
    id: 'x',
    label: 'X',
    field_type: FIELD_TYPE,
    display_context: 'OPTIONAL',
    display_context_parameter: '#TABLE(Title,FIRSTNAME)',
    value: VALUES
  }) as CaseField;
  const fieldReadComponentMock = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'caseFields', 'context', 'formGroup', 'topLevelFormGroup', 'idPrefix']
  });

  let fixture: ComponentFixture<ReadCollectionFieldComponent>;
  let component: ReadCollectionFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [fieldReadComponentMock],
        declarations: [
          ReadCollectionFieldComponent
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadCollectionFieldComponent);
    component = fixture.componentInstance;

    component.caseField = { ...CASE_FIELD_WITH_DISPLAY_CONTEXT, value: VALUES.slice() } as CaseField;
    component.context = PaletteContext.CHECK_YOUR_ANSWER;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('render as a table with one row and one cell to be passed down the chain', () => {
    component.caseField.value = VALUES;
    fixture.detectChanges();
    const cell = de.queryAll($CHILD_FIELDS);
    expect(cell[0].name).toEqual('ccd-field-read');
  });

  TRANSLATION_STATES.forEach(state => {
    it(`should copy table-label flags isTranslated=${state.isTranslated}, translationHandledLocally=${state.translationHandledLocally}`, () => {
      component.caseField = Object.assign(new CaseField(), component.caseField, state, {
        label: 'Contact PRIVATE_NAME'
      });
      fixture.detectChanges();

      const fields = de.queryAll($CHILD_FIELDS);
      expect(fields.length).toBe(1);
      const field = fields[0].componentInstance.caseField;
      expect(field).not.toBe(component.caseField);
      expect(field.label).toBe('Contact PRIVATE_NAME');
      expect(field.isTranslated).toBe(state.isTranslated);
      expect(field.translationHandledLocally).toBe(state.translationHandledLocally);
      expect(field.value).toBe(component.caseField.value);
      expect(field.parent).toBe(component.caseField);
      expect(field.display_context_parameter).toBe(component.caseField.display_context_parameter);
      expect(component.caseField.label).toBe('Contact PRIVATE_NAME');
    });
  });
});
